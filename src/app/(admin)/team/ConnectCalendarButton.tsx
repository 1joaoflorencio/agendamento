'use client'

import { Button } from '@/components/ui/button'
import { CalendarClock, CalendarCheck2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ConnectCalendarButtonProps {
    attendantId: string
    isConnected: boolean
    className?: string
}

export default function ConnectCalendarButton({ attendantId, isConnected, className }: ConnectCalendarButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            // Redirects to the API route which starts the OAuth flow
            window.location.href = `/api/calendar/auth?attendantId=${attendantId}`
        } catch (error) {
            toast.error('Erro ao conectar com o Google Agenda.')
            setIsLoading(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Deseja realmente desconectar o Google Agenda? Os novos agendamentos não serão mais sincronizados.')) {
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/calendar/disconnect?attendantId=${attendantId}`, {
                method: 'POST'
            })

            if (response.ok) {
                toast.success('Agenda desconectada com sucesso!')
                window.location.reload()
            } else {
                throw new Error('Failed to disconnect')
            }
        } catch (error) {
            toast.error('Erro ao desconectar a agenda.')
            setIsLoading(false)
        }
    }

    if (isConnected) {
        return (
            <Button
                variant="outline"
                className={cn("w-full h-14 rounded-full border-2 border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-200 font-extrabold text-xs shadow-sm flex items-center gap-2", className)}
                onClick={handleDisconnect}
                disabled={isLoading}
            >
                <CalendarCheck2 className="w-4 h-4" />
                {isLoading ? 'Aguarde...' : 'Agenda Conectada'}
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            className={cn("w-full h-14 rounded-full border-2 border-slate-100 font-extrabold text-slate-600 hover:bg-slate-50 text-xs shadow-sm flex items-center gap-2", className)}
            onClick={handleConnect}
            disabled={isLoading}
        >
            <CalendarClock className="w-4 h-4 text-slate-400" />
            {isLoading ? 'Conectando...' : 'Conectar Google'}
        </Button>
    )
}
