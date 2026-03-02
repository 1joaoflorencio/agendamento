import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createEstablishment } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'

export default async function OnboardingPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Verifica se o usuário já tem um estabelecimento. Se sim, manda pro painel.
    const appUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (appUser?.establishment_id) {
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Vamos configurar sua conta!</CardTitle>
                    <CardDescription>Qual é o nome do seu negócio?</CardDescription>
                </CardHeader>
                <form action={createEstablishment}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Estabelecimento</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Ex: Barbearia do Zé"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="niche">Nicho de Mercado</Label>
                            <Input
                                id="niche"
                                name="niche"
                                type="text"
                                placeholder="Ex: Barbearia, Clínica, Salão"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pt-2 text-center">
                            Seu link de agendamento personalizado será gerado automaticamente com base no nome do estabelecimento.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit">
                            Criar Estabelecimento
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
