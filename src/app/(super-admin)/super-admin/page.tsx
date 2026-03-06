import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Store, Clock, Zap, Crown } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateStoreModal } from './CreateStoreModal' // Client component
import { StoreActionsMenu } from './StoreActionsMenu' // Edit/Delete Actions

export default async function SuperAdminPage() {
    const stores = await prisma.establishment.findMany({
        orderBy: {
            created_at: 'desc'
        },
        include: {
            users: true // To get owner name/email
        }
    })

    const totalStores = stores.length
    const activeStores = stores.filter(s => s.status === 'ACTIVE').length
    const trialStores = stores.filter(s => s.status === 'TRIAL').length

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm backdrop-blur-md border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                        <Crown className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            Gestão de Clientes
                        </h1>
                        <p className="text-slate-400 font-medium mt-1">
                            Acompanhe as lojas ativas e os períodos de teste.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <CreateStoreModal />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-bold">Total de Lojas</p>
                        <p className="text-2xl font-black text-white">{totalStores}</p>
                    </div>
                </Card>
                <Card className="bg-slate-900 border-slate-800 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-bold">Lojas Ativas</p>
                        <p className="text-2xl font-black text-white">{activeStores}</p>
                    </div>
                </Card>
                <Card className="bg-slate-900 border-slate-800 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-bold">Lojas em Teste</p>
                        <p className="text-2xl font-black text-white">{trialStores}</p>
                    </div>
                </Card>
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 rounded-2xl md:rounded-[2rem] border border-slate-800 overflow-hidden w-full max-w-full">
                <div className="p-4 md:p-6 border-b border-slate-800">
                    <h2 className="text-lg font-black text-white">Todas as Lojas</h2>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-xs font-black uppercase tracking-widest">
                                <th className="p-4 md:p-6 py-4">Loja</th>
                                <th className="p-4 md:p-6 py-4">Dono</th>
                                <th className="p-4 md:p-6 py-4">Status</th>
                                <th className="p-4 md:p-6 py-4">Fim do Teste</th>
                                <th className="p-4 md:p-6 py-4 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {stores.map((store) => {
                                const isExpired = store.trial_ends_at && isPast(store.trial_ends_at)
                                const owner = store.users.find(u => u.role === 'USER') || store.users[0]

                                return (
                                    <tr key={store.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 md:p-6 py-4">
                                            <p className="font-bold text-slate-200">{store.name}</p>
                                            <p className="text-xs text-slate-500">{store.niche}</p>
                                        </td>
                                        <td className="p-4 md:p-6 py-4">
                                            <p className="font-bold text-slate-300">{owner?.name || '-'}</p>
                                            <p className="text-xs text-slate-500">{owner?.email || '-'}</p>
                                        </td>
                                        <td className="p-4 md:p-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${store.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                store.status === 'TRIAL' && !isExpired ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {store.status === 'TRIAL' && isExpired ? 'EXPIRADO' : store.status}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-6 py-4">
                                            {store.trial_ends_at ? (
                                                <div className="text-sm border-l-2 border-slate-700 pl-3">
                                                    <p className={`font-bold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
                                                        {formatDistanceToNow(new Date(store.trial_ends_at), { addSuffix: true, locale: ptBR })}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(store.trial_ends_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-2 md:p-4 py-4 text-right">
                                            <StoreActionsMenu store={store} />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
