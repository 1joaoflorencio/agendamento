"use client"

import { useState, useTransition } from "react"
import { format, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getAvailableTimeSlots, createPublicAppointment } from "../actions"
import { CalendarIcon, Clock, ArrowLeft, CheckCircle2, User, Scissors, Calendar as CalendarLucide, Search, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateGoogleCalendarLink, generateIcsContent } from "@/lib/calendar"
import type { Establishment, Service, AttendantWithServices, TimeSlot } from "@/types"
import { toast } from "sonner"
import { getTheme } from "@/lib/niche-themes"

export default function BookingForm({ establishment }: { establishment: Establishment }) {
    const [step, setStep] = useState(1)
    const [isPending, startTransition] = useTransition()

    // Seletions
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedAttendant, setSelectedAttendant] = useState<AttendantWithServices | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [allSlots, setAllSlots] = useState<TimeSlot[]>([])
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [isSlotLoading, setIsSlotLoading] = useState(false)
    const [errorLabel, setErrorLabel] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const theme = getTheme(establishment.niche || undefined)

    const { services } = establishment

    const filteredServices = services.filter((svc: Service) =>
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (svc.description && svc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Passo 2: Profissionais (Filtrados pelo serviço ou todos se não houver vínculos)
    const attendantsForService = establishment.attendants.filter((att: AttendantWithServices) =>
        att.services.length === 0 || att.services.some(s => s.service_id === selectedService?.id)
    )

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
        setStep(2)
    }

    const handleAttendantSelect = (attendant: AttendantWithServices) => {
        setSelectedAttendant(attendant)
        // Limpar dados do profissional anterior
        setAllSlots([])
        setSelectedTime(null)
        setSelectedDate(undefined)
        setStep(3)
    }

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        setSelectedTime(null)
        if (date && selectedService && selectedAttendant) {
            setIsSlotLoading(true)
            const dateStr = format(date, "yyyy-MM-dd")
            getAvailableTimeSlots(establishment.id, selectedAttendant.id, selectedService.id, dateStr)
                .then(slots => setAllSlots(slots))
                .catch(e => console.error(e))
                .finally(() => setIsSlotLoading(false))
        } else {
            setAllSlots([])
        }
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
        setStep(4)
    }

    const handleBookingSubmit = (formData: FormData) => {
        setErrorLabel("")
        startTransition(async () => {
            try {
                await createPublicAppointment(formData)
                toast.success('Agendamento confirmado!')
                setStep(5) // Sucesso!
            } catch (error) {
                setErrorLabel((error as Error).message || "Erro ao agendar.")
                toast.error((error as Error).message || "Erro ao agendar.")
            }
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white pt-0 pb-12 px-4 font-sans">
            <div className="max-w-2xl mx-auto">

                {/* HEADER / VOLTAR */}
                {step > 1 && step < 5 && (
                    <Button variant="ghost" onClick={() => setStep(step - 1)} className={cn("mb-6 transition-all rounded-full px-6", theme.textPrimary, theme.bgMuted)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                )}

                {/* ERROR LISTENER */}
                {errorLabel && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-semibold border border-red-100 shadow-sm animate-in shake-1">
                        {errorLabel}
                    </div>
                )}

                {/* STEPS */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* MAIN HEADER START */}
                        <div className="flex flex-col items-center text-center space-y-3 pt-6 pb-2">
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm px-4">
                                {establishment.name}
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 font-medium px-6 max-w-sm mx-auto leading-relaxed">
                                Selecione o serviço ideal e reserve seu horário rapidamente.
                            </p>
                        </div>
                        {/* MAIN HEADER END */}


                        {/* SEARCH INPUT */}
                        <div className="relative max-w-md mx-auto mb-4">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Buscar serviço..."
                                className="pl-12 h-14 rounded-[1.5rem] border-2 border-slate-100 bg-white/80 backdrop-blur-md focus:bg-white transition-all font-bold text-slate-700 shadow-sm text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* LISTA DE SERVICOS */}
                        <div className="grid gap-4">
                            {filteredServices.map((svc: Service) => (
                                <Card
                                    key={svc.id}
                                    className="group cursor-pointer transition-all duration-300 border-2 border-slate-100 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-[1px] active:scale-[0.98] overflow-hidden relative bg-white/90 backdrop-blur-xl rounded-[1rem]"
                                    onClick={() => handleServiceSelect(svc)}
                                >
                                    <div className="px-4 py-3 flex items-center justify-between gap-3">

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-black text-slate-800 leading-tight">{svc.name}</h3>
                                            {svc.description && <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed mt-0.5 pr-2">{svc.description}</p>}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={cn("text-xs font-black px-2 py-0.5 rounded-md", theme.textPrimary, theme.bgMuted)}>{formatPrice(svc.price)}</span>
                                                <span className="text-[11px] font-bold text-slate-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-300" /> {svc.duration_minutes}m</span>
                                            </div>
                                        </div>

                                        <div className={cn("w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-colors shrink-0 shadow-sm border border-slate-100", `group-hover:${theme.buttonActive.split(' ')[0]} group-hover:text-white`)}>
                                            <ChevronRight className="w-4 h-4 ml-[1px]" />
                                        </div>

                                    </div>
                                </Card>
                            ))}
                            {filteredServices.length === 0 && (
                                <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Nenhum serviço encontrado. =(</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-400">
                        <div className="flex flex-col items-center text-center space-y-4 pt-2">
                            <span className={cn("inline-block text-[10px] font-black border px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm", theme.textPrimary, theme.bgMuted, theme.borderMuted)}>
                                {selectedService?.name}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm px-4">
                                Com quem você deseja agendar?
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-5 max-w-2xl mx-auto w-full">
                            {attendantsForService.map((att: AttendantWithServices) => (
                                <Card
                                    key={att.id}
                                    className="group cursor-pointer transition-all duration-300 border-2 border-slate-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 active:scale-[0.98] overflow-hidden relative bg-white/90 backdrop-blur-xl rounded-[1.5rem] flex flex-col items-center justify-center p-5 sm:p-6 text-center"
                                    onClick={() => handleAttendantSelect(att)}
                                >
                                    <div className={cn("w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr rounded-[1.2rem] flex items-center justify-center text-white shadow-md border-2 border-white mb-3 sm:mb-4", theme.gradient, theme.shadow)}>
                                        <span className="text-3xl font-black">{att.name ? att.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-extrabold text-base sm:text-lg block text-slate-800 leading-tight line-clamp-1">{att.name}</span>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest block", theme.textPrimary)}>Profissional</span>
                                    </div>
                                </Card>
                            ))}
                            {attendantsForService.length === 0 && (
                                <p className="text-slate-400 col-span-2 text-center py-12 uppercase font-bold tracking-widest border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50 backdrop-blur-sm">Nenhum profissional disponível.</p>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-400">
                        <div className="flex flex-col items-center text-center space-y-4 pt-2">
                            <span className={cn("inline-block text-[10px] font-black border px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm", theme.textPrimary, theme.bgMuted, theme.borderMuted)}>
                                Agenda de {selectedAttendant?.name}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm px-4">
                                Qual o melhor momento?
                            </h2>
                        </div>

                        <div className="flex flex-col gap-8 max-w-sm mx-auto sm:max-w-none">
                            {/* CALENDAR CARD */}
                            <Card className="border-2 border-slate-100 shadow-xl p-4 sm:p-5 bg-white/90 backdrop-blur-xl mx-auto rounded-[1.5rem]">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={ptBR}
                                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                                    className="rounded-2xl"
                                />
                            </Card>

                            {/* TIME SLOTS SECTION */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-black text-xl flex items-center gap-3 text-slate-800">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme.bgMuted)}>
                                            <Clock className={cn("w-5 h-5", theme.textPrimary)} />
                                        </div>
                                        Horários
                                    </h3>
                                    {selectedDate && (
                                        <span className={cn("text-xs font-black text-white px-4 py-2 rounded-xl uppercase tracking-widest", theme.buttonActive)}>
                                            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                        </span>
                                    )}
                                </div>

                                {!selectedDate ? (
                                    <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
                                        <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest">Toque em uma data para ver os horários</p>
                                    </div>
                                ) : isSlotLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando horários...</p>
                                    </div>
                                ) : allSlots.length === 0 || allSlots.every(s => !s.available) ? (
                                    <div className="bg-slate-50 border-[3px] border-slate-100 rounded-[2.5rem] p-12 text-center shadow-inner mt-4">
                                        <div className="w-16 h-16 bg-slate-200/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CalendarIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Nenhum horário disponível</p>
                                        <span className="text-slate-400 font-medium text-xs mt-2 block">Por favor, selecione outra data na agenda.</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 max-h-[350px] overflow-y-auto p-2 sm:p-3 -m-2 sm:-m-3 scrollbar-thin scrollbar-thumb-indigo-100">
                                        {allSlots.map(slot => (
                                            <Button
                                                key={slot.time}
                                                variant="outline"
                                                className={cn(
                                                    "h-auto py-2.5 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl border-2 transition-all duration-200",
                                                    !slot.available
                                                        ? "border-slate-100 bg-slate-50 text-slate-300 line-through cursor-not-allowed opacity-60"
                                                        : selectedTime === slot.time
                                                            ? theme.buttonActive
                                                            : cn("border-slate-100 hover:scale-105 active:scale-95", theme.bgMuted, theme.textPrimary)
                                                )}
                                                onClick={() => {
                                                    if (!slot.available) {
                                                        alert('Este horário já está ocupado. Por favor, escolha outro horário disponível.')
                                                        return
                                                    }
                                                    handleTimeSelect(slot.time)
                                                }}
                                            >
                                                {slot.time}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-400 pb-12">
                        <div className="text-center space-y-3">
                            <span className={cn("inline-block text-xs font-black border px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm", theme.textPrimary, theme.bgMuted, theme.borderMuted)}>
                                Último Passo
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                                Está quase lá!
                            </h2>
                            <p className="text-lg text-slate-500">Preencha seus dados para garantir seu horário.</p>
                        </div>

                        {/* CONFIRMATION SUMMARY CARD - LIGHT & COMPACT */}
                        <div className={cn("bg-white border-2 rounded-[2rem] p-6 mb-6 flex flex-col gap-3 shadow-xl relative overflow-hidden", theme.borderMuted, theme.shadow)}>
                            <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", theme.gradient)}></div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Serviço</span>
                                <span className="text-slate-800 text-sm font-black text-right">{selectedService?.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Profissional</span>
                                <span className="text-slate-800 text-sm font-black text-right">{selectedAttendant?.name}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Data e Hora</span>
                                <div className="text-right">
                                    <span className="text-slate-800 text-sm font-black">{selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                                    <span className={cn("text-sm font-black ml-1.5 px-2 py-0.5 rounded-md", theme.textPrimary, theme.bgMuted)}>{selectedTime}</span>
                                </div>
                            </div>
                        </div>

                        <form action={handleBookingSubmit} className="space-y-4">
                            {/* HIDDEN LOGIC FIELDS */}
                            <input type="hidden" name="tenant_id" value={establishment.id} />
                            <input type="hidden" name="attendant_id" value={selectedAttendant?.id} />
                            <input type="hidden" name="service_id" value={selectedService?.id} />
                            <input type="hidden" name="date" value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} />
                            <input type="hidden" name="time" value={selectedTime || ""} />

                            <div className="space-y-1.5">
                                <Label htmlFor="client_name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</Label>
                                <Input id="client_name" name="client_name" placeholder="Como você quer ser chamado?" className="h-14 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 px-4 text-base shadow-sm" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="client_phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</Label>
                                <Input id="client_phone" name="client_phone" placeholder="(00) 00000-0000" className="h-14 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 px-4 text-base shadow-sm" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="client_email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail para lembretes (opcional)</Label>
                                <Input id="client_email" name="client_email" type="email" placeholder="seu@email.com" className="h-14 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 px-4 text-base shadow-sm" />
                            </div>

                            <Button type="submit" className={cn("w-full mt-4 text-lg h-16 rounded-2xl font-black transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3", theme.buttonActive)} disabled={isPending}>
                                {isPending ? (
                                    <>Aguarde...</>
                                ) : (
                                    <>Confirmar Agendamento <CheckCircle2 className="w-6 h-6" /></>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                {step === 5 && (() => {
                    const [hours, minutes] = selectedTime?.split(":").map(Number) || [0, 0]
                    const appointmentDate = new Date(selectedDate || new Date())
                    appointmentDate.setHours(hours, minutes, 0, 0)

                    const calendarData = {
                        title: `${selectedService?.name} - ${establishment.name}`,
                        description: `Agendamento com ${selectedAttendant?.name} na ${establishment.name}. Selecionado via Sistema de Agendamento.`,
                        startTime: appointmentDate,
                        duration: selectedService?.duration_minutes || 60,
                    }

                    const googleLink = generateGoogleCalendarLink(calendarData)

                    const handleIcs = () => {
                        const icsContent = generateIcsContent(calendarData)
                        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement("a")
                        link.href = url
                        link.setAttribute("download", `agendamento-${establishment.slug}.ics`)
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }

                    return (
                        <div className="text-center py-4 space-y-6 animate-in zoom-in-95 fade-in duration-700 flex flex-col justify-center">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 ring-4 ring-green-50">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">Confirmado!</h1>
                                <p className="text-sm text-slate-500 font-medium">Sua vaga está garantida na agenda.</p>
                            </div>

                            <Card className="bg-white/80 backdrop-blur-xl border-2 border-slate-100 shadow-xl rounded-[1.5rem] overflow-hidden max-w-sm mx-auto w-full">
                                <div className="bg-slate-50/80 p-4 border-b-2 border-slate-100 text-center">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Resumo do Encontro</p>
                                    <p className="text-slate-900 font-black text-2xl">
                                        {selectedDate && format(selectedDate, "dd/MM")} às {selectedTime}
                                    </p>
                                </div>
                                <CardContent className="p-5 text-left space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", theme.bgMuted, theme.textPrimary)}><Scissors className="w-4 h-4" /></div>
                                        <span className="font-bold text-slate-800 text-sm">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", theme.bgMuted, theme.textPrimary)}><User className="w-4 h-4" /></div>
                                        <span className="font-bold text-slate-800 text-sm">{selectedAttendant?.name}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-3 max-w-sm mx-auto pt-2 w-full text-center">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Adicione à sua agenda</p>
                                <Button asChild className="w-full h-12 rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-black shadow-md shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 text-sm">
                                    <a href={googleLink} target="_blank" rel="noopener noreferrer">
                                        <CalendarLucide className="w-4 h-4 mr-2" /> Google Agenda
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-slate-200 font-black text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-1 active:scale-95 text-sm bg-white" onClick={handleIcs}>
                                    <CalendarLucide className="w-4 h-4 mr-2" /> Apple Calendar
                                </Button>
                            </div>

                            <div className="pt-2">
                                <Button variant="ghost" className={cn("font-bold uppercase tracking-widest text-[10px]", theme.textPrimary)} onClick={() => window.location.reload()}>
                                    <ArrowLeft className="w-3 h-3 mr-1.5" /> Fazer outro agendamento
                                </Button>
                            </div>
                        </div>
                    )
                })()}

            </div>
        </div>
    )
}

