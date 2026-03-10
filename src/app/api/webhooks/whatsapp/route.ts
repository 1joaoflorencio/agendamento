import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET

interface EvolutionWebhookPayload {
    event: string;
    instance: string; // whatsapp_instance_name
    data: {
        key?: {
            remoteJid: string; // The sender phone
            fromMe: boolean;   // If true, the bot sent it
            id?: string;
            senderPn?: string; // Appears inside key block for Logical ID hidden clients
        };
        message?: {
            conversation?: string;
            extendedTextMessage?: {
                text: string;
            };
        };
        // Some older Evolution versions might nest differently, preparing a fallback
        remoteJid?: string;
        fromMe?: boolean;
    };
    sender?: string; // The real phone number at the root payload (e.g. 5511999999999@s.whatsapp.net)
}

export async function POST(req: Request) {
    try {
        // Verify webhook authenticity
        if (WEBHOOK_SECRET) {
            const token = req.headers.get('x-webhook-secret') || req.headers.get('authorization')?.replace('Bearer ', '')
            if (token !== WEBHOOK_SECRET) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        const body = await req.json() as EvolutionWebhookPayload

        // We only care about new incoming messages
        if (body.event !== 'messages.upsert') {
            return NextResponse.json({ received: true, reason: 'ignored_event' })
        }

        // Extract remoteJid and fromMe safely
        const remoteJid = body.data?.key?.remoteJid || body.data?.remoteJid
        const fromMe = body.data?.key?.fromMe ?? body.data?.fromMe ?? false
        const senderPn = body.data?.key?.senderPn

        if (fromMe) {
            // Ignore if the system itself sent it (prevent loops)
            return NextResponse.json({ received: true, reason: 'ignored_sender' })
        }

        if (!remoteJid) {
            return NextResponse.json({ received: true, reason: 'missing_data' })
        }

        // Determine the actual client phone number.
        // If remoteJid uses @lid (Logical ID), the real phone number is usually enclosed within senderPn.
        let rawPhone = remoteJid;
        if (rawPhone.includes('@lid') && senderPn) {
            rawPhone = senderPn;
        }

        const senderPhone = rawPhone.split('@')[0]
        const instanceName = body.instance

        if (!senderPhone || !instanceName) {
            return NextResponse.json({ received: true, reason: 'missing_data' })
        }

        // Find the Establishment matching this Instance Name
        const establishment = await prisma.establishment.findFirst({
            where: { whatsapp_instance_name: instanceName, whatsapp_enabled: true },
            select: { id: true, name: true, slug: true }
        })

        if (!establishment) {
            return NextResponse.json({ received: true, reason: 'tenant_not_found' })
        }

        // Generate the booking link
        const currentDomain = req.headers.get('host')
        const protocol = currentDomain?.includes('localhost') ? 'http' : 'https'
        const bookingLink = `${protocol}://${currentDomain}/book/${establishment.slug}`

        // Construct the welcome message
        const replyText = `Olá! Que bom ter você aqui na *${establishment.name}*! 🚀\n\nNossa agenda agora é 100% digital e automática. Para escolher o seu serviço, horário e o profissional de sua preferência, basta acessar o nosso link oficial de agendamentos abaixo:\n\n🔗 ${bookingLink}\n\nLeva menos de 1 minuto! Te esperamos lá.`

        // Send the reply back
        await sendWhatsAppMessage(establishment.id, senderPhone, replyText)

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[Webhook Error]', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
