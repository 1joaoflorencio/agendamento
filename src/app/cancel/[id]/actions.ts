"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function cancelAppointment(appointmentId: string) {
    // 1. Fetch appointment to verify it exists and is scheduled
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            attendant: true,
            service: true
        }
    })

    if (!appointment) {
        throw new Error("Agendamento não encontrado.")
    }

    if (appointment.status !== 'SCHEDULED') {
        throw new Error("Este agendamento já foi cancelado ou concluído.")
    }

    // 2. Map transition to CANCELED
    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: 'CANCELED'
        }
    })

    // 3. Send WhatsApp Notification to the Attendant
    if (appointment.attendant.phone) {
        const dateTimeFormatted = format(new Date(appointment.date_time), "dd/MM 'às' HH:mm", { locale: ptBR })
        const message = `❌ *Cancelamento de Cliente*\n\nO cliente *${appointment.client_name}* acabou de cancelar o agendamento pelo link do sistema.\n\n*Serviço:* ${appointment.service.name}\n*Horário vago:* ${dateTimeFormatted}`

        try {
            await sendWhatsAppMessage(appointment.tenant_id, appointment.attendant.phone, message)
        } catch (error) {
            console.error("[WhatsApp] Failed to send cancellation notice to attendant:", error)
        }
    }

    // 4. Invalidate the page cache to show the CANCELED state
    revalidatePath(`/cancel/${appointmentId}`)
    revalidatePath('/dashboard') // Invalidate admin dashboard as well

    return updated
}
