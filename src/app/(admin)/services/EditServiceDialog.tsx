'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { updateService } from './actions'
import { Service } from '@prisma/client'
import { Edit2 } from 'lucide-react'

interface EditServiceDialogProps {
    service: Service
}

export default function EditServiceDialog({ service }: EditServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await updateService(formData)
            setOpen(false)
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar serviço')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 h-14 rounded-full border-2 border-slate-100 font-extrabold text-slate-600 hover:bg-slate-50 text-xs shadow-sm">
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-xl p-8 bg-white">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl font-black">Editar Serviço</DialogTitle>
                    <DialogDescription className="font-medium text-slate-500">
                        Atualize as informações do seu serviço.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-6">
                    <input type="hidden" name="id" value={service.id} />

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Serviço</Label>
                        <Input id="name" name="name" defaultValue={service.name} className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Breve Descrição</Label>
                        <Input id="description" name="description" defaultValue={service.description || ''} className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duração (min)</Label>
                            <Input id="duration" name="duration" type="number" min="1" defaultValue={service.duration_minutes} className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</Label>
                            <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={service.price} className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" required />
                        </div>
                    </div>

                    <DialogFooter className="pt-6">
                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10">
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
