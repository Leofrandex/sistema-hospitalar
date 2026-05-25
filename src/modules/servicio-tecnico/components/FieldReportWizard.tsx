import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { StepWizard } from '@/components/shared/StepWizard'
import { SignaturePad } from '@/components/shared/SignaturePad'
import { PhotoUploader } from '@/components/shared/PhotoUploader'
import { GeoCapture } from '@/components/shared/GeoCapture'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { addFieldReport, getFieldReportsByOrderId } from '@/data/mock/field-reports'
import { addPartRequest } from '@/data/mock/part-requests'
import { updateServiceOrder, getServiceOrderById } from '@/data/mock/service-orders'
import { getClientById } from '@/data/mock/clients'
import { getEquipmentById, updateEquipment } from '@/data/mock/equipment'
import { useAuth } from '@/contexts/AuthContext'
import type { GeoPoint, PartUsed, ServiceTimes } from '@/types/field-report'

const ACCESSORIES = [
  'Maletín de herramientas',
  'Multímetro',
  'Calibrador',
  'Manual técnico',
  'Repuesto',
  'Herramienta de calibración',
]

const FAULT_SYMPTOMS = [
  'No enciende / No arranca',
  'Pantalla sin imagen o distorsionada',
  'Error de calibración',
  'Fuga de fluidos o gases',
  'Ruido mecánico anormal',
  'Sensor defectuoso',
  'Cable o conector dañado',
  'Error de software / firmware',
  'Sobrecalentamiento',
  'Batería o fuente de poder',
]

interface FieldReportWizardProps {
  serviceOrderId: string
  onSuccess: () => void
  onCancel: () => void
}

