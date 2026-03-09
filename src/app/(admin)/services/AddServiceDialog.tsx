'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createService } from './actions'
import { Plus, CheckCircle2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NichePlaceholders } from '@/lib/niche-themes'
import { toast } from 'sonner'

interface AddServiceDialogProps {
    attendants: { id: string; name: string }[]
    placeholders: NichePlaceholders
}

export default function AddServiceDialog({ attendants, placeholders: ph }: AddServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)
    const [selectedAttendants, setSelectedAttendants] = useState<string[]>([])
    const [isPriceHidden, setIsPriceHidden] = useState(false)

    const toggleAttendant = (id: string) => {
        setSelectedAttendants(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        )
    }

    const handleSubmit = (formData: FormData) => {
        // Add selected attendants to formData
        selectedAttendants.forEach(id => formData.append('attendant_ids', id))

        startTransition(async () => {
            try {
                await createService(formData)
                setSuccess(true)
                toast.success('Serviço criado com sucesso!')
                setTimeout(() => {
                    setOpen(false)
                    setSuccess(false)
                    setSelectedAttendants([])
                    setIsPriceHidden(false)
                }, 1500)
            } catch (error) {
                toast.error((error as Error).message || 'Erro ao criar serviço.')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) { setSuccess(false); setSelectedAttendants([]); setIsPriceHidden(false); } }}>
            <DialogTrigger asChild>
                <Button className="h-12 sm:h-14 px-6 sm:px-10 rounded-2xl sm:rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                    Novo Serviço <Plus className="h-5 w-5 ml-1" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] rounded-2xl sm:rounded-[2rem] border-none shadow-xl p-6 sm:p-8 bg-white max-h-[90vh] overflow-y-auto">
                {success ? (
                    <div className="py-8 flex flex-col items-center gap-3 animate-in zoom-in-95 fade-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Serviço Criado!</h3>
                        <p className="text-sm text-slate-500 font-medium">Adicionado ao catálogo com sucesso.</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="mb-4 sm:mb-6">
                            <DialogTitle className="text-2xl sm:text-3xl font-black">Adicionar Serviço</DialogTitle>
                            <DialogDescription className="font-medium text-slate-500">
                                Crie uma nova oferta no seu catálogo.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="svc-name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Serviço</Label>
                                <Input id="svc-name" name="name" placeholder={ph.serviceName} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="svc-desc" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Breve Descrição</Label>
                                <Input id="svc-desc" name="description" placeholder={ph.serviceDescription} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="svc-dur" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duração (min)</Label>
                                    <Input id="svc-dur" name="duration" type="number" min="1" placeholder={ph.serviceDuration} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="svc-price" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="hide-price"
                                                name="hide_price"
                                                checked={isPriceHidden}
                                                onChange={(e) => setIsPriceHidden(e.target.checked)}
                                                className="w-3 h-3 rounded text-indigo-600 focus:ring-indigo-600 border-slate-300"
                                            />
                                            <Label htmlFor="hide-price" className="text-[10px] font-bold text-slate-500 cursor-pointer">A Combinar</Label>
                                        </div>
                                    </div>
                                    <Input id="svc-price" name="price" type="number" step="0.01" min="0" placeholder={ph.servicePrice} defaultValue="0" disabled={isPriceHidden} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50 disabled:opacity-50" required />
                                </div>
                            </div>

                            {/* Seleção de profissionais */}
                            {attendants.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Profissionais</Label>
                                    <p className="text-[11px] text-slate-400 ml-1">Selecione quem realiza este serviço. Nenhum selecionado = todos.</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {attendants.map(att => {
                                            const isSelected = selectedAttendants.includes(att.id)
                                            return (
                                                <button
                                                    key={att.id}
                                                    type="button"
                                                    onClick={() => toggleAttendant(att.id)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border",
                                                        isSelected
                                                            ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                            : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                                                    )}
                                                >
                                                    <User className="w-3 h-3" />
                                                    {att.name.split(' ')[0]}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={isPending} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10">
                                    {isPending ? 'Criando...' : 'Salvar no Catálogo'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
