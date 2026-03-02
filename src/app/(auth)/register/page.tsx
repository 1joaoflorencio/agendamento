import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">

            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Scheduler SaaS</h1>
                <p className="text-muted-foreground mt-2">Crie sua conta como estabelecimento</p>
            </div>

            <Card className="w-[400px]">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Criar uma conta</CardTitle>
                    <CardDescription>Insira seus dados para começar a gerenciar.</CardDescription>
                </CardHeader>
                <form>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="João Pedro"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" formAction={signup}>
                            Cadastrar Módulo Gestor
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Já possui uma conta?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Faça login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
