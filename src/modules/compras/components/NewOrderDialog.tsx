import { useEffect } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getSuppliers } from '@/data/mock/suppliers'
import { getProducts, getProductById } from '@/data/mock/products'
import { addPurchaseOrder } from '@/data/mock/purchases'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import type { PurchaseOrder } from '@/types/purchase'

const lineSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.coerce.number().int().min(1, 'Min 1'),
  unitPrice: z.coerce.number().min(0.01, 'Precio requerido'),
})

const schema = z.object({
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  emissionDate: z.string().min(1, 'Fecha requerida'),
  estimatedArrivalDate: z.string().min(1, 'Fecha requerida'),
  currency: z.enum(['USD', 'VES']),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'Agrega al menos una línea'),
})

type FormValues = z.infer<typeof schema>

interface NewOrderDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (order: PurchaseOrder) => void
}

const suppliers = getSuppliers()
const products = getProducts()

export function NewOrderDialog({ open, onClose, onCreated }: NewOrderDialogProps) {
  const today = new Date().toISOString().slice(0, 10)

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        supplierId: '',
        emissionDate: today,
        estimatedArrivalDate: '',
        currency: 'USD',
        notes: '',
        lines: [{ productId: '', quantity: 1, unitPrice: 0 }],
      },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const lines = useWatch({ control, name: 'lines' })
  const currency = watch('currency')

  useEffect(() => {
    if (!open) {
      reset({
        supplierId: '',
        emissionDate: today,
        estimatedArrivalDate: '',
        currency: 'USD',
        notes: '',
        lines: [{ productId: '', quantity: 1, unitPrice: 0 }],
      })
    }
  }, [open, reset, today])

  function handleProductChange(index: number, productId: string) {
    setValue(`lines.${index}.productId`, productId)
    const product = getProductById(productId)
    if (product) {
      setValue(`lines.${index}.unitPrice`, product.referencePrice)
    }
  }

  function onSubmit(data: FormValues) {
    const items = data.lines.map((line, i) => ({
      id: `temp-item-${i + 1}`,
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      currency: data.currency,
    }))
    const totalCost = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)

    const order = addPurchaseOrder({
      supplierId: data.supplierId,
      emissionDate: new Date(data.emissionDate),
      estimatedArrivalDate: new Date(data.estimatedArrivalDate),
      status: 'emitida',
      totalCost,
      currency: data.currency,
      items: items.map((it, i) => ({ ...it, id: `pending-item-${i + 1}` })),
      statusHistory: [{ status: 'emitida', changedAt: new Date() }],
      notes: data.notes || undefined,
    })

    // fix item ids after we know the order id
    order.items = order.items.map((it, i) => ({ ...it, id: `${order.id}-item-${i + 1}` }))

    toast.success('Orden creada', { description: `${order.id} registrada correctamente.` })
    onCreated(order)
    onClose()
  }

  const subtotal = (lines ?? []).reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0)

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva orden de compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Proveedor</Label>
              <Select onValueChange={v => setValue('supplierId', v)} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId.message}</p>}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Moneda</Label>
              <Select onValueChange={v => setValue('currency', v as 'USD' | 'VES')} defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="VES">VES</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Fecha de emisión</Label>
              <Input type="date" {...register('emissionDate')} />
              {errors.emissionDate && <p className="text-xs text-destructive">{errors.emissionDate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Fecha de llegada estimada</Label>
              <Input type="date" {...register('estimatedArrivalDate')} />
              {errors.estimatedArrivalDate && <p className="text-xs text-destructive">{errors.estimatedArrivalDate.message}</p>}
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label>Notas (opcional)</Label>
              <Textarea placeholder="Observaciones, condiciones especiales…" className="min-h-[60px] text-sm" {...register('notes')} />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Líneas de la orden</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar línea
              </Button>
            </div>

            {errors.lines?.root && <p className="text-xs text-destructive">{errors.lines.root.message}</p>}

            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5 space-y-1">
                    {i === 0 && <Label className="text-xs">Producto</Label>}
                    <Select onValueChange={v => handleProductChange(i, v)} defaultValue="">
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Seleccionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.name} — {p.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.lines?.[i]?.productId && (
                      <p className="text-xs text-destructive">{errors.lines[i].productId?.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-1">
                    {i === 0 && <Label className="text-xs">Cantidad</Label>}
                    <Input type="number" min={1} className="h-9 text-xs" {...register(`lines.${i}.quantity`)} />
                    {errors.lines?.[i]?.quantity && (
                      <p className="text-xs text-destructive">{errors.lines[i].quantity?.message}</p>
                    )}
                  </div>

                  <div className="col-span-4 space-y-1">
                    {i === 0 && <Label className="text-xs">Precio unitario ({currency})</Label>}
                    <Input type="number" min={0} step="0.01" className="h-9 text-xs" {...register(`lines.${i}.unitPrice`)} />
                    {errors.lines?.[i]?.unitPrice && (
                      <p className="text-xs text-destructive">{errors.lines[i].unitPrice?.message}</p>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    {i === 0 && <div className="text-xs invisible">x</div>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => fields.length > 1 && remove(i)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total estimado</p>
            <p className="text-lg font-semibold">{formatCurrency(subtotal, currency)}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Crear orden</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
