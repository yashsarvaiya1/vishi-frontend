// components/login/LoginPage.tsx
'use client'

import { useState } from 'react'
import { useCheckNumber } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Smartphone } from 'lucide-react'

export default function LoginPage() {
  const [mobile, setMobile] = useState('')
  const { mutate, isPending } = useCheckNumber()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobile.trim().length < 10) return
    mutate({ mobile_number: mobile.trim() })
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
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Enter your mobile number to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
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
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || mobile.trim().length < 10}
            >
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Continue'
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Don&apos;t have an account? Contact your admin.
      </p>
    </div>
  )
}
