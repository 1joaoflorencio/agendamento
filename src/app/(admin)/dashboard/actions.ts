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

export async function pauseStore(
    tenantIdFromClient: string, // Kept for signature compatibility but ignored for security
    pauseStart: Date | null,
    pauseUntil: Date | null,
    targetAttendantId?: string
) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) {
        throw new Error('Não autorizado.')
    }

    try {
        if (targetAttendantId) {
            // Verifica se o atendente pertence a loja atual
            const attendant = await prisma.attendant.findFirst({
                where: { id: targetAttendantId, tenant_id: tenantId }
            })
            if (!attendant) throw new Error('Profissional não encontrado.')

            // Atualiza a pausa específica do profissional
            await prisma.attendant.update({
                where: { id: targetAttendantId },
                data: { pause_start: pauseStart, paused_until: pauseUntil }
            })
        } else {
            // Atualiza o registro global do estabelecimento
            await prisma.establishment.update({
                where: { id: tenantId },
                data: { pause_start: pauseStart, paused_until: pauseUntil }
            })
        }

        // Limpa o cache das páginas pra a UI atualizar
        revalidatePath('/dashboard', 'page')
        revalidatePath('/super-admin', 'page')
    } catch (error) {
        console.error('Erro ao pausar loja/profissional:', error)
        throw new Error('Não foi possível pausar a loja ou o profissional.')
    }
}
