'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createAttendant } from './actions'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import { NichePlaceholders } from '@/lib/niche-themes'
import { toast } from 'sonner'

interface AddAttendantDialogProps {
    placeholders: NichePlaceholders
}

export default function AddAttendantDialog({ placeholders: ph }: AddAttendantDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            try {
                await createAttendant(formData)
                setSuccess(true)
                toast.success('Profissional cadastrado com sucesso!')
                setTimeout(() => {
                    setOpen(false)
                    setSuccess(false)
                }, 1500)
            } catch (error) {
                toast.error((error as Error).message || 'Erro ao cadastrar profissional.')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); setSuccess(false) }}>
            <DialogTrigger asChild>
                <Button className="h-12 sm:h-14 px-6 sm:px-10 rounded-2xl sm:rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                    Nova Pessoa <UserPlus className="h-5 w-5 ml-1" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] rounded-2xl sm:rounded-[2rem] border-none shadow-xl p-6 sm:p-8 bg-white">
                {success ? (
                    <div className="py-8 flex flex-col items-center gap-3 animate-in zoom-in-95 fade-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Cadastrado!</h3>
                        <p className="text-sm text-slate-500 font-medium">Profissional adicionado com sucesso.</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="mb-4 sm:mb-6">
                            <DialogTitle className="text-2xl sm:text-3xl font-black">Adicionar Membro</DialogTitle>
                            <DialogDescription className="font-medium text-slate-500">
                                Preencha os dados do novo profissional abaixo.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</Label>
                                <Input id="name" name="name" placeholder={ph.professionalName} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</Label>
                                <Input id="email" name="email" type="email" placeholder={ph.professionalEmail} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</Label>
                                <Input id="phone" name="phone" placeholder={ph.professionalPhone} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={isPending} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10">
                                    {isPending ? 'Cadastrando...' : 'Cadastrar Agora'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
