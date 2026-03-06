'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getEstablishmentId } from '@/lib/auth'



export async function createAttendant(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!name) throw new Error('O nome é obrigatório.')

    try {
        await prisma.attendant.create({
            data: {
                tenant_id: tenantId,
                name,
                email: email || null,
                phone: phone || null,
            }
        })
        revalidatePath('/team')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao criar profissional.')
    }
}

export async function deleteAttendant(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const id = formData.get('id') as string

    try {
        // Garante que só o dono apaga o Seu profissional (WHERE tenant_id)
        await prisma.attendant.delete({
            where: {
                id,
                tenant_id: tenantId
            }
        })
        revalidatePath('/team')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao deletar profissional.')
    }
}

export async function updateAttendant(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!id || !name) throw new Error('ID e Nome são obrigatórios.')

    try {
        await prisma.attendant.update({
            where: {
                id,
                tenant_id: tenantId
            },
            data: {
                name,
                email: email || null,
                phone: phone || null,
            }
        })
        revalidatePath('/team')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao atualizar profissional.')
    }
}
