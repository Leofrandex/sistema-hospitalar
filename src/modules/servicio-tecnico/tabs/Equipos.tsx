import { useMemo, useState } from 'react'
import { Cpu } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getServiceOrders } from '@/data/mock/service-orders'
import { getEquipmentById } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { getContractByEquipmentId } from '@/data/mock/contracts'
import { getMaintenanceInfo, type MaintenanceStatus } from '@/lib/maintenance'
import { formatDate } from '@/lib/format'
import { EquipmentDetailSheet } from '../components/EquipmentDetailSheet'
import type { EquipmentCategory } from '@/types/equipment'

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  ultrasonido: 'Ultrasonido',
  'rayos-x': 'Rayos X',
  monitor: 'Monitor',
  desfibrilador: 'Desfibrilador',
  otros: 'Otros',
}

function MaintenanceBadge({ status }: { status: MaintenanceStatus }) {
  if (status === 'vencido')
    return <Badge variant="destructive">Vencido</Badge>
  if (status === 'proximo')
    return (
      <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
        Próximo
      </Badge>
    )
  if (status === 'ok')
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
        Al día
      </Badge>
    )
  return <Badge variant="secondary">Sin contrato</Badge>
}

export default function STEquipos() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const allOrders = useMemo(() => getServiceOrders(), [])

  const rows = useMemo(() => {
    const ids = Array.from(new Set(allOrders.map(o => o.equipmentId)))
    return ids
      .map(id => {
        const equipment = getEquipmentById(id)
        if (!equipment) return null
        const client = equipment.clientId
          ? getClientById(equipment.clientId)
          : null
        const info = getMaintenanceInfo(equipment, allOrders, getContractByEquipmentId(equipment.id))
        const equipOrders = allOrders.filter(o => o.equipmentId === id)
        const completedDates = equipOrders
          .filter(o => o.completedAt)
          .map(o => o.completedAt!)
        const lastIntervention =
          completedDates.length > 0
            ? completedDates.reduce((max, d) => (d > max ? d : max))
            : null
        return { equipment, client, info, orderCount: equipOrders.length, lastIntervention }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.orderCount - a.orderCount)
  }, [allOrders])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Cpu}
        title="Equipos"
        description="Historial y estado de mantenimiento por equipo"
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="Sin equipos registrados"
          description="Aún no hay órdenes de servicio vinculadas a ningún equipo."
        />
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Equipo
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Categoría
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Intervenciones
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Última intervención
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Próximo preventivo
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(row => (
                <tr
                  key={row.equipment.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedId(row.equipment.id)}
                >
                  <td className="px-4 py-3 font-medium">
                    {row.equipment.brand} {row.equipment.model}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {CATEGORY_LABELS[row.equipment.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.client?.name ?? 'En almacén'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {row.orderCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.lastIntervention ? formatDate(row.lastIntervention) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.info.nextDue ? formatDate(row.info.nextDue) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <MaintenanceBadge status={row.info.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <EquipmentDetailSheet
          equipmentId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
