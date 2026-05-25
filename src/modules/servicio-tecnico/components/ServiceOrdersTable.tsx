import { useState, useMemo } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutList, Kanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ServiceOrderStatusBadge, ServiceOrderTypeBadge } from '@/components/shared/StatusBadge'
import { ServiceOrderCard } from './ServiceOrderCard'
import { getEquipmentById } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { getUserById } from '@/data/mock/users'
import { updateServiceOrder } from '@/data/mock/service-orders'
import { formatDate } from '@/lib/format'
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderType } from '@/types/service-order'

const KANBAN_COLUMNS: { status: ServiceOrderStatus; label: string }[] = [
  { status: 'pendiente',   label: 'Pendiente' },
  { status: 'asignada',    label: 'Asignada' },
  { status: 'en-progreso', label: 'En progreso' },
  { status: 'completada',  label: 'Completada' },
]

interface ServiceOrdersTableProps {
  orders: ServiceOrder[]
  onOrderClick: (order: ServiceOrder) => void
  onOrdersChange: () => void
  showAssignedTo?: boolean
  readonly?: boolean
}

export function ServiceOrdersTable({ orders, onOrderClick, onOrdersChange, showAssignedTo = true, readonly = false }: ServiceOrdersTableProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [filterType, setFilterType] = useState<ServiceOrderType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ServiceOrderStatus | 'all'>('all')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => orders.filter(o => {
    if (filterType !== 'all' && o.type !== filterType) return false
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    return true
  }), [orders, filterType, filterStatus])

  function handleDragEnd(event: DragEndEvent) {
    if (readonly) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const targetStatus = over.id as ServiceOrderStatus
    if (KANBAN_COLUMNS.some(c => c.status === targetStatus)) {
      updateServiceOrder(active.id as string, { status: targetStatus })
      onOrdersChange()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterType} onValueChange={v => setFilterType(v as ServiceOrderType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="revision-fabrica">Revisión fábrica</SelectItem>
            <SelectItem value="instalacion">Instalación</SelectItem>
            <SelectItem value="preventivo">Preventivo</SelectItem>
            <SelectItem value="correctivo">Correctivo</SelectItem>
            <SelectItem value="predictivo">Predictivo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as ServiceOrderStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="asignada">Asignada</SelectItem>
            <SelectItem value="en-progreso">En progreso</SelectItem>
            <SelectItem value="en-espera-repuestos">Espera repuestos</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('kanban')}
          >
            <Kanban className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List view */}
      {viewMode === 'list' && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                {showAssignedTo && <TableHead>Técnico</TableHead>}
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showAssignedTo ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No hay órdenes con estos filtros
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(order => {
                  const eq = getEquipmentById(order.equipmentId)
                  const client = order.clientId ? getClientById(order.clientId) : undefined
                  const tech = order.assignedTo ? getUserById(order.assignedTo) : undefined
                  return (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onOrderClick(order)}>
                      <TableCell>
                        <p className="font-medium text-sm">{eq?.model ?? order.equipmentId}</p>
                        <p className="text-xs text-muted-foreground">{eq?.brand}</p>
                      </TableCell>
                      <TableCell><ServiceOrderTypeBadge type={order.type} /></TableCell>
                      <TableCell><ServiceOrderStatusBadge status={order.status} /></TableCell>
                      <TableCell className="text-sm">{client?.name ?? '—'}</TableCell>
                      {showAssignedTo && <TableCell className="text-sm">{tech?.name ?? '—'}</TableCell>}
                      <TableCell className="text-sm text-muted-foreground">
                        {order.dueDate ? formatDate(order.dueDate) : order.scheduledDate ? formatDate(order.scheduledDate) : formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map(col => {
              const colOrders = filtered.filter(o => o.status === col.status)
              return (
                <div key={col.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{col.label}</h3>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{colOrders.length}</span>
                  </div>
                  <SortableContext items={colOrders.map(o => o.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[100px]">
                      {colOrders.map(order => (
                        <ServiceOrderCard key={order.id} order={order} onClick={() => onOrderClick(order)} />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>
        </DndContext>
      )}
    </div>
  )
}
