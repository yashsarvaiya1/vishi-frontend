import type { VishiFrequency } from '@/models/vishi'

export function getVishiScheduleError(frequency: VishiFrequency, draw: number, collection: number, release: number, startDate: string): string | null {
  const maximum = frequency === 'weekly' ? 7 : frequency === 'half_monthly' ? 14 : 28
  if ([draw, collection, release].some((day) => !Number.isInteger(day) || day < 1 || day > maximum)) {
    return `Days must be whole numbers between 1 and ${maximum}.`
  }
  if (draw >= release) return 'Draw day must be before Release day.'
  if (collection >= release) return 'Collection day must be before Release day.'
  if (!startDate) return 'Start date is required.'
  if (!['weekly', 'half_monthly'].includes(frequency)) {
    const startDay = Number(startDate.slice(8, 10))
    if (startDay > Math.min(draw, collection, release)) {
      return 'Start date must not be after the first draw, collection or release date.'
    }
  }
  return null
}
