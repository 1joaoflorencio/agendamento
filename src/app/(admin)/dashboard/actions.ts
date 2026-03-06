'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getEstablishmentId } from '@/lib/auth'



export async function updateAppointmentStatus(id: string, status: 'SCHEDULED' | 'CANCELED' | 'COMPLETED') {
    const tenantId = await getEstablishmentId()
    if (!tenantId) {
        return { success: false, error: 'Não autorizado.' }
    }

    try {
        await prisma.appointment.update({
            where: {
                id,
                tenant_id: tenantId
            },
            data: { status }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error)
        return { success: false, error: 'Não foi possível atualizar o status.' }
    }
}
