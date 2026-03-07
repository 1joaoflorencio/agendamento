'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, Play, Pause, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { pauseStore } from '@/app/(admin)/dashboard/actions'

import { Attendant } from '@prisma/client'

export default function PauseStoreButton({
    tenantId,
    currentPauseStart,
    currentPauseUntil,
    attendants,
    onUpdate
}: {
    tenantId: string
    currentPauseStart: Date | null
    currentPauseUntil: Date | null
    attendants: Attendant[]
    onUpdate?: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedStartTime, setSelectedStartTime] = useState('12:00')
    const [selectedEndTime, setSelectedEndTime] = useState('14:00')
    const [selectedAttendantId, setSelectedAttendantId] = useState<string>('all')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const now = new Date()
    const isCurrentlyPaused = currentPauseStart && currentPauseUntil && new Date(currentPauseStart) <= now && new Date(currentPauseUntil) > now
    const isScheduledPause = currentPauseStart && currentPauseUntil && new Date(currentPauseStart) > now
    const isPaused = isCurrentlyPaused || isScheduledPause

    const formatTime = (date: Date | string) => {
        return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    const handlePause = () => {
        startTransition(async () => {
            const now = new Date()

            const [startHours, startMinutes] = selectedStartTime.split(':').map(Number)
            const pauseStartDate = new Date(now)
            pauseStartDate.setHours(startHours, startMinutes, 0, 0)

            const [endHours, endMinutes] = selectedEndTime.split(':').map(Number)
            const pauseUntilDate = new Date(now)
            pauseUntilDate.setHours(endHours, endMinutes, 0, 0)

            // Se o end time for menor que o start time (ex 23:00 a 01:00), joga para o dia seguinte
            if (pauseUntilDate <= pauseStartDate) {
                pauseUntilDate.setDate(pauseUntilDate.getDate() + 1)
            }

            // Se o start time já passou muito tempo hoje, assume que é pro dia seguinte
            if (pauseStartDate < now && (now.getTime() - pauseStartDate.getTime()) > 3600000) {
                pauseStartDate.setDate(pauseStartDate.getDate() + 1)
                pauseUntilDate.setDate(pauseUntilDate.getDate() + 1)
            }

            const targetAttendantId = selectedAttendantId === 'all' ? undefined : selectedAttendantId

            await pauseStore(tenantId, pauseStartDate, pauseUntilDate, targetAttendantId)
            setIsOpen(false)
            if (onUpdate) onUpdate()
            router.refresh()
        })
    }

    const handleResume = () => {
        startTransition(async () => {
            const targetAttendantId = selectedAttendantId === 'all' ? undefined : selectedAttendantId
            await pauseStore(tenantId, null, null, targetAttendantId)
            setIsOpen(false)
            if (onUpdate) onUpdate()
            router.refresh()
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={isCurrentlyPaused ? "default" : isScheduledPause ? "default" : "outline"}
                    size="sm"
                    className={`gap-2 font-bold rounded-full shadow-sm ${isCurrentlyPaused ? 'bg-red-500 hover:bg-red-600 text-white' :
                        isScheduledPause ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                        }`}
                >
                    {isCurrentlyPaused ? (
                        <>
                            <Pause className="w-4 h-4" />
                            Loja Pausada
                        </>
                    ) : isScheduledPause ? (
                        <>
                            <Clock className="w-4 h-4" />
                            Pausa Agendada
                        </>
                    ) : (
                        <>
                            <Clock className="w-4 h-4" />
                            Pausar Loja
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] rounded-2xl sm:rounded-[2rem] border-none shadow-xl p-6 sm:p-8 bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPaused ? <Play className="w-5 h-5 text-emerald-500" /> : <Pause className="w-5 h-5 text-amber-500" />}
                        {isPaused ? 'Retomar Agendamentos' : 'Pausar Agendamentos'}
                    </DialogTitle>
                    <DialogDescription>
                        {isPaused
                            ? `Sua agenda está pausada das ${formatTime(currentPauseStart!)} até as ${formatTime(currentPauseUntil!)}.`
                            : 'Pause o recebimento de novos agendamentos até um horário específico.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {!isPaused && (
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Pausar para:
                            </label>
                            <select
                                value={selectedAttendantId}
                                onChange={(e) => setSelectedAttendantId(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="all">Loja Inteira (Todos os profissionais)</option>
                                {attendants?.map(attendant => (
                                    <option key={attendant.id} value={attendant.id}>
                                        Apenas {attendant.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-semibold text-slate-700">
                                    Pausar das:
                                </label>
                                <input
                                    type="time"
                                    value={selectedStartTime}
                                    onChange={(e) => setSelectedStartTime(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-semibold text-slate-700">
                                    Até as:
                                </label>
                                <input
                                    type="time"
                                    value={selectedEndTime}
                                    onChange={(e) => setSelectedEndTime(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm">
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <p>
                                A agenda ficará <strong>bloqueada entre {selectedStartTime} e {selectedEndTime}</strong>.
                                Fora desse intervalo, clientes marcam normalmente.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="mr-auto sm:justify-start w-full sm:flex-row-reverse">
                    {isPaused ? (
                        <Button
                            type="button"
                            onClick={handleResume}
                            disabled={isPending}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold"
                        >
                            {isPending ? 'Retomando...' : 'Retomar Loja Agora'}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handlePause}
                            disabled={isPending}
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold"
                        >
                            {isPending ? 'Pausando...' : 'Pausar Loja'}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                        className="w-full sm:w-auto rounded-full font-bold text-slate-500"
                    >
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
