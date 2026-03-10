import prisma from '@/lib/prisma'

export async function sendWhatsAppMessage(tenantId: string, phone: string, text: string) {
    const establishment = await prisma.establishment.findUnique({
        where: { id: tenantId },
        select: {
            whatsapp_enabled: true,
            whatsapp_api_url: true,
            whatsapp_instance_name: true,
            whatsapp_api_key: true
        }
    })

    if (!establishment || !establishment.whatsapp_enabled || !establishment.whatsapp_instance_name || !establishment.whatsapp_api_key) {
        return { success: false, reason: 'disabled' }
    }

    // Prepara o número (Evolution API espera no formato 5511999999999)
    let cleanPhone = phone.replace(/\D/g, '')

    // Se for um número de 10 ou 11 dígitos (Brasil), adiciona o DDI 55 automaticamente
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith('55')) {
        cleanPhone = '55' + cleanPhone
    }

    // Prioriza a URL salva no banco de dados do estabelecimento
    const apiUrl = establishment.whatsapp_api_url || process.env.NEXT_PUBLIC_EVOLUTION_API_URL;

    if (!apiUrl) {
        console.error('[WhatsApp Error] URL da API não configurada')
        return { success: false, reason: 'no_api_url' }
    }

    try {
        const response = await fetch(`${apiUrl}/message/sendText/${establishment.whatsapp_instance_name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': establishment.whatsapp_api_key
            },
            body: JSON.stringify({
                number: cleanPhone,
                text: text,
                options: {
                    delay: 1200,
                    presence: 'composing',
                    linkPreview: false
                }
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[WhatsApp] Falha no envio:', response.status)
            return { success: false, data }
        }

        return { success: true, data }
    } catch (error) {
        console.error('[WhatsApp] Erro de rede ao enviar mensagem')
        return { success: false, error }
    }
}
