import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getTheme } from '@/lib/niche-themes'
import AgendaView from './AgendaView'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ attendantId?: string }>
}) {
    const supabase = await createClient()
    const { attendantId } = await searchParams

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const appUser: any = await prisma.user.findUnique({
        where: { id: user.id },
        include: { establishment: true }
    })

    if (!appUser?.establishment) {
        if (appUser?.role === 'SUPER_ADMIN') {
            redirect('/super-admin')
        }
        redirect('/login')
    }

    const establishment = appUser.establishment

    if (establishment.status !== 'ACTIVE' && establishment.trial_ends_at && new Date(establishment.trial_ends_at) < new Date()) {
        redirect('/expired')
    }

    const establishmentId = establishment.id
    const theme = getTheme(establishment.niche)

    // Buscar profissionais do estabelecimento
    const attendants = await prisma.attendant.findMany({
        where: { tenant_id: establishmentId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })

    // Agendamentos dos últimos 7 dias + próximos 15 dias
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(now)
    endDate.setDate(now.getDate() + 15)
    endDate.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
        where: {
            tenant_id: establishmentId,
            date_time: { gte: startDate, lte: endDate },
            ...(attendantId ? { attendant_id: attendantId } : {})
        },
        include: {
            service: true,
            attendant: true
        },
        orderBy: {
            date_time: 'asc'
        }
    })

    return (
        <AgendaView
            appointments={appointments}
            attendants={attendants}
            theme={theme}
        />
    )
}
