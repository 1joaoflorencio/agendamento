import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { addHours, format, subMinutes } from 'date-fns'

// Ideally this cron job runs every 15-30 minutes minimum on Vercel
export async function GET(req: Request) {
    try {
        // Authenticate the cron request
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const targetTimeWindow = addHours(now, 2) // Look 2 hours ahead
        const earlierBound = subMinutes(now, 10) // Small safety buffer for slightly missed cron beats

        // Fetch appointments that:
        // 1. Are scheduled (not canceled/completed)
        // 2. Haven't had a reminder sent yet
        // 3. The date_time is within the next 2 hours but hasn't passed "now"
        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                status: 'SCHEDULED',
                reminder_sent: false,
                date_time: {
                    lte: targetTimeWindow,
                    gte: earlierBound
                },
                establishment: {
                    whatsapp_enabled: true
                }
            },
            include: {
                establishment: true,
                service: true,
                attendant: true
            }
        })

        if (upcomingAppointments.length === 0) {
            return NextResponse.json({ success: true, message: 'No reminders to send' })
        }

        const stats = { sent: 0, failed: 0 }

        // Process reminders one by one
        for (const appt of upcomingAppointments) {
            const formattedTime = format(new Date(appt.date_time), 'HH:mm')

            // 1. Send to Client
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coreagenda.vercel.app'
            const cancelLink = `${appUrl}/cancel/${appt.id}`
            const clientMsg = `⚠️ *Lembrete de Agendamento* ⚠️\n\nOlá ${appt.client_name}, passando para lembrar do seu horário hoje na *${appt.establishment.name}*!\n\n📅 Tratamento: ${appt.service.name}\n⏰ Horário: ${formattedTime}\n👨‍🎨 Profissional: ${appt.attendant.name}\n\nSe precisar reagendar, por favor nos avise com antecedência.\n\n_Para cancelar este agendamento, acesse:_\n${cancelLink}`
            const clientResult = await sendWhatsAppMessage(appt.tenant_id, appt.client_phone, clientMsg)

            // 2. Send to Attendant (if they have a phone number)
            if (appt.attendant.phone) {
                const attendantMsg = `🔔 *Lembrete de Serviço* 🔔\n\nOlá ${appt.attendant.name}, você tem um cliente agendado em breve:\n\n👤 Cliente: ${appt.client_name}\n📞 Contato: ${appt.client_phone}\n📅 Tratamento: ${appt.service.name}\n⏰ Horário: ${formattedTime}`
                await sendWhatsAppMessage(appt.tenant_id, appt.attendant.phone, attendantMsg)
            }

            // If the message was sent to the client successfully (or if it attempted and the tenant is blocked), we mark it as sent so it doesn't loop forever
            if (clientResult.success || clientResult.reason === 'disabled') {
                await prisma.appointment.update({
                    where: { id: appt.id },
                    data: { reminder_sent: true }
                })
                stats.sent++
            } else {
                stats.failed++
            }
        }

        return NextResponse.json({ success: true, processed: upcomingAppointments.length, stats })

    } catch (error) {
        console.error('[Cron Error]', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
