'use client'

import { useState } from 'react'
import { Plus, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTrialStore } from '@/app/actions/super-admin'

export function CreateStoreModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ storeName?: string, email?: string, password?: string } | null>(null)
    const [copied, setCopied] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            storeName: formData.get('storeName') as string,
            ownerName: formData.get('ownerName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            niche: formData.get('niche') as string,
        }

        const res = await createTrialStore(data)

        setIsLoading(false)

        if (res.error) {
            alert(res.error)
            return
        }

        if (res.success && res.initialPassword) {
            setResult({
                storeName: data.storeName,
                email: data.email,
                password: res.initialPassword
            })
        }
    }

    function copyToClipboard() {
        if (!result) return
        const text = `🎉 Sua conta na *${result.storeName}* está pronta para os 7 dias de teste!

*Acesso:* https://seu-dominio.com/login (Troque pelo URL real)
*E-mail:* ${result.email}
*Senha Temporária:* ${result.password}

Basta fazer o login para acessar o painel!`

        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setTimeout(() => setResult(null), 300) // Reset on close
        }}>
            <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-6 rounded-2xl shadow-lg border-none flex items-center gap-2 transition-all">
                    <Plus className="w-5 h-5" />
                    Nova Loja / Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50 rounded-3xl p-6">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-white">Adicionar Cliente</DialogTitle>
                    {!result && <p className="text-sm text-slate-400 font-medium">Crie a loja e o usuário em um clique.</p>}
                </DialogHeader>

                {result ? (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-2">
                            <h3 className="text-lg font-black text-emerald-400">Sucesso!</h3>
                            <p className="text-sm text-slate-400">Conta e loja criadas. 7 dias de teste iniciados.</p>
                        </div>

                        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">E-mail (Login)</p>
                                <p className="font-bold text-slate-200">{result.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Senha Inicial</p>
                                <p className="font-mono text-xl font-bold text-amber-500">{result.password}</p>
                            </div>
                        </div>

                        <Button
                            onClick={copyToClipboard}
                            className={`w-full h-14 rounded-2xl font-bold text-white transition-all ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {copied ? (
                                <><Check className="w-5 h-5 mr-2" /> Copiado para o WhatsApp!</>
                            ) : (
                                <><Copy className="w-5 h-5 mr-2" /> Copiar Mensagem Pronta</>
                            )}
                        </Button>
                        <Button variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
                            Fechar
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName" className="text-sm font-bold text-slate-300">Nome do Negócio</Label>
                            <Input id="storeName" name="storeName" required className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" placeholder="Ex: Studio Bela" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="niche" className="text-sm font-bold text-slate-300">Nicho</Label>
                            <Select name="niche" defaultValue="Clinica">
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                                    <SelectValue placeholder="Selecione o Nicho" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-slate-800 text-white rounded-xl">
                                    <SelectItem value="Barbearia">Barbearia</SelectItem>
                                    <SelectItem value="Clinica">Clínica</SelectItem>
                                    <SelectItem value="Salao de Beleza">Salão de Beleza</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <Label htmlFor="ownerName" className="text-sm font-bold text-slate-300">Nome do Dono (Cliente)</Label>
                            <Input id="ownerName" name="ownerName" required className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" placeholder="Ex: Maria" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-bold text-slate-300">WhatsApp</Label>
                                <Input id="phone" name="phone" required className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" placeholder="Ex: 11999999999" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-300">E-mail</Label>
                                <Input id="email" type="email" name="email" required className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" placeholder="cliente@email.com" />
                            </div>
                        </div>

                        <Button disabled={isLoading} type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 rounded-2xl shadow-lg mt-6">
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Criar Conta (7 dias grátis)'}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
