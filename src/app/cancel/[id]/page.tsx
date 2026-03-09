import prisma from '@/lib/prisma'
import { format, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import CancelBookingClientControls from './CancelBookingClientControls'
import { getTheme } from '@/lib/niche-themes'
import { CalendarIcon, Clock, Scissors, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function CancelPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Fetch the appointment and related data
    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            establishment: true,
            service: true,
            attendant: true
        }
    })

    if (!appointment) {
        return notFound()
    }

    const theme = getTheme(appointment.establishment.niche || undefined)
    const isPast = isBefore(new Date(appointment.date_time), new Date())
    const isCanceled = appointment.status === 'CANCELED'

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* HEADERS */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                        {appointment.establishment.name}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Detalhes do seu agendamento
                    </p>
                </div>

                {/* STATUS CARDS */}
                {isCanceled ? (
                    <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[1.5rem] text-center shadow-inner">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-red-700 font-black text-xl mb-1">Agendamento Cancelado</h2>
                        <p className="text-red-600/80 text-sm font-medium">Esta reserva não está mais ativa.</p>
                    </div>
                ) : isPast ? (
                    <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-[1.5rem] text-center shadow-inner">
                        <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h2 className="text-slate-700 font-black text-xl mb-1">Agendamento Concluído</h2>
                        <p className="text-slate-500 text-sm font-medium">A data deste encontro já passou.</p>
                    </div>
                ) : (
                    <div className={cn("bg-white border-2 rounded-[2rem] p-6 shadow-xl relative overflow-hidden", theme.borderMuted, theme.shadow)}>
                        <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", theme.gradient)}></div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Scissors className="w-3 h-3" /> Serviço</span>
                                <span className="text-slate-800 text-sm font-black text-right">{appointment.service.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Profissional</span>
                                <span className="text-slate-800 text-sm font-black text-right">{appointment.attendant.name}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Data e Hora</span>
                                <div className="text-right">
                                    <span className="text-slate-800 text-sm font-black block">{format(new Date(appointment.date_time), "dd 'de' MMMM", { locale: ptBR })}</span>
                                    <span className={cn("text-sm font-black px-2 py-0.5 rounded-md mt-1 inline-block", theme.textPrimary, theme.bgMuted)}>{format(new Date(appointment.date_time), 'HH:mm')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <CancelBookingClientControls appointmentId={appointment.id} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
