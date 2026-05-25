import { Link } from 'react-router-dom'
import { ClipboardList, Calendar, Wrench, FileText, Plus, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { KpiCard } from '@/components/shared/KpiCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceOrderStatusBadge, ServiceOrderTypeBadge } from '@/components/shared/StatusBadge'
import { formatDate, daysUntil } from '@/lib/format'
import {
  getOrdersForClient,
  getEquipmentsForClient,
  getContractsForClient,
} from '@/lib/client-scope'
import { getMaintenanceInfo } from '@/lib/maintenance'
import { getContractByEquipmentId } from '@/data/mock/contracts'

export default function ClientDashboard() {
  const { user } = useAuth()
  const clientId = user?.clientId

  if (!clientId) return null

  const orders = getOrdersForClient(clientId)
  const equipments = getEquipmentsForClient(clientId)
  const contracts = getContractsForClient(clientId)

  const openOrders = orders.filter(o => o.status !== 'completada' && o.status !== 'cancelada')

  const nextDueDates = equipments
    .map(eq => {
      const contract = getContractByEquipmentId(eq.id)
      const info = getMaintenanceInfo(eq, orders, contract)
      return info.nextDue
    })
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime())

  const nextDue = nextDueDates[0]
  const nextDueDays = nextDue ? daysUntil(nextDue) : null

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {user?.name}</h1>
          <p className="text-sm text-muted-foreground">Aquí está el resumen de tu servicio técnico.</p>
        </div>
        <Button asChild>
          <Link to="../nueva-solicitud">
            <Plus className="h-4 w-4" />
            Solicitar nuevo servicio
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Órdenes abiertas"
          value={openOrders.length}
          subtitle="En curso o programadas"
          icon={ClipboardList}
        />
        <KpiCard
          title="Próximo preventivo"
          value={nextDue ? formatDate(nextDue) : '—'}
          subtitle={nextDueDays != null ? (nextDueDays >= 0 ? `En ${nextDueDays} días` : `Vencido hace ${Math.abs(nextDueDays)} días`) : 'Sin contratos activos'}
          icon={Calendar}
          variant={nextDueDays != null && nextDueDays < 0 ? 'danger' : nextDueDays != null && nextDueDays <= 14 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Mis equipos"
          value={equipments.length}
          subtitle="Equipos registrados"
          icon={Wrench}
        />
        <KpiCard
          title="Contratos activos"
          value={contracts.length}
          subtitle="Mantenimiento vigente"
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Órdenes recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">Aún no tienes órdenes registradas.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map(o => (
                <li key={o.id}>
                  <Link
                    to={`../ordenes/${o.id}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                    </div>
                    <ServiceOrderTypeBadge type={o.type} />
                    <ServiceOrderStatusBadge status={o.status} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
