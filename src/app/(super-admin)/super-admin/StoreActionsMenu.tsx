'use client'

import { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Loader2, AlertTriangle, Eye, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateStore, deleteStore } from '@/app/actions/super-admin'

interface StoreActionsProps {
    store: {
        id: string;
        name: string;
        slug: string;
        status: string;
        niche: string;
        trial_ends_at: string | Date | null;
        initial_password?: string | null;
        users: { email: string }[];
    }
}

export function StoreActionsMenu({ store }: StoreActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            niche: formData.get('niche') as string,
            status: formData.get('status') as string,
            trial_ends_at: formData.get('trial_ends_at') as string || undefined,
            email: formData.get('email') as string || undefined
        }

        const res = await updateStore(store.id, data)
        setIsLoading(false)

        if (res.error) {
            alert(res.error)
        } else {
            setIsEditOpen(false)
        }
    }

    async function handleDelete() {
        setIsLoading(true)
        const res = await deleteStore(store.id)
        setIsLoading(false)

        if (res.error) {
            alert(res.error)
        } else {
            setIsDeleteOpen(false)
        }
    }

    // Format date for input default value (YYYY-MM-DD)
    const formattedDate = store.trial_ends_at
        ? new Date(store.trial_ends_at).toISOString().split('T')[0]
        : ''

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300 w-48 rounded-2xl shadow-xl shadow-black/50">
                    <DropdownMenuItem
                        onClick={() => setIsEditOpen(true)}
                        className="hover:bg-slate-800 hover:text-white cursor-pointer rounded-xl gap-2 font-bold focus:bg-slate-800 focus:text-white"
                    >
                        <Edit2 className="h-4 w-4" />
                        Editar Loja
                    </DropdownMenuItem>
                    {store.initial_password && (
                        <DropdownMenuItem
                            onClick={() => setIsViewOpen(true)}
                            className="hover:bg-slate-800 hover:text-white cursor-pointer rounded-xl gap-2 font-bold focus:bg-slate-800 focus:text-white"
                        >
                            <Eye className="h-4 w-4" />
                            Ver Credenciais
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer rounded-xl gap-2 font-bold focus:bg-red-500/10 focus:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                        Excluir Cliente
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50 rounded-3xl p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-black text-white">Editar: {store.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-300">Nome da Loja</Label>
                            <Input id="name" name="name" defaultValue={store.name} required className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-slate-300">E-mail do Proprietário</Label>
                            <Input id="email" name="email" type="email" defaultValue={store.users?.[0]?.email || ''} required className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="niche" className="text-sm font-bold text-slate-300">Nicho</Label>
                            <Select name="niche" defaultValue={store.niche}>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-bold text-slate-300">Status</Label>
                                <Select name="status" defaultValue={store.status}>
                                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800 text-white rounded-xl">
                                        <SelectItem value="TRIAL">Teste Mapeado (TRIAL)</SelectItem>
                                        <SelectItem value="ACTIVE">Assinante (ACTIVE)</SelectItem>
                                        <SelectItem value="EXPIRED">Bloqueado (EXPIRED)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="trial_ends_at" className="text-sm font-bold text-slate-300">Fim do Teste</Label>
                                <Input id="trial_ends_at" name="trial_ends_at" type="date" defaultValue={formattedDate} className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 [color-scheme:dark]" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="flex-1 text-slate-400 hover:text-white h-12 rounded-xl">
                                Cancelar
                            </Button>
                            <Button disabled={isLoading} type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl">
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-red-900/50 text-slate-50 rounded-3xl p-6">
                    <DialogHeader className="mb-2">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white text-center">Excluir Loja?</DialogTitle>
                    </DialogHeader>
                    <div className="text-center space-y-4">
                        <p className="text-slate-400 text-sm">
                            Você está prestes a excluir permanentemente a loja <strong className="text-white">{store.name}</strong>.
                        </p>
                        <p className="text-red-400 text-sm px-4 py-3 bg-red-500/10 rounded-xl border border-red-500/20 font-medium">
                            Iso apagará os registros de agendamentos, o banco de dados da loja e a conta de usuário do administrador. Não pode ser desfeito.
                        </p>

                        <div className="flex gap-3 pt-4">
                            <Button disabled={isLoading} variant="ghost" onClick={() => setIsDeleteOpen(false)} className="flex-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 h-14 rounded-2xl font-bold">
                                Cancelar
                            </Button>
                            <Button disabled={isLoading} onClick={handleDelete} className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-red-600/20">
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Sim, Excluir Para Sempre'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Credentials Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50 rounded-3xl p-6">
                    <DialogHeader className="mb-4">
                        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Key className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-black text-white text-center">Credenciais de Acesso</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-400">E-mail de Acesso</Label>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-medium select-all">
                                {store.users?.[0]?.email || 'Não encontrado'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-400">Senha Padrão</Label>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-medium select-all">
                                {store.initial_password}
                            </div>
                        </div>
                        <Button type="button" variant="ghost" onClick={() => setIsViewOpen(false)} className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-12 rounded-xl mt-2 font-bold">
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
