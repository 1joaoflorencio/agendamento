import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings, Users, LogOut, LayoutDashboard, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export default async function SuperAdminLayout({
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
        where: { id: user.id }
    })

    if (!appUser || appUser.role !== 'SUPER_ADMIN') {
        redirect('/dashboard') // User a normal client, push them away
    }

    const navLinks = [
        { name: 'Lojas Cadastradas', href: '/super-admin', icon: LayoutDashboard },
    ]

    return (
        <div className="flex min-h-screen w-full bg-slate-950 text-slate-50">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-[280px] fixed h-screen z-20 border-r border-slate-800 bg-slate-950">
                <div className="p-8 pb-4">
                    <Link href="/super-admin" className="flex items-center gap-3 px-2 group">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-transform duration-500">
                            <Crown className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-extrabold text-white leading-tight truncate">Super Admin</span>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Controle Mestre</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2">
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Menu do Sistema</p>
                    </div>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-3xl transition-all duration-300 font-bold overflow-hidden bg-slate-900 text-white shadow-xl shadow-black/20"
                        >
                            <link.icon className="h-5 w-5 text-amber-500" />
                            <span className="relative z-10">{link.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-6 mt-auto border-t border-slate-800">
                    <form action="/auth/signout" method="post">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 h-14 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 font-bold transition-all px-6"
                            type="submit"
                        >
                            <LogOut className="h-5 w-5" />
                            Sair da Conta
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen relative z-10">
                <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-20">
                    <div className="flex items-center gap-2">
                        <h2 className="text-white font-extrabold text-xl tracking-tight">Painel Mestre</h2>
                    </div>
                </header>

                <div className="flex-1 p-8 pt-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
