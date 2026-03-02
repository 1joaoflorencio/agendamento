import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createAttendant, deleteAttendant } from './actions'
import { Trash2, Plus, User, Mail, Phone, ShieldCheck, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Attendant } from '@prisma/client'
import { EditAttendantDialog } from './EditAttendantDialog'

export default async function TeamPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
    })

    if (!appUser?.establishment_id) {
        redirect('/onboarding')
    }

    const attendants = await prisma.attendant.findMany({
        where: {
            tenant_id: appUser.establishment_id
        },
        orderBy: { created_at: 'desc' }
    })

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Nossa Equipe</h1>
                    <p className="text-slate-500 font-medium mt-1">Gerencie os talentos que fazem seu negócio brilhar.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="h-16 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="w-5 h-5" /> Novo Profissional
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-xl p-8 bg-white">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-3xl font-black">Adicionar Membro</DialogTitle>
                            <DialogDescription className="font-medium text-slate-500">
                                Preencha os dados do novo profissional abaixo.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={createAttendant as any} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</Label>
                                <Input id="name" name="name" placeholder="Ex: João Silva" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</Label>
                                <Input id="email" name="email" type="email" placeholder="joao@exemplo.com" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</Label>
                                <Input id="phone" name="phone" placeholder="(11) 99999-9999" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                            <DialogFooter className="pt-6">
                                <Button type="submit" className="w-full h-14 rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10">
                                    Cadastrar Agora
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {attendants.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold italic">Nenhum profissional cadastrado ainda.</p>
                    </div>
                ) : (
                    attendants.map((membro: Attendant, i: number) => (
                        <Card key={membro.id} className="group border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="p-8 pb-6 flex flex-col items-center text-center">
                                    <div className="relative mb-6">
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

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{membro.name}</h3>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-60">Profissional</span>
                                    </div>
                                </div>

                                <div className="px-8 pb-8 space-y-3">
                                    <div className="flex items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                                        <Mail className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        <span className="text-xs font-bold text-slate-500 truncate">{membro.email || 'Sem e-mail'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                                        <Phone className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        <span className="text-xs font-bold text-slate-500">{membro.phone || 'Sem telefone'}</span>
                                    </div>

                                    <div className="pt-4 flex items-center gap-2">
                                        <a href={`/dashboard?attendantId=${membro.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full h-14 rounded-full border-2 border-slate-100 font-extrabold text-slate-600 hover:bg-slate-50 text-xs shadow-sm">
                                                Agenda
                                            </Button>
                                        </a>
                                        <EditAttendantDialog attendant={membro} />
                                        <form action={deleteAttendant as any}>
                                            <input type="hidden" name="id" value={membro.id} />
                                            <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all" type="submit">
                                                <Trash2 className="h-6 w-6" />
                                            </Button>
                                        </form>
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
