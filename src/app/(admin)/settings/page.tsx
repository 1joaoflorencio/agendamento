import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, Globe, Copy, CheckCircle2 } from 'lucide-react'

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
                {/* Perfil do Estabelecimento */}
                <Card className="border-none shadow-2xl shadow-slate-200/60 overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-md">
                    <CardHeader className="bg-slate-900 p-8 pb-12 relative overflow-hidden rounded-b-[2.5rem]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/20">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-white">Perfil do Estabelecimento</CardTitle>
                                <CardDescription className="text-slate-400 font-medium">
                                    Sua identidade pública para os clientes.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 -mt-6 bg-white rounded-t-[2.5rem] relative z-20 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <Input id="name" defaultValue={establishment.name} readOnly className="h-14 pl-12 rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="niche" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nicho de Atuação</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                    <Input id="niche" defaultValue={establishment.niche} readOnly className="h-14 pl-12 rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-8 rounded-[3rem] bg-indigo-50/50 border border-indigo-100">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="space-y-1">
                                    <Label htmlFor="slug" className="text-xs font-black text-indigo-400 uppercase tracking-widest">Seu Link Exclusivo</Label>
                                    <p className="text-[10px] text-indigo-400/80 font-bold">Use este link na bio do seu Instagram ou Facebook.</p>
                                </div>
                                <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-tighter bg-green-50 px-3 py-1 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Link Ativo
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="relative flex-1 group">
                                    <Input
                                        id="slug"
                                        value={`http://localhost:3000/book/${establishment.slug}`}
                                        readOnly
                                        className="h-14 px-8 rounded-full border-2 border-indigo-100 bg-white font-black text-indigo-600 shadow-inner"
                                    />
                                </div>
                                <Button className="h-14 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
                                    <Copy className="w-4 h-4" /> Copiar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BusinessHoursCard hours={establishment.businessHours} />

                <WhatsAppSettingsCard establishment={establishment} />
            </div>
        </div >
    )
}
