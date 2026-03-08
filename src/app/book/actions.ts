"use server"

import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, addMinutes, format, isBefore, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5    // max requests
const RATE_LIMIT_WINDOW = 60_000 // per minute

function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(key)
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
        return true
    }
    if (entry.count >= RATE_LIMIT_MAX) return false
    entry.count++
    return true
}

// 1. Get Establishment Details for the booking page
export async function getEstablishmentForBooking(slug: string) {
    const establishment = await prisma.establishment.findUnique({
        where: { slug },
        include: {
            services: true,
            attendants: {
                include: {
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            }
        }
    })

    if (!establishment) {
        throw new Error("Estabelecimento não encontrado")
    }

    return establishment
}

// 2. The core Algorithm: Get Available Time Slots
export async function getAvailableTimeSlots(
    tenantId: string,
    attendantId: string,
    serviceId: string,
    dateStr: string // YYYY-MM-DD
) {

    // Forçamos o timezone exato da string para não cair no dia anterior em UTC -3
    const date = new Date(`${dateStr}T00:00:00`);

    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda...

    const start = startOfDay(date);
    const end = endOfDay(date);

    // 2.2 Run ALL static checks and appointment searches concurrently
    const [establishment, attendant, businessHour, service, existingAppointments] = await Promise.all([
        prisma.establishment.findUnique({
            where: { id: tenantId },
            select: { pause_start: true, paused_until: true }
        }),
        prisma.attendant.findUnique({
            where: { id: attendantId },
            select: { pause_start: true, paused_until: true }
        }),
        prisma.businessHour.findUnique({
            where: {
                establishment_id_day_of_week: {
                    establishment_id: tenantId,
                    day_of_week: dayOfWeek
                }
            }
        }),
        prisma.service.findUnique({
            where: { id: serviceId }
        }),
        prisma.appointment.findMany({
            where: {
                tenant_id: tenantId,
                attendant_id: attendantId,
                status: { not: "CANCELED" },
                date_time: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                service: { select: { duration_minutes: true } }
            }
        })
    ]);

    let startHour = 8;
    let startMin = 0;
    let endHour = 18;
    let endMin = 0;

    // Se houver config explícita dizendo que está fechado, retorna vazio
    if (businessHour && businessHour.is_closed) {
        return [];
    }

    // Se houver config aberta, usa ela. Senão usa fallback 08 as 18!
    if (businessHour && !businessHour.is_closed) {
        const [h1, m1] = businessHour.open_time.split(':').map(Number);
        const [h2, m2] = businessHour.close_time.split(':').map(Number);
        startHour = h1;
        startMin = m1;
        endHour = h2;
        endMin = m2;
    }

    if (!service) throw new Error("Serviço não encontrado")

    const duration = service.duration_minutes

    // Mapeia os intervalos de tempo ocupados
    const blockedIntervals = existingAppointments.map((appt) => {
        const apptDuration = appt.service ? appt.service.duration_minutes : 60; // fallback

        return {
            start: appt.date_time,
            end: addMinutes(appt.date_time, apptDuration)
        }
    })

    const allSlots: { time: string; available: boolean }[] = []

    let currentSlot = new Date(date);
    currentSlot.setHours(startHour, startMin, 0, 0);

    const endOfDayLimit = new Date(date);
    endOfDayLimit.setHours(endHour, endMin, 0, 0);

    const now = new Date();
    const INCREMENT = duration; // o pulo de horário agora segue o tempo exato do serviço

    while (addMinutes(currentSlot, duration) <= endOfDayLimit) {
        const slotStart = currentSlot;
        const slotEnd = addMinutes(currentSlot, duration);
        const timeStr = format(slotStart, "HH:mm");

        if (isBefore(slotStart, now)) {
            allSlots.push({ time: timeStr, available: false });
            currentSlot = addMinutes(currentSlot, INCREMENT);
            continue;
        }

        // Bloquear horário se a loja estiver em "Pausa Agendada" naquele momento
        const isStorePaused = establishment?.pause_start && establishment?.paused_until && (
            (slotStart >= establishment.pause_start && slotStart < establishment.paused_until) ||
            (slotEnd > establishment.pause_start && slotEnd <= establishment.paused_until) ||
            (slotStart <= establishment.pause_start && slotEnd >= establishment.paused_until)
        );

        // Bloquear horário se o profissional estiver em "Pausa Agendada" naquele momento
        const isAttendantPaused = attendant?.pause_start && attendant?.paused_until && (
            (slotStart >= attendant.pause_start && slotStart < attendant.paused_until) ||
            (slotEnd > attendant.pause_start && slotEnd <= attendant.paused_until) ||
            (slotStart <= attendant.pause_start && slotEnd >= attendant.paused_until)
        );

        // Lógica Legada de Pausa Imediata
        const isLegacyStorePaused = establishment?.paused_until && isBefore(slotStart, establishment.paused_until);
        const isLegacyAttendantPaused = attendant?.paused_until && isBefore(slotStart, attendant.paused_until);

        if (isStorePaused || isAttendantPaused || isLegacyStorePaused || isLegacyAttendantPaused) {
            allSlots.push({ time: timeStr, available: false });
            currentSlot = addMinutes(currentSlot, INCREMENT);
            continue;
        }

        let isOverlapping = false;
        for (const interval of blockedIntervals) {
            if (isBefore(slotStart, interval.end) && isAfter(slotEnd, interval.start)) {
                isOverlapping = true;
                break;
            }
        }

        allSlots.push({ time: timeStr, available: !isOverlapping });

        currentSlot = addMinutes(currentSlot, INCREMENT);
    }

    return allSlots;
}

// 3. Create Appointment (Public Booking)
export async function createPublicAppointment(formData: FormData) {
    const tenant_id = formData.get("tenant_id") as string
    const attendant_id = formData.get("attendant_id") as string
    const service_id = formData.get("service_id") as string
    const dateStr = formData.get("date") as string // "YYYY-MM-DD"
    const timeStr = formData.get("time") as string // "HH:mm"
    const client_name = formData.get("client_name") as string
    const client_phone = formData.get("client_phone") as string
    const client_email = formData.get("client_email") as string

    if (!tenant_id || !attendant_id || !service_id || !dateStr || !timeStr || !client_name || !client_phone) {
        throw new Error("Preencha todos os campos obrigatórios")
    }

    // Rate limiting by phone number
    const cleanPhone = client_phone.replace(/\D/g, '')
    if (!checkRateLimit(cleanPhone)) {
        throw new Error("Muitas tentativas. Aguarde um momento antes de tentar novamente.")
    }

    const [hours, minutes] = timeStr.split(":").map(Number)
    // Forçamos o timezone local
    const dateTime = new Date(`${dateStr}T00:00:00`)
    dateTime.setHours(hours, minutes, 0, 0)

    // Dupla checagem contra corrida (Dois clientes marcando ao mesmo tempo)
    const allSlots = await getAvailableTimeSlots(tenant_id, attendant_id, service_id, dateStr);
    const requestedSlot = allSlots.find(s => s.time === timeStr);
    if (!requestedSlot || !requestedSlot.available) {
        throw new Error("Ops! Este horário já foi reservado ou ficou indisponível no sistema.");
    }

    // CRM: Buscar ou Criar o Perfil do Cliente baseado no Telefone Limpo
    // Adicionamos a lógica de Upsert para garantir a criação ou atualização.
    const clientProfile = await prisma.client.upsert({
        where: {
            tenant_id_phone: {
                tenant_id: tenant_id,
                phone: cleanPhone
            }
        },
        update: {
            name: client_name,         // Atualiza o nome caso a pessoa tenha digitado algo diferente 
            email: client_email || null
        },
        create: {
            tenant_id,
            name: client_name,
            phone: cleanPhone,
            email: client_email || null,
        }
    })

    const appointment = await prisma.appointment.create({
        data: {
            tenant_id,
            attendant_id,
            service_id,
            client_id: clientProfile.id,
            client_name,
            client_phone,
            client_email: client_email || null,
            date_time: dateTime,
            status: "SCHEDULED"
        },
        include: {
            service: true,
            attendant: true
        }
    })

    // Envio de WhatsApp (non-blocking: falha no WhatsApp NÃO impede o agendamento)
    try {
        const result = await sendWhatsAppMessage(tenant_id, client_phone, `Olá ${client_name}! Confirmamos seu agendamento de ${appointment.service.name} com ${appointment.attendant.name} para o dia ${format(dateTime, "dd/MM 'às' HH:mm", { locale: ptBR })}. Te esperamos!`)

        if (!result.success) {
            console.warn(`[WhatsApp] Falha ao enviar confirmação (não-bloqueante):`, result.reason || result.data)
        }
    } catch (whatsappError) {
        console.warn('[WhatsApp] Erro inesperado ao enviar confirmação (não-bloqueante):', whatsappError)
    }
}
