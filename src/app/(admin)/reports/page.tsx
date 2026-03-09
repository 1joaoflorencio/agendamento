import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getTheme } from '@/lib/niche-themes'
import ReportsView from './ReportsView'
import { startOfDay, subDays, startOfMonth, startOfYear, format, endOfMonth } from 'date-fns'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { establishment: true }
    })

    if (!appUser?.establishment) {
        redirect('/dashboard')
    }

    const establishmentId = appUser.establishment.id
    const theme = getTheme(appUser.establishment.niche)
    const now = new Date()

    // Query 1: Last 7 Days (Daily breakdown)
    const sevenDaysAgo = subDays(startOfDay(now), 6) // includes today, so 6 days ago -> 7 slots
    const last7DaysAppointments = await prisma.appointment.findMany({
        where: {
            tenant_id: establishmentId,
            status: 'COMPLETED',
            date_time: { gte: sevenDaysAgo, lte: now }
        },
        include: { service: true }
    })

    // Query 2: Current Month (Weekly/Daily Breakdown)
    const startOfCurrentMonth = startOfMonth(now)
    const currentMonthAppointments = await prisma.appointment.findMany({
        where: {
            tenant_id: establishmentId,
            status: 'COMPLETED',
            date_time: { gte: startOfCurrentMonth, lte: now }
        },
        include: { service: true }
    })

    // Query 3: Current Year (Monthly Breakdown)
    const startOfCurrentYear = startOfYear(now)
    const currentYearAppointments = await prisma.appointment.findMany({
        where: {
            tenant_id: establishmentId,
            status: 'COMPLETED',
            date_time: { gte: startOfCurrentYear, lte: now }
        },
        include: { service: true }
    })

    // Process Last 7 Days
    const last7DaysMap: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
        const d = subDays(startOfDay(now), i)
        last7DaysMap[format(d, 'yyyy-MM-dd')] = 0
    }
    last7DaysAppointments.forEach(appt => {
        const key = format(appt.date_time, 'yyyy-MM-dd')
        if (typeof last7DaysMap[key] !== 'undefined') {
            last7DaysMap[key] += appt.service?.price || 0
        }
    })
    const weeklyData = Object.keys(last7DaysMap).sort().map(date => ({
        label: format(new Date(date + 'T00:00:00'), 'dd/MM'),
        value: last7DaysMap[date]
    }))

    // Process Current Month (group by week string inside month)
    const monthlyDataMap: Record<string, number> = {}
    // Pre-fill days of the current month until today
    for (let i = 1; i <= now.getDate(); i++) {
        monthlyDataMap[i.toString()] = 0
    }
    currentMonthAppointments.forEach(appt => {
        const key = appt.date_time.getDate().toString()
        if (typeof monthlyDataMap[key] !== 'undefined') {
            monthlyDataMap[key] += appt.service?.price || 0
        }
    })
    const monthlyData = Object.keys(monthlyDataMap).sort((a, b) => parseInt(a) - parseInt(b)).map(day => ({
        label: `Dia ${day}`,
        value: monthlyDataMap[day]
    }))

    // Process Current Year
    const yearlyDataMap: Record<string, number> = {}
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    for (let i = 0; i <= now.getMonth(); i++) {
        yearlyDataMap[months[i]] = 0
    }
    currentYearAppointments.forEach(appt => {
        const key = months[appt.date_time.getMonth()]
        if (typeof yearlyDataMap[key] !== 'undefined') {
            yearlyDataMap[key] += appt.service?.price || 0
        }
    })
    const yearlyData = Object.keys(yearlyDataMap).map(month => ({
        label: month,
        value: yearlyDataMap[month]
    }))

    // Also get totals
    const totalWeekly = last7DaysAppointments.reduce((acc, curr) => acc + (curr.service?.price || 0), 0)
    const totalMonthly = currentMonthAppointments.reduce((acc, curr) => acc + (curr.service?.price || 0), 0)
    const totalYearly = currentYearAppointments.reduce((acc, curr) => acc + (curr.service?.price || 0), 0)

    const totals = {
        week: totalWeekly,
        month: totalMonthly,
        year: totalYearly
    }

    return (
        <ReportsView
            theme={theme}
            weeklyData={weeklyData}
            monthlyData={monthlyData}
            yearlyData={yearlyData}
            totals={totals}
        />
    )
}
