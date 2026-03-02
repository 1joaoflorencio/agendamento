"use client"

import { useState, useTransition } from "react"
import { format, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getAvailableTimeSlots, createPublicAppointment } from "../actions"
import { CalendarIcon, Clock, ArrowLeft, CheckCircle2, User, Scissors, Calendar as CalendarLucide, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateGoogleCalendarLink, generateIcsContent } from "@/lib/calendar"

export default function BookingForm({ establishment }: { establishment: any }) {
    const [step, setStep] = useState(1)
    const [isPending, startTransition] = useTransition()

    // Seletions
    const [selectedService, setSelectedService] = useState<any>(null)
    const [selectedAttendant, setSelectedAttendant] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [isSlotLoading, setIsSlotLoading] = useState(false)
    const [errorLabel, setErrorLabel] = useState("")

    // Passo 1: Serviços
    const services = establishment.services || []

    // Passo 2: Profissionais (Filtrados pelo serviço ou todos se não houver vínculos)
    const attendantsForService = establishment.attendants.filter((att: any) =>
        att.services.length === 0 || att.services.some((s: any) => s.service_id === selectedService?.id)
    )

    const handleServiceSelect = (service: any) => {
        setSelectedService(service)
        setStep(2)
    }

    const handleAttendantSelect = (attendant: any) => {
        setSelectedAttendant(attendant)
        setStep(3)
    }

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        setSelectedTime(null)
        if (date && selectedService && selectedAttendant) {
            setIsSlotLoading(true)
            const dateStr = format(date, "yyyy-MM-dd")
            getAvailableTimeSlots(establishment.id, selectedAttendant.id, selectedService.id, dateStr)
                .then(slots => setAvailableSlots(slots))
                .catch(e => console.error(e))
                .finally(() => setIsSlotLoading(false))
        } else {
            setAvailableSlots([])
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
                setStep(5) // Sucesso!
            } catch (error: any) {
                setErrorLabel(error.message || "Erro ao agendar.")
            }
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white py-12 px-4 font-sans">
            <div className="max-w-2xl mx-auto">

                {/* HEADER / VOLTAR */}
                {step > 1 && step < 5 && (
                    <Button variant="ghost" onClick={() => setStep(step - 1)} className="mb-6 hover:bg-indigo-100/50 text-indigo-600 transition-all rounded-full px-6">
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">{establishment.name}</h1>
                            <p className="text-lg text-slate-500 font-medium">Selecione o serviço para seu agendamento</p>
                        </div>
                        <div className="grid gap-5">
                            {services.map((svc: any) => (
                                <Card
                                    key={svc.id}
                                    className="group cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 border-2 hover:border-indigo-500/30 overflow-hidden relative bg-white/70 backdrop-blur-sm"
                                    onClick={() => handleServiceSelect(svc)}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-slate-800">{svc.name}</h3>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-indigo-600">{formatPrice(svc.price)}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-[85%]">{svc.description}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider">
                                                <Clock className="w-3 h-3 mr-1.5" /> {svc.duration_minutes} min
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {services.length === 0 && (
                                <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium italic">Nenhum serviço disponível no momento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-400">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">Com quem você deseja agendar?</h2>
                            <p className="text-lg text-slate-500">{selectedService?.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {attendantsForService.map((att: any) => (
                                <Card
                                    key={att.id}
                                    className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border-2 hover:border-indigo-500/30 overflow-hidden bg-white hover:bg-indigo-50/10"
                                    onClick={() => handleAttendantSelect(att)}
                                >
                                    <CardContent className="py-10 flex flex-col items-center gap-5">
                                        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 group-hover:rotate-3 transition-transform duration-500">
                                            <User className="w-12 h-12" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-bold text-xl block text-slate-800">{att.name}</span>
                                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Profissional</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {attendantsForService.length === 0 && (
                                <p className="text-slate-400 col-span-2 text-center py-12 italic border-2 border-dashed rounded-3xl">Nenhum profissional disponível para este serviço.</p>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-12 duration-400">
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">Qual o melhor momento?</h2>
                            <p className="text-lg text-slate-500">Agenda de <strong>{selectedAttendant?.name}</strong></p>
                        </div>

                        <div className="flex flex-col gap-10">
                            {/* CALENDAR CARD */}
                            <Card className="border-none shadow-2xl p-6 bg-white/90 backdrop-blur-md mx-auto ring-1 ring-slate-200/50 rounded-3xl">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={ptBR}
                                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                                    className="rounded-xl"
                                />
                            </Card>

                            {/* TIME SLOTS SECTION */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-black text-xl flex items-center gap-3 text-slate-800">
                                        <Clock className="w-6 h-6 text-indigo-500" /> Horários
                                    </h3>
                                    {selectedDate && (
                                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                        </span>
                                    )}
                                </div>

                                {!selectedDate ? (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
                                        <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Toque em uma data para ver os horários</p>
                                    </div>
                                ) : isSlotLoading ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="bg-red-50/50 border-2 border-dashed border-red-100 rounded-[2rem] p-16 text-center">
                                        <p className="text-red-500 font-bold italic">Nenhum horário disponível para este dia.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto pr-3 pb-4 scrollbar-thin scrollbar-thumb-indigo-100">
                                        {availableSlots.map(time => (
                                            <Button
                                                key={time}
                                                variant="outline"
                                                className={cn(
                                                    "h-14 text-lg font-extrabold rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 duration-200",
                                                    selectedTime === time
                                                        ? "border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-600/30"
                                                        : "border-slate-100 hover:border-indigo-500/30 hover:bg-indigo-50 text-slate-700"
                                                )}
                                                onClick={() => handleTimeSelect(time)}
                                            >
                                                {time}
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
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">Está quase lá!</h2>
                            <p className="text-lg text-slate-500">Preencha seus dados para garantir seu horário.</p>
                        </div>

                        {/* CONFIRMATION SUMMARY CARD */}
                        <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden rounded-[2.5rem]">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>
                            <CardContent className="p-8 space-y-6 relative z-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Serviço</span>
                                        <p className="text-xl font-bold">{selectedService?.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Profissional</span>
                                        <p className="text-xl font-bold">{selectedAttendant?.name}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest block mb-1">Quando</span>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-black">
                                            {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                        <span className="text-2xl font-light text-white/40">às</span>
                                        <p className="text-4xl font-black text-indigo-400">{selectedTime}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <form action={handleBookingSubmit} className="space-y-5 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 ring-1 ring-slate-900/5">
                            {/* HIDDEN LOGIC FIELDS */}
                            <input type="hidden" name="tenant_id" value={establishment.id} />
                            <input type="hidden" name="attendant_id" value={selectedAttendant?.id} />
                            <input type="hidden" name="service_id" value={selectedService?.id} />
                            <input type="hidden" name="date" value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} />
                            <input type="hidden" name="time" value={selectedTime || ""} />

                            <div className="space-y-2">
                                <Label htmlFor="client_name" className="text-slate-700 font-bold ml-1">Nome Completo</Label>
                                <Input id="client_name" name="client_name" placeholder="Como você quer ser chamado?" className="h-14 rounded-2xl border-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client_phone" className="text-slate-700 font-bold ml-1">WhatsApp</Label>
                                <Input id="client_phone" name="client_phone" placeholder="(00) 00000-0000" className="h-14 rounded-2xl border-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client_email" className="text-slate-700 font-bold ml-1">E-mail para lembretes (opcional)</Label>
                                <Input id="client_email" name="client_email" type="email" placeholder="seu@email.com" className="h-14 rounded-2xl border-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" />
                            </div>

                            <Button type="submit" className="w-full mt-6 text-xl h-20 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3" disabled={isPending}>
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

                    const handleDownloadIcs = () => {
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
                        <div className="text-center py-12 space-y-8 animate-in zoom-in-95 fade-in duration-700">
                            <div className="relative mx-auto w-32 h-32">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-200 ring-8 ring-green-50">
                                    <CheckCircle2 className="w-16 h-16" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-black tracking-tight text-slate-900">Confirmado!</h1>
                                <p className="text-xl text-slate-500 font-medium">Sua vaga está garantida na agenda.</p>
                            </div>

                            <Card className="bg-white border-2 border-slate-100 shadow-xl rounded-[2.5rem] overflow-hidden max-w-sm mx-auto">
                                <div className="bg-slate-50 p-6 border-b-2 border-slate-100">
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Resumo do Encontro</p>
                                    <p className="text-slate-900 font-black text-2xl">
                                        {selectedDate && format(selectedDate, "dd/MM")} às {selectedTime}
                                    </p>
                                </div>
                                <CardContent className="p-6 text-left space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><Scissors className="w-4 h-4" /></div>
                                        <span className="font-bold text-slate-700">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><User className="w-4 h-4" /></div>
                                        <span className="font-bold text-slate-700">{selectedAttendant?.name}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4 max-w-xs mx-auto pt-6">
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-tighter italic font-medium mb-2">Não se esqueça! Adicione à sua agenda:</p>
                                <Button asChild className="w-full h-14 rounded-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                                    <a href={googleLink} target="_blank" rel="noopener noreferrer">
                                        <CalendarLucide className="w-5 h-5 mr-3" /> Salvar no Google Agenda
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95" onClick={handleDownloadIcs}>
                                    <Download className="w-5 h-5 mr-3" /> Apple / Outros Calendários
                                </Button>
                            </div>

                            <div className="pt-12">
                                <Button variant="ghost" className="text-slate-400 hover:text-indigo-600 font-bold" onClick={() => window.location.reload()}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Fazer outro agendamento
                                </Button>
                            </div>
                        </div>
                    )
                })()}

            </div>
        </div>
    )
}

