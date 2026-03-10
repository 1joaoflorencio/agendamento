import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url)
    const attendantId = searchParams.get('attendantId')

    if (!attendantId) {
        return NextResponse.json({ error: 'Attendant ID is required' }, { status: 400 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.attendant.update({
            where: { id: attendantId },
            data: {
                google_access_token: null,
                google_refresh_token: null
            }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('[Google Calendar Disconnect Error]', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