function toHHmm(d: Date | undefined): string {
  if (!d) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function FieldReportWizard({ serviceOrderId, onSuccess }: FieldReportWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)

  const order = getServiceOrderById(serviceOrderId)
  const client = order?.clientId ? getClientById(order.clientId) : undefined
  const equipment = order ? getEquipmentById(order.equipmentId) : undefined
  const isPhysicalSignature = client?.country === 'pa' && client?.isPublicSector === true
  const existingReports = getFieldReportsByOrderId(serviceOrderId)
  const visitNumber = existingReports.length + 1
  const isCorrectivo = order?.type === 'correctivo'

  const [geoCheckIn, setGeoCheckIn] = useState<GeoPoint | undefined>()
  const [startedAt] = useState(new Date())
  const [photos, setPhotos] = useState<string[]>([])
  const [accessories, setAccessories] = useState<string[]>([])
  const [techSig, setTechSig] = useState<string | undefined>()
  const [clientSig, setClientSig] = useState<string | undefined>()
  const [scannedDoc, setScannedDoc] = useState<string | undefined>()
  const [clientSignerName, setClientSignerName] = useState('')
  const [clientSignerCedula, setClientSignerCedula] = useState('')
  const [includeDirector, setIncludeDirector] = useState(false)
  const [directorSig, setDirectorSig] = useState<string | undefined>()
  const [directorScannedDoc, setDirectorScannedDoc] = useState<string | undefined>()
  const [directorSignerName, setDirectorSignerName] = useState('')
  const [directorSignerCedula, setDirectorSignerCedula] = useState('')
  const [geoCheckOut, setGeoCheckOut] = useState<GeoPoint | undefined>()
  const [notes, setNotes] = useState('')
  const [closeOrder, setCloseOrder] = useState(false)

  const [faultChecklist, setFaultChecklist] = useState<string[]>([])
  const [faultDescription, setFaultDescription] = useState('')
  const [requiresPartsDescription, setRequiresPartsDescription] = useState('')

  const [serviceArea, setServiceArea] = useState(equipment?.serviceArea ?? '')
  const [assetTag, setAssetTag] = useState(equipment?.assetTag ?? '')
  const [faultReported, setFaultReported] = useState(order?.notes ?? '')
  const [workPerformed, setWorkPerformed] = useState('')
  const [times, setTimes] = useState<ServiceTimes>({
    travelOut: { start: '', end: '' },
    wait: { start: '', end: '' },
    work: { start: '', end: '' },
    travelReturn: { start: '', end: '' },
    note: '',
  })
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([])

  const STEPS = isCorrectivo
    ? [
        { label: 'Check-in' },
        { label: 'Diagnóstico' },
        { label: 'Detalle' },
        { label: 'Fotos' },
        { label: 'Firmas' },
        { label: 'Cierre' },
      ]
    : [
        { label: 'Check-in' },
        { label: 'Detalle' },
        { label: 'Fotos' },
        { label: 'Firmas' },
        { label: 'Cierre' },
      ]

  const STEP_DIAG    = isCorrectivo ? 1 : -1
  const STEP_DETAIL  = isCorrectivo ? 2 : 1
  const STEP_PHOTOS  = isCorrectivo ? 3 : 2
  const STEP_SIGS    = isCorrectivo ? 4 : 3
  const STEP_CLOSE   = isCorrectivo ? 5 : 4

  function toggleFaultSymptom(symptom: string) {
    setFaultChecklist(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom],
    )
  }

  function toggleAccessory(name: string) {
    setAccessories(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name],
    )
  }

  function updatePhase(phase: keyof ServiceTimes, bound: 'start' | 'end', value: string) {
    setTimes(prev => {
      if (phase === 'note') return { ...prev, note: value }
      const current = (prev[phase] as { start?: string; end?: string } | undefined) ?? {}
      return { ...prev, [phase]: { ...current, [bound]: value } }
    })
  }

  function addPartRow() {
    setPartsUsed(prev => [...prev, { code: '', quantity: 1, description: '' }])
  }
  function updatePartRow(idx: number, patch: Partial<PartUsed>) {
    setPartsUsed(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }
  function removePartRow(idx: number) {
    setPartsUsed(prev => prev.filter((_, i) => i !== idx))
  }

  // Pre-fill work start when check-in is captured
  function handleGeoCheckIn(point: GeoPoint) {
    setGeoCheckIn(point)
    setTimes(prev => {
      if (prev.work?.start) return prev
      return { ...prev, work: { ...(prev.work ?? {}), start: toHHmm(new Date(point.timestamp)) } }
    })
  }

  function canProceed(): boolean {
    if (currentStep === 0) return !!geoCheckIn
    if (currentStep === STEP_DIAG) {
      return faultChecklist.length > 0 || faultDescription.trim().length > 0
    }
    if (currentStep === STEP_DETAIL) return workPerformed.trim().length > 0
    if (currentStep === STEP_PHOTOS) return photos.length > 0
    if (currentStep === STEP_SIGS) {
      const techOk = !!techSig
      const clientOk = (isPhysicalSignature ? !!scannedDoc : !!clientSig) && clientSignerName.trim().length > 0
      const directorOk = !includeDirector
        || (((isPhysicalSignature ? !!directorScannedDoc : !!directorSig)) && directorSignerName.trim().length > 0)
      return techOk && clientOk && directorOk
    }
    return true
  }

  function handleComplete() {
    if (equipment && (serviceArea !== (equipment.serviceArea ?? '') || assetTag !== (equipment.assetTag ?? ''))) {
      updateEquipment(equipment.id, {
        serviceArea: serviceArea.trim() || undefined,
        assetTag: assetTag.trim() || undefined,
      })
    }

    const cleanedParts = partsUsed
      .map(p => ({ ...p, code: p.code.trim(), description: p.description.trim() }))
      .filter(p => p.code !== '' || p.description !== '')

    addFieldReport({
      serviceOrderId,
      visitNumber,
      technicianId: user!.id,
      startedAt,
      completedAt: new Date(),
      photos,
      accessories,
      technicianSignature: techSig ?? '',
      clientSignatureMode: isPhysicalSignature ? 'physical-scanned' : 'digital',
      clientSignatureData: isPhysicalSignature ? scannedDoc : clientSig,
      clientSignerName: clientSignerName.trim() || undefined,
      clientSignerCedula: clientSignerCedula.trim() || undefined,
      directorSignatureMode: includeDirector
        ? (isPhysicalSignature ? 'physical-scanned' : 'digital')
        : undefined,
      directorSignatureData: includeDirector
        ? (isPhysicalSignature ? directorScannedDoc : directorSig)
        : undefined,
      directorSignerName: includeDirector ? directorSignerName.trim() || undefined : undefined,
      directorSignerCedula: includeDirector ? directorSignerCedula.trim() || undefined : undefined,
      geoCheckIn,
      geoCheckOut,
      notes,
      faultChecklist: isCorrectivo ? faultChecklist : undefined,
      faultDescription: isCorrectivo ? faultDescription : undefined,
      faultReported: faultReported.trim() || undefined,
      workPerformed: workPerformed.trim() || undefined,
      requiresPartsDescription: isCorrectivo ? requiresPartsDescription : undefined,
      partsUsed: cleanedParts.length > 0 ? cleanedParts : undefined,
      times,
      status: 'completado',
    })

    const needsParts = isCorrectivo && requiresPartsDescription.trim().length > 0
    if (needsParts) {
      addPartRequest({
        serviceOrderId,
        description: requiresPartsDescription.trim(),
        status: 'solicitado',
        requestedAt: new Date(),
      })
    }

    updateServiceOrder(serviceOrderId, {
      status: closeOrder ? 'completada' : 'en-espera-repuestos',
      completedAt: closeOrder ? new Date() : undefined,
      requiresParts: needsParts || undefined,
    })

    onSuccess()
  }

  return (
    <StepWizard
      steps={STEPS}
      currentStep={currentStep}
      onNext={() => setCurrentStep(s => s + 1)}
      onBack={() => setCurrentStep(s => s - 1)}
      onComplete={handleComplete}
      nextDisabled={!canProceed()}
      completeLabel="Enviar reporte"
    >
      {currentStep === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Visita #{visitNumber} — {new Date().toLocaleString('es')}</p>
          <GeoCapture
            label="Ubicación de llegada"
            value={geoCheckIn}
            onCapture={handleGeoCheckIn}
          />
          {!geoCheckIn && (
            <p className="text-xs text-muted-foreground">Debes capturar tu ubicación para continuar</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
            <div className="space-y-1.5">
              <Label>Servicio / Área</Label>
              <Input
                value={serviceArea}
                onChange={e => setServiceArea(e.target.value)}
                placeholder="UCI, Pediatría, Quirófano…"
              />
              <p className="text-xs text-muted-foreground">
                Dónde está físicamente el equipo en el hospital.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Activo (código interno)</Label>
              <Input
                value={assetTag}
                onChange={e => setAssetTag(e.target.value)}
                placeholder="Ej: ACT-1029"
              />
              <p className="text-xs text-muted-foreground">
                Etiqueta de activo del cliente, si la tiene.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStep === STEP_DIAG && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Síntomas observados</Label>
            <p className="text-xs text-muted-foreground">Selecciona todos los que apliquen</p>
            <div className="flex flex-wrap gap-2">
              {FAULT_SYMPTOMS.map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleFaultSymptom(symptom)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    faultChecklist.includes(symptom)
                      ? 'bg-destructive text-white border-destructive'
                      : 'border-border text-muted-foreground hover:border-destructive hover:text-destructive'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción detallada de la falla</Label>
            <Textarea
              value={faultDescription}
              onChange={e => setFaultDescription(e.target.value)}
              placeholder="Describe el comportamiento anormal, condiciones de reproducción, frecuencia..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Repuestos requeridos (opcional)</Label>
            <Textarea
              value={requiresPartsDescription}
              onChange={e => setRequiresPartsDescription(e.target.value)}
              placeholder="Ej: Sensor de presión ref. SP-440, cable de datos USB-B..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Si se indica, se creará automáticamente una solicitud de repuesto al enviar
            </p>
          </div>

          {faultChecklist.length === 0 && faultDescription.trim().length === 0 && (
            <p className="text-xs text-destructive">Selecciona al menos un síntoma o escribe una descripción para continuar</p>
          )}
        </div>
      )}

      {currentStep === STEP_DETAIL && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Falla reportada por el cliente</Label>
            <Textarea
              value={faultReported}
              onChange={e => setFaultReported(e.target.value)}
              placeholder="Lo que el cliente reportó antes de la visita."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Trabajo realizado *</Label>
            <Textarea
              value={workPerformed}
              onChange={e => setWorkPerformed(e.target.value)}
              placeholder="Describe el procedimiento ejecutado, pruebas, calibración, ajustes..."
              rows={4}
              required
            />
            {workPerformed.trim().length === 0 && (
              <p className="text-xs text-destructive">Requerido para continuar</p>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>Tiempo de trabajo</Label>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs items-center">
              <span className="font-medium text-muted-foreground"></span>
              <span className="font-medium text-muted-foreground w-24 text-center">Inicio</span>
              <span className="font-medium text-muted-foreground w-24 text-center">Fin</span>
              {([
                ['Traslado (Ida)', 'travelOut'],
                ['Espera', 'wait'],
                ['Trabajo', 'work'],
                ['Traslado (Regreso)', 'travelReturn'],
              ] as const).map(([label, key]) => (
                <PhaseRow
                  key={key}
                  label={label}
                  start={(times[key] as { start?: string })?.start ?? ''}
                  end={(times[key] as { end?: string })?.end ?? ''}
                  onChangeStart={v => updatePhase(key, 'start', v)}
                  onChangeEnd={v => updatePhase(key, 'end', v)}
                />
              ))}
            </div>
            <Input
              value={times.note ?? ''}
              onChange={e => updatePhase('note', 'start', e.target.value)}
              placeholder="Nota sobre tiempos (opcional)"
            />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>Repuestos utilizados</Label>
              <Button type="button" size="sm" variant="outline" onClick={addPartRow}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Agregar
              </Button>
            </div>
            {partsUsed.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin repuestos. Agregar fila si se usó alguno.</p>
            )}
            {partsUsed.map((p, idx) => (
              <div key={idx} className="grid grid-cols-[110px_70px_1fr_auto] gap-2 items-start">
                <Input
                  value={p.code}
                  onChange={e => updatePartRow(idx, { code: e.target.value })}
                  placeholder="Código"
                />
                <Input
                  type="number"
                  min={1}
                  value={p.quantity}
                  onChange={e => updatePartRow(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                />
                <Input
                  value={p.description}
                  onChange={e => updatePartRow(idx, { description: e.target.value })}
                  placeholder="Descripción"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => removePartRow(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === STEP_PHOTOS && (
        <div className="space-y-4">
          <PhotoUploader
            label="Fotos del servicio"
            value={photos}
            onChange={setPhotos}
            required
          />
          <div className="space-y-2">
            <Label>Accesorios utilizados</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES.map(acc => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => toggleAccessory(acc)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    accessories.includes(acc)
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === STEP_SIGS && (
        <div className="space-y-6">
          <section className="space-y-3 rounded-md border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Técnico responsable
            </p>
            <SignaturePad
              label="Firma del técnico"
              value={techSig}
              onChange={setTechSig}
            />
            <div className="text-xs text-muted-foreground">
              {user?.name} {user?.cedula ? `· C.I. ${user.cedula}` : ''}
            </div>
          </section>

          <section className="space-y-3 rounded-md border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ing. / Jefe Mantenimiento o Biomédica
            </p>
            {isPhysicalSignature ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Cliente PA sector público — firma física escaneada</p>
                <FileDropzone
                  label="Documento firmado (PDF o imagen)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={scannedDoc}
                  onChange={url => setScannedDoc(url ?? undefined)}
                />
              </div>
            ) : (
              <SignaturePad
                label="Firma"
                value={clientSig}
                onChange={setClientSig}
              />
            )}
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={clientSignerName}
                onChange={e => setClientSignerName(e.target.value)}
                placeholder="Nombre"
              />
              <Input
                value={clientSignerCedula}
                onChange={e => setClientSignerCedula(e.target.value)}
                placeholder="C.I."
              />
            </div>
          </section>

          <section className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dirección Centro / Propietario (opcional)
              </p>
              <Switch checked={includeDirector} onCheckedChange={setIncludeDirector} />
            </div>
            {includeDirector && (
              <>
                {isPhysicalSignature ? (
                  <FileDropzone
                    label="Documento firmado por el director"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={directorScannedDoc}
                    onChange={url => setDirectorScannedDoc(url ?? undefined)}
                  />
                ) : (
                  <SignaturePad
                    label="Firma"
                    value={directorSig}
                    onChange={setDirectorSig}
                  />
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={directorSignerName}
                    onChange={e => setDirectorSignerName(e.target.value)}
                    placeholder="Nombre"
                  />
                  <Input
                    value={directorSignerCedula}
                    onChange={e => setDirectorSignerCedula(e.target.value)}
                    placeholder="C.I."
                  />
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {currentStep === STEP_CLOSE && (
        <div className="space-y-4">
          <GeoCapture
            label="Ubicación de salida"
            value={geoCheckOut}
            onCapture={setGeoCheckOut}
          />
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observaciones generales, pendientes, recomendaciones..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Switch checked={closeOrder} onCheckedChange={setCloseOrder} id="close-order" />
            <div>
              <Label htmlFor="close-order" className="cursor-pointer">Cerrar orden</Label>
              <p className="text-xs text-muted-foreground">
                {closeOrder
                  ? 'La orden quedará marcada como completada'
                  : 'La orden quedará en "espera de repuestos / nueva visita"'}
              </p>
            </div>
          </div>
        </div>
      )}
    </StepWizard>
  )
}

function PhaseRow({
  label,
  start,
  end,
  onChangeStart,
  onChangeEnd,
}: {
  label: string
  start: string
  end: string
  onChangeStart: (v: string) => void
  onChangeEnd: (v: string) => void
}) {
  return (
    <>
      <span className="text-xs text-foreground self-center">{label}</span>
      <Input
        type="time"
        className="w-24"
        value={start}
        onChange={e => onChangeStart(e.target.value)}
      />
      <Input
        type="time"
        className="w-24"
        value={end}
        onChange={e => onChangeEnd(e.target.value)}
      />
    </>
  )
}
