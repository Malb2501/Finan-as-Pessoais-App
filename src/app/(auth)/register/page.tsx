'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { toast } from 'sonner'
import { CheckCircle, Mail, TriangleAlert, Wallet } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      toast.error('Erro ao criar conta: ' + error.message)
      setLoading(false)
    } else {
      setRegistered(true)
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-foreground">FinançasPessoais</h1>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle className="h-14 w-14 text-green-500" />
              </div>
              <CardTitle className="text-xl">Conta criada com sucesso!</CardTitle>
              <CardDescription>Só mais um passo para começar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Verifique sua caixa de entrada</p>
                  <p>
                    Enviamos um link de confirmação para{' '}
                    <span className="font-medium">{email}</span>.
                    Clique no link para ativar sua conta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Não encontrou o e-mail?</p>
                  <p>
                    Verifique também a pasta de <span className="font-medium">spam</span> ou{' '}
                    <span className="font-medium">lixo eletrônico</span> — às vezes o e-mail de
                    confirmação pode parar por lá.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/login" className={buttonVariants({ className: 'w-full justify-center' })}>
                Já confirmei, ir para o login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Wallet className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-foreground">FinançasPessoais</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Comece a controlar suas finanças hoje</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando...' : 'Criar conta'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Já tem conta?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
