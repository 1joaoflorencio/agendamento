'use server'

import { createClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import { createClient as createServerClientRaw } from '@/utils/supabase/server'

// Note: Requires SUPABASE_SERVICE_ROLE_KEY to be set in .env
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

/**
 * Ensures the caller is a SUPER_ADMIN.
 * If not, throws an Error.
 */
async function verifySuperAdmin() {
    const supabaseSession = await createServerClientRaw()
    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) throw new Error("Acesso negado: Usuário não autenticado.")

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
        throw new Error("Acesso negado: Privilégios insuficientes.")
    }

    return true
}

export async function createTrialStore(data: {
    storeName: string,
    ownerName: string,
    email: string,
    phone: string,
    niche: string,
}) {
    await verifySuperAdmin();

    let authUserId: string | null = null;
    try {
        const password = Math.random().toString(36).slice(-8)
        console.log(`[createTrialStore] Attempting to create user with email: ${data.email}`)

        // 1. Create User in Supabase Auth using Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: data.ownerName,
                phone: data.phone,
            }
        })

        if (authError) {
            console.error('Error creating user in Supabase:', authError)
            return { error: authError.message }
        }

        authUserId = authData.user.id;
        const authUser = authData.user

        // 2. Calculate Trial Date (7 days from now)
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 7)

        // 3. Create Store in Prisma
        const slug = data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        const store = await prisma.establishment.create({
            data: {
                name: data.storeName,
                slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
                niche: data.niche,
                status: 'TRIAL',
                trial_ends_at: trialEndDate,
                initial_password: password,
            }
        })

        // 4. Create User in Prisma linked to Store
        await prisma.user.create({
            data: {
                id: authUser.id,
                email: data.email,
                name: data.ownerName,
                role: 'USER', // Standard user for the new store
                establishment_id: store.id
            }
        })

        revalidatePath('/super-admin')
        return { success: true, store, initialPassword: password }
    } catch (e) {
        console.error('Error creating trial store:', e)
        if (authUserId) {
            console.log(`Rolling back user creation for ${authUserId}`)
            await supabaseAdmin.auth.admin.deleteUser(authUserId)
        }
        return { error: 'Ocorreu um erro interno de conexão. Você adicionou uma nova funcionalidade recentemente? Reinicie seu servidor (npm run dev) e tente novamente.' }
    }
}

export async function deleteStore(storeId: string) {
    await verifySuperAdmin();
    try {
        const store = await prisma.establishment.findUnique({
            where: { id: storeId },
            include: { users: true }
        })

        if (!store) {
            return { error: 'Loja não encontrada.' }
        }

        // 1. Delete Store from DB (cascade deletes users and appointments in DB)
        await prisma.establishment.delete({
            where: { id: storeId }
        })

        // 2. Delete user(s) from Supabase Auth based on the users attached in Prisma
        // This is safe to do after because even if it fails, a ghost account in Supabase 
        // without a DB record is better than a broken DB record without a Supabase login.
        for (const user of store.users) {
            if (user.role === 'USER') {
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
                if (authError) {
                    console.error(`Erro ao deletar usuário ${user.id} do Supabase:`, authError)
                } else {
                    console.log(`Successfully deleted ${user.email} from Supabase Auth`)
                }
            }
        }

        revalidatePath('/super-admin')
        return { success: true }
    } catch (e) {
        console.error('Error deleting store:', e)
        return { error: 'Ocorreu um erro ao excluir a loja. Tente reiniciar seu servidor (npm run dev).' }
    }
}

export async function updateStore(storeId: string, data: { name?: string, niche?: string, status?: string, trial_ends_at?: string, email?: string }) {
    await verifySuperAdmin();
    try {
        const payload: Partial<{ name: string, niche: string, status: string, trial_ends_at: Date }> = {}
        if (data.name) payload.name = data.name
        if (data.niche) payload.niche = data.niche
        if (data.status) payload.status = data.status
        if (data.trial_ends_at) payload.trial_ends_at = new Date(data.trial_ends_at)

        const store = await prisma.establishment.findUnique({
            where: { id: storeId },
            include: { users: true }
        })

        if (!store) {
            return { error: 'Loja não encontrada.' }
        }

        if (data.email) {
            const owner = store.users.find(u => u.role === 'USER')
            if (owner && owner.email !== data.email) {
                // Update Supabase Auth Email
                const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                    owner.id,
                    { email: data.email, email_confirm: true }
                )
                if (authError) {
                    console.error('Failed to update email in Supabase:', authError)
                    return { error: 'Erro ao atualizar o email do usuário na autenticação.' }
                }

                // Update Prisma User Email
                await prisma.user.update({
                    where: { id: owner.id },
                    data: { email: data.email }
                })
            } else if (!owner && data.email) {
                // If there's no USER (only Super Admin), we skip email update for safety
                // or handle as a custom error. 
                console.warn('Attempted to update email on store without a regular USER owner.')
            }
        }

        await prisma.establishment.update({
            where: { id: storeId },
            data: payload
        })

        revalidatePath('/super-admin')
        return { success: true }
    } catch (e) {
        console.error('Error updating store:', e)
        return { error: 'Ocorreu um erro ao atualizar a loja.' }
    }
}
