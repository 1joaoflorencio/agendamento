import { getGoogleTokens } from '@/lib/google-calendar'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const attendantId = searchParams.get('state') // The attendantId we passed during auth
    const error = searchParams.get('error')

    if (error) {
        console.error('[Google OAuth Error]', error)
        redirect('/team?error=google_auth_failed')
    }

    if (!code || !attendantId) {
        return new Response('Missing code or state parameters', { status: 400 })
    }

    try {
        // 1. Exchange the code for tokens
        const tokens = await getGoogleTokens(code)

        // 2. Save tokens to the attendant
        // We ensure we only update the token if the attendant exists.
        await prisma.attendant.update({
            where: { id: attendantId },
            data: {
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token, // Crucial for long-lived offline sync
            }
        })

        // 3. Redirect back to the team page with a success flag
        redirect('/team?success=google_connected')

    } catch (e) {
        console.error('[Google OAuth Exchange Error]', e)
        redirect('/team?error=google_token_exchange')
    }
}
