import { createClient } from '@/utils/supabase/server'
import { getGoogleAuthUrl } from '@/lib/google-calendar'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const attendantId = searchParams.get('attendantId')

    if (!attendantId) {
        return new Response('Attendant ID is required', { status: 400 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Unauthorized')
    } catch {
        return new Response('Unauthorized', { status: 401 })
    }

    const authUrl = getGoogleAuthUrl(attendantId)
    redirect(authUrl)
}
