"use server"

import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, addMinutes, format, isBefore, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

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

    // 2.2 Busca horários de funcionamento dinâmicos
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda...
    const businessHour = await prisma.businessHour.findUnique({
        where: {
            establishment_id_day_of_week: {
                establishment_id: tenantId,
                day_of_week: dayOfWeek
            }
        }
    });

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

    const service = await prisma.service.findUnique({
        where: { id: serviceId }
    })

    if (!service) throw new Error("Serviço não encontrado")

    const duration = service.duration_minutes

    // Busca agendamentos do profissional no dia
    const start = startOfDay(date);
    const end = endOfDay(date);

    const existingAppointments = await prisma.appointment.findMany({
        where: {
            tenant_id: tenantId,
            attendant_id: attendantId,
            status: { not: "CANCELED" },
            date_time: {
                gte: start,
                lte: end
            }
        }
    })

    // Mapeia os intervalos de tempo ocupados
    const blockedIntervals = await Promise.all(
        existingAppointments.map(async (appt: any) => {
            const apptService = await prisma.service.findUnique({ where: { id: appt.service_id } });
            const apptDuration = apptService ? apptService.duration_minutes : 60; // fallback

            return {
                start: appt.date_time,
                end: addMinutes(appt.date_time, apptDuration)
            }
        })
    )

    const availableSlots: string[] = []

    let currentSlot = new Date(date);
    currentSlot.setHours(startHour, startMin, 0, 0);

    const endOfDayLimit = new Date(date);
    endOfDayLimit.setHours(endHour, endMin, 0, 0);

    const now = new Date();
    const INCREMENT = duration; // o pulo de horário agora segue o tempo exato do serviço

    while (addMinutes(currentSlot, duration) <= endOfDayLimit) {
        const slotStart = currentSlot;
        const slotEnd = addMinutes(currentSlot, duration);

        if (isBefore(slotStart, now)) {
            currentSlot = addMinutes(currentSlot, INCREMENT);
            continue;
        }

        let isOverlapping = false;
        for (const interval of blockedIntervals) {
            // Se o início do slot for antes do fim de um agendamento existente
            // E o fim do slot for depois do início do agendamento existente => Colisão
            if (isBefore(slotStart, interval.end) && isAfter(slotEnd, interval.start)) {
                isOverlapping = true;
                break;
            }
        }

        if (!isOverlapping) {
            availableSlots.push(format(slotStart, "HH:mm"));
        }

        currentSlot = addMinutes(currentSlot, INCREMENT);
    }

    return availableSlots;
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

    const [hours, minutes] = timeStr.split(":").map(Number)
    // Forçamos o timezone local
    const dateTime = new Date(`${dateStr}T00:00:00`)
    dateTime.setHours(hours, minutes, 0, 0)

    // Dupla checagem contra corrida (Dois clientes marcando ao mesmo tempo)
    const availableSlots = await getAvailableTimeSlots(tenant_id, attendant_id, service_id, dateStr);
    if (!availableSlots.includes(timeStr)) {
        throw new Error("Ops! Este horário já foi reservado ou ficou indisponível no sistema.");
    }

    const appointment = await prisma.appointment.create({
        data: {
            tenant_id,
            attendant_id,
            service_id,
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

    // Envio de WhatsApp (Fase 5 - Debug)
    const result = await sendWhatsAppMessage(tenant_id, client_phone, `Olá ${client_name}! Confirmamos seu agendamento de ${appointment.service.name} com ${appointment.attendant.name} para o dia ${format(dateTime, "dd/MM 'às' HH:mm", { locale: ptBR })}. Te esperamos!`)

    if (!result.success) {
        throw new Error(`WhatsApp não enviado: ${JSON.stringify(result.data || result.reason)}`)
    }
}
