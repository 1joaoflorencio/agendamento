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

export async function updateWhatsAppSettings(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const instanceName = formData.get('instanceName') as string
    const apiKey = formData.get('apiKey') as string
    const apiUrl = formData.get('apiUrl') as string
    const enabled = formData.get('enabled') === 'true'

    try {
        await prisma.establishment.update({
            where: { id: tenantId },
            data: {
                whatsapp_api_url: apiUrl || null,
                whatsapp_instance_name: instanceName || null,
                whatsapp_api_key: apiKey || null,
                whatsapp_enabled: enabled
            }
        })
        revalidatePath('/settings')
    } catch (e: any) {
        console.error('ERRO AO SALVAR WHATSAPP:', e)
        throw new Error(`Falha ao atualizar configurações: ${e.message}`)
    }
}

export async function updateBusinessHours(hours: { day_of_week: number, open_time: string, close_time: string, is_closed: boolean }[]) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    try {
        await Promise.all(
            hours.map(h =>
                prisma.businessHour.upsert({
                    where: {
                        establishment_id_day_of_week: {
                            establishment_id: tenantId,
                            day_of_week: h.day_of_week
                        }
                    },
                    update: {
                        open_time: h.open_time,
                        close_time: h.close_time,
                        is_closed: h.is_closed
                    },
                    create: {
                        establishment_id: tenantId,
                        day_of_week: h.day_of_week,
                        open_time: h.open_time,
                        close_time: h.close_time,
                        is_closed: h.is_closed
                    }
                })
            )
        )
        revalidatePath('/settings')
    } catch (e: any) {
        console.error('ERRO AO SALVAR HORÁRIOS:', e)
        throw new Error(`Falha ao atualizar horários: ${e.message}`)
    }
}

export async function testWhatsAppConnection(instanceName: string, apiKey: string, apiUrlParam?: string) {
    const apiUrl = apiUrlParam || process.env.NEXT_PUBLIC_EVOLUTION_API_URL;

    if (!apiUrl) {
        throw new Error('URL da Evolution API não definida. Preencha o campo ou configure no .env');
    }

    try {
        const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
            method: 'GET',
            headers: {
                'apikey': apiKey
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao conectar com a instância.');
        }

        const data = await response.json();
        return data; // Retorna o estado da conexão (open, close, etc)
    } catch (error: any) {
        throw new Error(error.message || 'Erro de rede ao tentar conectar com a Evolution API.');
    }
}

export async function updateEstablishmentProfile(formData: FormData) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    const name = formData.get('name') as string

    if (!name) throw new Error('Nome Fantasia é obrigatório.')

    try {
        await prisma.establishment.update({
            where: { id: tenantId },
            data: {
                name
            }
        })
        revalidatePath('/settings')
    } catch (e: any) {
        console.error('ERRO AO SALVAR PERFIL DO ESTABELECIMENTO:', e)
        throw new Error(`Falha ao atualizar perfil: ${e.message}`)
    }
}

export async function updateEstablishmentSlug(newSlug: string) {
    const tenantId = await getEstablishmentId()
    if (!tenantId) throw new Error('Não autorizado.')

    if (!newSlug || newSlug.trim() === '') {
        throw new Error('O link (slug) não pode estar vazio.')
    }

    // Valida o formato do slug (apenas letras minúsculas, números e hífens)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(newSlug)) {
        throw new Error('O link deve conter apenas letras minúsculas, números e hífens, sem espaços ou acentos.')
    }

    try {
        // Verifica se o slug já existe para OUTRO estabelecimento
        const existing = await prisma.establishment.findUnique({
            where: { slug: newSlug },
            select: { id: true }
        })

        if (existing && existing.id !== tenantId) {
            throw new Error('Este link já está em uso por outro estabelecimento. Escolha outro.')
        }

        await prisma.establishment.update({
            where: { id: tenantId },
            data: {
                slug: newSlug
            }
        })
        revalidatePath('/settings')
        return { success: true }
    } catch (e: any) {
        console.error('ERRO AO ATUALIZAR SLUG:', e)
        throw new Error(e.message || 'Falha ao atualizar o link do estabelecimento.')
    }
}
