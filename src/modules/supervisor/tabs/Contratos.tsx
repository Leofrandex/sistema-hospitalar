import { useMemo, useState } from 'react'
import { FileText, Plus, FileCheck, AlertTriangle, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { KpiCard } from '@/components/shared/KpiCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getContracts } from '@/data/mock/contracts'
import { getClientById } from '@/data/mock/clients'
import { getEquipmentById } from '@/data/mock/equipment'
import { formatDate, daysUntil } from '@/lib/format'
import { ContractForm } from '../components/ContractForm'
import type { ContractStatus } from '@/types/contract'

type Filter = 'todos' | ContractStatus

const FILTER_LABELS: Record<Filter, string> = {
  todos: 'Todos',
  activo: 'Activos',
  vencido: 'Vencidos',
  cancelado: 'Cancelados',
}

function StatusBadge({ status }: { status: ContractStatus }) {
  if (status === 'activo') {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
        Activo
      </Badge>
    )
  }
  if (status === 'vencido') return <Badge variant="destructive">Vencido</Badge>
  return <Badge variant="secondary">Cancelado</Badge>
}

export default function Contratos() {
  const [filter, setFilter] = useState<Filter>('todos')
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const contracts = useMemo(() => {
    return [...getContracts()].sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const filtered = useMemo(
    () => (filter === 'todos' ? contracts : contracts.filter(c => c.status === filter)),
    [contracts, filter],
  )

  const activos = contracts.filter(c => c.status === 'activo')
  const proximosVencer = activos.filter(c => {
    const days = daysUntil(c.endDate)
    return days >= 0 && days <= 60
  })
  const vencidos = contracts.filter(c => c.status === 'vencido')

  function handleCreated() {
    setShowForm(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Contratos"
        description="Cobertura activa y términos de mantenimiento por equipo"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar contrato
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Contratos activos"
          value={activos.length}
          subtitle="Cobertura vigente"
          icon={FileCheck}
          variant="success"
        />
        <KpiCard
          title="Próximos a vencer"
          value={proximosVencer.length}
          subtitle="≤ 60 días para renovar"
          icon={Clock}
          variant={proximosVencer.length > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Vencidos"
          value={vencidos.length}
          subtitle="Sin cobertura"
          icon={AlertTriangle}
          variant={vencidos.length > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={v => setFilter(v as Filter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(FILTER_LABELS) as Filter[]).map(k => (
              <SelectItem key={k} value={k}>
                {FILTER_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {filtered.length} contrato{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={filter === 'todos' ? 'Sin contratos registrados' : 'Sin contratos en este estado'}
          description="Cuando agregues un contrato aparecerá aquí."
        />
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contrato</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Equipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vigencia</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Preventivos</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => {
                const client = getClientById(c.clientId)
                const equipment = getEquipmentById(c.equipmentId)
                const remaining = daysUntil(c.endDate)
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.contractNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[14rem]">
                      {client?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {equipment ? `${equipment.brand} ${equipment.model}` : '—'}
                      {equipment && (
                        <div className="text-xs text-muted-foreground/80">
                          {equipment.serialNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{formatDate(c.startDate)}</div>
                      <div className="text-xs">
                        → {formatDate(c.endDate)}
                        {c.status === 'activo' && remaining >= 0 && (
                          <span className="ml-1 text-foreground">({remaining}d)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {c.preventivosIncluded}
                      <div className="text-xs text-muted-foreground font-normal">
                        en {c.durationMonths}m
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      {c.pdfUrl ? (
                        <a
                          href={c.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs hover:underline"
                        >
                          Abrir PDF
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo contrato</DialogTitle>
          </DialogHeader>
          <ContractForm
            onSuccess={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
