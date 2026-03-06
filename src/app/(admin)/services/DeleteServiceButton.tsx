'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteService } from './actions'
import { Trash2 } from 'lucide-react'

interface DeleteServiceButtonProps {
    id: string
    name: string
}

export default function DeleteServiceButton({ id, name }: DeleteServiceButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (!confirm(`Tem certeza que deseja excluir o serviço "${name}"?`)) {
            return
        }

        const formData = new FormData()
        formData.set('id', id)

        startTransition(async () => {
            try {
                await deleteService(formData)
            } catch (error) {
                alert((error as Error).message || 'Erro ao excluir serviço.')
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all ml-auto"
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
    )
}
