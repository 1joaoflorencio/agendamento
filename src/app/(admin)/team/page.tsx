import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getTheme } from '@/lib/niche-themes'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, ShieldCheck, Users, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Attendant } from '@prisma/client'
import { EditAttendantDialog } from './EditAttendantDialog'
import AddAttendantDialog from './AddAttendantDialog'
import DeleteAttendantButton from './DeleteAttendantButton'
import SearchFilter from '@/components/SearchFilter'

export default async function TeamPage() {
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

    const attendants = await prisma.attendant.findMany({
        where: {
            tenant_id: appUser.establishment_id
        },
        orderBy: { created_at: 'desc' }
    })

    const niche = appUser.establishment?.niche
    const { placeholders } = getTheme(niche)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">Nossa Equipe</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Gerencie os talentos que fazem seu negócio brilhar.</p>
                </div>

                <AddAttendantDialog placeholders={placeholders} />
            </div>

            <SearchFilter placeholder="Buscar profissional..." />

            {/* Mobile: compact list */}
            <div className="flex flex-col gap-3 sm:hidden">
                {attendants.length === 0 ? (
                    <div className="py-16 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200 text-center px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold italic">Nenhum profissional cadastrado ainda.</p>
                    </div>
                ) : (
                    attendants.map((membro: Attendant, i: number) => (
                        <div key={membro.id} data-search={`${membro.name} ${membro.email || ''} ${membro.phone || ''}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                            {/* Avatar */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0",
                                i % 2 === 0 ? "bg-gradient-to-tr from-indigo-500 to-violet-500" : "bg-gradient-to-tr from-emerald-500 to-teal-500"
                            )}>
                                <User className="w-6 h-6" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-900 truncate">{membro.name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                    <span className="text-[11px] font-medium text-slate-400 truncate">{membro.phone || 'Sem telefone'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <a href={`/dashboard?attendantId=${membro.id}`}>
                                    <Button variant="outline" size="icon" className="w-9 h-9 rounded-lg border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                                        <CalendarDays className="w-4 h-4" />
                                    </Button>
                                </a>
                                <EditAttendantDialog attendant={membro} />
                                <DeleteAttendantButton id={membro.id} name={membro.name} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop: original card grid */}
            <div className="hidden sm:grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {attendants.length === 0 ? (
                    <div className="col-span-full py-16 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 text-center px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold italic">Nenhum profissional cadastrado ainda.</p>
                    </div>
                ) : (
                    attendants.map((membro: Attendant, i: number) => (
                        <Card key={membro.id} data-search={`${membro.name} ${membro.email || ''} ${membro.phone || ''}`} className="group border-none shadow-lg shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[2.5rem] overflow-hidden hover:-translate-y-1 transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="p-8 pb-6 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <div className={cn(
                                            "w-24 h-24 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:rotate-6",
                                            i % 2 === 0 ? "bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-indigo-200" : "bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-200"
                                        )}>
                                            <User className="w-12 h-12" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-50">
                                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                        </div>
                                    </div>

                                    <div className="space-y-0.5 w-full">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{membro.name}</h3>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-60">Profissional</span>
                                    </div>
                                </div>

                                <div className="px-8 pb-8 space-y-2">
                                    <div className="flex items-center gap-2.5 p-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-0">
                                        <Mail className="w-4 h-4 flex-shrink-0 text-slate-300" />
                                        <span className="text-xs font-bold text-slate-500 truncate">{membro.email || 'Sem e-mail'}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 p-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-0">
                                        <Phone className="w-4 h-4 flex-shrink-0 text-slate-300" />
                                        <span className="text-xs font-bold text-slate-500 truncate">{membro.phone || 'Sem telefone'}</span>
                                    </div>

                                    <div className="pt-3 flex items-center gap-2">
                                        <a href={`/dashboard?attendantId=${membro.id}`} className="flex-1 min-w-0">
                                            <Button variant="outline" className="w-full h-14 rounded-full border-2 border-slate-100 font-extrabold text-slate-600 hover:bg-slate-50 text-xs shadow-sm">
                                                Agenda
                                            </Button>
                                        </a>
                                        <EditAttendantDialog attendant={membro} />
                                        <DeleteAttendantButton
                                            id={membro.id}
                                            name={membro.name}
                                            className="w-14 h-14 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                            iconSize="h-6 w-6"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
