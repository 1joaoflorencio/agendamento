import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import ClientLayout from './ClientLayout'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            establishment: {
                include: {
                    attendants: true
                }
            }
        }
    })

    if (!appUser?.establishment) {
        // Se usuário não tiver estabelecimento, pode precisar do onboarding 
        // ou criar um novo / tratar erro (atualmente o app loga direto)
        // Redirecionamento pode ser necessário, mas deixaremos passar ao layout base para tratar
    }

    // Convertendo objeto prisma para plain object por segurança via props
    const serializedEstablishment = appUser?.establishment ? JSON.parse(JSON.stringify(appUser.establishment)) : null;

    return (
        <ClientLayout initialEstablishment={serializedEstablishment}>
            {children}
        </ClientLayout>
    )
}
