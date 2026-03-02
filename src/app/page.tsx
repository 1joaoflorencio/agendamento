import { redirect } from 'next/navigation'

export default function Home() {
  // Para a Fase 2, redirecionaremos direto pro Login do Gestor.
  // Na Fase 3 (Motor de Agendamento), isso aqui pode virar a Landing Page do SaaS.
  redirect('/login')
}
