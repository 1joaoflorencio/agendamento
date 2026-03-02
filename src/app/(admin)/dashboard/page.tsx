import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, ShoppingBag, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

    if (!appUser?.establishment_id || !appUser.establishment) {
        redirect('/onboarding')
    }

    const establishmentId = appUser.establishment_id

    // Cálculo da Semana (Hoje + 6 dias)
    const now = new Date()
    const startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(now)
    endDate.setDate(now.getDate() + 7)
    endDate.setHours(23, 59, 59, 999)

    // Agendamentos da Semana (com filtro opcional por profissional)
    const appointments = await prisma.appointment.findMany({
        where: {
            tenant_id: establishmentId,
            date_time: { gte: startDate, lte: endDate },
            status: { not: 'CANCELED' },
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

    // Se houver filtro, pegar o nome do profissional para o título
    const filteredAttendant = attendantId
        ? await prisma.attendant.findUnique({ where: { id: attendantId } })
        : null

    // Estatísticas Simples
    const totalWeek = appointments.length
    const estimatedRevenue = appointments.reduce((acc: number, curr: any) => acc + (curr.service.price || 0), 0)
    const uniqueClients = new Set(appointments.map((a: any) => a.client_phone)).size

    // Agrupar por dia para facilitar a leitura
    const groupedAppointments: { [key: string]: any[] } = {}
    appointments.forEach((appt: any) => {
        const dateKey = appt.date_time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
        if (!groupedAppointments[dateKey]) groupedAppointments[dateKey] = []
        groupedAppointments[dateKey].push(appt)
    })

    const stats = [
        {
            label: 'Agendamentos da Semana',
            value: totalWeek.toString(),
            icon: Calendar,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Clientes na Semana',
            value: uniqueClients.toString(),
            icon: Users,
            color: 'text-violet-600',
            bg: 'bg-violet-50'
        },
        {
            label: 'Receita Est. Semana',
            value: `R$ ${estimatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: ShoppingBag,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        }
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Simples */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        {filteredAttendant ? `Agenda: ${filteredAttendant.name} 👥` : 'Agenda da Semana 📅'}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {filteredAttendant
                            ? `Visualizando compromissos específicos deste profissional.`
                            : 'Visualize e gerencie seus próximos compromissos em um só lugar.'}
                    </p>
                </div>
                {attendantId && (
                    <a href="/dashboard">
                        <Button className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 border-none">
                            Ver Todos
                        </Button>
                    </a>
                )}
            </div>

            {/* Grid de Estatísticas Rápidas (Compactas) */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md shadow-slate-100 bg-white/70 backdrop-blur-sm rounded-[1.5rem] overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2.5 rounded-2xl transition-colors duration-300", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Lista Cronológica */}
            <div className="space-y-8">
                {Object.keys(groupedAppointments).length === 0 ? (
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[2.5rem] p-12 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <Calendar className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold italic">Nenhum agendamento encontrado para os próximos 7 dias.</p>
                        </div>
                    </Card>
                ) : (
                    Object.entries(groupedAppointments).map(([date, dayAppts]) => (
                        <div key={date} className="space-y-4">
                            <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-3">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                {date}
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </h2>
                            <div className="grid gap-3">
                                {dayAppts.map((appt: any) => (
                                    <div key={appt.id} className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-100 font-black flex-shrink-0">
                                                <span className="text-[9px] uppercase opacity-60">Hora</span>
                                                <span className="text-base">
                                                    {appt.date_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 text-sm truncate">{appt.service.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-black text-indigo-500 uppercase italic truncate">
                                                        {appt.client_name}
                                                    </span>
                                                    <span className="text-slate-300 text-[10px]">•</span>
                                                    <span className="text-[11px] text-slate-400 font-bold truncate">
                                                        Pro: {appt.attendant.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                    Status: <span className="text-slate-700">{appt.status === 'SCHEDULED' ? 'Agendado' : appt.status}</span>
                                                </span>
                                            </div>
                                            <a
                                                href={`https://wa.me/${appt.client_phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm flex-shrink-0"
                                            >
                                                <Clock className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
