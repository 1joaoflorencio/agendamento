import { google } from 'googleapis'
import prisma from '@/lib/prisma'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/callback`
)

/**
 * Generates the Google Auth URL for the given attendant.
 * We pass the attendantId in the state so we know who logged in on the callback.
 */
export function getGoogleAuthUrl(attendantId: string) {
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
    ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Demands a refresh_token
        prompt: 'consent', // Forces the consent screen to always send a refresh token
        scope: scopes,
        state: attendantId
    })
}

/**
 * Exchanges the auth code for access and refresh tokens.
 */
export async function getGoogleTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
}

/**
 * Returns an authenticated Google Calendar API client for this attendant.
 */
export async function getCalendarClient(attendantId: string) {
    const attendant = await prisma.attendant.findUnique({
        where: { id: attendantId },
        select: { google_access_token: true, google_refresh_token: true }
    })

    if (!attendant || !attendant.google_refresh_token) {
        return null // Not connected
    }

    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/callback`
    )

    client.setCredentials({
        access_token: attendant.google_access_token,
        refresh_token: attendant.google_refresh_token,
    })

    return google.calendar({ version: 'v3', auth: client })
}

/**
 * Adds an appointment to the attendant's Google Calendar.
 * This function should fail gracefully (no-throw) to not break the standard booking flow.
 */
export async function addEventToCalendar(appointmentId: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { service: true, establishment: true }
        })

        if (!appointment) return false

        const calendar = await getCalendarClient(appointment.attendant_id)
        if (!calendar) return false // Professional doesn't have Google connected

        const startDateTime = new Date(appointment.date_time)
        const endDateTime = new Date(startDateTime.getTime() + appointment.service.duration_minutes * 60000)

        const event = {
            summary: `${appointment.service.name} com ${appointment.client_name}`,
            location: appointment.establishment.name,
            description: `**Agendamento Automático - ${appointment.establishment.name}**\n\nCliente: ${appointment.client_name}\nTelefone: ${appointment.client_phone}\nServiço: ${appointment.service.name}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            reminders: {
                useDefault: true,
            },
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        })

        if (response.data.id) {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: { google_event_id: response.data.id }
            })
            return true
        }
        return false
    } catch (e) {
        console.error('[Google Calendar Sync Error] addEvent:', e)
        return false
    }
}

/**
 * Removes an appointment from the attendant's Google Calendar.
 */
export async function removeEventFromCalendar(attendantId: string, googleEventId: string) {
    try {
        const calendar = await getCalendarClient(attendantId)
        if (!calendar) return false

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventId,
        })

        return true
    } catch (e) {
        console.error('[Google Calendar Sync Error] removeEvent:', e)
        return false
    }
}
