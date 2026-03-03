import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

import EstablishmentProfileCard from './EstablishmentProfileCard'
import WhatsAppSettingsCard from './WhatsAppSettingsCard'
import BusinessHoursCard from './BusinessHoursCard'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const appUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            establishment: {
                include: {
                    businessHours: true
                }
            }
        }
    })

    if (!appUser?.establishment_id || !appUser.establishment) {
        redirect('/onboarding')
    }

    const { establishment } = appUser

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Configurações</h1>
                    <p className="text-slate-500 font-medium mt-1">Personalize seu espaço e conecte suas ferramentas.</p>
                </div>
            </div>

            <div className="grid gap-10">
                <EstablishmentProfileCard establishment={establishment} />

                <BusinessHoursCard hours={establishment.businessHours} />

                <WhatsAppSettingsCard establishment={establishment} />
            </div>
        </div >
    )
}
