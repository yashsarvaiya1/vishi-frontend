// components/shared/DrawAnimation.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Trophy }                       from 'lucide-react'
import { Button }                       from '@/components/ui/button'
import { cn }                           from '@/lib/utils'
import useUIStore                       from '@/stores/uiStore'

interface DrawAnimationProps {
  vishiId:      number
  cycleNumber:  number
  winnerName:   string    // slot name e.g. "Raj-Home"
  username:     string    // real name e.g. "Raj Shah"
  amount:       string    // released amount e.g. "25000.00"
  wasFixed:     boolean
  onDone:       () => void
}

// ─── Confetti particle config ─────────────────────────────────────────────────
const COLORS   = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#8b5cf6']
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id:    i,
  color: COLORS[i % COLORS.length],
  left:  `${Math.random() * 100}%`,
  delay: `${Math.random() * 0.6}s`,
  dur:   `${0.9 + Math.random() * 0.6}s`,
  size:  `${6 + Math.floor(Math.random() * 7)}px`,
  rot:   `${Math.floor(Math.random() * 360)}deg`,
  shape: i % 3 === 0 ? 'circle' : 'square',
}))

// ─── Stage timing ─────────────────────────────────────────────────────────────
//  0 → "spinning"  (slot machine roll)
//  1 → "reveal"    (winner card pops in)
//  2 → "done"      (can dismiss)
const SPIN_DURATION  = 1800   // ms
const REVEAL_DELAY   = 200    // ms after spin before reveal

export default function DrawAnimation({
  vishiId, cycleNumber, winnerName, username, amount, wasFixed, onDone,
}: DrawAnimationProps) {
  const markDrawSeen = useUIStore((s) => s.markDrawSeen)
  const hasSeenDraw  = useUIStore((s) => s.hasSeenDraw)

  const [stage, setStage]     = useState<0 | 1 | 2>(0)
  const [visible, setVisible] = useState(true)
  const spinRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  // If already seen, skip straight to done/reveal so caller can proceed
  useEffect(() => {
    if (hasSeenDraw(vishiId, cycleNumber)) {
      onDone()
      return
    }

    // Stage 0 → Stage 1 after spin
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
    // Small delay so fade-out plays before unmount
    setTimeout(onDone, 300)
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-100 flex flex-col items-center justify-center',
        'bg-background/95 backdrop-blur-md transition-opacity duration-300',
        !visible && 'opacity-0'
      )}
    >
      {/* ── Confetti (only after spin) ── */}
      {stage >= 1 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {PARTICLES.map((p) => (
            <span
              key={p.id}
              className="absolute top-0 animate-confetti-fall"
              style={{
                left:             p.left,
                width:            p.size,
                height:           p.size,
                background:       p.color,
                borderRadius:     p.shape === 'circle' ? '50%' : '2px',
                transform:        `rotate(${p.rot})`,
                animationDelay:   p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Slot machine spinner ── */}
      {stage === 0 && (
        <div className="flex flex-col items-center gap-6 select-none">
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Drawing winner…
          </p>

          {/* Drum roll: cycling names */}
          <div className="h-16 w-56 overflow-hidden rounded-xl border bg-muted/40 flex items-center justify-center">
            <div className="animate-slot-spin text-2xl font-bold tracking-tight text-foreground text-center leading-none">
              🎰
            </div>
          </div>

          <div className="flex gap-1.5">
            {[0,1,2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Winner reveal card ── */}
      {stage >= 1 && (
        <div
          className={cn(
            'flex flex-col items-center gap-5 px-6 w-full max-w-xs',
            'transition-all duration-500',
            stage === 1 ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          )}
        >
          {/* Trophy icon */}
          <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-lg ring-4 ring-amber-200 dark:ring-amber-800">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {wasFixed ? '🔒 Fixed Draw — Cycle Winner' : '🎉 Cycle Winner'}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              {winnerName}
            </h2>
            <p className="text-sm text-muted-foreground">{username}</p>
          </div>

          {/* Amount chip */}
          <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-6 py-3 text-center">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">Receives</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-0.5">
              ₹{Number(amount).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Cycle badge */}
          <p className="text-xs text-muted-foreground">Cycle #{cycleNumber}</p>

          {stage === 2 && (
            <Button
              className="w-full mt-2 rounded-xl h-12 text-base font-semibold"
              onClick={handleDone}
            >
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
