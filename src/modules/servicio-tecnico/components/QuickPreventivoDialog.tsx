import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getUsersByRole } from '@/data/mock/users'
import { getClientById } from '@/data/mock/clients'
import { getEquipment } from '@/data/mock/equipment'
import { addServiceOrder, getServiceOrders } from '@/data/mock/service-orders'
import { getSuggestedTechnician } from '@/lib/technician-suggestion'
import { useAuth } from '@/contexts/AuthContext'
import type { MaintenanceInfo } from '@/lib/maintenance'

interface QuickPreventivoDialogProps {
  info: MaintenanceInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function QuickPreventivoDialog({ info, open, onOpenChange, onCreated }: QuickPreventivoDialogProps) {
  const { user } = useAuth()
  const technicians = useMemo(() => getUsersByRole('tecnico'), [])

  const [assignedTo, setAssignedTo] = useState<string>('')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const equipment = info?.equipment ?? null
  const client = equipment?.clientId ? getClientById(equipment.clientId) : null
  const suggestion = useMemo(() => {
    if (!equipment) return null
    return getSuggestedTechnician(equipment.brand, getServiceOrders(), technicians, getEquipment())
  }, [equipment, technicians])

  useEffect(() => {
    setAssignedTo('')
    setNotes('')
    setScheduledDate(info?.nextDue ? format(info.nextDue, 'yyyy-MM-dd') : '')
  }, [info])

  function handleSubmit() {
    if (!equipment || !user) return
    addServiceOrder({
      type: 'preventivo',
      status: assignedTo ? 'asignada' : 'pendiente',
      equipmentId: equipment.id,
      clientId: equipment.clientId,
      country: client?.country ?? 've',
      assignedTo: assignedTo || undefined,
      createdBy: user.id,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      dueDate: info?.nextDue ?? undefined,
      notes: notes || undefined,
    })
    onCreated()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Orden Preventiva</DialogTitle>
        </DialogHeader>

        {equipment && (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">Preventivo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipo</span>
                <span className="font-medium">{equipment.brand} {equipment.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial</span>
                <span className="font-mono text-xs">{equipment.serialNumber}</span>
              </div>
              {client && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{client.name}</span>
                </div>
              )}
            </div>

            {suggestion && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
                <p className="text-xs font-medium text-primary flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Técnico sugerido
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-medium">{suggestion.technician.name}</span>
                    <span className="text-muted-foreground">
                      {' · '}{suggestion.orderCount} orden{suggestion.orderCount !== 1 ? 'es' : ''} completada{suggestion.orderCount !== 1 ? 's' : ''} con {equipment.brand}
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignedTo(suggestion.technician.id)}
                    disabled={assignedTo === suggestion.technician.id}
                  >
                    {assignedTo === suggestion.technician.id ? '✓ Asignado' : 'Usar este técnico'}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Técnico asignado</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue placeholder="Seleccionar técnico" /></SelectTrigger>
                <SelectContent>
                  {technicians.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha programada</Label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSubmit}>Crear orden</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
