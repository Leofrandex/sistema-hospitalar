import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { ArrowLeft, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ImportSchema, ColumnMapping, ImportResult } from '@/lib/data-import'
import { executeImport } from '@/lib/data-import'
import { getKnownMapping, type TargetField } from '@/lib/excel-headers'
import { cn } from '@/lib/cn'

interface Props {
  onExit: () => void
}

type Step = 1 | 2 | 3 | 4

const TARGET_OPTIONS: { value: TargetField; label: string }[] = [
  { value: 'ignore', label: '— ignorar —' },
  { value: 'client.name', label: 'Cliente: nombre' },
  { value: 'client.notes', label: 'Cliente: notas' },
  { value: 'client.phone', label: 'Cliente: teléfono' },
  { value: 'client.email', label: 'Cliente: correo' },
  { value: 'site.name', label: 'Sede: nombre' },
  { value: 'site.address', label: 'Sede: dirección' },
  { value: 'site.city', label: 'Sede: ciudad' },
  { value: 'site.contact.biomedica.name', label: 'Contacto biomédica: nombre' },
  { value: 'site.contact.biomedica.phone', label: 'Contacto biomédica: teléfono' },
  { value: 'site.contact.biomedica.email', label: 'Contacto biomédica: correo' },
  { value: 'site.contact.unidad_ejecutora.name', label: 'Contacto unidad ejecutora: nombre' },
  { value: 'site.contact.unidad_ejecutora.phone', label: 'Contacto unidad ejecutora: teléfono' },
  { value: 'site.contact.unidad_ejecutora.email', label: 'Contacto unidad ejecutora: correo' },
  { value: 'site.contact.general.name', label: 'Contacto general: nombre' },
  { value: 'equipment.equipmentType', label: 'Equipo: tipo (texto libre)' },
  { value: 'equipment.brand', label: 'Equipo: marca' },
  { value: 'equipment.model', label: 'Equipo: modelo' },
  { value: 'equipment.serialNumber', label: 'Equipo: serial' },
  { value: 'equipment.peripherals', label: 'Equipo: periféricos' },
  { value: 'equipment.installationDate', label: 'Equipo: fecha instalación' },
  { value: 'equipment.dispatchDate', label: 'Equipo: fecha entrega' },
  { value: 'equipment.serviceArea', label: 'Equipo: departamento/área' },
  { value: 'equipment.assetTag', label: 'Equipo: activo' },
  { value: 'equipment.license', label: 'Equipo: licencia' },
  { value: 'equipment.ctni', label: 'Equipo: CTNI' },
  { value: 'equipment.purchaseOrder', label: 'Equipo: orden de compras' },
  { value: 'equipment.serviceHistory[]', label: 'Equipo: visita histórica (fecha)' },
  { value: 'contract.warrantyText', label: 'Contrato: garantía (texto)' },
]

function extractSheet(ws: XLSX.WorkSheet, headerRowIdx: number): {
  hdrs: string[]
  json: Record<string, unknown>[]
} {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: undefined,
    blankrows: false,
  })
  const headerRow = (aoa[headerRowIdx] ?? []) as unknown[]
  const hdrs = headerRow.map((h, i) => {
    const s = h == null ? '' : String(h).trim()
    return s || `(columna ${i + 1})`
  })
  const dataRows = aoa.slice(headerRowIdx + 1)
  const json = dataRows
    .map(row => {
      const obj: Record<string, unknown> = {}
      hdrs.forEach((h, i) => {
        obj[h] = row[i]
      })
      return obj
    })
    .filter(r => Object.values(r).some(v => v != null && v !== ''))
  return { hdrs, json }
}

