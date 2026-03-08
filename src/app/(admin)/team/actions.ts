'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getEstablishmentId } from '@/lib/auth'
import { attendantSchema, attendantUpdateSchema } from '@/lib/validations'

export async function createAttendant(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
    };

    const validatedFields = attendantSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = validatedFields.error.issues[0]?.message;
        throw new Error(firstError || 'Campos obrigatórios inválidos.');
    }

    const { name, email, phone } = validatedFields.data;

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

    const rawData = {
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
    };

    const validatedFields = attendantUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = validatedFields.error.issues[0]?.message;
        throw new Error(firstError || 'Campos obrigatórios inválidos.');
    }

    const { id, name, email, phone } = validatedFields.data;

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
