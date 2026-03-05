'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateWhatsAppSettings, testWhatsAppConnection } from './actions'
import { MessageSquare, ShieldCheck, Zap, Globe, Key, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

export default function WhatsAppSettingsCard({ establishment }: { establishment: any }) {
    const [isPending, startTransition] = useTransition()
    const [isTesting, setIsTesting] = useState(false)
    const [apiUrl, setApiUrl] = useState(establishment.whatsapp_api_url || '')
    const [instanceName, setInstanceName] = useState(establishment.whatsapp_instance_name || '')
    const [apiKey, setApiKey] = useState(establishment.whatsapp_api_key || '')
    const [enabled, setEnabled] = useState(establishment.whatsapp_enabled || false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleSave = () => {
        const formData = new FormData()
        formData.append('apiUrl', apiUrl)
        formData.append('instanceName', instanceName)
        formData.append('apiKey', apiKey)
        formData.append('enabled', String(enabled))

        startTransition(async () => {
            try {
                await updateWhatsAppSettings(formData)
                alert('Configurações de integração salvas!')
            } catch (error: any) {
                alert(error.message)
            }
        })
    }

    const handleTestConnection = async () => {
        if (!instanceName || !apiKey) {
            setTestResult({ success: false, message: 'Preencha a Instância e a API Key.' })
            return
        }

        setIsTesting(true)
        setTestResult(null)
        try {
            const result = await testWhatsAppConnection(instanceName, apiKey, apiUrl)
            if (result.instance?.state === 'open') {
                setTestResult({ success: true, message: 'Conexão estabelecida com sucesso!' })
            } else {
                setTestResult({
                    success: false,
                    message: `Instância: ${result.instance?.state || 'Desconectada'}. Escaneie o QR Code no Evolution.`
                })
            }
        } catch (error: any) {
            setTestResult({ success: false, message: `Erro: ${error.message}` })
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/60 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white/80 backdrop-blur-md">
            <CardHeader className="bg-slate-900 p-5 sm:p-8 pb-8 sm:pb-12 relative overflow-hidden rounded-b-2xl sm:rounded-b-[2.5rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                <div className="flex items-center justify-between relative z-10 w-full gap-3">
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 flex-shrink-0">
                            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-lg sm:text-2xl font-black text-white truncate">WhatsApp Bot</CardTitle>
                            <CardDescription className="text-slate-400 font-medium text-xs sm:text-sm">
                                Automação via Evolution API.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 bg-white/5 p-1.5 pr-3 sm:p-2 sm:pr-5 rounded-full border border-white/10 backdrop-blur-sm flex-shrink-0">
                        <Switch
                            id="enabled"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                        <Label htmlFor="enabled" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white cursor-pointer select-none hidden sm:inline">
                            {enabled ? 'Ativado' : 'Desativado'}
                        </Label>
                    </div>
                </div>
            </CardHeader>

            <CardContent className={cn(
                "p-4 sm:p-8 -mt-4 sm:-mt-6 bg-white rounded-t-2xl sm:rounded-t-[2.5rem] relative z-20 space-y-4 sm:space-y-8 transition-all duration-500",
                !enabled && "opacity-60 grayscale-[0.5]"
            )}>
                <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
                    <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="apiUrl" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Endpoint da API</Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <Input
                                id="apiUrl"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                disabled={!enabled}
                                placeholder="https://api.suaempresa.com"
                                className="h-12 sm:h-14 pl-10 sm:pl-12 rounded-xl sm:rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-emerald-500/50 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="instance" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Instância</Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <Input
                                id="instance"
                                value={instanceName}
                                onChange={(e) => setInstanceName(e.target.value)}
                                disabled={!enabled}
                                placeholder="Ex: BarberBot01"
                                className="h-12 sm:h-14 pl-10 sm:pl-12 rounded-xl sm:rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-emerald-500/50 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="apikey" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Global API Key (Security)</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                            <Key className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <Input
                            id="apikey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={!enabled}
                            placeholder="••••••••••••••••"
                            className="h-12 sm:h-14 pl-10 sm:pl-12 rounded-xl sm:rounded-full border-2 border-slate-50 bg-slate-50 font-bold text-slate-700 focus:border-emerald-500/50 text-sm"
                        />
                    </div>
                </div>

                {testResult && (
                    <div className={cn(
                        "p-3 sm:p-4 rounded-xl sm:rounded-full flex items-center gap-2 sm:gap-3 animate-in zoom-in-95 duration-300",
                        testResult.success ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-red-50 border border-red-100 text-red-700"
                    )}>
                        {testResult.success ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                        <span className="text-xs font-bold leading-tight">{testResult.message}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 sm:p-8 pt-0 bg-white flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                    onClick={handleSave}
                    disabled={isPending || !enabled}
                    className="h-12 sm:h-16 flex-1 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> {isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>

                <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTesting || !enabled || !instanceName || !apiKey}
                    className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-full border-2 border-slate-100 font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                    {isTesting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            Testando...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> Testar Conexão
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
