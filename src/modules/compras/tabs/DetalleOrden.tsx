import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getPurchaseOrderById, updatePurchaseOrder } from '@/data/mock/purchases'
import { getSupplierById } from '@/data/mock/suppliers'
import { getProductById } from '@/data/mock/products'
import { formatDate, formatDateLong, formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import type { PurchaseOrderStatus } from '@/types/purchase'

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  emitida: 'Emitida',
  'en-transito': 'En tránsito',
  recibida: 'Recibida',
  cancelada: 'Cancelada',
}

const STATUS_VARIANTS: Record<PurchaseOrderStatus, 'default' | 'success' | 'destructive' | 'secondary'> = {
  emitida: 'secondary',
  'en-transito': 'default',
  recibida: 'success',
  cancelada: 'destructive',
}

const NEXT_STATUSES: Partial<Record<PurchaseOrderStatus, PurchaseOrderStatus[]>> = {
  emitida: ['en-transito', 'cancelada'],
  'en-transito': ['recibida', 'cancelada'],
}

export default function DetalleOrden() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState(() => getPurchaseOrderById(id ?? ''))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!order) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Orden no encontrada.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    )
  }

  const supplier = getSupplierById(order.supplierId)
  const allowedNextStatuses = NEXT_STATUSES[order.status] ?? []

  async function handleStatusChange(newStatus: PurchaseOrderStatus) {
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))

    const now = new Date()
    const updated = updatePurchaseOrder(order!.id, {
      status: newStatus,
      actualArrivalDate: newStatus === 'recibida' ? now : order!.actualArrivalDate,
      statusHistory: [
        ...order!.statusHistory,
        { status: newStatus, changedAt: now, note: note.trim() || undefined },
      ],
    })

    if (updated) setOrder({ ...updated })
    setNote('')
    setSaving(false)
    toast.success('Estado actualizado', { description: `Orden actualizada a "${STATUS_LABELS[newStatus]}"` })
  }

  const lineTotal = order.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a órdenes
        </Button>
        <Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de la orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Proveedor</p>
                  <p className="font-medium">{supplier?.name ?? order.supplierId}</p>
                  {supplier?.country && <p className="text-xs text-muted-foreground">{supplier.country}</p>}
                  {supplier?.contactName && <p className="text-xs text-muted-foreground">{supplier.contactName}</p>}
                  {supplier?.email && <p className="text-xs text-muted-foreground">{supplier.email}</p>}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total de la orden</p>
                  <p className="font-medium">{formatCurrency(order.totalCost, order.currency)}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? 'línea' : 'líneas'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Fecha de emisión</p>
                  <p className="font-medium">{formatDate(order.emissionDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Llegada estimada</p>
                  <p className="font-medium">{formatDate(order.estimatedArrivalDate)}</p>
                  {order.actualArrivalDate && (
                    <p className="text-xs text-success">Real: {formatDate(order.actualArrivalDate)}</p>
                  )}
                </div>
              </div>
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Notas</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Líneas de la orden</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">P. unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => {
                    const product = getProductById(item.productId)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{product?.name ?? item.productId}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{product?.sku ?? '—'}</TableCell>
                        <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(item.unitPrice, item.currency)}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{formatCurrency(item.quantity * item.unitPrice, item.currency)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(lineTotal, order.currency)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {allowedNextStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cambiar estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={order.status}
                  onValueChange={v => handleStatusChange(v as PurchaseOrderStatus)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={order.status} disabled>{STATUS_LABELS[order.status]} (actual)</SelectItem>
                    {allowedNextStatuses.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nota (opcional)</Label>
                  <Textarea
                    placeholder="Motivo del cambio, observación…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="text-sm min-h-[80px]"
                    disabled={saving}
                  />
                </div>
                {saving && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Guardando…
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      {i < order.statusHistory.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="min-w-0 pb-0">
                      <Badge variant={STATUS_VARIANTS[h.status]}>{STATUS_LABELS[h.status]}</Badge>
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
