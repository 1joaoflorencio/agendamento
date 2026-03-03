'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, Globe, Copy, CheckCircle2, Save, Edit2, X, Loader2 } from 'lucide-react'
import { updateEstablishmentProfile, updateEstablishmentSlug } from './actions'
import { Establishment } from '@prisma/client'

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
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar perfil')
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
        } catch (error: any) {
            setSlugError(error.message)
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
                <form action={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <Input id="name" name="name" defaultValue={establishment.name} required className="h-14 pl-12 rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="niche" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nicho de Atuação</Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Globe className="h-5 w-5 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
                                </div>
                                <Input id="niche" name="niche" defaultValue={establishment.niche} required className="h-14 pl-12 rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-indigo-500/50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-full bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>

                <div className="space-y-4 p-8 rounded-[3rem] bg-indigo-50/50 border border-indigo-100 relative">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                            <Label htmlFor="slug" className="text-xs font-black text-indigo-400 uppercase tracking-widest">Seu Link Exclusivo</Label>
                            <p className="text-[10px] text-indigo-400/80 font-bold">Use este link na bio do seu Instagram ou Facebook.</p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-tighter bg-green-50 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Link Ativo
                        </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                        {isEditingSlug ? (
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center h-14 rounded-full border-2 border-indigo-500 bg-white shadow-inner overflow-hidden pr-2">
                                    <span className="pl-6 pr-2 text-slate-400 font-bold hidden sm:inline-block">/book/</span>
                                    <Input
                                        value={slugInput}
                                        onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="seu-link-aqui"
                                        className="h-full border-none bg-transparent shadow-none px-0 font-black text-indigo-600 focus-visible:ring-0"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setIsEditingSlug(false)
                                            setSlugInput(establishment.slug || '')
                                            setSlugError('')
                                        }}
                                        className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={handleSaveSlug}
                                        disabled={isSavingSlug || !slugInput}
                                        className="h-10 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black ml-1"
                                    >
                                        {isSavingSlug ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                                    </Button>
                                </div>
                                {slugError && <p className="text-red-500 text-xs font-bold pl-4">{slugError}</p>}
                            </div>
                        ) : (
                            <>
                                <div className="relative flex-1 group">
                                    <Input
                                        id="slug"
                                        value={`http://localhost:3000/book/${establishment.slug}`}
                                        readOnly
                                        className="h-14 px-8 rounded-full border-2 border-indigo-100 bg-white font-black text-indigo-600 shadow-inner"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditingSlug(true)}
                                    className="h-14 w-14 rounded-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all active:scale-95 flex items-center justify-center shrink-0 p-0"
                                    title="Editar Link"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCopy}
                                    className={`h-14 px-8 rounded-full text-white font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 sm:min-w-[140px] ${copied
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
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
