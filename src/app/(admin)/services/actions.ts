'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getEstablishmentId } from '@/lib/auth'



export async function createService(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const duration = parseInt(formData.get('duration') as string, 10)
    const price = parseFloat(formData.get('price') as string)
    const attendantIds = formData.getAll('attendant_ids') as string[]

    if (!name || isNaN(duration) || isNaN(price)) {
        throw new Error('Campos obrigatórios inválidos.')
    }

    try {
        const service = await prisma.service.create({
            data: {
                tenant_id: tenantId,
                name,
                description: description || null,
                duration_minutes: duration,
                price,
                ...(attendantIds.length > 0 ? {
                    attendants: {
                        create: attendantIds.map(id => ({
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

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const duration = parseInt(formData.get('duration') as string, 10)
    const price = parseFloat(formData.get('price') as string)

    if (!id || !name || isNaN(duration) || isNaN(price)) {
        throw new Error('Campos obrigatórios inválidos.')
    }

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
                price
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
