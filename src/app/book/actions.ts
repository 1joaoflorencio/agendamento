"use server"

import prisma from '@/lib/prisma'
import { format, isBefore, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { addEventToCalendar } from '@/lib/google-calendar'
import { headers } from 'next/headers'
import { createPublicAppointmentSchema } from '@/lib/validations'

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5    // max requests
const RATE_LIMIT_WINDOW = 60_000 // per minute

function checkRateLimit(key: string): boolean {
    const now = Date.now()

    // OTIMIZAÇÃO: Varredura de Memória e Proteção contra Vazamento (OOM Protection)
    // Se passarmos de 5.000 IPs guardados na memória (Indicativo de ataque pesado)
    if (rateLimitMap.size > 5000) {
        for (const [k, v] of rateLimitMap.entries()) {
            if (now > v.resetAt) rateLimitMap.delete(k)
        }
        // Se após a varredura ainda tivermos mais de 5.000 (Ataque simultâneo gigantesco),
        // limpamos tudo como um disjuntor de emergência para evitar gargalos de lentidão (Garbage Collection)
        if (rateLimitMap.size > 5000) rateLimitMap.clear()
    }

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

    // Bypass local timezone mechanics by appending strict UTC-3 offset
    const date = new Date(`${dateStr}T00:00:00.000-03:00`);

    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda...

    const start = new Date(`${dateStr}T00:00:00.000-03:00`);
    const end = new Date(`${dateStr}T23:59:59.999-03:00`);

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

    // Mapeia os intervalos de tempo ocupados usando tempos absolutos em UTC subjacente
    const blockedIntervals = existingAppointments.map((appt) => {
        const apptDuration = appt.service ? appt.service.duration_minutes : 60; // fallback

        return {
            start: appt.date_time,
            end: new Date(appt.date_time.getTime() + apptDuration * 60000)
        }
    })

    const allSlots: { time: string; available: boolean }[] = []

    let currentMinute = startHour * 60 + startMin;
    const endMinute = endHour * 60 + endMin;

    const now = new Date(); // now represents absolute perfect time regardless of server timezone
    const INCREMENT = duration; // o pulo de horário agora segue o tempo exato do serviço

    while (currentMinute + duration <= endMinute) {
        const h = Math.floor(currentMinute / 60).toString().padStart(2, '0');
        const m = (currentMinute % 60).toString().padStart(2, '0');
        const timeStr = `${h}:${m}`;

        // Crio o slot forçando o timezone local (UTC-3)
        const slotStart = new Date(`${dateStr}T${h}:${m}:00.000-03:00`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        if (isBefore(slotStart, now)) {
            allSlots.push({ time: timeStr, available: false });
            currentMinute += INCREMENT;
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
            currentMinute += INCREMENT;
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

        currentMinute += INCREMENT;
    }

    return allSlots;
}

// 3. Create Appointment (Public Booking)
export async function createPublicAppointment(formData: FormData) {
    // SECURITY: IP-based Rate Limiting (Prevent DoS)
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown-ip';

    if (!checkRateLimit(ip)) {
        throw new Error("Muitas tentativas deste dispositivo. Aguarde um minuto antes de tentar novamente.");
    }

    // SECURITY: Zod Input Validation (Prevent Injection/Bad Data)
    const rawData = {
        tenant_id: formData.get("tenant_id"),
        attendant_id: formData.get("attendant_id"),
        service_id: formData.get("service_id"),
        date: formData.get("date"),
        time: formData.get("time"),
        client_name: formData.get("client_name"),
        client_phone: formData.get("client_phone"),
        client_email: formData.get("client_email"),
    };

    const validatedFields = createPublicAppointmentSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = validatedFields.error.issues[0]?.message;
        throw new Error(firstError || "Dados inválidos fornecidos no formulário.");
    }

    const {
        tenant_id,
        attendant_id,
        service_id,
        date: dateStr,
        time: timeStr,
        client_name,
        client_phone,
        client_email
    } = validatedFields.data;

    const cleanPhone = client_phone.replace(/\D/g, '')

    const [hours, minutes] = timeStr.split(":").map(Number)
    // Forçamos o timezone do Brasil (-03:00) na construção da data para que seja salvo como hora exata em UTC
    const hStr = hours.toString().padStart(2, '0')
    const mStr = minutes.toString().padStart(2, '0')
    const dateTime = new Date(`${dateStr}T${hStr}:${mStr}:00.000-03:00`)

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

    // Sincronização em Background: Google Agenda
    addEventToCalendar(appointment.id).catch(e => {
        console.error('[Google API Error Background Sync]', e)
    })

    // Envio de WhatsApp (non-blocking: falha no WhatsApp NÃO impede o agendamento)
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coreagenda.vercel.app'
        const cancelLink = `${appUrl}/cancel/${appointment.id}`

        const clientMsg = `Olá ${client_name}! Confirmamos seu agendamento de *${appointment.service.name}* com *${appointment.attendant.name}* para o dia *${format(dateTime, "dd/MM 'às' HH:mm", { locale: ptBR })}*.\n\nTe esperamos!\n\n_Para cancelar este agendamento, acesse:_\n${cancelLink}`

        const result = await sendWhatsAppMessage(tenant_id, client_phone, clientMsg)

        if (!result.success) {
            console.warn(`[WhatsApp Client] Falha ao enviar confirmação (não-bloqueante):`, result.reason || result.data)
        }

        // Notifica o profissional (Attendant) se ele tiver um número cadastrado
        if (appointment.attendant.phone) {
            const attendantMsg = `📅 *Novo Agendamento!*\n\n*Serviço:* ${appointment.service.name}\n*Data:* ${format(dateTime, "dd/MM 'às' HH:mm", { locale: ptBR })}\n*Cliente:* ${client_name} (${client_phone})`
            const attendantResult = await sendWhatsAppMessage(tenant_id, appointment.attendant.phone, attendantMsg)

            if (!attendantResult.success) {
                console.warn(`[WhatsApp Attendant] Falha ao notificar profissional (não-bloqueante):`, attendantResult.reason || attendantResult.data)
            }
        }
    } catch (whatsappError) {
        console.warn('[WhatsApp] Erro inesperado ao enviar confirmação (não-bloqueante):', whatsappError)
    }
}
