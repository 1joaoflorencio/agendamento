'use client'

import { useState, useActionState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { CalendarDays, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                <div className="w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
                <div className="w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8 space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 mb-6">
                        <CalendarDays className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Bem-vindo(a) de volta
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Acesse seu painel para gerenciar seus agendamentos.
                    </p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <form action={formAction}>
                        <CardContent className="p-8 space-y-6">
                            {state?.error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{state.error}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nome@exemplo.com"
                                    required
                                    className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:border-indigo-500/50 focus:bg-white transition-all px-5"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Senha
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:border-indigo-500/50 focus:bg-white transition-all px-5 pr-12 tracking-widest"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-lg transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 mt-4 disabled:opacity-50 disabled:hover:translate-y-0"
                                disabled={isPending}
                            >
                                {isPending ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </CardContent>
                    </form>

                </Card>
            </div>
        </div>
    )
}
