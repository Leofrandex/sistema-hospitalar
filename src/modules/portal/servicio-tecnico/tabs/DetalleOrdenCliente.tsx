import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ServiceOrderStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/format'
import { getOrderForClient, getFieldReportsForOrder } from '@/lib/client-scope'
import { getEquipmentById } from '@/data/mock/equipment'
import { getUserById } from '@/data/mock/users'
import { OrderStatusTimeline } from '../components/OrderStatusTimeline'

export default function DetalleOrdenCliente() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const clientId = user?.clientId

  if (!clientId || !id) return null

  const order = getOrderForClient(id, clientId)

  if (!order) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Orden no encontrada"
        description="No pudimos encontrar esta orden. Es posible que haya sido eliminada o no tengas acceso a ella."
        action={
          <Button asChild variant="outline">
            <Link to=".."><ArrowLeft className="h-4 w-4" /> Volver a mis órdenes</Link>
          </Button>
        }
      />
    )
  }

  const equipment = getEquipmentById(order.equipmentId)
  const technician = order.assignedTo ? getUserById(order.assignedTo) : null
  const visits = getFieldReportsForOrder(id, clientId).filter(fr => fr.status === 'completado')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to=".."><ArrowLeft className="h-4 w-4" /> Volver</Link>
        </Button>
        <h1 className="text-2xl font-semibold">{order.id}</h1>
        <ServiceOrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de la orden</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <OrderStatusTimeline status={order.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Detalles</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Tipo" value={<span className="capitalize">{order.type}</span>} />
            <Row label="Creada" value={formatDate(order.createdAt)} />
            {order.scheduledDate && <Row label="Programada" value={formatDate(order.scheduledDate)} />}
            {order.completedAt && <Row label="Completada" value={formatDate(order.completedAt)} />}
            <Row label="Técnico" value={technician?.name ?? 'Por asignar'} />
            {order.notes && <Row label="Notas" value={order.notes} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Equipo</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {equipment ? (
              <>
                <Row label="Marca / Modelo" value={`${equipment.brand} ${equipment.model}`} />
                <Row label="Serie" value={equipment.serialNumber} />
                <Row label="Categoría" value={<span className="capitalize">{equipment.category}</span>} />
                {equipment.serviceArea && <Row label="Área" value={equipment.serviceArea} />}
              </>
            ) : (
              <p className="text-muted-foreground">Equipo no disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitas realizadas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">Aún no hay visitas completadas en esta orden.</p>
          ) : (
            <ul className="divide-y divide-border">
              {visits.map(v => {
                const tech = v.technicianId ? getUserById(v.technicianId) : null
                return (
                  <li key={v.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Visita del {formatDate(v.completedAt ?? v.startedAt)}</p>
                      <span className="text-xs text-muted-foreground">{tech?.name ?? 'Técnico'}</span>
                    </div>
                    {v.workPerformed && (
                      <p className="text-sm text-muted-foreground">{v.workPerformed}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  )
}
