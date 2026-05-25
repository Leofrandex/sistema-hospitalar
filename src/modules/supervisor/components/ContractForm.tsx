import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addMonths } from 'date-fns'
import { StepWizard } from '@/components/shared/StepWizard'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getEquipment } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { addContract, getContractByEquipmentId, getContracts } from '@/data/mock/contracts'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/format'

const schema = z.object({
  equipmentId:         z.string().min(1, 'Requerido'),
  contractNumber:      z.string().min(1, 'Requerido'),
  startDate:           z.string().min(1, 'Requerido'),
  durationMonths:      z.coerce.number().int().min(1).max(120),
  preventivosIncluded: z.coerce.number().int().min(0).max(48),
  pdfUrl:              z.string().optional(),
  pdfFileName:         z.string().optional(),
  notes:               z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { label: 'Cliente y equipo' },
  { label: 'Términos' },
  { label: 'Documento y confirmación' },
]

interface ContractFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function ContractForm({ onSuccess, onCancel: _onCancel }: ContractFormProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)

  const nextNumber = useMemo(() => {
    const year = new Date().getFullYear()
    const count = getContracts().filter(c => c.contractNumber.includes(`HV-${year}`)).length + 1
    return `HV-${year}-${String(count).padStart(3, '0')}`
  }, [])

  const { control, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractNumber: nextNumber,
      startDate: new Date().toISOString().slice(0, 10),
      durationMonths: 12,
      preventivosIncluded: 2,
    },
  })

  const allEquipment = getEquipment()
  const availableEquipment = useMemo(
    () => allEquipment.filter(eq => eq.clientId && !getContractByEquipmentId(eq.id)),
    [allEquipment],
  )

  const watchedEquipmentId = watch('equipmentId')
  const watchedStartDate = watch('startDate')
  const watchedDuration = watch('durationMonths')
  const watchedPreventivos = watch('preventivosIncluded')

  const selectedEquip = allEquipment.find(e => e.id === watchedEquipmentId)
  const selectedClient = selectedEquip?.clientId ? getClientById(selectedEquip.clientId) : undefined
  const projectedEnd = watchedStartDate && watchedDuration
    ? addMonths(new Date(watchedStartDate), Number(watchedDuration))
    : null
  const intervalMonths = watchedPreventivos > 0 && watchedDuration > 0
    ? watchedDuration / watchedPreventivos
    : null

  async function handleNext() {
    const fields: (keyof FormData)[][] = [
      ['equipmentId', 'contractNumber'],
      ['startDate', 'durationMonths', 'preventivosIncluded'],
      [],
    ]
    const valid = await trigger(fields[currentStep])
    if (valid) setCurrentStep(s => s + 1)
  }

  function onSubmit(data: FormData) {
    if (!user || !selectedEquip || !selectedClient) return
    addContract({
      contractNumber: data.contractNumber,
      clientId: selectedClient.id,
      equipmentId: data.equipmentId,
      startDate: new Date(data.startDate),
      durationMonths: Number(data.durationMonths),
      preventivosIncluded: Number(data.preventivosIncluded),
      pdfUrl: data.pdfUrl,
      pdfFileName: data.pdfFileName,
      notes: data.notes,
      status: 'activo',
      createdBy: user.id,
      tipo: 'renovacion',
      origen: 'manual',
    })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepWizard
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => setCurrentStep(s => Math.max(0, s - 1))}
        onComplete={handleSubmit(onSubmit)}
        completeLabel="Crear contrato"
      >
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Número de contrato</Label>
              <Controller
                control={control}
                name="contractNumber"
                render={({ field }) => <Input {...field} placeholder="HV-2026-001" />}
              />
              {errors.contractNumber && (
                <p className="text-xs text-destructive">{errors.contractNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Equipo a cubrir</Label>
              <Controller
                control={control}
                name="equipmentId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEquipment.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          No hay equipos sin contrato disponibles.
                        </div>
                      )}
                      {availableEquipment.map(eq => {
                        const client = eq.clientId ? getClientById(eq.clientId) : null
                        return (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.brand} {eq.model} · {eq.serialNumber}
                            {client ? ` — ${client.name}` : ''}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.equipmentId && (
                <p className="text-xs text-destructive">{errors.equipmentId.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                El cliente se deriva del equipo seleccionado. Un equipo solo puede tener un contrato activo.
              </p>
            </div>

            {selectedEquip && selectedClient && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <p><strong>Cliente:</strong> {selectedClient.name}</p>
                <p><strong>Equipo:</strong> {selectedEquip.brand} {selectedEquip.model}</p>
                <p><strong>S/N:</strong> {selectedEquip.serialNumber}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha de inicio</Label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Duración (meses)</Label>
                <Controller
                  control={control}
                  name="durationMonths"
                  render={({ field }) => (
                    <Input type="number" min={1} max={120} {...field} />
                  )}
                />
                {errors.durationMonths && (
                  <p className="text-xs text-destructive">{errors.durationMonths.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Preventivos incluidos</Label>
              <Controller
                control={control}
                name="preventivosIncluded"
                render={({ field }) => (
                  <Input type="number" min={0} max={48} {...field} />
                )}
              />
              {errors.preventivosIncluded && (
                <p className="text-xs text-destructive">{errors.preventivosIncluded.message}</p>
              )}
            </div>

            {projectedEnd && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <p><strong>Vence el:</strong> {formatDate(projectedEnd)}</p>
                {intervalMonths !== null && watchedPreventivos > 0 && (
                  <p className="text-muted-foreground">
                    Un preventivo cada <strong>{intervalMonths.toFixed(1)} meses</strong> (a partir de inicio).
                  </p>
                )}
                {watchedPreventivos === 0 && (
                  <p className="text-muted-foreground">
                    Contrato sin preventivos incluidos — no se generarán alertas automáticas.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Documento del contrato (PDF)</Label>
              <Controller
                control={control}
                name="pdfUrl"
                render={({ field }) => (
                  <FileDropzone
                    label="Subir contrato firmado"
                    accept=".pdf"
                    value={field.value}
                    onChange={url => {
                      field.onChange(url)
                    }}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. El archivo se almacena en memoria hasta la migración a Supabase Storage.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Condiciones especiales, contactos, etc."
                  />
                )}
              />
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
              <p className="font-medium">Resumen</p>
              <p><strong>Cliente:</strong> {selectedClient?.name ?? '—'}</p>
              <p><strong>Equipo:</strong> {selectedEquip ? `${selectedEquip.brand} ${selectedEquip.model}` : '—'}</p>
              <p>
                <strong>Vigencia:</strong>{' '}
                {watchedStartDate ? formatDate(new Date(watchedStartDate)) : '—'}
                {' → '}
                {projectedEnd ? formatDate(projectedEnd) : '—'}
              </p>
              <p>
                <strong>Preventivos:</strong> {watchedPreventivos} en {watchedDuration} meses
              </p>
              {watch('pdfUrl') && (
                <p className="text-muted-foreground">Documento adjunto</p>
              )}
            </div>
          </div>
        )}
      </StepWizard>
    </form>
  )
}
