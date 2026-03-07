import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Calendar, Phone, User as UserIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ClientDetailsDialog from './ClientDetailsDialog'

export default async function ClientsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { establishment: true }
    })

    if (!dbUser?.establishment) {
        return <div>Loja não encontrada.</div>
    }

    // Busca todos os clientes atrelados a essa loja, junto com a contagem de agendamentos
    const clients = await prisma.client.findMany({
        where: { tenant_id: dbUser.establishment.id },
        include: {
            _count: {
                select: { appointments: true }
            },
            appointments: {
                orderBy: { date_time: 'desc' },
                include: { service: true, attendant: true } // Buscamos todo o histórico detalhado aqui
            }
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Meus Clientes</h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Gerencie a carteira de clientes da sua loja e visualize o histórico.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] flex flex-col divide-y divide-slate-100">
                {clients.map((client) => {
                    const lastVisit = client.appointments[0]?.date_time

                    return (
                        <ClientDetailsDialog key={client.id} client={client}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group gap-4 sm:gap-0">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                                        {client.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{client.name}</h3>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 mt-0.5">
                                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{client.phone}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 ml-14 sm:ml-0">
                                    <div className="flex flex-col text-left sm:text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Agendamentos</span>
                                        <span className="text-sm font-black text-slate-700">{client._count.appointments}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Última Visita</span>
                                        <span className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center justify-end gap-1">
                                            {lastVisit ? format(lastVisit, "dd MMM yyyy", { locale: ptBR }) : 'Nunca'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ClientDetailsDialog>
                    )
                })}

                {clients.length === 0 && (
                    <div className="py-16 text-center bg-slate-50/50">
                        <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Nenhum cliente cadastrado</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                            A carteira de clientes será populada automaticamente quando as pessoas agendarem no seu portal.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
