"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { cancelAppointment } from "./actions"
import { toast } from "sonner"

export default function CancelBookingClientControls({
    appointmentId
}: {
    appointmentId: string
}) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleCancel = () => {
        startTransition(async () => {
            try {
                await cancelAppointment(appointmentId)
                toast.success("Agendamento cancelado com sucesso.")
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erro ao cancelar agendamento.")
            }
        })
    }

    if (showConfirm) {
        return (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                    <div>
                        Você tem certeza que deseja cancelar este horário? <br />
                        <span className="font-bold">Esta ação não pode ser desfeita.</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowConfirm(false)}
                        disabled={isPending}
                        className="rounded-xl border-2 font-bold hover:bg-slate-50"
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sim, Cancelar"}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            className="w-full text-red-600 border-2 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-bold h-14 rounded-2xl transition-all shadow-sm"
            onClick={() => setShowConfirm(true)}
        >
            Cancelar Agendamento
        </Button>
    )
}
