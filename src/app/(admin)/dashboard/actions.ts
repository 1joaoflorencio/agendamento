'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function getEstablishmentId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { establishment_id: true }
    })

    return appUser?.establishment_id || null
}

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
