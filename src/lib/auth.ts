'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

/**
 * Shared auth helper: gets the establishment ID for the currently logged-in user.
 * Used by all admin server actions to enforce multi-tenant isolation.
 */
export async function getEstablishmentId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { establishment_id: true }
    })

    return appUser?.establishment_id || null
}
