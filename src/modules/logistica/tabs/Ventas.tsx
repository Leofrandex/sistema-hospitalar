import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeliveryStatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { getSales } from '@/data/mock/sales'
import { getClientById } from '@/data/mock/clients'
import { getEquipmentById } from '@/data/mock/equipment'
import { formatDate, formatCurrency } from '@/lib/format'
import type { DeliveryStatus } from '@/types/sale'
import { ShoppingCart } from 'lucide-react'

const SELLER_MAP: Record<string, string> = {
  'seller-01': 'Carlos Blanco',
  'seller-02': 'Laura Méndez',
}

const STATUS_FILTER_OPTIONS: Array<{ value: DeliveryStatus | 'todas'; label: string }> = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'por-entregar', label: 'Por entregar' },
  { value: 'en-entrega', label: 'En entrega' },
  { value: 'entregado', label: 'Entregado' },
]

export default function Ventas() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'todas'>('todas')
  const [sortBy, setSortBy] = useState<'fecha' | 'precio'>('fecha')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sales = useMemo(() => {
    let list = getSales()

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => {
        const client = getClientById(s.clientId)
        const eq = getEquipmentById(s.equipmentId)
        return (
          client?.name.toLowerCase().includes(q) ||
          eq?.model.toLowerCase().includes(q) ||
          eq?.serialNumber.toLowerCase().includes(q) ||
          s.id.includes(q)
        )
      })
    }

    if (statusFilter !== 'todas') {
      list = list.filter(s => s.deliveryStatus === statusFilter)
    }

    list = [...list].sort((a, b) => {
      let va = sortBy === 'fecha' ? a.deliveryDate.getTime() : a.price
      let vb = sortBy === 'fecha' ? b.deliveryDate.getTime() : b.price
      return sortDir === 'asc' ? va - vb : vb - va
    })

    return list
  }, [search, statusFilter, sortBy, sortDir])

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ventas" description="Gestión de ventas, documentación y entregas" icon={ShoppingCart} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, equipo o serie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as DeliveryStatus | 'todas')}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('precio')}>
                  Precio <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('fecha')}>
                  Entrega <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Docs.</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map(s => {
              const client = getClientById(s.clientId)
              const eq = getEquipmentById(s.equipmentId)
              return (
                <TableRow
                  key={s.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigate(`/modulos/logistica/ventas/${s.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{client?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{client?.city}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{eq?.model ?? '—'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{eq?.serialNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{SELLER_MAP[s.sellerId] ?? s.sellerId}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(s.price, s.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="muted" className="text-xs">
                      {s.paymentPlan === 'contado' ? 'Contado' : `${s.totalInstallments} cuotas`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(s.deliveryDate)}</TableCell>
                  <TableCell>
                    {s.crmDataComplete ? (
                      <Badge variant="success" className="text-xs">Completos</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Incompletos
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusBadge status={s.deliveryStatus} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {sales.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No se encontraron ventas con esos filtros.
          </div>
        )}
      </div>
    </div>
  )
}
