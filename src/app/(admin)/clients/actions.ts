"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/utils/supabase/server'

export async function updateClientNotes(clientId: string, notes: string) {
    if (!clientId) throw new Error("ID do cliente não fornecido.")

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error("Não autorizado.")
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { establishment_id: true }
        })

        if (!dbUser || !dbUser.establishment_id) {
            throw new Error("Loja não encontrada para este usuário.")
        }

        // Verify the client belongs to this establishment
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                tenant_id: dbUser.establishment_id
            }
        })

        if (!client) {
            throw new Error("Cliente não encontrado ou você não tem permissão para editá-lo.")
        }

        await prisma.client.update({
            where: { id: clientId },
            data: { notes }
        })

        // Limpa o cache da aba de Clientes pra a UI atualizar
        revalidatePath('/clients')
    } catch (error) {
        console.error('Erro ao salvar anotações do cliente:', error)
        throw new Error('Não foi possível salvar as anotações do cliente.')
    }
}
