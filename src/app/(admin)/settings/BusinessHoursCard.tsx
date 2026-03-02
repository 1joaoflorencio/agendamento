'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateBusinessHours } from './actions'
import { Clock, Save, CheckCircle2, XCircle, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

const DAYS = [
    { id: 1, name: 'Segunda-feira' },
    { id: 2, name: 'Terça-feira' },
    { id: 3, name: 'Quarta-feira' },
    { id: 4, name: 'Quinta-feira' },
    { id: 5, name: 'Sexta-feira' },
    { id: 6, name: 'Sábado' },
    { id: 0, name: 'Domingo' },
]

export default function BusinessHoursCard({ hours }: { hours: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [savedSuccessfully, setSavedSuccessfully] = useState(false)

    const [schedule, setSchedule] = useState(
        DAYS.map(day => {
            const saved = hours.find(h => h.day_of_week === day.id)
            return {
                day_of_week: day.id,
                name: day.name,
                open_time: saved?.open_time || '08:00',
                close_time: saved?.close_time || '18:00',
                is_closed: saved?.is_closed ?? false
            }
        })
    )

    const handleChange = (dayId: number, field: string, value: any) => {
        setSavedSuccessfully(false)
        setSchedule(prev => prev.map(s =>
            s.day_of_week === dayId ? { ...s, [field]: value } : s
        ))
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                const dataToSave = schedule.map(({ name, ...rest }) => rest)
                await updateBusinessHours(dataToSave)
                setSavedSuccessfully(true)
                setTimeout(() => setSavedSuccessfully(false), 3000)
            } catch (error: any) {
                alert(error.message)
            }
        })
    }

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/60 overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-md">
            <CardHeader className="bg-slate-900 p-8 pb-12 relative overflow-hidden text-white rounded-b-[2.5rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
                        <CalendarClock className="w-8 h-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black">Horário de Funcionamento</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            Seu estabelecimento aberto no padrão 24 horas.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 -mt-6 bg-white rounded-t-[2.5rem] relative z-20 space-y-6">
                <div className="grid gap-3">
                    {schedule.map((day, i) => (
                        <div
                            key={day.day_of_week}
                            className={cn(
                                "group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-full px-8 border transition-all duration-300",
                                i % 2 === 0 ? "bg-slate-50/50 border-slate-50" : "bg-white border-transparent",
                                day.is_closed ? "opacity-50 grayscale-[0.5]" : "hover:bg-indigo-50/30 hover:border-indigo-100"
                            )}
                        >
                            <div className="flex items-center gap-5 min-w-[200px]">
                                <Switch
                                    id={`closed-${day.day_of_week}`}
                                    checked={!day.is_closed}
                                    onCheckedChange={(checked) => handleChange(day.day_of_week, 'is_closed', !checked)}
                                    className="data-[state=checked]:bg-indigo-600"
                                />
                                <Label
                                    htmlFor={`closed-${day.day_of_week}`}
                                    className="text-base font-black text-slate-700 cursor-pointer select-none"
                                >
                                    {day.name}
                                </Label>
                            </div>

                            <div className="flex items-center gap-2 flex-1 max-w-[380px]">
                                <div className="relative group/input">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/input:text-indigo-500 transition-colors" />
                                    <Input
                                        value={day.open_time}
                                        onChange={(e) => handleChange(day.day_of_week, 'open_time', e.target.value)}
                                        disabled={day.is_closed}
                                        className="h-12 pl-12 rounded-full border-2 border-slate-100 bg-white font-black text-slate-600 focus:border-indigo-500 focus:ring-0 transition-all"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase px-1 tracking-tighter">até</span>
                                <div className="relative flex-1 group/input">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/input:text-indigo-500 transition-colors" />
                                    <Input
                                        value={day.close_time}
                                        onChange={(e) => handleChange(day.day_of_week, 'close_time', e.target.value)}
                                        disabled={day.is_closed}
                                        className="h-12 pl-12 rounded-full border-2 border-slate-100 bg-white font-black text-slate-600 focus:border-indigo-500 focus:ring-0 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="hidden lg:block">
                                {day.is_closed ? (
                                    <span className="text-[10px] font-black text-red-400 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">Fechado</span>
                                ) : (
                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">Aberto</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="p-8 pt-0 bg-white">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className={cn(
                        "h-16 w-full rounded-full font-black text-lg transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3",
                        savedSuccessfully
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                    )}
                >
                    {isPending ? (
                        <>Salvando...</>
                    ) : savedSuccessfully ? (
                        <><CheckCircle2 className="w-6 h-6" /> Horários Atualizados!</>
                    ) : (
                        <><Save className="w-6 h-6" /> Salvar Configurações</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
