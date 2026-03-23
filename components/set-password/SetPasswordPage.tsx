// components/set-password/SetPasswordPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { useSetPassword }      from '@/hooks/useAuth'
import { Button }              from '@/components/ui/button'
import { Input }               from '@/components/ui/input'
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn }                  from '@/lib/utils'

export default function SetPasswordPage() {
  const router = useRouter()
  const [mobile,   setMobile]   = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const { mutate, isPending } = useSetPassword()

  useEffect(() => {
    const m = sessionStorage.getItem('pending_mobile')
    const u = sessionStorage.getItem('pending_username')
    if (!m) { router.replace('/login'); return }
    setMobile(m)
    setUsername(u ?? '')
  }, [router])

  const isLong   = password.length >= 6
  const mismatch = confirm.length > 0 && password !== confirm
  const matched  = confirm.length > 0 && password === confirm
  const canSubmit = isLong && matched && !isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    mutate({ mobile_number: mobile, password, confirm_password: confirm })
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
              {username ? `Hi, ${username}` : 'Create password'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{mobile} — set a password to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                autoFocus
                className="pr-10 h-11 rounded-xl"
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide' : 'Show'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <p className={cn('text-xs flex items-center gap-1 transition-colors', isLong ? 'text-emerald-600' : 'text-muted-foreground')}>
                {isLong
                  ? <><CheckCircle2 className="h-3 w-3" /> Good length</>
                  : `${6 - password.length} more character${6 - password.length !== 1 ? 's' : ''} needed`
                }
              </p>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConf ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isPending}
                className={cn(
                  'pr-10 h-11 rounded-xl',
                  mismatch && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              <button
                type="button"
                aria-label={showConf ? 'Hide' : 'Show'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConf((v) => !v)}
              >
                {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
            {matched   && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Passwords match</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-base gap-2"
            disabled={!canSubmit}
          >
            {isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><span>Set Password & Login</span><ArrowRight className="h-4 w-4" /></>
            }
          </Button>
        </form>
      </div>
    </div>
  )
}
