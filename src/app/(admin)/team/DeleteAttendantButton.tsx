'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteAttendant } from './actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteAttendantButtonProps {
    id: string
    name: string
    className?: string
    iconSize?: string
}

export default function DeleteAttendantButton({ id, name, className, iconSize = "h-4 w-4" }: DeleteAttendantButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (!confirm(`Tem certeza que deseja excluir "${name}"? Todos os agendamentos deste profissional também serão removidos.`)) {
            return
        }

        const formData = new FormData()
        formData.set('id', id)

        startTransition(async () => {
            try {
                await deleteAttendant(formData)
                toast.success('Profissional excluído.')
            } catch (error) {
                toast.error((error as Error).message || 'Erro ao excluir profissional.')
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className || "w-9 h-9 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"}
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash2 className={iconSize} />
        </Button>
    )
}
