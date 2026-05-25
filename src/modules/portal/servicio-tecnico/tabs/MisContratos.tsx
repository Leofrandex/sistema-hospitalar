import { FileText, Download } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { getContractsForClient } from '@/lib/client-scope'
import { getEquipmentById } from '@/data/mock/equipment'

export default function MisContratos() {
  const { user } = useAuth()
  const clientId = user?.clientId
  if (!clientId) return null

  const contracts = getContractsForClient(clientId)

  if (contracts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Sin contratos vigentes"
        description="Cuando tengas un contrato de mantenimiento activo, aparecerá aquí."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis contratos"
        description="Contratos de mantenimiento de tus equipos"
        icon={FileText}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map(c => {
          const equipment = getEquipmentById(c.equipmentId)
          return (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="min-w-0">
                  <CardTitle className="text-base">{c.contractNumber}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {equipment ? `${equipment.brand} ${equipment.model}` : 'Equipo desconocido'}
                  </p>
                </div>
                <Badge variant={c.status === 'activo' ? 'default' : 'secondary'} className="capitalize">{c.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Inicio</span><span>{formatDate(c.startDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fin</span><span>{formatDate(c.endDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Preventivos incluidos</span><span>{c.preventivosIncluded}</span></div>
                {c.pdfUrl && (
                  <Button asChild variant="outline" size="sm" className="w-full mt-3">
                    <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" /> Ver contrato
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
