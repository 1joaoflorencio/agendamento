import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { establishment: { include: { attendants: true } } }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found in DB' }, { status: 404 })
        }

        return NextResponse.json({
            user: dbUser,
            establishment: dbUser.establishment
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
