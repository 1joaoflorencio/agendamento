import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    // Redireciona pro Login. Como POST route de form action default, a navegação vai pra cá
    return NextResponse.redirect(new URL('/login', request.url), {
        status: 302,
    })
}
