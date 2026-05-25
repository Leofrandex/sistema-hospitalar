import { DollarSign, AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentStatusBadge } from '@/components/shared/StatusBadge'
import { getPayments } from '@/data/mock/payments'
import { getClientById } from '@/data/mock/clients'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'
import { useNavigate } from 'react-router-dom'

export default function CobDashboard() {
  const payments = getPayments()
  const navigate = useNavigate()

  const mora = payments.filter(p => p.status === 'mora')
  const proximos = payments.filter(p => p.status === 'pendiente' && daysUntil(p.dueDate) <= 7 && daysUntil(p.dueDate) >= 0)
  const totalMora = mora.reduce((acc, p) => acc + p.amount, 0)
  const totalPendiente = payments.filter(p => p.status === 'pendiente').reduce((acc, p) => acc + p.amount, 0)

  const priorityList = [
    ...mora.map(p => ({ ...p, priority: 1 })),
    ...proximos.map(p => ({ ...p, priority: 2 })),
  ]
    .sort((a, b) => a.priority - b.priority || a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranzas" description="Seguimiento de pagos y cuotas de clientes" icon={DollarSign} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total por cobrar" value={formatCurrency(totalPendiente)} icon={DollarSign} variant="default" />
        <KpiCard title="En mora" value={mora.length} subtitle={formatCurrency(totalMora)} icon={AlertTriangle} variant={mora.length > 0 ? 'danger' : 'success'} />
        <KpiCard title="Vencen esta semana" value={proximos.length} icon={Clock} variant={proximos.length > 0 ? 'warning' : 'default'} />
        <KpiCard title="Clientes activos" value={new Set(payments.filter(p => p.status !== 'pagado').map(p => p.clientId)).size} icon={TrendingDown} variant="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prioridades de cobro</CardTitle>
        </CardHeader>
        <CardContent>
          {priorityList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin cobros urgentes. ¡Todo al día!</p>
          ) : (
            <div className="space-y-3">
              {priorityList.map(p => {
                const client = getClientById(p.clientId)
                const days = daysUntil(p.dueDate)
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate('/modulos/cobranzas/pagos')}
                    className="w-full flex items-center justify-between gap-4 py-2 border-b last:border-0 hover:bg-muted/40 rounded px-2 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        Cuota {p.installmentNumber}/{p.totalInstallments} · Vence: {formatDate(p.dueDate)}
                        {days < 0 && <span className="text-destructive ml-1">({Math.abs(days)}d vencida)</span>}
                        {days >= 0 && days <= 7 && <span className="text-warning ml-1">({days}d)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">{formatCurrency(p.amount)}</span>
                      <PaymentStatusBadge status={p.status} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
