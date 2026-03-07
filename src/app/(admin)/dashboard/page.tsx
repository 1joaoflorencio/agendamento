import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getTheme } from '@/lib/niche-themes'
import AgendaView from './AgendaView'
import type { Appointment } from '@/types'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ attendantId?: string }>
}) {
    const supabase = await createClient()
    const { attendantId } = await searchParams

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { establishment: true }
    })

    if (!appUser?.establishment) {
        if (appUser?.role === 'SUPER_ADMIN') {
            redirect('/super-admin')
        }
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 mt-8">
                <div className="w-16 h-16 bg-slate-100/50 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl">🔒</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Acesso Restrito</h2>
                <p className="text-slate-500 max-w-md font-medium">Sua conta ainda não está vinculada a nenhum estabelecimento. Por favor, contate o administrador do sistema.</p>
            </div>
        )
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
            appointments={appointments as unknown as Appointment[]}
            attendants={attendants}
            initialDate={now.toISOString()}
            theme={theme}
        />
    )
}
