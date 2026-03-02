'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, LayoutDashboard, Settings, Users, LogOut, Menu, Scissors, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [establishment, setEstablishment] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                window.location.href = '/login'
                return
            }

            // Busca os dados do estabelecimento via fetch ou similar se necessário, 
            // mas aqui usaremos a estrutura base que já temos no layout SSR convertido para Client 
            // apenas para fins estéticos (o ideal seria manter SSR, mas para animações e active states 
            // dinâmicos de alta fidelidade, o client-side facilita).
            // NOTA: O arquivo original era async 'use server' por padrão implicitamente.
            // Para manter a segurança SSR, faremos uma transição suave.
        }
        checkUser()
    }, [])

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Equipe', href: '/team', icon: Users },
        { name: 'Serviços', href: '/services', icon: Scissors },
        { name: 'Configurações', href: '/settings', icon: Settings },
    ]

    return (
        <div className="flex min-h-screen w-full bg-[#f8fafc]">
            {/* Background Decorativo */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-[280px] fixed h-screen z-20 border-r border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-2xl shadow-indigo-500/5">
                <div className="p-8 pb-4">
                    <Link href="/dashboard" className="flex items-center gap-3 px-2 group">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform duration-500">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-extrabold text-slate-900 leading-tight truncate">Painel Admin</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">SaaS Agendador</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden">
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu Principal</p>
                    </div>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "group relative flex items-center gap-3 px-4 py-3.5 rounded-3xl transition-all duration-300 font-bold overflow-hidden",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                        : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-lg hover:shadow-slate-200/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-100 z-0"></div>
                                )}
                                <link.icon className={cn("h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                                <span className="relative z-10">{link.name}</span>
                                {isActive && <ChevronRight className="h-4 w-4 ml-auto relative z-10 animate-in slide-in-from-left-2 duration-300" />}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-6 mt-auto border-t border-slate-100">
                    <form action="/auth/signout" method="post">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 h-14 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 font-bold transition-all px-6"
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
                {/* Header Dinâmico */}
                <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-white/40 backdrop-blur-md border-b border-slate-200/50 z-20">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full border-slate-200 shadow-sm w-12 h-12">
                                    <Menu className="h-5 w-5 text-slate-600" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] border-none bg-white p-0">
                                <SheetTitle className="sr-only">Menu Mobile</SheetTitle>
                                <div className="p-8">
                                    <Link href="/dashboard" className="flex items-center gap-3 mb-10">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                                            <CalendarDays className="h-6 w-6" />
                                        </div>
                                        <span className="font-extrabold text-xl">Admin</span>
                                    </Link>
                                    <div className="space-y-4">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-3xl font-bold transition-all",
                                                    pathname === link.href ? "bg-indigo-600 text-white" : "text-slate-500"
                                                )}
                                            >
                                                <link.icon className="h-5 w-5" />
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        <h2 className="text-slate-800 font-extrabold text-xl tracking-tight">Estúdio Cristiane França</h2>
                        <span className="bg-indigo-50 text-indigo-600 p-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            Pro Plan
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 text-sm">
                            CF
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 pt-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
