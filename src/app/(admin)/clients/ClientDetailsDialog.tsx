'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, Clock, CalendarDays, Contact, CheckCircle, Save, Loader2, User } from 'lucide-react'
import { format, isFuture } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateClientNotes } from './actions'

// Definindo os tipos diretamente aqui (um subset do prisma para client)
type AppointmentWithDetails = {
    id: string
    date_time: Date
    status: string
    service: { name: string, price: number }
    attendant: { name: string }
}

type ClientWithHistory = {
    id: string
    name: string
    phone: string
    email: string | null
    notes: string | null
    _count: { appointments: number }
    appointments: AppointmentWithDetails[]
}

export default function ClientDetailsDialog({
    client,
    children
}: {
    client: ClientWithHistory
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [notes, setNotes] = useState(client.notes || '')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSaveNotes = () => {
        startTransition(async () => {
            try {
                await updateClientNotes(client.id, notes)
                toast.success('Anotações salvas com sucesso!')
                router.refresh()
            } catch (error) {
                toast.error('Erro ao salvar anotações.')
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[700px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden bg-slate-50 rounded-2xl">
                <div className="bg-white p-4 sm:p-6 border-b border-slate-100 flex-shrink-0">
                    <DialogHeader>
                        <div className="flex items-center sm:items-start gap-3 sm:gap-4 text-left">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg sm:text-2xl shadow-md flex-shrink-0">
                                {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-lg sm:text-2xl font-black text-slate-800 flex items-center justify-start gap-2 truncate pr-4">
                                    {client.name}
                                </DialogTitle>
                                <DialogDescription className="mt-1 sm:mt-2 flex flex-wrap items-center justify-start gap-2 sm:gap-4 text-slate-500 font-medium text-xs sm:text-sm">
                                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{client.phone}</span></span>
                                    {client.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{client.email}</span></span>}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Seção Anotações Privadas */}
                    <section className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                                <Contact className="w-4 h-4" /> Anotações do Cliente
                            </h3>
                            <Button
                                size="sm"
                                className="h-9 gap-2 bg-slate-900 text-white hover:bg-slate-800 w-full sm:w-auto rounded-lg shadow-sm font-semibold transition-all"
                                onClick={handleSaveNotes}
                                disabled={isPending || notes === (client.notes || '')}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Alterações
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Escreva preferências, alergias, gostos do cliente (Ex: Gosta de cortar com máquina 2, cliente VIP, etc)..."
                            className="min-h-[140px] bg-slate-50 resize-y shadow-inner font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal border-slate-200 focus-visible:ring-indigo-500 rounded-xl leading-relaxed p-4 transition-colors hover:bg-slate-100/50 focus:bg-white"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </section>

                    {/* Histórico Recente */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" /> Histórico de Agendamentos ({client._count.appointments})
                        </h3>

                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col divide-y divide-slate-100">
                            {client.appointments.map((appt) => {
                                const isUpcoming = isFuture(new Date(appt.date_time)) && appt.status === 'SCHEDULED'

                                return (
                                    <div key={appt.id} className={`flex items-center justify-between p-3 sm:p-4 ${isUpcoming ? 'bg-indigo-50/40 relative' : 'bg-white hover:bg-slate-50 transition-colors'}`}>
                                        {isUpcoming && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUpcoming ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100/80 text-slate-400'}`}>
                                                {isUpcoming ? <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm sm:text-base leading-tight truncate">{appt.service.name}</p>
                                                <div className="text-[11px] sm:text-[13px] text-slate-500 mt-1 truncate flex items-center gap-1.5 font-medium">
                                                    <CalendarDays className="w-3 h-3 flex-shrink-0" />
                                                    {format(new Date(appt.date_time), "dd MMM, HH:mm", { locale: ptBR })}
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full mx-0.5" />
                                                    <span className="truncate">{appt.attendant.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-3">
                                            <div className="font-bold text-slate-700 text-sm sm:text-base leading-tight">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appt.service.price)}
                                            </div>
                                            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 ${isUpcoming ? 'text-indigo-600' : appt.status === 'CANCELED' ? 'text-red-500' : 'text-slate-400'}`}>
                                                {isUpcoming ? 'Futuro' : appt.status === 'CANCELED' ? 'Cancelado' : 'Concluído'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {client.appointments.length === 0 && (
                                <div className="text-center py-6 sm:py-8 text-slate-500 text-sm">
                                    Nenhum agendamento encontrado no histórico.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    )
}
