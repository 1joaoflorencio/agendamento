'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

// Helper para criar slug do nome
function slugify(text: string) {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
}

export async function createEstablishment(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const name = formData.get('name') as string
    const niche = formData.get('niche') as string

    if (!name || !niche) {
        throw new Error('Preencha todos os campos.')
    }

    let slug = slugify(name)

    // Garantir Slug única (caso já exista Barbearia do João)
    const existingSlug = await prisma.establishment.findUnique({
        where: { slug }
    })

    if (existingSlug) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`
    }

    try {
        // 1. Cria o Tenant Oob
        const newEstablishment = await prisma.establishment.create({
            data: {
                name,
                niche,
                slug
            }
        })

        // 2. Atualiza o User vinculando ele como Dono/Membro desse Tenant
        await prisma.user.update({
            where: { id: user.id },
            data: {
                establishment_id: newEstablishment.id
            }
        })

    } catch (error) {
        console.error("Erro na criação do Tenant", error)
        throw new Error('Não foi possível registrar o estabelecimento.')
    }

    redirect('/dashboard')
}
