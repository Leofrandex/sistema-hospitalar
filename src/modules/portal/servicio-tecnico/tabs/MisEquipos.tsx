import { Wrench } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, daysUntil } from '@/lib/format'
import { getEquipmentsForClient, getOrdersForClient } from '@/lib/client-scope'
import { getMaintenanceInfo } from '@/lib/maintenance'
import { getContractByEquipmentId } from '@/data/mock/contracts'

export default function MisEquipos() {
  const { user } = useAuth()
  const clientId = user?.clientId
  if (!clientId) return null

  const equipments = getEquipmentsForClient(clientId)
  const orders = getOrdersForClient(clientId)

  if (equipments.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Aún no hay equipos registrados"
        description="Cuando tengas equipos contratados con Hospitalar, aparecerán aquí."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis equipos"
        description="Equipos médicos bajo seguimiento de Hospitalar"
        icon={Wrench}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipments.map(eq => {
          const contract = getContractByEquipmentId(eq.id)
          const info = getMaintenanceInfo(eq, orders, contract)
          const days = info.nextDue ? daysUntil(info.nextDue) : null

          let pillVariant: 'default' | 'secondary' | 'destructive' = 'secondary'
          let pillText = 'Sin contrato'
          if (info.nextDue && days != null) {
            if (days < 0) {
              pillVariant = 'destructive'
              pillText = `Vencido hace ${Math.abs(days)} días`
            } else if (days <= 14) {
              pillVariant = 'default'
              pillText = `Próximo en ${days} días`
            } else {
              pillVariant = 'secondary'
              pillText = `En ${days} días`
            }
          }

          return (
            <Card key={eq.id}>
              <CardHeader>
                <CardTitle className="text-base">{eq.brand} {eq.model}</CardTitle>
                <p className="text-xs text-muted-foreground">Serie {eq.serialNumber}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Categoría</span>
                  <span className="capitalize">{eq.category}</span>
                </div>
                {eq.serviceArea && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Área</span>
                    <span>{eq.serviceArea}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2 items-center pt-2 border-t border-border">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Próximo preventivo</p>
                    <p className="text-sm font-medium">{info.nextDue ? formatDate(info.nextDue) : '—'}</p>
                  </div>
                  <Badge variant={pillVariant}>{pillText}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
