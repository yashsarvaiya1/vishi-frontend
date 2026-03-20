// components/shared/DrawAnimation.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Trophy, Sparkles }             from 'lucide-react'
import { Button }                       from '@/components/ui/button'
import { cn }                           from '@/lib/utils'
import useUIStore                       from '@/stores/uiStore'

interface DrawAnimationProps {
  vishiId:     number
  cycleNumber: number
  winnerName:  string
  username:    string
  amount:      string
  wasFixed:    boolean
  onDone:      () => void
}

const COLORS    = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#8b5cf6','#f97316']
const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id:    i,
  color: COLORS[i % COLORS.length],
  left:  `${5 + Math.random() * 90}%`,
  delay: `${Math.random() * 0.7}s`,
  dur:   `${1.0 + Math.random() * 0.7}s`,
  size:  `${5 + Math.floor(Math.random() * 8)}px`,
  rot:   `${Math.floor(Math.random() * 360)}deg`,
  shape: i % 4 === 0 ? 'circle' : i % 4 === 1 ? 'triangle' : 'square',
}))

const SPIN_DURATION = 1800
const REVEAL_DELAY  = 200

export default function DrawAnimation({
  vishiId, cycleNumber, winnerName, username, amount, wasFixed, onDone,
}: DrawAnimationProps) {
  const markDrawSeen = useUIStore((s) => s.markDrawSeen)
  const hasSeenDraw  = useUIStore((s) => s.hasSeenDraw)

  const [stage,   setStage]   = useState<0 | 1 | 2>(0)
  const [visible, setVisible] = useState(true)
  const spinRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hasSeenDraw(vishiId, cycleNumber)) {
      onDone()
      return
    }
    spinRef.current = setTimeout(() => {
      setStage(1)
      setTimeout(() => setStage(2), REVEAL_DELAY + 400)
    }, SPIN_DURATION)
    return () => { if (spinRef.current) clearTimeout(spinRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDone = () => {
    setVisible(false)
    markDrawSeen(vishiId, cycleNumber)
    setTimeout(onDone, 300)
  }

  if (!visible) return null

  return (
    <div className={cn(
      'fixed inset-0 z-100 flex flex-col items-center justify-center',
      'bg-background/97 backdrop-blur-lg',
      'transition-opacity duration-300',
      !visible && 'opacity-0'
    )}>

      {/* Confetti */}
      {stage >= 1 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {PARTICLES.map((p) => (
            <span
              key={p.id}
              className="absolute top-0 animate-confetti-fall"
              style={{
                left:              p.left,
                width:             p.size,
                height:            p.size,
                background:        p.color,
                borderRadius:      p.shape === 'circle' ? '50%' : p.shape === 'triangle' ? '2px' : '3px',
                transform:         `rotate(${p.rot})`,
                animationDelay:    p.delay,
                '--dur':           p.dur,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Spinner stage */}
      {stage === 0 && (
        <div className="flex flex-col items-center gap-8 select-none px-8">
          <div className="space-y-2 text-center">
            <p className="text-2xl font-bold">🎰</p>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Drawing winner…
            </p>
          </div>

          <div className="h-20 w-64 overflow-hidden rounded-2xl border-2 bg-muted/30 flex items-center justify-center shadow-inner">
            <div className="animate-slot-spin text-3xl font-black text-foreground leading-none select-none">
              ？
            </div>
          </div>

          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Winner reveal */}
      {stage >= 1 && (
        <div className={cn(
          'flex flex-col items-center gap-6 px-8 w-full max-w-xs transition-all duration-500',
          stage === 1 ? 'opacity-0 scale-90 translate-y-6' : 'opacity-100 scale-100 translate-y-0'
        )}>

          {/* Trophy */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-xl ring-4 ring-amber-200 dark:ring-amber-700">
              <Trophy className="h-11 w-11 text-white drop-shadow" />
            </div>
            <span className="absolute -top-1 -right-1 text-lg">🎉</span>
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {wasFixed ? '🔒 Fixed Draw · Cycle Winner' : 'Cycle Winner'}
            </p>
            <h2 className="text-4xl font-black tracking-tight leading-none">
              {winnerName}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">{username}</p>
          </div>

          {/* Amount */}
          <div className="w-full rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 px-6 py-4 text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
              Receives
            </p>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              ₹{Number(amount).toLocaleString('en-IN')}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">Cycle #{cycleNumber}</p>

          {stage === 2 && (
            <Button
              className="w-full rounded-2xl h-12 text-base font-bold shadow-md"
              onClick={handleDone}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
