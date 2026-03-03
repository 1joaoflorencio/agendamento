'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        throw new Error(error.message)
    }

    if (authData?.user) {
        const dbUser = await prisma.user.findUnique({
            where: { id: authData.user.id }
        })

        revalidatePath('/', 'layout')

        if (dbUser?.role === 'SUPER_ADMIN') {
            redirect('/super-admin')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}


