import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, XCircle, FileText, Loader2, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { DeliveryStatusBadge } from '@/components/shared/StatusBadge'
import { getSaleById, updateSale } from '@/data/mock/sales'
import { getClientById } from '@/data/mock/clients'
import { getEquipmentById } from '@/data/mock/equipment'
import { formatDate, formatDateLong, formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import type { DeliveryStatus, SaleDocument } from '@/types/sale'

const SELLER_MAP: Record<string, string> = {
  'seller-01': 'Carlos Blanco',
  'seller-02': 'Laura Méndez',
}

const DOC_LABELS: Array<{ key: keyof SaleDocument; label: string }> = [
  { key: 'cedula', label: 'Cédula de Identidad' },
  { key: 'rif', label: 'RIF' },
  { key: 'planVenta', label: 'Plan de Venta' },
  { key: 'soportePago', label: 'Soporte de Pago' },
  { key: 'contrato', label: 'Contrato' },
]

export default function DetalleVenta() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sale, setSale] = useState(() => getSaleById(id ?? ''))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [docs, setDocs] = useState<SaleDocument>(sale?.documents ?? {})

  if (!sale) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Venta no encontrada.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    )
  }

  const client = getClientById(sale.clientId)
  const equipment = getEquipmentById(sale.equipmentId)
  const docsComplete = DOC_LABELS.filter(d => d.key !== 'contrato').every(d => !!docs[d.key])

  async function handleStatusChange(newStatus: DeliveryStatus) {
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))

    const updated = updateSale(sale!.id, {
      deliveryStatus: newStatus,
      statusHistory: [
        ...sale!.statusHistory,
        { status: newStatus, changedAt: new Date(), note: note.trim() || undefined },
      ],
    })
    if (updated) setSale({ ...updated })
    setNote('')
    setSaving(false)
    toast.success('Estado actualizado', { description: `Estatus cambiado a "${newStatus}"` })
  }

  function handleDocChange(key: keyof SaleDocument, url: string | undefined) {
    const newDocs = { ...docs, [key]: url }
    setDocs(newDocs)
    const allComplete = DOC_LABELS.filter(d => d.key !== 'contrato').every(d => !!newDocs[d.key])
    updateSale(sale!.id, { documents: newDocs, crmDataComplete: allComplete })
    setSale(prev => prev ? { ...prev, documents: newDocs, crmDataComplete: allComplete } : prev)
  }

  function handleGenerateContract() {
    if (!docsComplete) {
      toast.error('Documentación incompleta', {
        description: 'Completa todos los documentos requeridos antes de generar el contrato.',
      })
      return
    }
    const fakeUrl = `contrato_${sale!.id}.pdf`
    const newDocs = { ...docs, contrato: fakeUrl }
    setDocs(newDocs)
    updateSale(sale!.id, { documents: newDocs, contractGenerated: true })
    setSale(prev => prev ? { ...prev, documents: newDocs, contractGenerated: true } : prev)
    toast.success('Contrato generado', { description: 'El contrato fue generado exitosamente.' })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a ventas
        </Button>
        <DeliveryStatusBadge status={sale.deliveryStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client + Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de la venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Cliente</p>
                  <p className="font-medium">{client?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{client?.cedula ?? client?.rif}</p>
                  <p className="text-xs text-muted-foreground">{client?.location}</p>
                  <p className="text-xs text-muted-foreground">{client?.city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Equipo</p>
                  <p className="font-medium">{equipment?.model ?? '—'}</p>
                  <p className="text-xs text-muted-foreground font-mono">{equipment?.serialNumber}</p>
                  <p className="text-xs text-muted-foreground">{equipment?.brand}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Precio</p>
                  <p className="font-medium">{formatCurrency(sale.price, sale.currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.paymentPlan === 'contado' ? 'Contado' : `${sale.totalInstallments} cuotas`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Vendedor / Fecha</p>
                  <p className="font-medium">{SELLER_MAP[sale.sellerId] ?? sale.sellerId}</p>
                  <p className="text-xs text-muted-foreground">Entrega: {formatDate(sale.deliveryDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documentación CRM</CardTitle>
                {docsComplete ? (
                  <Badge variant="success" className="text-xs">Completa</Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">Incompleta</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {DOC_LABELS.map(({ key, label }) => (
                key === 'contrato' ? null : (
                  <FileDropzone
                    key={key}
                    label={label}
                    value={docs[key]}
                    onChange={url => handleDocChange(key, url)}
                  />
                )
              ))}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contrato</span>
                </div>
                {docs.contrato ? (
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Generado
                  </Badge>
                ) : (
                  <Button size="sm" onClick={handleGenerateContract} disabled={!docsComplete}>
                    Generar contrato
                  </Button>
                )}
              </div>
              {!docsComplete && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Completa todos los documentos requeridos para generar el contrato.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status + Timeline */}
        <div className="space-y-6">
          {/* Change status */}
          {sale.deliveryStatus !== 'entregado' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cambiar estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={sale.deliveryStatus}
                  onValueChange={v => handleStatusChange(v as DeliveryStatus)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="por-entregar">Por entregar</SelectItem>
                    <SelectItem value="en-entrega">En entrega</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nota (opcional)</Label>
                  <Textarea
                    placeholder="Motivo del cambio, observación, etc."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="text-sm min-h-[80px]"
                  />
                </div>
                {saving && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Guardando...
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {sale.statusHistory.map((h, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      {i < sale.statusHistory.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="min-w-0 pb-0">
                      <DeliveryStatusBadge status={h.status} />
                      <p className="text-xs text-muted-foreground mt-1">{formatDateLong(h.changedAt)}</p>
                      {h.note && <p className="text-xs text-foreground/80 mt-1 italic">"{h.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
