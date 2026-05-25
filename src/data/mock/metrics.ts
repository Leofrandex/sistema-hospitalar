import { subDays } from 'date-fns'
import type { MetricEntry, AggregatedMetric } from '@/types/metric'

const NOW = new Date()

function rand(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

// Generate 180 days of historical metrics
function generateMetrics(): MetricEntry[] {
  const entries: MetricEntry[] = []
  let id = 1

  for (let daysAgo = 179; daysAgo >= 0; daysAgo--) {
    const date = subDays(NOW, daysAgo)
    // review-time: avg 3-8 days normally, sometimes spikes
    entries.push({ id: `m-${id++}`, type: 'review-time', valueDays: rand(2, 9), recordedAt: date, department: 'servicio-tecnico' })
    // factory-to-dispatch: avg 5-14 days
    entries.push({ id: `m-${id++}`, type: 'factory-to-dispatch', valueDays: rand(4, 16), recordedAt: date, department: 'servicio-tecnico' })
    // delivery-time: avg 4-10 days
    entries.push({ id: `m-${id++}`, type: 'delivery-time', valueDays: rand(3, 12), recordedAt: date, department: 'logistica' })
    // payment-delay: avg 2-15 days late
    entries.push({ id: `m-${id++}`, type: 'payment-delay', valueDays: rand(0, 18), recordedAt: date, department: 'cobranzas' })
  }

  // Add recent spikes to create bottleneck in delivery-time and payment-delay
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = subDays(NOW, daysAgo)
    entries.push({ id: `m-spike-dt-${daysAgo}`, type: 'delivery-time', valueDays: rand(14, 22), recordedAt: date, department: 'logistica' })
    entries.push({ id: `m-spike-pd-${daysAgo}`, type: 'payment-delay', valueDays: rand(12, 25), recordedAt: date, department: 'cobranzas' })
  }

  return entries
}

export const METRIC_ENTRIES: MetricEntry[] = generateMetrics()

function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

export function getAggregatedMetrics(): AggregatedMetric[] {
  const THRESHOLD = 0.20

  const types: Array<{ type: MetricEntry['type']; label: string }> = [
    { type: 'review-time', label: 'Revisión de equipo (llegada → revisado)' },
    { type: 'factory-to-dispatch', label: 'Fábrica → Despacho' },
    { type: 'delivery-time', label: 'Despacho → Entrega' },
    { type: 'payment-delay', label: 'Mora promedio de pagos' },
  ]

  const cutoff30 = subDays(NOW, 30)

  return types.map(({ type, label }) => {
    const all = METRIC_ENTRIES.filter(e => e.type === type)
    const last30 = all.filter(e => e.recordedAt >= cutoff30)
    const historical = all.filter(e => e.recordedAt < cutoff30)

    const avgHist = average(historical.map(e => e.valueDays))
    const avg30 = average(last30.map(e => e.valueDays))
    const delta = avg30 - avgHist
    const deltaPercent = avgHist > 0 ? Math.round((delta / avgHist) * 100) : 0

    return {
      type,
      label,
      avgHistorical: avgHist,
      avg30Days: avg30,
      delta,
      deltaPercent,
      isBottleneck: deltaPercent > THRESHOLD * 100,
    }
  })
}

export function getMetricsByType(type: MetricEntry['type']): MetricEntry[] {
  return METRIC_ENTRIES.filter(e => e.type === type)
}
