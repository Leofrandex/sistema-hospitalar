import { useMemo, useState } from 'react'
import { Plus, Search, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { NewOrderDialog } from '../components/NewOrderDialog'
import { getPurchaseOrders } from '@/data/mock/purchases'
import { getSupplierById } from '@/data/mock/suppliers'
import { formatDate, formatCurrency } from '@/lib/format'
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase'
import { ShoppingBag } from 'lucide-react'

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

export default function Ordenes() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'todas'>('todas')
  const [sortBy, setSortBy] = useState<'emision' | 'llegada' | 'costo'>('emision')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [orders, setOrders] = useState(() => getPurchaseOrders())

  const filtered = useMemo(() => {
    let list = orders

    if (statusFilter !== 'todas') {
      list = list.filter(o => o.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o => {
        const supplier = getSupplierById(o.supplierId)
        return (
          o.id.toLowerCase().includes(q) ||
          (supplier?.name ?? '').toLowerCase().includes(q)
        )
      })
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'emision') return b.emissionDate.getTime() - a.emissionDate.getTime()
      if (sortBy === 'llegada') return a.estimatedArrivalDate.getTime() - b.estimatedArrivalDate.getTime()
      return b.totalCost - a.totalCost
    })
  }, [orders, search, statusFilter, sortBy])

  function handleCreated(order: PurchaseOrder) {
    setOrders(getPurchaseOrders())
    navigate(`/modulos/compras/ordenes/${order.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes de compra"
        description="Historial y registro de órdenes"
        icon={ShoppingBag}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva orden
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o proveedor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            {(Object.keys(STATUS_LABELS) as PurchaseOrderStatus[]).map(s => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="emision">Fecha emisión</SelectItem>
            <SelectItem value="llegada">Fecha llegada</SelectItem>
            <SelectItem value="costo">Costo total</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">No se encontraron órdenes.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const supplier = getSupplierById(order.supplierId)
            return (
              <Card
                key={order.id}
                className="cursor-pointer group hover:shadow-sm hover:-translate-y-px transition-all duration-150"
                onClick={() => navigate(`/modulos/compras/ordenes/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                        <span className="text-sm font-medium truncate">{supplier?.name ?? order.supplierId}</span>
                        <Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{formatCurrency(order.totalCost, order.currency)}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">Emitida: {formatDate(order.emissionDate)}</span>
                        <span className="text-xs text-muted-foreground">Llegada est.: {formatDate(order.estimatedArrivalDate)}</span>
                        <span className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? 'línea' : 'líneas'}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NewOrderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
