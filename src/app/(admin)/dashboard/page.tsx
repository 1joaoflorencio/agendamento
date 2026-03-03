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
            {/* Header Focado na Agenda */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 p-8 rounded-[2.5rem] shadow-sm backdrop-blur-md border border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            {filteredAttendant ? `Agenda de ${filteredAttendant.name}` : 'Minha Agenda'}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Acompanhe todos os seus compromissos programados.
                        </p>
                    </div>
                </div>
                {attendantId && (
                    <a href="/dashboard">
                        <Button className="h-12 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-8 border-none transition-all shadow-sm">
                            Ver Agenda Completa
                        </Button>
                    </a>
                )}
            </div>

            {/* Lista Cronológica - Foco Principal */}
            <div className="space-y-8">
                {Object.keys(groupedAppointments).length === 0 ? (
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[2.5rem] p-16 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-700">Agenda Livre! 🎉</h3>
                            <p className="text-slate-400 font-bold italic">Nenhum agendamento encontrado para os próximos 7 dias.</p>
                        </div>
                    </Card>
                ) : (
                    Object.entries(groupedAppointments).map(([date, dayAppts]) => (
                        <div key={date} className="space-y-6">
                            <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent">
                                <h2 className="text-lg font-black text-slate-600 uppercase tracking-widest flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                    {date}
                                    <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                {dayAppts.map((appt: any) => (
                                    <div key={appt.id} className="bg-white border-2 border-transparent hover:border-indigo-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-default">
                                        <div className="flex items-center gap-5 w-full sm:w-auto">
                                            <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-slate-600 group-hover:text-indigo-600 shadow-inner font-black flex-shrink-0 transition-colors">
                                                <span className="text-[10px] uppercase opacity-50 tracking-widest mb-0.5">Hora</span>
                                                <span className="text-lg leading-none">
                                                    {appt.date_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-black text-slate-800 truncate">{appt.service.name}</h3>
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight truncate">
                                                            {appt.client_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">PRO:</span>
                                                        <span className="text-xs text-slate-600 font-bold truncate">
                                                            {appt.attendant.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-end justify-center h-16">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    Status
                                                </span>
                                                <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">
                                                    {appt.status === 'SCHEDULED' ? 'Agendado' : appt.status}
                                                </span>
                                            </div>
                                            <a
                                                href={`https://wa.me/${appt.client_phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex flex-col items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm flex-shrink-0 group/btn"
                                                title="Contatar Cliente no WhatsApp"
                                            >
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current mb-0.5" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                                </svg>
                                                <span className="text-[8px] uppercase tracking-widest font-black opacity-60 group-hover/btn:opacity-100">Whats</span>
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
