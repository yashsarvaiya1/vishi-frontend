// lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function formatCurrency(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === '') return '₹0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

/** Format a date as DD/MM/YY; timestamps use the app's India timezone. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year.slice(-2)}`
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'Asia/Kolkata',
  }).format(date)
}

/**
 * Formats a frequency key to readable label.
 * "half_monthly" → "Half Monthly"
 */
export function formatFrequency(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
