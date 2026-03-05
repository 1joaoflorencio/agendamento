'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { updateServiceAttendants } from './actions'
import { Users, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Attendant {
    id: string
    name: string
}

interface ManageAttendantsDialogProps {
    serviceId: string
    serviceName: string
    attendants: Attendant[]
    currentAttendantIds: string[]
}

export default function ManageAttendantsDialog({ serviceId, serviceName, attendants, currentAttendantIds }: ManageAttendantsDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>(currentAttendantIds)
    const [isPending, startTransition] = useTransition()

    const toggleAttendant = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateServiceAttendants(serviceId, selectedIds)
                setOpen(false)
            } catch (error) {
                console.error(error)
                alert('Erro ao salvar profissionais.')
            }
        })
    }

    // Reset quando abrir o dialog
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setSelectedIds(currentAttendantIds)
        }
        setOpen(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 sm:h-10 px-3 rounded-xl sm:rounded-full border-2 font-bold text-xs transition-all flex items-center gap-1.5",
                        currentAttendantIds.length > 0
                            ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                >
                    <Users className="w-3.5 h-3.5" />
                    {currentAttendantIds.length > 0 ? `${currentAttendantIds.length} prof.` : 'Todos'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] rounded-2xl sm:rounded-[2rem] border-none shadow-xl p-6 sm:p-8 bg-white">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl sm:text-2xl font-black">Profissionais</DialogTitle>
                    <DialogDescription className="font-medium text-slate-500">
                        Selecione quem realiza <span className="font-bold text-slate-700">{serviceName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {attendants.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6 font-medium">
                            Nenhum profissional cadastrado. Adicione na aba Equipe.
                        </p>
                    ) : (
                        attendants.map((att) => {
                            const isSelected = selectedIds.includes(att.id)
                            return (
                                <button
                                    key={att.id}
                                    onClick={() => toggleAttendant(att.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                        isSelected
                                            ? "bg-indigo-50 border-2 border-indigo-200"
                                            : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0",
                                        isSelected ? "bg-indigo-500" : "bg-slate-300"
                                    )}>
                                        {isSelected ? <Check className="w-5 h-5" /> : att.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold flex-1",
                                        isSelected ? "text-indigo-700" : "text-slate-600"
                                    )}>
                                        {att.name}
                                    </span>
                                    {isSelected && (
                                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">
                                            Selecionado
                                        </span>
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>

                <p className="text-[10px] text-slate-400 font-medium mt-2">
                    {selectedIds.length === 0
                        ? '⚡ Sem seleção = todos os profissionais podem realizar este serviço.'
                        : `${selectedIds.length} profissional(is) selecionado(s).`
                    }
                </p>

                <DialogFooter className="pt-4 flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="w-full h-12 sm:h-14 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-white font-black transition-all shadow-xl shadow-slate-900/10"
                    >
                        {isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
