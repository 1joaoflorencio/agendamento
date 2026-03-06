'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string || '').trim()
    const password = formData.get('password') as string || ''

    // Input validation
    if (!email || !password) {
        return { error: 'Email e senha são obrigatórios.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { error: 'Formato de email inválido.' }
    }

    if (password.length < 6) {
        return { error: 'A senha deve ter no mínimo 6 caracteres.' }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return { error: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message }
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


