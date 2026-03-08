import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, MessageCircle, BarChart3, Smartphone, Zap, ShieldCheck, CheckCircle2, XCircle, Star, StarHalf, Quote } from 'lucide-react'
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
          <Image src="/images/logo.png" alt="CoreAgenda Logo" width={48} height={48} className="w-10 h-10 object-contain drop-shadow-sm" />
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">CoreAgenda</span>
            <div className="hidden md:block w-px h-6 bg-slate-300"></div>
            <span className="hidden md:block text-sm font-bold text-slate-500 tracking-wide">Sistema de Agendamento e Gestão</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden">
            Acessar Módulo
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
            <Link href="/login" className="w-full sm:w-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <Button className="relative w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-[1.03] active:scale-95 transition-all duration-300 font-extrabold rounded-full px-12 h-16 text-lg border border-white/20">
                  <span className="relative z-10 flex items-center">
                    Entrar no Meu Painel
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </Link>
          </div>
        </section>


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

        {/* CONTRAST: CHAOS VS PEACE */}
        <section className="w-full max-w-6xl mx-auto mt-32 px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Escolha trabalhar em paz.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Deixe o trabalho robótico para os sistemas. O seu tempo deve ser focado em escalar sua empresa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Chaos */}
            <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 sm:p-10 opacity-70 hover:opacity-100 transition-opacity">
              <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </span>
                Qualquer outro sistema
              </h3>
              <ul className="space-y-5">
                <li className="flex gap-3 text-slate-600 font-medium">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Clientes esquecem o horário e você toma um prejuízo furtivo.</span>
                </li>
                <li className="flex gap-3 text-slate-600 font-medium">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Interrupções toda hora via WhatsApp perguntando "Tem vaga de tarde?".</span>
                </li>
                <li className="flex gap-3 text-slate-600 font-medium">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Você não tem a mínima ideia de quem são seus melhores clientes.</span>
                </li>
                <li className="flex gap-3 text-slate-600 font-medium">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Design horrível de 2010 que não passa confiança pro seu cliente final.</span>
                </li>
              </ul>
            </div>

            {/* The Peace */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-500/20 rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="inline-flex px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full uppercase tracking-wider mb-4 border border-indigo-200">
                  A Escolha Certa
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  A Elite CoreAgenda
                </h3>
                <ul className="space-y-5">
                  <li className="flex gap-3 text-indigo-950 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Lembretes automáticos nativos via WhatsApp. Faltas zeradas.</span>
                  </li>
                  <li className="flex gap-3 text-indigo-950 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>O cliente marca sozinho, na hora que quiser, em 15 segundos.</span>
                  </li>
                  <li className="flex gap-3 text-indigo-950 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Métricas exatas de retenção e faturamento na palma da mão.</span>
                  </li>
                  <li className="flex gap-3 text-indigo-950 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Design hiper-premium, projetado para grudar na mente visual do seu cliente.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SLIDER */}
        <section className="w-full mt-32 px-4 sm:px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center mb-12 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Quem testa, não volta atrás.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Feito sob medida para negócios de beleza e saúde que precisam atrair, fidelizar e multiplicar caixa.</p>

            {/* Mobile Swipe Hint */}
            <div className="flex justify-center sm:hidden pt-2">
              <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50/80 px-4 py-1.5 rounded-full font-bold text-sm animate-pulse border border-indigo-100">
                Deslize para ver avaliações <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Horizontally scrollable container with hidden scrollbar */}
          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-12 snap-x snap-mandatory hide-scrollbar pl-4 md:pl-[max(1rem,calc((100vw-1152px)/2))] pr-8 py-4">

            {/* Review 1: Barbearia */}
            <div className="w-[85vw] sm:min-w-[320px] max-w-[400px] shrink-0 snap-center bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative text-white translate-y-0 hover:-translate-y-2 transition-transform duration-300">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-700" />
              <div className="flex gap-1 mb-6 text-amber-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-300 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                "Cara, o sistema é liso demais. A galera curtiu bastante o link personalizado com a logo da barbearia, passa uma moral foda, parece app de 100 mil reais. Única coisa, queria que o cliente já pagasse no link tbm rs, mas pro agendamento tá perfeito."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner shrink-0">TH</div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Thiago H.</h4>
                  <p className="text-xs sm:text-sm text-indigo-300">Barbearia Premium</p>
                </div>
              </div>
            </div>

            {/* Review 2: Salão de Beleza */}
            <div className="w-[85vw] sm:min-w-[320px] max-w-[400px] shrink-0 snap-center bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative hover:-translate-y-2 transition-transform duration-300 opacity-95 hover:opacity-100">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-50" />
              <div className="flex gap-1 mb-6 text-amber-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><StarHalf className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                "Menina, me salvou de um burnout real oficial kkkk. Chegava num ponto que eu não aguentava mais responder mensagem 8 da noite perguntando 'tem horário amanhã?'. Agora eu só jogo o link no Insta e a agenda enche sozinha de madrugada."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600 shrink-0">CS</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Camila Silva</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Salão & Estética</p>
                </div>
              </div>
            </div>

            {/* Review 3: Clínica Odonto */}
            <div className="w-[85vw] sm:min-w-[320px] max-w-[400px] shrink-0 snap-center bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative hover:-translate-y-2 transition-transform duration-300 opacity-95 hover:opacity-100">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-50" />
              <div className="flex gap-1 mb-6 text-amber-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                "Muito prático. A função do robô mandar o WhatsApp 1h antes pros pacientes confirmando quase que zerou as faltas aqui na clínica. Tinha dia que 3 furavam e eu ficava com a sala parada dando prejuízo... Valeu cada centavo."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center font-bold text-sky-600 shrink-0">MR</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Dr. Mateus R.</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Clínica Odontológica</p>
                </div>
              </div>
            </div>

            {/* Review 4: Barbearia Clássica */}
            <div className="w-[85vw] sm:min-w-[320px] max-w-[400px] shrink-0 snap-center bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative hover:-translate-y-2 transition-transform duration-300 opacity-95 hover:opacity-100">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-50" />
              <div className="flex gap-1 mb-6 text-amber-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><StarHalf className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                "Antes dava uma confusão do caramba pra fechar a comissão dos moleques no final do mês. Era papelzinho pra todo lado, um inferno. Agora eu abro o painel e já tá tudo calculado no centavo. Recomendo muito."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">PB</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Pedro B.</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Barber Club</p>
                </div>
              </div>
            </div>

            {/* Review 5: Clínica Dermatológica */}
            <div className="w-[85vw] sm:min-w-[320px] max-w-[400px] shrink-0 snap-center bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative hover:-translate-y-2 transition-transform duration-300 opacity-95 hover:opacity-100">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-50" />
              <div className="flex gap-1 mb-6 text-amber-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                "Fui de um sistema engessado dos anos 2000 direto pra CoreAgenda. A reação das minhas pacientes quando viram o visual com a logomarca da clínica nas cores que eu escolhi... surreal rs! Passa uma autoridade clínica gigante que não tem preço."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600 shrink-0">DA</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Dra. Amanda C.</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Dermatologia Avançada</p>
                </div>
              </div>
            </div>

            {/* Review 6: Esmalteria */}
            <div className="w-[85vw] sm:min-w-[320px] max-w-[400px] shrink-0 snap-center bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative hover:-translate-y-2 transition-transform duration-300 opacity-95 hover:opacity-100">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-50" />
              <div className="flex gap-1 mb-6 text-amber-400">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                "Esmalteria é correria pura! Emendar um serviço no outro o tempo inteiro com os alicates na mão. Mandei o link pro grupo VIP das unhas, e a agenda encheu sozinha. Ninguém precisou perguntar de preço, tava tudo lá machigadinho."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600 shrink-0">JP</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Juliana P.</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Nail Designer</p>
                </div>
              </div>
            </div>

            {/* Scroll Indication Card (End) */}
            <div className="min-w-[120px] shrink-0 flex items-center justify-center pt-8">
              <div className="text-slate-400 text-sm font-medium flex items-center gap-2 rotate-90 whitespace-nowrap bg-white/50 px-4 py-2 rounded-full shadow-sm">
                Deslize para o lado <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

          </div>
        </section>


        {/* FAQ SECTION */}
        <section className="w-full max-w-4xl mx-auto mt-32">
          <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Dúvidas Frequentes</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Tudo o que você precisa saber sobre a experiência CoreAgenda.</p>
          </div>
          <div className="space-y-4 text-left">
            <div className="p-6 sm:p-8 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-xl text-slate-900">Como faço para me cadastrar?</h3>
              <p className="text-slate-500 mt-2 text-lg font-medium leading-relaxed">A CoreAgenda atua por modelo de licenciamento privado. Nós configuramos a máquina de vendas e entregamos o acesso gerencial pronto para o lojista. Se você já tem acesso, basta entrar no painel.</p>
            </div>
            <div className="p-6 sm:p-8 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-xl text-slate-900">Meus clientes precisam de um aplicativo?</h3>
              <p className="text-slate-500 mt-2 text-lg font-medium leading-relaxed">Não! Eles acessam seu link exclusivo com a sua identidade visual direto pelo navegador (Chrome, Safari, Instagram) em segundos.</p>
            </div>
            <div className="p-6 sm:p-8 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-xl text-slate-900">Como vou ser notificado dos agendamentos?</h3>
              <p className="text-slate-500 mt-2 text-lg font-medium leading-relaxed">Sua agenda piscará na sua tela em tempo real com acesso imediato pelo computador ou pelo seu celular, tudo centralizado no seu Controle de Fluxo.</p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative bg-white border-t border-slate-200/60 pt-16 pb-8 px-6 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="CoreAgenda Logo" width={40} height={40} className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-xl text-slate-900">CoreAgenda</span>
          </div>

          <p className="text-slate-400 font-medium text-sm text-center md:text-right flex-1">
            &copy; {new Date().getFullYear()} CoreAgenda. Criado para negócios de alto nível.
          </p>
        </div>
      </footer>

    </div>
  )
}
