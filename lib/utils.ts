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

/**
 * Formats an ISO date string or Date to "15 Jan 2026".
 * Returns "—" for null/undefined/invalid.
 */
export function formatDate(
  value: string | Date | null | undefined
): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }).format(d)
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
