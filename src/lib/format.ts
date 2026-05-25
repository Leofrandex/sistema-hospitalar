import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ServiceOrderType } from '@/types/service-order'

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: es })
}

export function formatDayLabel(date: Date): string {
  return format(date, 'EEE d', { locale: es })
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return differenceInDays(d, new Date())
}

export function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return differenceInDays(new Date(), d)
}

export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return isPast(d)
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const ORDER_TYPE_LABEL: Record<ServiceOrderType, string> = {
  'revision-fabrica': 'Revisión de fábrica',
  instalacion: 'Instalación',
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
  predictivo: 'Predictivo',
}
