import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        // Authenticate the cron request
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Gather all unique WhatsApp API URLs configured in the database
        const establishments = await prisma.establishment.findMany({
            where: { whatsapp_enabled: true },
            select: { whatsapp_api_url: true }
        })

        const urls = new Set<string>()

        // Always include the global environment URL if exists
        const globalUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL
        if (globalUrl) {
            urls.add(globalUrl)
        }

        // Add any custom URLs from establishments
        establishments.forEach(est => {
            if (est.whatsapp_api_url) {
                // Ensure no trailing slashes for consistency
                urls.add(est.whatsapp_api_url.replace(/\/$/, ''))
            }
        })

        if (urls.size === 0) {
            return NextResponse.json({ success: true, message: 'No WhatsApp API URLs to ping' })
        }

        const results = []

        // 2. Ping each unique URL to keep the instance awake
        // We ping the root of the Evolution API which is enough to prevent the server from sleeping
        for (const url of urls) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache' }
                })

                results.push({
                    url,
                    status: response.status,
                    ok: response.ok
                })
            } catch (err) {
                results.push({
                    url,
                    error: (err as Error).message
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Keep awake pings completed',
            results
        })

    } catch (error) {
        console.error('[Wpp Keep-Alive Error]', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
