import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star } from 'lucide-react'
import { StepWizard } from '@/components/shared/StepWizard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getEquipment } from '@/data/mock/equipment'
import { getClients } from '@/data/mock/clients'
import { getUsersByRole } from '@/data/mock/users'
import { addServiceOrder, getServiceOrders } from '@/data/mock/service-orders'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/format'
import { getSuggestedTechnician } from '@/lib/technician-suggestion'
import type { ServiceOrderType } from '@/types/service-order'

const schema = z.object({
  type:          z.enum(['revision-fabrica', 'instalacion', 'preventivo', 'correctivo', 'predictivo']),
  equipmentId:   z.string().min(1, 'Requerido'),
  clientId:      z.string().optional(),
  parentOrderId: z.string().optional(),
  assignedTo:    z.string().optional(),
  scheduledDate: z.string().optional(),
  notes:         z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { label: 'Tipo y equipo' },
  { label: 'Asignación' },
  { label: 'Confirmar' },
]

interface ServiceOrderFormProps {
  onSuccess: () => void
  onCancel: () => void
  defaultType?: ServiceOrderType
}

export function ServiceOrderForm({ onSuccess, onCancel, defaultType }: ServiceOrderFormProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const { control, handleSubmit, watch, trigger, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType ?? 'instalacion' },
  })

  const equipment = getEquipment()
  const clients = getClients()
  const technicians = getUsersByRole('tecnico')
  const allOrders = getServiceOrders()
  const preventivoOrders = allOrders.filter(
    o => o.type === 'preventivo' && (o.status === 'completada' || o.status === 'en-espera-repuestos'),
  )

  const watchedType = watch('type')
  const watchedEquipmentId = watch('equipmentId')
  const watchedClientId = watch('clientId')
  const watchedAssignedTo = watch('assignedTo')
  const watchedParentOrderId = watch('parentOrderId')

  const selectedEquip = equipment.find(e => e.id === watchedEquipmentId)
  const selectedClient = clients.find(c => c.id === watchedClientId)
  const suggestion = selectedEquip
    ? getSuggestedTechnician(selectedEquip.brand, allOrders, technicians, equipment)
    : null
  const selectedTech = technicians.find(t => t.id === watchedAssignedTo)
  const selectedParent = preventivoOrders.find(o => o.id === watchedParentOrderId)

  async function handleNext() {
    const fields: (keyof FormData)[][] = [
      ['type', 'equipmentId'],
      [],
      [],
    ]
    const valid = await trigger(fields[currentStep])
    if (valid) setCurrentStep(s => s + 1)
  }

  function onSubmit(data: FormData) {
    addServiceOrder({
      type: data.type as ServiceOrderType,
      status: data.assignedTo ? 'asignada' : 'pendiente',
      equipmentId: data.equipmentId,
      clientId: data.clientId || undefined,
      country: selectedClient?.country ?? 've',
      assignedTo: data.assignedTo || undefined,
      createdBy: user!.id,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      parentOrderId: data.parentOrderId || undefined,
      notes: data.notes,
    })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepWizard
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => setCurrentStep(s => s - 1)}
        onComplete={handleSubmit(onSubmit)}
        completeLabel="Crear orden"
      >
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de orden</Label>
              <Controller name="type" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!!defaultType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revision-fabrica">Revisión de fábrica</SelectItem>
                    <SelectItem value="instalacion">Instalación</SelectItem>
                    <SelectItem value="preventivo">Mantenimiento preventivo</SelectItem>
                    <SelectItem value="correctivo">Mantenimiento correctivo</SelectItem>
                    <SelectItem value="predictivo">Mantenimiento predictivo</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="space-y-2">
              <Label>Equipo</Label>
              <Controller name="equipmentId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.brand} {eq.model} — {eq.serialNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.equipmentId && <p className="text-xs text-destructive">{errors.equipmentId.message}</p>}
            </div>

            {watchedType !== 'revision-fabrica' && (
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Controller name="clientId" control={control} render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} — {c.city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            )}

            {watchedType === 'correctivo' && (
              <div className="space-y-2">
                <Label>Orden origen (opcional)</Label>
                <p className="text-xs text-muted-foreground">Preventivo del que se derivó esta falla</p>
                <Controller name="parentOrderId" control={control} render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar orden preventiva" /></SelectTrigger>
                    <SelectContent>
                      {preventivoOrders.map(o => {
                        const eq = equipment.find(e => e.id === o.equipmentId)
                        return (
                          <SelectItem key={o.id} value={o.id}>
                            {o.id} — {eq ? `${eq.brand} ${eq.model}` : o.equipmentId} ({formatDate(o.createdAt)})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
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
                      {' · '}{suggestion.orderCount} orden{suggestion.orderCount !== 1 ? 'es' : ''} completada{suggestion.orderCount !== 1 ? 's' : ''} con {selectedEquip!.brand}
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('assignedTo', suggestion.technician.id)}
                    disabled={watchedAssignedTo === suggestion.technician.id}
                  >
                    {watchedAssignedTo === suggestion.technician.id ? '✓ Asignado' : 'Usar este técnico'}
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Técnico asignado</Label>
              <Controller name="assignedTo" control={control} render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar técnico" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="space-y-2">
              <Label>Fecha programada</Label>
              <Controller name="scheduledDate" control={control} render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                />
              )} />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-md border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium capitalize">{watchedType?.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipo</span>
                <span className="font-medium">{selectedEquip ? `${selectedEquip.brand} ${selectedEquip.model}` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{selectedClient?.name ?? '—'}</span>
              </div>
              {watchedType === 'correctivo' && selectedParent && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orden origen</span>
                  <span className="font-medium">{selectedParent.id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Técnico</span>
                <span className="font-medium">{selectedTech?.name ?? 'Sin asignar'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{watchedType === 'correctivo' ? 'Descripción inicial de la falla' : 'Notas'}</Label>
              <Controller name="notes" control={control} render={({ field }) => (
                <Textarea {...field} placeholder="Observaciones adicionales..." rows={3} />
              )} />
            </div>
          </div>
        )}
      </StepWizard>
    </form>
  )
}
