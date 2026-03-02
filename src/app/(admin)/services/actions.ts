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

export async function createService(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const duration = parseInt(formData.get('duration') as string, 10)
    const price = parseFloat(formData.get('price') as string)

    if (!name || isNaN(duration) || isNaN(price)) {
        throw new Error('Campos obrigatórios inválidos.')
    }

    try {
        await prisma.service.create({
            data: {
                tenant_id: tenantId,
                name,
                description: description || null,
                duration_minutes: duration,
                price
            }
        })
        revalidatePath('/services')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao deletar crias.')
    }
}

export async function deleteService(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const id = formData.get('id') as string

    try {
        await prisma.service.delete({
            where: {
                id,
                tenant_id: tenantId
            }
        })
        revalidatePath('/services')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao deletar serviço.')
    }
}
