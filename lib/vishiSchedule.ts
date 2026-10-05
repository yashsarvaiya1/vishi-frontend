import type { VishiFrequency } from '@/models/vishi'

export function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getCycleEnd(start: string, frequency: VishiFrequency): string {
  if (!start) return ''
  if (frequency === 'weekly') return shiftDate(start, 7)
  if (frequency === 'half_monthly') return shiftDate(start, 14)
  const [year, month, day] = start.split('-').map(Number)
  const months = frequency === 'monthly' ? 1 : frequency === 'halfyear' ? 6 : 12
  const first = new Date(Date.UTC(year, month - 1 + months, 1))
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  first.setUTCDate(Math.min(day, last))
  return first.toISOString().slice(0, 10)
}

export function getVishiScheduleError(frequency: VishiFrequency, draw: string, collection: string, release: string, start: string): string | null {
  if (!start || !draw || !collection || !release) return 'Select the start, draw, collection and release dates.'
  const end = getCycleEnd(start, frequency)
  if ([draw, collection, release].some(date => date < start || date >= end)) {
    return 'All schedule dates must be within the highlighted cycle range.'
  }
  if (release <= draw || release <= collection) return 'Release date must be after both draw and collection dates.'
  return null
}
