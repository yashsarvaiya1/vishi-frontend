// components/password/PasswordPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { useLogin }            from '@/hooks/useAuth'
import { Button }              from '@/components/ui/button'
import { Input }               from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, ArrowLeft, Info, ArrowRight } from 'lucide-react'

export default function PasswordPage() {
  const router = useRouter()
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
    <div className="w-full max-w-sm space-y-8">

      {/* Logo */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/25">
          <span className="text-2xl font-black text-primary-foreground">V</span>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Vishi</h1>
          <p className="text-sm text-muted-foreground mt-1">Digital chit-fund management</p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border bg-card shadow-sm px-6 py-6 space-y-5">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mt-0.5 h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              Welcome back{username ? `, ${username}` : ''}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{mobile}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
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
                className="pr-10 h-11 rounded-xl"
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
            className="w-full h-11 rounded-xl font-semibold text-base gap-2"
            disabled={isPending || !password.trim()}
          >
            {isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><span>Login</span><ArrowRight className="h-4 w-4" /></>
            }
          </Button>
        </form>

        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors w-full text-center"
          onClick={() => setShowForgot((v) => !v)}
        >
          Forgot password?
        </button>

        {showForgot && (
          <Alert className="rounded-xl text-sm">
            <Info className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs leading-relaxed">
              Contact your admin to reset your password. Once cleared, go back to the login screen and enter your number again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
