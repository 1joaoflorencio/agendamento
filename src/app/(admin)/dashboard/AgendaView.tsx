'use client'

import { useState, useMemo, useTransition } from 'react'
import { Calendar, User, Phone as PhoneIcon, CheckCircle2, XCircle, Clock, ChevronDown, DollarSign, Users, PhoneCall, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format, addDays, subDays, isSameDay, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { updateAppointmentStatus } from './actions'

type Appointment = {
    id: string
    date_time: Date
    status: string
    client_name: string
    client_phone: string
    client_email?: string | null
    service: { name: string; price: number; duration_minutes: number }
    attendant: { name: string; id: string }
}

type AttendantOption = {
    id: string
    name: string
}

type AgendaViewProps = {
    appointments: Appointment[]
    attendants: AttendantOption[]
    theme: {
        textPrimary: string
        bgMuted: string
        gradient: string
        shadow: string
    }
}

export default function AgendaView({ appointments, attendants, theme }: AgendaViewProps) {
    // Use startOfDay to create a stable date (no time component = no SSR mismatch)
    const today = startOfDay(new Date())
    const [selectedDate, setSelectedDate] = useState<Date>(today)
    const [selectedAttendant, setSelectedAttendant] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [pendingAction, setPendingAction] = useState<string | null>(null)

    const allDays = useMemo(() => {
        const days = []
        // 7 dias atrás + hoje + 14 dias à frente
        for (let i = -7; i <= 14; i++) {
            days.push(addDays(today, i))
        }
        return days
    }, [])

    const isPastDate = isBefore(selectedDate, today)

    // Filtrar por dia e por profissional
    const selectedAppointments = useMemo(() => {
        return appointments
            .filter(appt => isSameDay(new Date(appt.date_time), selectedDate))
            .filter(appt => !selectedAttendant || appt.attendant.id === selectedAttendant)
            .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    }, [appointments, selectedDate, selectedAttendant])

    // Stats do dia
    const stats = useMemo(() => {
        const total = selectedAppointments.length
        const scheduled = selectedAppointments.filter(a => a.status === 'SCHEDULED').length
        const completed = selectedAppointments.filter(a => a.status === 'COMPLETED').length
        const canceled = selectedAppointments.filter(a => a.status === 'CANCELED').length
        const revenue = selectedAppointments
            .filter(a => a.status === 'COMPLETED')
            .reduce((acc, curr) => acc + (curr.service.price || 0), 0)
        return { total, scheduled, completed, canceled, revenue }
    }, [selectedAppointments])

    // Contar agendamentos por dia (para dots)
    const appointmentCountByDay = useMemo(() => {
        const counts: Record<string, number> = {}
        appointments.forEach(appt => {
            if (appt.status === 'CANCELED') return
            const key = format(new Date(appt.date_time), 'yyyy-MM-dd')
            counts[key] = (counts[key] || 0) + 1
        })
        return counts
    }, [appointments])

    const handleStatusChange = (id: string, status: 'COMPLETED' | 'CANCELED') => {
        setPendingAction(id)
        startTransition(async () => {
            await updateAppointmentStatus(id, status)
            setPendingAction(null)
        })
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return { label: 'Agendado', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' }
            case 'COMPLETED':
                return { label: 'Concluído', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' }
            case 'CANCELED':
                return { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400' }
            default:
                return { label: status, bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' }
        }
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-700 pb-8 overflow-x-hidden">
            {/* Header */}
            <div className="mt-2 sm:mt-4">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Agenda</h1>
                <p className="text-sm text-slate-500 font-medium capitalize">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
            </div>

            {/* Aviso de data passada */}
            {isPastDate && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-2 text-xs font-bold">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Você está vendo um dia que já passou.
                </div>
            )}

            {/* Date Swiper */}
            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-hide" id="date-swiper" ref={(el) => {
                // Auto-scroll to today on mount
                if (el && !el.dataset.scrolled) {
                    const todayBtn = el.querySelector('[data-today="true"]')
                    if (todayBtn) {
                        todayBtn.scrollIntoView({ inline: 'center', block: 'nearest' })
                        el.dataset.scrolled = 'true'
                    }
                }
            }}>
                {allDays.map((date, idx) => {
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, today)
                    const dateKey = format(date, 'yyyy-MM-dd')
                    const count = appointmentCountByDay[dateKey] || 0
                    const isPast = isBefore(startOfDay(date), today)
                    return (
                        <button
                            key={idx}
                            data-today={isToday ? 'true' : undefined}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[4rem] h-[4.5rem] rounded-2xl snap-center transition-all border",
                                isSelected
                                    ? cn("bg-gradient-to-tr text-white shadow-lg scale-105 border-none", theme.gradient, theme.shadow)
                                    : isToday
                                        ? "bg-white text-slate-700 border-indigo-200 shadow-sm"
                                        : isPast
                                            ? "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
                                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-100"
                            )}
                        >
                            <span className={cn("text-[10px] uppercase font-black tracking-widest", isSelected ? "text-white/80" : "text-slate-400")}>
                                {format(date, 'eee', { locale: ptBR }).replace('.', '')}
                            </span>
                            <span className="text-lg font-black leading-none mt-0.5">
                                {format(date, 'dd')}
                            </span>
                            {/* Dot indicador de agendamentos */}
                            {count > 0 && !isSelected && (
                                <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                            )}
                            {count > 0 && isSelected && (
                                <span className="text-[9px] font-black mt-0.5 text-white/80">{count}</span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Filtro por Profissional */}
            {attendants.length > 0 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                        onClick={() => setSelectedAttendant(null)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border",
                            !selectedAttendant
                                ? cn("bg-gradient-to-r text-white border-none shadow-md", theme.gradient)
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        <Users className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Todos
                    </button>
                    {attendants.map(att => (
                        <button
                            key={att.id}
                            onClick={() => setSelectedAttendant(att.id === selectedAttendant ? null : att.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border",
                                selectedAttendant === att.id
                                    ? cn("bg-gradient-to-r text-white border-none shadow-md", theme.gradient)
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {att.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats do dia */}
            <div className="flex gap-2 sm:gap-3 w-full">
                <div className="flex-1 min-w-0 bg-white rounded-2xl p-2.5 sm:p-4 border border-slate-100 shadow-sm text-center">
                    <div className="text-lg sm:text-2xl font-black text-slate-800">{stats.total}</div>
                    <div className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase">Agendados</div>
                </div>
                <div className="flex-1 min-w-0 bg-white rounded-2xl p-2.5 sm:p-4 border border-slate-100 shadow-sm text-center">
                    <div className="text-lg sm:text-2xl font-black text-emerald-600">{stats.completed}</div>
                    <div className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase">Concluídos</div>
                </div>
                <div className="flex-1 min-w-0 bg-white rounded-2xl p-2.5 sm:p-4 border border-slate-100 shadow-sm text-center">
                    <div className="text-sm sm:text-2xl font-black text-indigo-600 truncate">
                        R${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase">Faturamento</div>
                </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="space-y-3">
                {selectedAppointments.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl p-10 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-slate-300" />
                        </div>
                        <h3 className="text-base font-black text-slate-700">Agenda Livre 🎉</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Nenhum compromisso para este dia.</p>
                    </div>
                ) : (
                    selectedAppointments.map((appt) => {
                        const statusConfig = getStatusConfig(appt.status)
                        const isExpanded = expandedId === appt.id
                        const isActioning = pendingAction === appt.id

                        return (
                            <div
                                key={appt.id}
                                className={cn(
                                    "bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden",
                                    appt.status === 'CANCELED' ? "opacity-60 border-slate-100" : "border-slate-100",
                                    appt.status === 'COMPLETED' ? "border-l-4 border-l-emerald-400" : "",
                                    appt.status === 'SCHEDULED' ? "border-l-4 border-l-amber-400" : ""
                                )}
                            >
                                {/* Linha principal - clicável */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                                    className="w-full p-4 flex items-center gap-3 text-left"
                                >
                                    {/* Horário */}
                                    <div className="bg-slate-50 rounded-xl px-2.5 py-1.5 flex-shrink-0">
                                        <span className="text-base font-black text-slate-700 leading-none">
                                            {format(new Date(appt.date_time), 'HH:mm')}
                                        </span>
                                    </div>

                                    {/* Nome + Serviço + Profissional */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-800 truncate text-sm">{appt.client_name}</h4>
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {appt.service.name} · <span className="text-indigo-400">{appt.attendant.name.split(' ')[0]}</span>
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <span className={cn(
                                        "text-[9px] uppercase font-black px-2 py-1 rounded-full flex-shrink-0",
                                        statusConfig.bg, statusConfig.text
                                    )}>
                                        {statusConfig.label}
                                    </span>

                                    {/* Chevron */}
                                    <ChevronDown className={cn(
                                        "w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-300",
                                        isExpanded && "rotate-180"
                                    )} />
                                </button>

                                {/* Detalhes expandidos */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
                                        {/* Info - lista vertical simples */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Profissional</span>
                                                <span className="text-xs font-bold text-slate-700">{appt.attendant.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Duração</span>
                                                <span className="text-xs font-bold text-slate-700">{appt.service.duration_minutes} min</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Valor</span>
                                                <span className="text-xs font-bold text-indigo-600">
                                                    R$ {appt.service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Telefone</span>
                                                <span className="text-xs font-bold text-slate-700">{appt.client_phone}</span>
                                            </div>
                                        </div>

                                        {/* Botões de contato */}
                                        <div className="flex gap-2">
                                            <a
                                                href={`https://wa.me/${appt.client_phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-0 h-10 bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#25D366] hover:text-white transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                                                WhatsApp
                                            </a>
                                            <a
                                                href={`tel:${appt.client_phone.replace(/\D/g, '')}`}
                                                className="flex-1 min-w-0 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                                            >
                                                <PhoneCall className="w-4 h-4 flex-shrink-0" />
                                                Ligar
                                            </a>
                                        </div>

                                        {/* Botões de ação (só para SCHEDULED) */}
                                        {appt.status === 'SCHEDULED' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleStatusChange(appt.id, 'COMPLETED')
                                                    }}
                                                    disabled={isActioning}
                                                    className="flex-1 min-w-0 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                                    {isActioning ? '...' : 'Concluir'}
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleStatusChange(appt.id, 'CANCELED')
                                                    }}
                                                    disabled={isActioning}
                                                    variant="outline"
                                                    className="flex-1 min-w-0 h-10 rounded-xl border-2 border-red-200 text-red-500 font-bold text-xs hover:bg-red-50 gap-1.5"
                                                >
                                                    <XCircle className="w-4 h-4 flex-shrink-0" />
                                                    Cancelar
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