export function BulkUploadWizard({ onExit }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [schema, setSchema] = useState<ImportSchema>('privado')
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [headerRow, setHeaderRow] = useState<number>(1) // 1-indexed for UX
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preventivosIncluded, setPreventivosIncluded] = useState<number>(0)
  const [fileName, setFileName] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array', cellDates: true })
      setWorkbook(wb)
      const defaultSheet =
        wb.SheetNames.find(n => /priv|p[uú]bl/i.test(n)) ?? wb.SheetNames[0]
      setSelectedSheet(defaultSheet)
      setHeaderRow(1)
    }
    reader.readAsArrayBuffer(file)
  }

  // Preview headers for the currently selected sheet + header row
  const previewHeaders: string[] = (() => {
    if (!workbook || !selectedSheet) return []
    const ws = workbook.Sheets[selectedSheet]
    if (!ws) return []
    return extractSheet(ws, Math.max(0, headerRow - 1)).hdrs
  })()
  const previewRecognized = previewHeaders.filter(h => getKnownMapping(schema, h)).length

  function confirmSheet() {
    if (!workbook || !selectedSheet) return
    const ws = workbook.Sheets[selectedSheet]
    if (!ws) return
    const { hdrs, json } = extractSheet(ws, Math.max(0, headerRow - 1))
    const autoMap: ColumnMapping = {}
    hdrs.forEach(h => {
      const known = getKnownMapping(schema, h)
      if (known) autoMap[h] = known
    })
    setHeaders(hdrs)
    setRows(json)
    setMapping(autoMap)
    setStep(3)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onExit}><ArrowLeft className="h-4 w-4 mr-1" />Volver</Button>
        <h2 className="text-xl font-semibold">Carga masiva — paso {step} de 4</h2>
      </div>

      {step === 1 && (
        <div className="space-y-4 max-w-md">
          <Label>¿Qué tipo de cliente vas a cargar?</Label>
          <RadioGroup value={schema} onValueChange={v => setSchema(v as ImportSchema)}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="privado" id="r-priv" />
              <Label htmlFor="r-priv">Privado</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="publico" id="r-pub" />
              <Label htmlFor="r-pub">Público (CSS, MINSA, etc.)</Label>
            </div>
          </RadioGroup>
          <Button onClick={() => setStep(2)}>Continuar</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-2xl">
          <Label>Selecciona el archivo .xlsx</Label>
          <div
            className={cn(
              'relative rounded-md border-2 border-dashed p-6 transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40',
            )}
            onDragEnter={e => { e.preventDefault(); setIsDragging(true) }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFile(file)
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <div className="flex items-center gap-3 pointer-events-none">
              <div className="rounded-md bg-muted p-2 shrink-0">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{fileName || 'Arrastra aquí o haz clic para seleccionar'}</p>
                <p className="text-xs text-muted-foreground">Formatos soportados: .xlsx, .xls</p>
              </div>
            </div>
          </div>

          {workbook && (
            <div className="space-y-3 rounded border border-border p-4">
              <p className="text-sm text-muted-foreground">
                El archivo contiene <strong>{workbook.SheetNames.length}</strong> hojas. Elige cuál importar y en qué fila están los encabezados.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="sheet-select">Hoja</Label>
                  <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                    <SelectTrigger id="sheet-select"><SelectValue placeholder="Selecciona una hoja" /></SelectTrigger>
                    <SelectContent>
                      {workbook.SheetNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="header-row">Fila de encabezado</Label>
                  <Input
                    id="header-row"
                    type="number"
                    min={1}
                    step={1}
                    value={headerRow}
                    onChange={e => setHeaderRow(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  />
                  <p className="text-xs text-muted-foreground">Suele ser 1. La hoja "Privado" del archivo maestro la tiene en 2.</p>
                </div>
              </div>
              {previewHeaders.length > 0 && (
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">
                    Detectados <strong>{previewHeaders.length}</strong> encabezados; reconocidos automáticamente: <strong>{previewRecognized}</strong>.
                  </p>
                  <div className="rounded bg-muted/50 p-2 font-mono text-[11px] leading-relaxed max-h-32 overflow-auto">
                    {previewHeaders.join(' · ')}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
            <Button onClick={confirmSheet} disabled={!workbook || !selectedSheet || previewHeaders.length === 0}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <MappingStep
          headers={headers}
          mapping={mapping}
          rows={rows}
          onChange={setMapping}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <ConfirmStep
          rows={rows}
          result={result}
          preventivosIncluded={preventivosIncluded}
          onPreventivosChange={setPreventivosIncluded}
          onExecute={() => setResult(executeImport(rows, mapping, schema === 'publico', preventivosIncluded))}
          onExit={onExit}
        />
      )}
    </div>
  )
}

interface MappingStepProps {
  headers: string[]
  rows: Record<string, unknown>[]
  mapping: ColumnMapping
  onChange: (m: ColumnMapping) => void
  onBack: () => void
  onNext: () => void
}

function MappingStep({ headers, rows, mapping, onChange, onBack, onNext }: MappingStepProps) {
  const unmappedCount = headers.filter(h => !mapping[h]).length
  const preview = rows.slice(0, 5)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Reconocimos automáticamente {headers.length - unmappedCount} de {headers.length} columnas.
        {unmappedCount > 0 && ` Asigna manualmente las ${unmappedCount} restantes o márcalas como ignorar.`}
      </p>
      <div className="rounded border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">Columna Excel</th>
              <th className="text-left p-2">Ejemplo (fila 1)</th>
              <th className="text-left p-2">Mapear a</th>
            </tr>
          </thead>
          <tbody>
            {headers.map(h => (
              <tr key={h} className="border-t border-border">
                <td className="p-2 font-mono text-xs">{h}</td>
                <td className="p-2 text-muted-foreground text-xs">
                  {String(preview[0]?.[h] ?? '').slice(0, 40) || '—'}
                </td>
                <td className="p-2">
                  <Select
                    value={mapping[h] ?? 'ignore'}
                    onValueChange={v => onChange({ ...mapping, [h]: v as TargetField })}
                  >
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TARGET_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onBack}>Atrás</Button>
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}

interface ConfirmStepProps {
  rows: Record<string, unknown>[]
  result: ImportResult | null
  preventivosIncluded: number
  onPreventivosChange: (n: number) => void
  onExecute: () => void
  onExit: () => void
}

function ConfirmStep({ rows, result, preventivosIncluded, onPreventivosChange, onExecute, onExit }: ConfirmStepProps) {
  if (result) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Importación completada</h3>
        <ul className="text-sm space-y-1">
          <li>Filas leídas: <strong>{result.rowsRead}</strong></li>
          <li>Clientes creados: <strong>{result.clientsCreated}</strong> (reutilizados: {result.clientsReused})</li>
          <li>Sedes creadas: <strong>{result.sitesCreated}</strong> (reutilizadas: {result.sitesReused})</li>
          <li>Equipos creados: <strong>{result.equipmentCreated}</strong></li>
          <li>Equipos actualizados (upsert): <strong>{result.equipmentUpdated}</strong></li>
          <li>Contratos de garantía creados: <strong>{result.contractsCreated}</strong></li>
          <li>Errores: <strong>{result.errors.length}</strong></li>
        </ul>
        {result.errors.length > 0 && (
          <div className="rounded border border-destructive/50 bg-destructive/5 p-3 text-xs">
            <strong>Errores por fila:</strong>
            <ul className="mt-1">
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>Fila {e.rowIndex}: {e.reason}</li>
              ))}
              {result.errors.length > 10 && <li>… y {result.errors.length - 10} más</li>}
            </ul>
          </div>
        )}
        <Button onClick={onExit}>Volver al menú</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold">Listo para importar</h3>
      <p className="text-sm text-muted-foreground">
        Se procesarán <strong>{rows.length}</strong> filas. Equipos con serial existente serán actualizados (upsert).
      </p>
      <div className="space-y-1">
        <Label htmlFor="preventivos">Preventivos incluidos en el período de garantía</Label>
        <Input
          id="preventivos"
          type="number"
          min={0}
          step={1}
          value={preventivosIncluded}
          onChange={e => onPreventivosChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
        />
        <p className="text-xs text-muted-foreground">
          Se aplica a todos los contratos de garantía generados por esta carga. Déjalo en 0 si la garantía no incluye preventivos.
        </p>
      </div>
      <Button onClick={onExecute}>Ejecutar importación</Button>
    </div>
  )
}
