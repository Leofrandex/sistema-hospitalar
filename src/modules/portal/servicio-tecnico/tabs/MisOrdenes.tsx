import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ServiceOrderStatusBadge, ServiceOrderTypeBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/format'
import { getOrdersForClient } from '@/lib/client-scope'
import type { ServiceOrderType, ServiceOrderStatus } from '@/types/service-order'

const ORDER_TYPES: ('all' | ServiceOrderType)[] = ['all', 'preventivo', 'correctivo', 'instalacion', 'predictivo']
const ORDER_STATUSES: ('all' | ServiceOrderStatus)[] = ['all', 'pendiente', 'asignada', 'en-progreso', 'en-espera-repuestos', 'completada', 'cancelada']

export default function MisOrdenes() {
  const { user } = useAuth()
  const clientId = user?.clientId

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ServiceOrderType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceOrderStatus>('all')

  const orders = useMemo(() => {
    if (!clientId) return []
    let result = getOrdersForClient(clientId)
    if (typeFilter !== 'all') result = result.filter(o => o.type === typeFilter)
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o => o.id.toLowerCase().includes(q) || (o.notes ?? '').toLowerCase().includes(q))
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [clientId, typeFilter, statusFilter, search])

  if (!clientId) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis órdenes"
        description="Estado de tus servicios técnicos"
        icon={ClipboardList}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o notas"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as 'all' | ServiceOrderType)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ORDER_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t === 'all' ? 'Todos los tipos' : t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | ServiceOrderStatus)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s === 'all' ? 'Todos los estados' : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay órdenes"
          description="Aún no tienes órdenes con los filtros seleccionados."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {orders.map(o => (
              <li key={o.id}>
                <Link
                  to={o.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{o.id}</p>
                    <ServiceOrderTypeBadge type={o.type} />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</span>
                  <ServiceOrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
