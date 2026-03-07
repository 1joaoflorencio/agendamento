import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, AlertCircle, CalendarSearch } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 max-w-md w-full text-center space-y-8 p-8 sm:p-12 bg-white/80 backdrop-blur-xl rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-indigo-500/5">

                <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-50"></div>
                    <div className="relative w-full h-full bg-red-50 text-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <CalendarSearch className="w-12 h-12 sm:w-16 sm:h-16" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-50">
                        <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                        Ops!
                    </h1>
                    <p className="text-base sm:text-lg text-slate-500 font-medium">
                        A página ou loja que você está procurando não foi encontrada. O link pode estar incorreto ou o estabelecimento não existe mais.
                    </p>
                </div>

                <div className="pt-4 space-y-3">
                    <Button asChild className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base">
                        <Link href="/">
                            <Home className="w-5 h-5" />
                            Voltar para o Início
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
