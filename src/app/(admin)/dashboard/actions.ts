'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(id: string, status: 'SCHEDULED' | 'CANCELED' | 'COMPLETED') {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error)
        return { success: false, error: 'Não foi possível atualizar o status.' }
    }
}
