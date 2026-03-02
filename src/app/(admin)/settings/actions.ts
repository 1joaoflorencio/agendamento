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
