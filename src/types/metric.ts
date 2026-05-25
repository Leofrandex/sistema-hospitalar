export type MetricType =
  | 'review-time'
  | 'delivery-time'
  | 'payment-delay'
  | 'factory-to-dispatch'

export interface MetricEntry {
  id: string
  type: MetricType
  valueDays: number
  recordedAt: Date
  department: string
}

export interface AggregatedMetric {
  type: MetricType
  label: string
  avgHistorical: number
  avg30Days: number
  delta: number
  deltaPercent: number
  isBottleneck: boolean
}
