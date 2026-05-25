import { useState } from 'react'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getPartRequestsByOrderId, addPartRequest, updatePartRequest } from '@/data/mock/part-requests'
import { formatDate } from '@/lib/format'
import type { PartRequest, PartRequestStatus } from '@/types/part-request'
import type { ServiceOrderStatus } from '@/types/service-order'

const STATUS_LABELS: Record<PartRequestStatus, string> = {
  'solicitado':  'Solicitado',
  'en-tramite':  'En trámite',
  'recibido':    'Recibido',
  'cancelado':   'Cancelado',
}

const STATUS_VARIANT: Record<PartRequestStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  'solicitado':  'secondary',
  'en-tramite':  'default',
  'recibido':    'outline',
  'cancelado':   'destructive',
}

interface PartRequestPanelProps {
  serviceOrderId: string
  orderStatus: ServiceOrderStatus
  isCoordinadora: boolean
  onOrderStatusChange: (status: ServiceOrderStatus) => void
}

export function PartRequestPanel({
  serviceOrderId,
  orderStatus,
  isCoordinadora,
  onOrderStatusChange,
}: PartRequestPanelProps) {
  const [requests, setRequests] = useState<PartRequest[]>(() => getPartRequestsByOrderId(serviceOrderId))
  const [showForm, setShowForm] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [newNotes, setNewNotes] = useState('')

  function refresh() {
    setRequests([...getPartRequestsByOrderId(serviceOrderId)])
  }

  function handleCreate() {
    if (!newDescription.trim()) return
    addPartRequest({
      serviceOrderId,
      description: newDescription.trim(),
      status: 'solicitado',
      requestedAt: new Date(),
      notes: newNotes.trim() || undefined,
    })
    setNewDescription('')
    setNewNotes('')
    setShowForm(false)
    refresh()
  }

  function handleStatusChange(id: string, status: PartRequestStatus) {
    const updates: Partial<PartRequest> = { status }
    if (status === 'recibido') updates.resolvedAt = new Date()
    updatePartRequest(id, updates)
    refresh()

    if (status === 'recibido' && orderStatus === 'en-espera-repuestos') {
      const updated = getPartRequestsByOrderId(serviceOrderId)
      const allDone = updated.every(r => r.status === 'recibido' || r.status === 'cancelado')
      if (allDone) onOrderStatusChange('en-progreso')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" />
          Repuestos ({requests.length})
        </p>
        {isCoordinadora && !showForm && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Solicitar
          </Button>
        )}
      </div>

      {requests.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Sin solicitudes de repuesto</p>
      )}

      {requests.map(req => (
        <div key={req.id} className="rounded-md border p-3 space-y-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{req.description}</p>
            <Badge variant={STATUS_VARIANT[req.status]} className="shrink-0 text-xs">
              {STATUS_LABELS[req.status]}
            </Badge>
          </div>
          {req.notes && <p className="text-xs text-muted-foreground">{req.notes}</p>}
          <p className="text-xs text-muted-foreground">Solicitado {formatDate(req.requestedAt)}</p>
          {req.resolvedAt && (
            <p className="text-xs text-muted-foreground">Recibido {formatDate(req.resolvedAt)}</p>
          )}
          {isCoordinadora && req.status !== 'recibido' && req.status !== 'cancelado' && (
            <Select
              value={req.status}
              onValueChange={v => handleStatusChange(req.id, v as PartRequestStatus)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solicitado">Solicitado</SelectItem>
                <SelectItem value="en-tramite">En trámite</SelectItem>
                <SelectItem value="recibido">Recibido ✓</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      ))}

      {showForm && (
        <div className="rounded-md border p-3 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Descripción del repuesto</Label>
            <Textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Ej: Sensor de presión ref. SP-440"
              rows={2}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notas (opcional)</Label>
            <Textarea
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="Proveedor, urgencia, referencia..."
              rows={2}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!newDescription.trim()}>
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setNewDescription(''); setNewNotes('') }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
