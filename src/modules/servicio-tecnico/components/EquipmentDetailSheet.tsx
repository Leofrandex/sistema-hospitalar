import { useMemo } from 'react'
import { X, Activity, Wrench, Clock, Calendar, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/shared/KpiCard'
import { ServiceOrderTypeBadge, ServiceOrderStatusBadge } from '@/components/shared/StatusBadge'
import { getEquipmentById } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { getServiceOrders } from '@/data/mock/service-orders'
import { getFieldReportsByOrderId } from '@/data/mock/field-reports'
import { getUserById } from '@/data/mock/users'
import { getContractByEquipmentId } from '@/data/mock/contracts'
import { getNextMaintenanceDue } from '@/lib/maintenance'
import { formatDate } from '@/lib/format'
import type { ServiceOrder } from '@/types/service-order'
import type { FieldReport } from '@/types/field-report'

interface Props {
  equipmentId: string
  onClose: () => void
  excludeOrderId?: string
}

export function EquipmentDetailSheet({ equipmentId, onClose, excludeOrderId }: Props) {
  const equipment = getEquipmentById(equipmentId)
  const client = equipment?.clientId ? getClientById(equipment.clientId) : null

  const allOrders = useMemo(() => getServiceOrders(), [])
  const orders = useMemo(
    () =>
      allOrders
        .filter(o => o.equipmentId === equipmentId)
        .filter(o => !excludeOrderId || o.id !== excludeOrderId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [allOrders, equipmentId, excludeOrderId],
  )

  // Promedio de días entre correctivos completados consecutivos
  const avgDaysBetweenFaults = useMemo(() => {
    const timestamps = orders
      .filter(o => o.type === 'correctivo' && o.completedAt)
      .map(o => o.completedAt!.getTime())
      .sort((a, b) => a - b)
    if (timestamps.length < 2) return null
    const gaps: number[] = []
    for (let i = 1; i < timestamps.length; i++) {
      gaps.push((timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60 * 24))
    }
    return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
  }, [orders])

  // Última orden completada
  const lastCompleted = useMemo(() => {
    const done = orders.filter(o => o.completedAt)
    if (done.length === 0) return null
    return done.reduce((max, o) =>
      o.completedAt! > max.completedAt! ? o : max,
    )
  }, [orders])

  const reportsByOrder = useMemo(() => {
    const map = new Map<string, FieldReport[]>()
    for (const order of orders) {
      map.set(order.id, getFieldReportsByOrderId(order.id))
    }
    return map
  }, [orders])

  const contract = equipment ? getContractByEquipmentId(equipment.id) : undefined
  const nextDue = equipment ? getNextMaintenanceDue(equipment, allOrders, contract) : null

  if (!equipment) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-background border-l border-border shadow-xl overflow-y-auto p-6 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg">
              {equipment.brand} {equipment.model}
            </h2>
            <p className="text-sm text-muted-foreground">{equipment.serialNumber}</p>
            {client && (
              <p className="text-sm text-muted-foreground mt-0.5">{client.name}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {excludeOrderId && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Historial previo del equipo
          </p>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            title="Intervenciones"
            value={orders.length}
            subtitle="total histórico"
            icon={Activity}
          />
          <KpiCard
            title="Prom. entre fallas"
            value={avgDaysBetweenFaults !== null ? `${avgDaysBetweenFaults}d` : '—'}
            subtitle="días entre correctivos"
            icon={Wrench}
          />
          <KpiCard
            title="Última visita"
            value={lastCompleted ? formatDate(lastCompleted.completedAt!) : '—'}
            subtitle={lastCompleted ? lastCompleted.type : 'sin visitas completadas'}
            icon={Clock}
          />
          <KpiCard
            title="Próximo preventivo"
            value={nextDue ? formatDate(nextDue) : '—'}
            subtitle={
              contract
                ? `${contract.preventivosIncluded} preventivo(s) en ${contract.durationMonths}m`
                : 'sin contrato activo'
            }
            icon={Calendar}
          />
        </div>

        {/* Historial */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Historial de órdenes
          </h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {excludeOrderId
                ? 'Sin servicios previos para este equipo. Es la primera intervención registrada.'
                : 'Sin órdenes registradas.'}
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <OrderHistoryEntry
                  key={order.id}
                  order={order}
                  reports={reportsByOrder.get(order.id) ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderHistoryEntry({
  order,
  reports,
}: {
  order: ServiceOrder
  reports: FieldReport[]
}) {
  const tech = order.assignedTo ? getUserById(order.assignedTo) : null
  const visits = [...reports].sort((a, b) => a.visitNumber - b.visitNumber)
  const isCorrectivo = order.type === 'correctivo'
  const isRevisionFabrica = order.type === 'revision-fabrica'

  return (
    <div className="rounded-md border border-border p-3 text-sm space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <ServiceOrderTypeBadge type={order.type} />
        <ServiceOrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {tech && (
          <span>
            Técnico: <span className="text-foreground">{tech.name}</span>
          </span>
        )}
        {order.scheduledDate && (
          <span>
            Programada:{' '}
            <span className="text-foreground">{formatDate(order.scheduledDate)}</span>
          </span>
        )}
        {order.completedAt && (
          <span>
            Cierre:{' '}
            <span className="text-foreground">{formatDate(order.completedAt)}</span>
          </span>
        )}
        <span>
          Creada:{' '}
          <span className="text-foreground">{formatDate(order.createdAt)}</span>
        </span>
      </div>

      {order.notes && (
        <p className="text-xs italic text-muted-foreground border-t pt-2">
          Notas creación: {order.notes}
        </p>
      )}

      {isRevisionFabrica && order.outcome && (
        <p className="text-xs border-t pt-2">
          Resultado: <span className="font-medium">{order.outcome}</span>
          {order.anomalyDescription && (
            <span className="text-muted-foreground"> — {order.anomalyDescription}</span>
          )}
        </p>
      )}

      {visits.length > 0 ? (
        <div className="space-y-2 border-t pt-2">
          {visits.map(visit => (
            <div key={visit.id} className="space-y-1">
              <p className="text-xs font-medium">
                Visita #{visit.visitNumber}
                <span className="text-muted-foreground font-normal">
                  {' '}— {formatDate(visit.startedAt)}
                </span>
              </p>
              {visit.notes && (
                <p className="text-xs text-muted-foreground pl-3">
                  Notas: <span className="text-foreground">{visit.notes}</span>
                </p>
              )}
              {isCorrectivo && visit.faultChecklist && visit.faultChecklist.length > 0 && (
                <p className="text-xs text-muted-foreground pl-3">
                  Síntomas:{' '}
                  <span className="text-foreground">{visit.faultChecklist.join(' · ')}</span>
                </p>
              )}
              {isCorrectivo && visit.faultDescription && (
                <p className="text-xs text-muted-foreground pl-3">
                  Diagnóstico:{' '}
                  <span className="text-foreground">{visit.faultDescription}</span>
                </p>
              )}
              {visit.requiresPartsDescription && (
                <p className="text-xs text-muted-foreground pl-3">
                  Repuestos:{' '}
                  <span className="text-foreground">{visit.requiresPartsDescription}</span>
                </p>
              )}
              {visit.photos.length > 0 && (
                <p className="text-xs text-muted-foreground pl-3 flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {visit.photos.length} foto{visit.photos.length === 1 ? '' : 's'}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic border-t pt-2">
          Sin visitas ejecutadas
        </p>
      )}
    </div>
  )
}
