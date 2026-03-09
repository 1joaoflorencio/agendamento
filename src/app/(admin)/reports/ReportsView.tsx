'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Wallet, TrendingUp, Calendar, CalendarDays } from 'lucide-react'

type ReportData = {
    label: string
    value: number
}

export default function ReportsView({
    theme,
    weeklyData,
    monthlyData,
    yearlyData,
    totals
}: {
    theme: any
    weeklyData: ReportData[]
    monthlyData: ReportData[]
    yearlyData: ReportData[]
    totals: { week: number, month: number, year: number }
}) {
    const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('month')

    // Determine current dataset and total based on active tab
    const data = activeTab === 'week' ? weeklyData : activeTab === 'month' ? monthlyData : yearlyData
    const currentTotal = activeTab === 'week' ? totals.week : activeTab === 'month' ? totals.month : totals.year

    // Extract hex color from generic tailwind classes? Since theme gives tailwind classes, we hardcode some visually pleasing colors that match the niches.
    // As a robust fallback, we use an indigo shade usually.
    let chartColor = '#6366f1' // indigo
    if (theme.primary.includes('blue')) chartColor = '#2563eb'
    if (theme.primary.includes('zinc')) chartColor = '#18181b'
    if (theme.primary.includes('pink')) chartColor = '#db2777'

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">
            <div className="mt-2 sm:mt-4">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Faturamento</h1>
                <p className="text-sm text-slate-500 font-medium">
                    Acompanhe o rendimento e o crescimento do seu negócio.
                </p>
            </div>

            {/* HIGH LEVEL STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={cn("border-2 rounded-[1.5rem] shadow-sm", activeTab === 'week' ? "border-slate-300" : "border-slate-100")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Últimos 7 Dias</CardTitle>
                        <Calendar className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.week)}
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("border-2 rounded-[1.5rem] shadow-sm", activeTab === 'month' ? cn("border-transparent", theme.shadow) : "border-slate-100")}>
                    {activeTab === 'month' && <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-5 rounded-[1.5rem] z-0", theme.gradient)} />}
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className={cn("text-sm font-black uppercase tracking-widest", activeTab === 'month' ? theme.textPrimary : "text-slate-500")}>Mês Atual</CardTitle>
                        <CalendarDays className={cn("h-4 w-4", activeTab === 'month' ? theme.textPrimary : "text-slate-400")} />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className={cn("text-3xl font-black", activeTab === 'month' ? theme.textPrimary : "text-slate-800")}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.month)}
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("border-2 rounded-[1.5rem] shadow-sm", activeTab === 'year' ? "border-slate-300" : "border-slate-100")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Este Ano</CardTitle>
                        <Wallet className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.year)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS */}
            <Card className="border-2 border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden bg-white/50 backdrop-blur-xl">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-50 bg-white">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Análise de Receita
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-1">
                            Receita baseada em agendamentos concluídos.
                        </CardDescription>
                    </div>

                    {/* TABS */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('week')}
                            className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all", activeTab === 'week' ? cn("bg-white shadow-sm", theme.textPrimary) : "text-slate-500 hover:text-slate-700")}
                        >
                            7 Dias
                        </button>
                        <button
                            onClick={() => setActiveTab('month')}
                            className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all", activeTab === 'month' ? cn("bg-white shadow-sm", theme.textPrimary) : "text-slate-500 hover:text-slate-700")}
                        >
                            Este Mês
                        </button>
                        <button
                            onClick={() => setActiveTab('year')}
                            className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all", activeTab === 'year' ? cn("bg-white shadow-sm", theme.textPrimary) : "text-slate-500 hover:text-slate-700")}
                        >
                            Este Ano
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeTab === 'week' ? (
                                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                                        tickFormatter={(value) => `R$ ${value}`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill={chartColor}
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={50}
                                    />
                                </BarChart>
                            ) : (
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                                        tickFormatter={(value) => `R$ ${value}`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={chartColor}
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
