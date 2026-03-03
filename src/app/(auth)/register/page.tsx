import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function RegisterPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-indigo-500/30 py-12">
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                <div className="w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
                <div className="w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8 space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 mb-6">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Crie seu espaço
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Configure seu estabelecimento em segundos.
                    </p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <form>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Nome Completo
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="João Pedro"
                                    required
                                    className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:border-indigo-500/50 focus:bg-white transition-all px-5"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Email Profissional
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
                                <Label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Senha Segura
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:border-indigo-500/50 focus:bg-white transition-all px-5 tracking-widest"
                                />
                            </div>

                            <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-lg transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 mt-4" formAction={signup}>
                                Criar Conta Agora
                            </Button>
                        </CardContent>
                    </form>

                    <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
                        <p className="text-sm font-bold text-slate-500">
                            Já possui uma conta?{' '}
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
