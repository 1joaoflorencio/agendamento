import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createService, deleteService } from './actions'
import { Trash2, Plus, Scissors, Clock, Banknote, Sparkles, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Service } from '@prisma/client'
import { cn } from '@/lib/utils'
import EditServiceDialog from './EditServiceDialog'

export default async function ServicesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
    })

    if (!appUser?.establishment_id) {
        redirect('/onboarding')
    }

    const services = await prisma.service.findMany({
        where: { tenant_id: appUser.establishment_id },
        orderBy: { created_at: 'desc' }
    })

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Catálogo de Serviços</h1>
                    <p className="text-slate-500 font-medium mt-1">Defina suas experiências e preços para os clientes.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="h-16 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="w-5 h-5" /> Novo Serviço
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-xl p-8 bg-white">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-3xl font-black">Adicionar Serviço</DialogTitle>
                            <DialogDescription className="font-medium text-slate-500">
                                Crie uma nova oferta no seu catálogo.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={createService} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Serviço</Label>
                                <Input id="name" name="name" placeholder="Ex: Corte Moderno + Barba" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Breve Descrição</Label>
                                <Input id="description" name="description" placeholder="Ex: Combo completo com toalha quente" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duração (min)</Label>
                                    <Input id="duration" name="duration" type="number" min="1" placeholder="45" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</Label>
                                    <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="60.00" className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                                </div>
                            </div>
                            <DialogFooter className="pt-6">
                                <Button type="submit" className="w-full h-14 rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10">
                                    Salvar no Catálogo
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Scissors className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold italic">Nenhum serviço criado ainda.</p>
                    </div>
                ) : (
                    services.map((item: Service, i: number) => (
                        <Card key={item.id} className="group border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-all duration-300 relative">
                            {/* Badge de Destaque Aleatório para visual */}
                            {i === 0 && (
                                <div className="absolute top-6 right-6 z-10 bg-amber-400 text-white p-2 rounded-full shadow-lg animate-bounce">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            )}

                            <CardContent className="p-0">
                                <div className="p-8">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/10",
                                        i % 2 === 0 ? "bg-gradient-to-tr from-indigo-600 to-indigo-400" : "bg-gradient-to-tr from-violet-600 to-violet-400"
                                    )}>
                                        <Sparkles className="w-8 h-8" />
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-400 line-clamp-2 min-h-[2.5rem] italic">
                                            {item.description || 'Sem descrição detalhada disponível.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Investimento</span>
                                            <div className="flex items-center gap-1.5 text-slate-900 font-black text-xl tracking-tighter">
                                                <span className="text-sm text-indigo-500">R$</span>
                                                {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Duração</span>
                                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                                                <Clock className="w-3 h-3 text-slate-500" />
                                                <span className="text-xs font-black text-slate-600 tracking-tight">
                                                    {item.duration_minutes} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        <EditServiceDialog service={item} />
                                        <form action={deleteService as any}>
                                            <input type="hidden" name="id" value={item.id} />
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
