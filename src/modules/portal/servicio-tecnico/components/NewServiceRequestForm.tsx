import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addServiceOrder } from '@/data/mock/service-orders'
import { getClientById } from '@/data/mock/clients'
import type { Equipment } from '@/types/equipment'
import type { ServiceOrderType } from '@/types/service-order'

type RequestType = Extract<ServiceOrderType, 'preventivo' | 'correctivo'>

interface Props {
  equipments: Equipment[]
  clientId: string
  userId: string
}

export function NewServiceRequestForm({ equipments, clientId, userId }: Props) {
  const navigate = useNavigate()
  const [equipmentId, setEquipmentId] = useState<string>('')
  const [type, setType] = useState<RequestType>('correctivo')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!equipmentId) {
      toast.error('Selecciona un equipo')
      return
    }
    if (!notes.trim()) {
      toast.error('Describe brevemente lo que necesitas')
      return
    }

    setSubmitting(true)
    const client = getClientById(clientId)
    const country = client?.country ?? 've'

    const newOrder = addServiceOrder({
      type,
      status: 'pendiente',
      equipmentId,
      clientId,
      country,
      createdBy: userId,
      notes: notes.trim(),
    })

    toast.success('Solicitud enviada', {
      description: `Tu orden ${newOrder.id} fue registrada. La coordinación la procesará pronto.`,
    })
    navigate(`../ordenes/${newOrder.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="equipment">Equipo</Label>
        <Select value={equipmentId} onValueChange={setEquipmentId}>
          <SelectTrigger id="equipment"><SelectValue placeholder="Selecciona un equipo" /></SelectTrigger>
          <SelectContent>
            {equipments.map(eq => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.brand} {eq.model} — Serie {eq.serialNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo de servicio</Label>
        <Select value={type} onValueChange={v => setType(v as RequestType)}>
          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="correctivo">Correctivo (algo no funciona)</SelectItem>
            <SelectItem value="preventivo">Preventivo (mantenimiento programado)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Descripción</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Describe el problema o el motivo de la solicitud"
          rows={5}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
