'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pencil } from 'lucide-react'
import { updateAttendant } from './actions'
import { Attendant } from '@prisma/client'

interface EditAttendantDialogProps {
    attendant: Attendant
}

export function EditAttendantDialog({ attendant }: EditAttendantDialogProps) {
    const [open, setOpen] = useState(false)

    async function handleSubmit(formData: FormData) {
        try {
            await updateAttendant(formData)
            setOpen(false)
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar profissional')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-full border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex-shrink-0">
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] rounded-2xl sm:rounded-[2rem] border-none shadow-xl p-6 sm:p-8 bg-white">
                <DialogHeader className="mb-4 sm:mb-6">
                    <DialogTitle className="text-2xl sm:text-3xl font-black">Editar Profissional</DialogTitle>
                    <DialogDescription className="font-medium text-slate-500">
                        Altere os dados do profissional e clique em salvar.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 sm:space-y-6">
                    <input type="hidden" name="id" value={attendant.id} />

                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</Label>
                        <Input id="edit-name" name="name" defaultValue={attendant.name} placeholder="Ex: João Silva" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</Label>
                        <Input id="edit-email" name="email" type="email" defaultValue={attendant.email || ''} placeholder="joao@exemplo.com" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-phone" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</Label>
                        <Input id="edit-phone" name="phone" defaultValue={attendant.phone || ''} placeholder="(11) 99999-9999" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full h-12 sm:h-14 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10">
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
