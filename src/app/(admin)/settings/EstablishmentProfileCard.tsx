'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, Globe, Copy, CheckCircle2, Save, Edit2, X, Loader2, Lock } from 'lucide-react'
import { updateEstablishmentProfile, updateEstablishmentSlug } from './actions'
import { Establishment } from '@prisma/client'
import { toast } from 'sonner'

interface EstablishmentProfileCardProps {
    establishment: Establishment
}

export default function EstablishmentProfileCard({ establishment }: EstablishmentProfileCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isEditingSlug, setIsEditingSlug] = useState(false)
    const [slugInput, setSlugInput] = useState(establishment.slug || '')
    const [isSavingSlug, setIsSavingSlug] = useState(false)
    const [slugError, setSlugError] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await updateEstablishmentProfile(formData)
            toast.success('Perfil atualizado com sucesso!')
        } catch (error) {
            console.error(error)
            toast.error('Erro ao atualizar perfil')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveSlug = async () => {
        if (!slugInput || slugInput.trim() === '') return;
        setIsSavingSlug(true)
        setSlugError('')
        try {
            await updateEstablishmentSlug(slugInput)
            setIsEditingSlug(false)
            toast.success('Link atualizado com sucesso!')
        } catch (error) {
            const mg = (error as Error).message
            setSlugError(mg)
            toast.error(mg)
        } finally {
            setIsSavingSlug(false)
        }
    }

    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const link = `http://localhost:3000/book/${establishment.slug}`
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Falha ao copiar:', err)
            const input = document.getElementById('slug') as HTMLInputElement
            if (input) {
                input.select()
                document.execCommand('copy')
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        }
    }

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/60 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white/80 backdrop-blur-md">
            <CardHeader className="bg-slate-900 p-5 sm:p-8 pb-8 sm:pb-12 relative overflow-hidden rounded-b-2xl sm:rounded-b-[2.5rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/20 flex-shrink-0">
                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-2xl font-black text-white truncate">Perfil do Estabelecimento</CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-xs sm:text-sm">
                            Sua identidade pública para os clientes.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-8 -mt-4 sm:-mt-6 bg-white rounded-t-2xl sm:rounded-t-[2.5rem] relative z-20 space-y-6 sm:space-y-8">
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
                        <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <Input id="name" name="name" defaultValue={establishment.name} required className="h-12 sm:h-14 pl-10 sm:pl-12 rounded-xl sm:rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between px-1 gap-2">
                                <Label htmlFor="niche" className="text-xs font-black text-slate-400 uppercase tracking-widest">Nicho de Atuação</Label>
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                    <Lock className="w-2.5 h-2.5" /> Admin
                                </div>
                            </div>
                            <div className="relative group opacity-80">
                                <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 transition-colors" />
                                </div>
                                <Input
                                    id="niche"
                                    name="niche"
                                    value={establishment.niche}
                                    readOnly
                                    className="h-12 sm:h-14 pl-10 sm:pl-12 rounded-xl sm:rounded-full border-2 border-slate-50 bg-slate-50/50 font-bold text-slate-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto text-sm">
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>

                <div className="space-y-4 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] bg-indigo-50/50 border border-indigo-100 relative">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="space-y-0.5">
                            <Label htmlFor="slug" className="text-xs font-black text-indigo-400 uppercase tracking-widest">Seu Link Exclusivo</Label>
                            <p className="text-[10px] text-indigo-400/80 font-bold">Use este link na bio do seu Instagram ou Facebook.</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-tighter bg-green-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        {isEditingSlug ? (
                            <div className="space-y-2">
                                <div className="flex items-center h-12 sm:h-14 rounded-xl sm:rounded-full border-2 border-indigo-500 bg-white shadow-inner overflow-hidden pr-1">
                                    <span className="pl-3 sm:pl-6 pr-1 sm:pr-2 text-slate-400 font-bold text-xs sm:text-base hidden sm:inline-block">/book/</span>
                                    <Input
                                        value={slugInput}
                                        onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="seu-link-aqui"
                                        className="h-full border-none bg-transparent shadow-none px-1 sm:px-0 font-black text-indigo-600 focus-visible:ring-0 text-sm"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setIsEditingSlug(false)
                                            setSlugInput(establishment.slug || '')
                                            setSlugError('')
                                        }}
                                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100 text-slate-400 flex-shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                        onClick={handleSaveSlug}
                                        disabled={isSavingSlug || !slugInput}
                                        className="h-8 sm:h-10 px-3 sm:px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black ml-0.5 text-xs sm:text-sm flex-shrink-0"
                                    >
                                        {isSavingSlug ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                                    </Button>
                                </div>
                                {slugError && <p className="text-red-500 text-xs font-bold pl-2 sm:pl-4">{slugError}</p>}
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <div className="relative flex-1 min-w-0">
                                    <Input
                                        id="slug"
                                        value={`/book/${establishment.slug}`}
                                        readOnly
                                        className="h-12 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-full border-2 border-indigo-100 bg-white font-black text-indigo-600 shadow-inner text-xs sm:text-sm truncate"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditingSlug(true)}
                                        className="h-12 sm:h-14 w-12 sm:w-14 rounded-xl sm:rounded-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all active:scale-95 flex items-center justify-center shrink-0 p-0"
                                        title="Editar Link"
                                    >
                                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleCopy}
                                        className={`h-12 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-full text-white font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 flex-1 sm:flex-auto justify-center text-sm ${copied
                                            ? 'bg-green-500 hover:bg-green-600 shadow-green-200'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" /> Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" /> Copiar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
