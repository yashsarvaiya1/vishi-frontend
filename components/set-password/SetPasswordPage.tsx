// components/set-password/SetPasswordPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { useSetPassword }      from '@/hooks/useAuth'
import { Button }              from '@/components/ui/button'
import { Input }               from '@/components/ui/input'
import { Label }               from '@/components/ui/label'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn }                  from '@/lib/utils'

export default function SetPasswordPage() {
  const router   = useRouter()
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

  // Backend requires minimum 6 characters
  const isLong    = password.length >= 6
  const mismatch  = confirm.length > 0 && password !== confirm
  const canSubmit = isLong && password === confirm && !isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    mutate({ mobile_number: mobile, password, confirm_password: confirm })
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
              Welcome{username ? `, ${username}` : ''}
            </CardTitle>
          </div>
          <CardDescription className="pl-9">
            {mobile} — Create a password to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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
              {password.length > 0 && (
                <p className={cn(
                  'text-xs flex items-center gap-1',
                  isLong ? 'text-green-600' : 'text-muted-foreground'
                )}>
                  {isLong
                    ? <><CheckCircle2 className="h-3 w-3" /> Good length</>
                    : `${6 - password.length} more character${6 - password.length !== 1 ? 's' : ''} needed`
                  }
                </p>
              )}
            </div>

            {/* Confirm field */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConf ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={isPending}
                  className={cn('pr-10', mismatch && 'border-destructive focus-visible:ring-destructive')}
                />
                <button
                  type="button"
                  aria-label={showConf ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConf((v) => !v)}
                >
                  {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mismatch && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
              {!mismatch && confirm.length > 0 && password === confirm && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Set Password & Login'
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
