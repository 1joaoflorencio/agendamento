import { format, addMinutes } from "date-fns"

export function generateGoogleCalendarLink({
    title,
    description,
    startTime,
    duration,
}: {
    title: string
    description: string
    startTime: Date
    duration: number
}) {
    const endTime = addMinutes(startTime, duration)

    const fmt = (date: Date) => format(date, "yyyyMMdd'T'HHmmss")

    const url = new URL("https://calendar.google.com/calendar/render")
    url.searchParams.append("action", "TEMPLATE")
    url.searchParams.append("text", title)
    url.searchParams.append("details", description)
    url.searchParams.append("dates", `${fmt(startTime)}/${fmt(endTime)}`)

    return url.toString()
}

export function generateIcsContent({
    title,
    description,
    startTime,
    duration,
}: {
    title: string
    description: string
    startTime: Date
    duration: number
}) {
    const endTime = addMinutes(startTime, duration)
    const fmt = (date: Date) => format(date, "yyyyMMdd'T'HHmmss")

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${fmt(startTime)}`,
        `DTEND:${fmt(endTime)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\n")
}
