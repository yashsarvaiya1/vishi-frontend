// components/password/PasswordPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, ArrowLeft, Info } from 'lucide-react'

export default function PasswordPage() {
  const router   = useRouter()
  const [mobile,     setMobile]     = useState('')
  const [username,   setUsername]   = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const { mutate, isPending } = useLogin()

  useEffect(() => {
    const m = sessionStorage.getItem('pending_mobile')
    const u = sessionStorage.getItem('pending_username')
    if (!m) { router.replace('/login'); return }
    setMobile(m)
    setUsername(u ?? '')
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    mutate({ mobile_number: mobile, password: password.trim() })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
          <span className="text-2xl font-bold text-primary">V</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Vishi</h1>
        <p className="text-muted-foreground text-sm mt-1">Digital chit-fund management</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => router.push('/login')}
              aria-label="Back to login"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">
              Welcome back{username ? `, ${username}` : ''}
            </CardTitle>
          </div>
          <CardDescription className="pl-9 text-xs">{mobile}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  autoFocus
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !password.trim()}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>

          <button
            type="button"
            className="text-sm text-muted-foreground underline underline-offset-4 w-full text-center hover:text-foreground transition-colors"
            onClick={() => setShowForgot((v) => !v)}
          >
            Forgot password?
          </button>

          {showForgot && (
            <Alert className="text-sm">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Contact your admin. Admin clears your password from the Users page.
                Once cleared, go back and re-enter your number to set a new one.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
