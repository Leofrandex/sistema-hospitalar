import { Wrench, Package, CreditCard, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getServiceOrders } from '@/data/mock/service-orders'
import { getSales } from '@/data/mock/sales'
import { getPayments } from '@/data/mock/payments'
import { getAggregatedMetrics } from '@/data/mock/metrics'
import { formatCurrency, daysUntil } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function Resumen() {
  const orders = getServiceOrders()
  const sales = getSales()
  const payments = getPayments()
  const metrics = getAggregatedMetrics()

  const enRevision = orders.filter(o => o.type === 'revision-fabrica' && o.status !== 'completada').length
  const porEntregar = sales.filter(s => s.deliveryStatus !== 'entregado').length
  const mora = payments.filter(p => p.status === 'mora').length
  const anomalias = orders.filter(o => o.outcome === 'anomalia').length
  const mantVencidos = orders.filter(o => o.type === 'preventivo' && o.dueDate && daysUntil(o.dueDate) < 0 && o.status !== 'completada').length
  const totalMora = payments.filter(p => p.status === 'mora').reduce((s, p) => s + p.amount, 0)

  const bottlenecks = metrics.filter(m => m.isBottleneck)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Supervisor"
        description="Visión global de todos los procesos de Hospitalar"
        icon={BarChart2}
      />

      {/* Alert if bottlenecks detected */}
      {bottlenecks.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="font-medium text-sm">
              {bottlenecks.length} cuello{bottlenecks.length > 1 ? 's' : ''} de botella detectado{bottlenecks.length > 1 ? 's' : ''}
            </p>
          </div>
          <ul className="space-y-1">
            {bottlenecks.map(b => (
              <li key={b.type} className="text-sm text-warning">
                · {b.label}: promedio 30d = <strong>{b.avg30Days}d</strong> vs histórico {b.avgHistorical}d
                ({b.deltaPercent > 0 ? '+' : ''}{b.deltaPercent}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Equipos en proceso (ST)"
          value={enRevision}
          icon={Wrench}
          variant={enRevision > 8 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Ventas por entregar"
          value={porEntregar}
          icon={Package}
          variant={porEntregar > 5 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Pagos en mora"
          value={mora}
          subtitle={formatCurrency(totalMora)}
          icon={CreditCard}
          variant={mora > 0 ? 'danger' : 'success'}
        />
        <KpiCard
          title="Anomalías en revisiones"
          value={anomalias}
          icon={AlertTriangle}
          variant={anomalias > 0 ? 'danger' : 'success'}
        />
        <KpiCard
          title="Mantenimientos vencidos"
          value={mantVencidos}
          icon={Wrench}
          variant={mantVencidos > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Metrics overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tiempos promedio de proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.map(m => (
              <div key={m.type} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm truncate">{m.label}</p>
                    {m.isBottleneck && (
                      <Badge variant="warning" className="text-xs shrink-0">Cuello de botella</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Histórico: <strong className="text-foreground">{m.avgHistorical}d</strong></span>
                    <span>Últimos 30d: <strong className={cn(m.isBottleneck ? 'text-warning' : 'text-foreground')}>{m.avg30Days}d</strong></span>
                  </div>
                </div>
                <div className={cn(
                  'text-sm font-semibold shrink-0',
                  m.deltaPercent > 20 ? 'text-destructive' : m.deltaPercent > 0 ? 'text-warning' : 'text-success',
                )}>
                  {m.deltaPercent > 0 ? '+' : ''}{m.deltaPercent}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
