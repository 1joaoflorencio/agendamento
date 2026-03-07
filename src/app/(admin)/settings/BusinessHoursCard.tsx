'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateBusinessHours } from './actions'
import { Save, CheckCircle2, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


const DAYS = [
    { id: 1, name: 'Segunda-feira', short: 'Seg' },
    { id: 2, name: 'Terça-feira', short: 'Ter' },
    { id: 3, name: 'Quarta-feira', short: 'Qua' },
    { id: 4, name: 'Quinta-feira', short: 'Qui' },
    { id: 5, name: 'Sexta-feira', short: 'Sex' },
    { id: 6, name: 'Sábado', short: 'Sáb' },
    { id: 0, name: 'Domingo', short: 'Dom' },
]

export default function BusinessHoursCard({ hours }: { hours: { id?: string; day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[] }) {
    const [isPending, startTransition] = useTransition()
    const [savedSuccessfully, setSavedSuccessfully] = useState(false)

    const [schedule, setSchedule] = useState(
        DAYS.map(day => {
            const saved = hours.find(h => h.day_of_week === day.id)
            return {
                day_of_week: day.id,
                name: day.name,
                short: day.short,
                open_time: saved?.open_time || '08:00',
                close_time: saved?.close_time || '18:00',
                is_closed: saved?.is_closed ?? false
            }
        })
    )

    const handleChange = (dayId: number, field: string, value: string | boolean) => {
        setSavedSuccessfully(false)
        setSchedule(prev => prev.map(s =>
            s.day_of_week === dayId ? { ...s, [field]: value } : s
        ))
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                const dataToSave = schedule.map((s) => ({
                    day_of_week: s.day_of_week,
                    open_time: s.open_time,
                    close_time: s.close_time,
                    is_closed: s.is_closed
                }))
                await updateBusinessHours(dataToSave)
                setSavedSuccessfully(true)
                toast.success('Horários atualizados com sucesso!')
                setTimeout(() => setSavedSuccessfully(false), 3000)
            } catch (error) {
                toast.error((error as Error).message)
            }
        })
    }

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/60 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white/80 backdrop-blur-md">
            <CardHeader className="bg-slate-900 p-5 sm:p-8 pb-8 sm:pb-12 relative overflow-hidden text-white rounded-b-2xl sm:rounded-b-[2.5rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/40 flex-shrink-0">
                        <CalendarClock className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-2xl font-black truncate">Horário de Funcionamento</CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-xs sm:text-sm">
                            Seu estabelecimento aberto no padrão 24 horas.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-8 -mt-4 sm:-mt-6 bg-white rounded-t-2xl sm:rounded-t-[2.5rem] relative z-20 space-y-4 sm:space-y-6">
                <div className="grid gap-2 sm:gap-3">
                    {schedule.map((day, i) => (
                        <div
                            key={day.day_of_week}
                            className={cn(
                                "group flex flex-col gap-2 p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300",
                                i % 2 === 0 ? "bg-slate-50/50 border-slate-50" : "bg-white border-transparent",
                                day.is_closed ? "opacity-60" : "hover:bg-indigo-50/30 hover:border-indigo-100"
                            )}
                        >
                            {/* Top: Day name + toggle button */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-base font-black text-slate-700">
                                    <span className="sm:hidden">{day.short}</span>
                                    <span className="hidden sm:inline">{day.name}</span>
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleChange(day.day_of_week, 'is_closed', !day.is_closed)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 min-w-[90px]",
                                        day.is_closed
                                            ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                                            : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                    )}
                                >
                                    {day.is_closed ? '✕ Fechado' : '✓ Aberto'}
                                </button>
                            </div>

                            {/* Bottom: time inputs (only when open) */}
                            {!day.is_closed && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="time"
                                        value={day.open_time}
                                        onChange={(e) => handleChange(day.day_of_week, 'open_time', e.target.value)}
                                        className="h-9 sm:h-11 rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-600 focus:border-indigo-500 text-sm flex-1 min-w-0 px-2"
                                    />
                                    <span className="text-[10px] font-black text-slate-300 uppercase flex-shrink-0">até</span>
                                    <Input
                                        type="time"
                                        value={day.close_time}
                                        onChange={(e) => handleChange(day.day_of_week, 'close_time', e.target.value)}
                                        className="h-9 sm:h-11 rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-600 focus:border-indigo-500 text-sm flex-1 min-w-0 px-2"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="p-4 sm:p-8 pt-0 bg-white">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className={cn(
                        "h-12 sm:h-16 w-full rounded-xl sm:rounded-full font-black text-base sm:text-lg transition-all active:scale-95 shadow-xl sm:shadow-2xl flex items-center justify-center gap-2 sm:gap-3",
                        isPending
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:scale-105 active:scale-95"
                    )}
                >
                    {isPending ? (
                        <>Salvando...</>
                    ) : savedSuccessfully ? (
                        <><CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> Horários Atualizados!</>
                    ) : (
                        <><Save className="w-5 h-5 sm:w-6 sm:h-6" /> Salvar Configurações</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
