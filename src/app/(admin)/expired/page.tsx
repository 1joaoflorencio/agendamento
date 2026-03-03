import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ExpiredTrialPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Período de Teste Encerrado</h1>

                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    Seu período de 7 dias gratuitos chegou ao fim. Esperamos que o sistema tenha ajudado a otimizar agendamentos no seu negócio!
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-slate-600 font-bold mb-4">Para continuar usando o painel, a agenda online e todos os nossos recursos, escolha um dos nossos planos.</p>

                    <Link href="https://wa.me/5500000000000?text=Ol%C3%A1%21+Meu+per%C3%ADodo+de+teste+acabou+e+gostaria+de+saber+mais+sobre+os+planos" target="_blank" rel="noopener noreferrer">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20">
                            Falar no WhatsApp <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                <p className="text-sm text-slate-400 font-medium">
                    Tem alguma dúvida? Entre em contato com nosso suporte.
                </p>
            </div>
        </div>
    )
}
