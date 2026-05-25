import { Truck, FileX, CheckCircle, Package } from 'lucide-react'
import { isThisMonth } from 'date-fns'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeliveryStatusBadge } from '@/components/shared/StatusBadge'
import { getSales } from '@/data/mock/sales'
import { getClientById } from '@/data/mock/clients'
import { getEquipmentById } from '@/data/mock/equipment'
import { formatDate, formatCurrency } from '@/lib/format'
import { useNavigate } from 'react-router-dom'

export default function LogDashboard() {
  const sales = getSales()
  const navigate = useNavigate()

  const pendientes = sales.filter(s => s.deliveryStatus === 'por-entregar').length
  const enEntrega = sales.filter(s => s.deliveryStatus === 'en-entrega').length
  const docsIncompletos = sales.filter(s => !s.crmDataComplete && s.deliveryStatus !== 'entregado').length
  const entregadosMes = sales.filter(s => s.deliveryStatus === 'entregado' && isThisMonth(s.createdAt)).length

  const pending = sales.filter(s => s.deliveryStatus !== 'entregado')

  return (
    <div className="space-y-6">
      <PageHeader title="Logística" description="Resumen de ventas y entregas" icon={Package} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Por entregar" value={pendientes} icon={Truck} variant={pendientes > 3 ? 'warning' : 'default'} />
        <KpiCard title="En entrega" value={enEntrega} icon={Truck} variant="default" />
        <KpiCard title="Documentación incompleta" value={docsIncompletos} icon={FileX} variant={docsIncompletos > 0 ? 'danger' : 'success'} />
        <KpiCard title="Entregados este mes" value={entregadosMes} icon={CheckCircle} variant="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ventas activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pending.slice(0, 8).map(s => {
              const client = getClientById(s.clientId)
              const eq = getEquipmentById(s.equipmentId)
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/modulos/logistica/ventas/${s.id}`)}
                  className="w-full flex items-center justify-between gap-4 py-2 border-b last:border-0 hover:bg-muted/40 rounded px-2 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{eq?.model} · {formatCurrency(s.price, s.currency)} · {formatDate(s.deliveryDate)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!s.crmDataComplete && (
                      <span className="text-xs text-destructive font-medium">Docs. incompletos</span>
                    )}
                    <DeliveryStatusBadge status={s.deliveryStatus} />
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
