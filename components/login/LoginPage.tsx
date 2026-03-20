// components/login/LoginPage.tsx
'use client'

import { useState }        from 'react'
import { useCheckNumber }  from '@/hooks/useAuth'
import { Button }          from '@/components/ui/button'
import { Input }           from '@/components/ui/input'
import { Loader2, Smartphone, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [mobile, setMobile]   = useState('')
  const { mutate, isPending } = useCheckNumber()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobile.trim().length < 10) return
    mutate({ mobile_number: mobile.trim() })
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
        <div>
          <h2 className="text-xl font-bold">Welcome</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Enter your mobile number to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="mobile" className="text-sm font-medium">Mobile Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                placeholder="9001234567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                disabled={isPending}
                autoFocus
                className="pl-9 h-11 rounded-xl"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-base gap-2"
            disabled={isPending || mobile.trim().length < 10}
          >
            {isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><span>Continue</span><ArrowRight className="h-4 w-4" /></>
            }
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <span className="font-medium text-foreground">Contact your admin.</span>
      </p>
    </div>
  )
}
