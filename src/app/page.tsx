import Link from 'next/link'
import { ArrowRight, Calendar, MessageCircle, BarChart3, Smartphone, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/30 overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-200/50 via-purple-200/40 to-transparent blur-[100px] opacity-70 animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-cyan-200/40 via-blue-200/30 to-transparent blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-t from-emerald-100/30 via-slate-100/10 to-transparent blur-[80px] opacity-50"></div>
      </div>

      {/* HEADER / NAV */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">CoreAgenda</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-full px-6 transition-all duration-300">
              Sou Cliente
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold rounded-full px-8 shadow-xl shadow-slate-900/10 h-12">
              Acessar Painel <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center pt-16 pb-32 px-4 sm:px-6 lg:px-8">

        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-sm font-bold text-indigo-700 mb-4 animate-in fade-in zoom-in duration-700 delay-300">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            A Nova Referência em Gestão de Alto Padrão
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-sm text-slate-900">
            A agenda que o seu <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">negócio merece.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Uma plataforma de nicho ultra-rápida, sem instalações complexas, desenhada para barbearias, salões e clínicas que exigem o melhor em tecnologia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-[1.03] active:scale-95 transition-all duration-300 font-extrabold rounded-full px-10 h-16 text-lg shadow-2xl shadow-indigo-600/25 border border-white/10 group">
                Entrar no Meu Painel
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* HERO MOCKUP (GLASS COMPONENT) */}
        <div className="w-full max-w-5xl mx-auto mt-20 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          {/* Glow behind mockup */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[80px] opacity-20 -z-10 rounded-[3rem]"></div>

          <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-slate-900/10 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-6 overflow-hidden">
            {/* Mock Header */}
            <div className="flex items-center gap-2 mb-6 ml-2">
              <div className="w-3 h-3 rounded-full bg-slate-300/80"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300/80"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300/80"></div>
            </div>

            {/* Mock Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Sidebar Mock */}
              <div className="hidden md:block col-span-1 space-y-4">
                <div className="h-12 bg-slate-100/80 rounded-2xl w-full animate-pulse"></div>
                <div className="h-10 bg-slate-100/50 rounded-xl w-3/4"></div>
                <div className="h-10 bg-slate-100/50 rounded-xl w-5/6"></div>
                <div className="h-10 bg-slate-100/50 rounded-xl w-4/6"></div>
              </div>
              {/* Main Content Mock */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-200/80 rounded-lg"></div>
                    <div className="h-10 w-64 bg-slate-800/80 rounded-xl"></div>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                {/* Schedule Cards Mock */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="h-32 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between">
                      <div className="h-4 w-12 bg-indigo-200 rounded-md"></div>
                      <div className="h-6 w-16 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200/80 rounded-md"></div>
                      <div className="h-3 w-1/2 bg-slate-100 rounded-md"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between">
                      <div className="h-4 w-12 bg-slate-200 rounded-md"></div>
                      <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200/80 rounded-md"></div>
                      <div className="h-3 w-1/2 bg-slate-100 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <section className="w-full max-w-6xl mx-auto mt-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Tecnologia que <span className="text-indigo-600">trabalha por você.</span></h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Tudo que uma operação conectada precisa para não perder tempo recebendo mensagens de disponibilidade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feat 1 */}
            <div className="col-span-1 md:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-10 -mt-10 transition-colors group-hover:bg-indigo-200/50"></div>
              <div className="relative z-10 space-y-5">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">WhatsApp Bot Nativo</h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md">Lembretes disparados automaticamente. Sem clientes não comparecendo e sem perder horas confirmando agendas.</p>
                </div>
              </div>
            </div>

            {/* Feat 2 */}
            <div className="col-span-1 bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Link Próprio</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">Coloque na bio do Instagram. Link exclusivo com sua logo, regras e identidade visual (Barbearia, Clínica ou Beleza).</p>
                </div>
              </div>
            </div>

            {/* Feat 3 */}
            <div className="col-span-1 bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Métricas e Fluxo</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">Painel gerencial centralizado. Veja o pico de horários, faturamento e controle de profissionais em tempo real.</p>
                </div>
              </div>
            </div>

            {/* Feat 4 */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10 space-y-5 h-full flex flex-col justify-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold mb-2">Segurança em 1º Lugar</h3>
                  <p className="text-indigo-200/80 font-medium leading-relaxed max-w-md">Servidores no edge, proteção anti-spam por IP e validação estrita prevendo negações de serviço e horários duplicados.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative bg-white border-t border-slate-200/60 pt-16 pb-8 px-6 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xl text-slate-900">CoreAgenda</span>
          </div>

          <p className="text-slate-400 font-medium text-sm text-center">
            &copy; {new Date().getFullYear()} CoreAgenda. Criado para negócios de alto nível.
          </p>

          <Link href="/login">
            <span className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest border border-slate-200 rounded-full px-6 py-2 hover:bg-slate-50 active:scale-95 inline-block">
              Login Administrativo
            </span>
          </Link>
        </div>
      </footer>

    </div>
  )
}
