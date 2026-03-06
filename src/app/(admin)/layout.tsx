'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, LayoutDashboard, Settings, Users, LogOut, Menu, Scissors, ChevronRight, Stethoscope, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getTheme } from '@/lib/niche-themes'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [establishment, setEstablishment] = useState<Establishment | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        setIsMounted(true)
        const checkUser = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                window.location.href = '/login'
                return
            }

            // Busca os dados do estabelecimento via API
            try {
                const response = await fetch('/api/user/profile')
                if (response.ok) {
                    const data = await response.json()
                    if (data.establishment) {
                        setEstablishment(data.establishment)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkUser()
    }, [pathname])

    const theme = getTheme(establishment?.niche)

    const getNicheIcon = () => {
        switch (establishment?.niche) {
            case 'Barbearia': return Scissors
            case 'Salao de Beleza': return Sparkles
            case 'Clinica':
            default: return Stethoscope
        }
    }

    const NicheIcon = getNicheIcon()

    const navLinks = [
        { name: 'Agenda', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Equipe', href: '/team', icon: Users },
        { name: 'Serviços', href: '/services', icon: Scissors },
        { name: 'Configurações', href: '/settings', icon: Settings },
    ]

    return (
        <div className="flex min-h-screen w-full bg-[#f8fafc]">
            {/* Background Decorativo */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={cn("absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 opacity-20", theme.bgMuted)}></div>
                <div className={cn("absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 opacity-20", theme.bgMuted)}></div>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-[280px] fixed h-screen z-20 border-r border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-2xl shadow-indigo-500/5">
                <div className="p-8 pb-4">
                    <Link href="/dashboard" className="flex items-center gap-3 px-2 group">
                        <div className={cn("w-10 h-10 bg-gradient-to-tr rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-all duration-500", theme.gradient, theme.shadow)}>
                            <NicheIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-extrabold text-slate-900 leading-tight truncate">Painel Admin</span>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.textPrimary)}>
                                {establishment?.niche ? theme.label : 'Sistema de Agendamento'}
                            </span>
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
                                        ? "text-white " + theme.shadow
                                        : cn("text-slate-500 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50", "hover:" + theme.textPrimary)
                                )}
                            >
                                {isActive && (
                                    <div className={cn("absolute inset-0 bg-gradient-to-r opacity-100 z-0", theme.gradient)}></div>
                                )}
                                <link.icon className={cn("h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-active:scale-95")} />
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
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen relative z-10 min-w-0 overflow-hidden">
                {/* Header Dinâmico */}
                <header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 bg-white/40 backdrop-blur-md border-b border-slate-200/50 z-20">
                    <div className="lg:hidden">
                        {isMounted && (
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
                        )}
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        {isLoading ? (
                            <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-md"></div>
                        ) : (
                            <>
                                <h2 className="text-slate-800 font-extrabold text-xl tracking-tight">
                                    {establishment?.name || 'Carregando...'}
                                </h2>
                                {establishment?.status === 'TRIAL' ? (
                                    <span className="bg-amber-50 text-amber-600 p-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-sm">
                                        Período de Teste
                                    </span>
                                ) : (
                                    <span className={cn("p-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", theme.bgMuted, theme.textPrimary, theme.borderMuted)}>
                                        Pro Plan
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 text-sm">
                            {establishment?.name ? establishment.name.substring(0, 2).toUpperCase() : 'CF'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 pt-6 sm:p-8 sm:pt-10 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    )
}
