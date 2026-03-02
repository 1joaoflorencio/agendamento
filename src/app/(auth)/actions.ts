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

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
    }

    // 1. Cria Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.name
            }
        }
    })

    if (authError || !authData.user) {
        throw new Error(authError?.message || 'Error creating user')
    }

    // 2. Guarda o Usuário no Prisma (Vinculado ao Auth UUID)
    try {
        await prisma.user.create({
            data: {
                id: authData.user.id,
                email: data.email,
                name: data.name,
            }
        })
    } catch (dbError) {
        console.error(dbError)
        throw new Error('Failed to initialize user database record.')
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding')
}
