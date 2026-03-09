import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getTheme } from '@/lib/niche-themes'
import SearchFilter from '@/components/SearchFilter'
import { Scissors, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import EditServiceDialog from './EditServiceDialog'
import ManageAttendantsDialog from './ManageAttendantsDialog'
import DeleteServiceButton from './DeleteServiceButton'
import AddServiceDialog from './AddServiceDialog'

export default async function ServicesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { establishment: true }
    })

    if (!appUser?.establishment_id) {
        if (appUser?.role === 'SUPER_ADMIN') {
            redirect('/super-admin')
        }
        redirect('/login')
    }

    const services = await prisma.service.findMany({
        where: { tenant_id: appUser.establishment_id },
        include: {
            attendants: {
                select: {
                    attendant_id: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    })

    const attendants = await prisma.attendant.findMany({
        where: { tenant_id: appUser.establishment_id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    const niche = appUser.establishment?.niche
    const { placeholders } = getTheme(niche)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">Catálogo de Serviços</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Defina suas experiências e preços para os clientes.</p>
                </div>

                <AddServiceDialog attendants={attendants} placeholders={placeholders} />
            </div>

            <SearchFilter placeholder="Buscar serviço..." />

            <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.length === 0 ? (
                    <div className="col-span-full py-16 bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-slate-200 text-center px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Scissors className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold italic">Nenhum serviço criado ainda.</p>
                    </div>
                ) : (
                    services.map((item, i) => {
                        const serviceAttendantIds = item.attendants.map(a => a.attendant_id)

                        return (
                            <Card key={item.id} data-search={`${item.name} ${item.description || ''}`} className="group border-none shadow-lg shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:-translate-y-1 transition-all duration-300 relative">
                                <CardContent className="p-0">
                                    <div className="p-4 sm:p-8">
                                        {/* Header: icon + nome + preço/duração */}
                                        <div className="flex items-start gap-3 sm:flex-col">
                                            <div className={cn(
                                                "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0",
                                                i % 2 === 0 ? "bg-gradient-to-tr from-indigo-600 to-indigo-400" : "bg-gradient-to-tr from-violet-600 to-violet-400"
                                            )}>
                                                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {item.name}
                                                </h3>
                                                {item.description && (
                                                    <p className="text-[11px] sm:text-sm font-medium text-slate-400 line-clamp-1 sm:line-clamp-2 italic mt-0.5">
                                                        {item.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5 sm:mt-3">
                                                    <span className="text-xs sm:text-base font-black text-slate-800">
                                                        {item.hide_price ? (
                                                            <span>Preço a Combinar</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-indigo-500 text-[10px] sm:text-xs">R$</span>{' '}
                                                                {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </>
                                                        )}
                                                    </span>
                                                    <span className="text-slate-200">•</span>
                                                    <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {item.duration_minutes}min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações: profissionais + editar + excluir — tudo numa linha */}
                                        <div className="mt-3 sm:mt-5 pt-3 border-t border-slate-50 flex items-center gap-2">
                                            <ManageAttendantsDialog
                                                serviceId={item.id}
                                                serviceName={item.name}
                                                attendants={attendants}
                                                currentAttendantIds={serviceAttendantIds}
                                            />

                                            <EditServiceDialog service={item} />

                                            <DeleteServiceButton id={item.id} name={item.name} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
