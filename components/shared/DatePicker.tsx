'use client'

import { useEffect, useId, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, formatDate } from '@/lib/utils'
import { shiftDate } from '@/lib/vishiSchedule'

const today = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const part = (type: string) => parts.find(value => value.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
const monthName = (month: string) => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`))
const moveMonth = (month: string, offset: number) => {
  const [year, number] = month.split('-').map(Number)
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7)
}

export default function DatePicker({ label, value, onChange, min, max, disabled = false }: {
  label: string; value: string; onChange: (date: string) => void; min?: string; max?: string; disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState((value || min || today()).slice(0, 7))
  const heading = useId()
  const focusDate = value && (!min || value >= min) && (!max || value <= max) ? value : min || today()
  useEffect(() => {
    if (open) setMonth((value && (!min || value >= min) && (!max || value <= max) ? value : min || today()).slice(0, 7))
  }, [open, value, min, max])
  const first = `${month}-01`
  const weekday = new Date(`${first}T00:00:00Z`).getUTCDay()
  const start = shiftDate(first, -((weekday + 6) % 7))
  const days = Array.from({ length: 42 }, (_, index) => shiftDate(start, index))
  const allowed = (date: string) => (!min || date >= min) && (!max || date <= max)
  const tabDate = focusDate.slice(0, 7) === month && allowed(focusDate) ? focusDate : days.find(date => date.slice(0, 7) === month && allowed(date))
  const previous = moveMonth(month, -1), next = moveMonth(month, 1)
  const currentYear = Number(month.slice(0, 4))
  const minYear = min ? Number(min.slice(0, 4)) : Math.min(currentYear, Number(today().slice(0, 4)) - 10)
  const maxYear = max ? Number(max.slice(0, 4)) : Math.max(currentYear, Number(today().slice(0, 4)) + 10)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index)
  const selectMonth = (candidate: string) => setMonth(min && candidate < min.slice(0, 7) ? min.slice(0, 7) : max && candidate > max.slice(0, 7) ? max.slice(0, 7) : candidate)
  const keyboard = (event: React.KeyboardEvent<HTMLButtonElement>, date: string) => {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (!(event.key in offsets)) return
    event.preventDefault()
    const target = shiftDate(date, offsets[event.key])
    if (!allowed(target)) return
    setMonth(target.slice(0, 7))
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-calendar="${heading}"][data-date="${target}"]`)?.focus())
  }
  return (
    <div className="space-y-1.5 min-w-0">
      <p className="text-xs font-medium">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled} aria-label={`${label}: ${value ? formatDate(value) : 'Select date'}`} className="w-full justify-between rounded-xl h-11 px-3 font-normal">
            <span className={cn(!value && 'text-muted-foreground')}>{value ? formatDate(value) : 'DD/MM/YY'}</span>
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-3">
          <div className="flex items-center justify-between gap-1 mb-3">
            <Button type="button" variant="ghost" size="icon" aria-label="Previous month" disabled={!!min && previous < min.slice(0, 7)} onClick={() => setMonth(previous)}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex gap-1 min-w-0">
              <select aria-label="Calendar month" className="bg-background rounded-lg text-sm max-w-28" value={month.slice(5, 7)} onChange={event => selectMonth(`${month.slice(0, 4)}-${event.target.value}`)}>
                {Array.from({length: 12}, (_, index) => String(index + 1).padStart(2, '0')).map(number => <option key={number} value={number}>{monthName(`2000-${number}`).split(' ')[0]}</option>)}
              </select>
              <select aria-label="Calendar year" className="bg-background rounded-lg text-sm" value={currentYear} onChange={event => selectMonth(`${event.target.value}-${month.slice(5, 7)}`)}>
                {years.map(year => <option key={year}>{year}</option>)}
              </select>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Next month" disabled={!!max && next > max.slice(0, 7)} onClick={() => setMonth(next)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <p id={heading} className="sr-only">{label}, {monthName(month)}</p>
          <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground mb-1" aria-hidden="true">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div role="group" aria-labelledby={heading} className="grid grid-cols-7 gap-1">
            {days.map(date => <button type="button" key={date} aria-label={formatDate(date)} aria-pressed={value === date} disabled={!allowed(date)} data-calendar={heading} data-date={date} tabIndex={date === tabDate ? 0 : -1}
              onKeyDown={event => keyboard(event, date)} onClick={() => { onChange(date); setOpen(false) }}
              className={cn('h-9 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-25 disabled:cursor-not-allowed',
                allowed(date) && 'bg-primary/8 hover:bg-primary/20', date.slice(0, 7) !== month && 'text-muted-foreground', value === date && 'bg-primary text-primary-foreground hover:bg-primary/90')}>
              {Number(date.slice(8, 10))}
            </button>)}
          </div>
          {min && max && <p className="mt-3 text-[11px] text-muted-foreground">Highlighted range: {formatDate(min)}–{formatDate(max)}</p>}
        </PopoverContent>
      </Popover>
    </div>
  )
}
