import { NextResponse } from 'next/server'

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET

export async function POST(req: Request) {
    try {
        // Verify webhook authenticity
        if (WEBHOOK_SECRET) {
            const token = req.headers.get('x-webhook-secret') || req.headers.get('authorization')?.replace('Bearer ', '')
            if (token !== WEBHOOK_SECRET) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const body = await req.json()

        console.log('[WhatsApp Webhook Received]')

        // Aqui você pode adicionar lógica para:
        // 1. Identificar se o cliente quer cancelar (ex: cliente respondeu "CANCELAR")
        // 2. Notificar o admin sobre novas mensagens
        // 3. Confirmar agendamentos pendentes

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[Webhook Error]', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
