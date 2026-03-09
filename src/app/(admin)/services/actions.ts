'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getEstablishmentId } from '@/lib/auth'
import { serviceSchema, serviceUpdateSchema } from '@/lib/validations'

export async function createService(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        duration: parseInt(formData.get('duration') as string, 10),
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
        hide_price: formData.get('hide_price') === 'on' || formData.get('hide_price') === 'true',
        attendant_ids: formData.getAll('attendant_ids'),
    };

    const validatedFields = serviceSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = validatedFields.error.issues[0]?.message;
        throw new Error(firstError || 'Campos obrigatórios inválidos.');
    }

    const { name, description, duration, price, hide_price, attendant_ids } = validatedFields.data;

    try {
        const service = await prisma.service.create({
            data: {
                tenant_id: tenantId,
                name,
                description: description || null,
                duration_minutes: duration,
                price,
                hide_price,
                ...(attendant_ids && attendant_ids.length > 0 ? {
                    attendants: {
                        create: attendant_ids.map(id => ({
                            attendant_id: id
                        }))
                    }
                } : {})
            }
        })
        revalidatePath('/services')
        return service.id
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao criar serviço.')
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

export async function updateService(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const rawData = {
        id: formData.get('id'),
        name: formData.get('name'),
        description: formData.get('description'),
        duration: parseInt(formData.get('duration') as string, 10),
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
        hide_price: formData.get('hide_price') === 'on' || formData.get('hide_price') === 'true',
    };

    const validatedFields = serviceUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = validatedFields.error.issues[0]?.message;
        throw new Error(firstError || 'Campos obrigatórios inválidos.');
    }

    const { id, name, description, duration, price, hide_price } = validatedFields.data;

    try {
        await prisma.service.update({
            where: {
                id,
                tenant_id: tenantId // Garante que o usuário só edita os seus próprios serviços
            },
            data: {
                name,
                description: description || null,
                duration_minutes: duration,
                price,
                hide_price
            }
        })
        revalidatePath('/services')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao atualizar serviço.')
    }
}

export async function updateServiceAttendants(serviceId: string, attendantIds: string[]) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    // Verifica se o serviço pertence ao tenant
    const service = await prisma.service.findFirst({
        where: { id: serviceId, tenant_id: tenantId }
    })
    if (!service) throw new Error('Serviço não encontrado.')

    try {
        // Remove todas as associações existentes
        await prisma.attendantService.deleteMany({
            where: { service_id: serviceId }
        })

        // Cria as novas associações
        if (attendantIds.length > 0) {
            await prisma.attendantService.createMany({
                data: attendantIds.map(attendantId => ({
                    attendant_id: attendantId,
                    service_id: serviceId
                }))
            })
        }

        revalidatePath('/services')
    } catch (e) {
        console.error(e)
        throw new Error('Falha ao atualizar profissionais do serviço.')
    }
}
