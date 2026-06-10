import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  // es-AR: $ 1.234,56 (y "US$ " si la moneda es USD) — el formato que espera
  // un usuario argentino; antes estaba en en-US
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(dateStr))
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}
