import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        console.log('[WhatsApp Webhook Received]', body)

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
