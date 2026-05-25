import { useMemo, useState } from 'react'
import { Bell, AlertTriangle, CheckCircle, Clock, List, CalendarDays, Plus, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventsCalendar, type CalendarEvent } from '@/components/calendar/EventsCalendar'
import { getEquipment } from '@/data/mock/equipment'
import { getServiceOrders } from '@/data/mock/service-orders'
import { getClientById } from '@/data/mock/clients'
import { getContractByEquipmentId } from '@/data/mock/contracts'
import { getMaintenanceInfo, type MaintenanceInfo, type MaintenanceStatus } from '@/lib/maintenance'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/cn'
import { QuickPreventivoDialog } from '../components/QuickPreventivoDialog'

function StatusBadge({ status, days, hasOpenOrder }: {
  status: MaintenanceStatus
  days: number | null
  hasOpenOrder: boolean
}) {
  if (hasOpenOrder && (status === 'vencido' || status === 'proximo')) {
    return <Badge variant="outline" className="shrink-0 text-xs">Orden activa</Badge>
  }
  if (status === 'vencido') {
    return (
      <Badge variant="destructive" className="shrink-0">
        {Math.abs(days ?? 0)}d vencido
      </Badge>
    )
  }
  if (status === 'proximo') {
    return (
      <Badge className="shrink-0 border-warning/50 bg-warning/10 text-warning">
        {days}d restantes
      </Badge>
    )
  }
  return <Badge variant="secondary" className="shrink-0">Al día</Badge>
}

function EquipmentRow({
  info,
  isCoordinadora,
  onCreate,
}: {
  info: MaintenanceInfo
  isCoordinadora: boolean
  onCreate: (info: MaintenanceInfo) => void
}) {
  const { equipment, nextDue, daysRemaining, status, hasOpenOrder } = info
  const client = equipment.clientId ? getClientById(equipment.clientId) : undefined
  const canCreateOrder =
    isCoordinadora && (status === 'vencido' || status === 'proximo')

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {equipment.brand} {equipment.model}
        </p>
        <p className="text-xs text-muted-foreground">
          {equipment.serialNumber}
          {client ? ` · ${client.name}` : ''}
        </p>
      </div>
      <div className="hidden sm:block shrink-0 w-20 text-xs text-muted-foreground">
        {nextDue ? formatDate(nextDue) : '—'}
      </div>
      <div className="shrink-0 w-24 flex justify-start">
        <StatusBadge status={status} days={daysRemaining} hasOpenOrder={hasOpenOrder} />
      </div>
      {isCoordinadora && (
        <div className="shrink-0 w-32 flex justify-end">
          {canCreateOrder && (
            <Button
              size="sm"
              variant={status === 'vencido' ? 'destructive' : 'default'}
              onClick={() => onCreate(info)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Crear orden
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ isCoordinadora }: { isCoordinadora: boolean }) {
  return (
    <div className="flex items-center gap-4 pb-2 border-b border-border/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <div className="flex-1 min-w-0">Equipo / Serial / Cliente</div>
      <div className="hidden sm:block shrink-0 w-20">Próximo</div>
      <div className="shrink-0 w-24">Estado</div>
      {isCoordinadora && <div className="shrink-0 w-32" aria-hidden />}
    </div>
  )
}

function Section({
  title,
  items,
  icon: Icon,
  borderClass,
  bgClass,
  titleClass,
  isCoordinadora,
  onCreate,
}: {
  title: string
  items: MaintenanceInfo[]
  icon: LucideIcon
  borderClass: string
  bgClass: string
  titleClass: string
  isCoordinadora: boolean
  onCreate: (info: MaintenanceInfo) => void
}) {
  if (items.length === 0) return null
  return (
    <div className={cn('rounded-md border p-4', borderClass, bgClass)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn('h-4 w-4', titleClass)} />
        <h3 className={cn('text-sm font-semibold', titleClass)}>{title}</h3>
      </div>
      <SectionHeader isCoordinadora={isCoordinadora} />
      {items.map(info => (
        <EquipmentRow
          key={info.equipment.id}
          info={info}
          isCoordinadora={isCoordinadora}
          onCreate={onCreate}
        />
      ))}
    </div>
  )
}

export default function Preventivos() {
  const { user } = useAuth()
  const isCoordinadora = user?.role === 'coordinadora' || user?.role === 'supervisor'

  const [view, setView] = useState<'lista' | 'calendario'>('lista')
  const [refreshKey, setRefreshKey] = useState(0)
  const [quickCreateInfo, setQuickCreateInfo] = useState<MaintenanceInfo | null>(null)

  const allInfo = useMemo(() => {
    const equipment = getEquipment()
    const orders = getServiceOrders()
    return equipment
      .filter(eq => eq.clientId && eq.dispatchDate)
      .map(eq => getMaintenanceInfo(eq, orders, getContractByEquipmentId(eq.id)))
    // refreshKey forces recompute after creating a new order
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const vencidos = allInfo.filter(i => i.status === 'vencido')
  const proximos = allInfo.filter(i => i.status === 'proximo')
  const alDia    = allInfo.filter(i => i.status === 'ok')

  const todoAlDia = vencidos.length === 0 && proximos.length === 0

  function openQuickCreate(info: MaintenanceInfo) {
    setQuickCreateInfo(info)
  }

  function handleCreated() {
    setRefreshKey(k => k + 1)
  }

  const events: CalendarEvent[] = useMemo(() =>
    allInfo
      .filter(i => i.nextDue != null)
      .map(i => {
        const client = i.equipment.clientId ? getClientById(i.equipment.clientId) : undefined
        const canCreate =
          isCoordinadora && (i.status === 'vencido' || i.status === 'proximo')
        return {
          id: i.equipment.id,
          date: i.nextDue!,
          title: `${i.equipment.brand} ${i.equipment.model}${client ? ` — ${client.name}` : ''}`,
          variant:
            i.hasOpenOrder ? 'success' :
            i.status === 'vencido' ? 'danger' :
            i.status === 'proximo' ? 'warning' :
            'default',
          onClick: canCreate ? () => openQuickCreate(i) : undefined,
        }
      })
  , [allInfo, isCoordinadora])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Preventivos"
        description="Estado de mantenimiento por política de equipo"
        action={
          <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-sm">
            <button
              onClick={() => setView('lista')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                view === 'lista'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <List className="h-3.5 w-3.5" />
              Lista
            </button>
            <button
              onClick={() => setView('calendario')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                view === 'calendario'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendario
            </button>
          </div>
        }
      />

      {view === 'lista' && (
        <>
          {todoAlDia && (
            <div className="rounded-md border border-success/30 bg-success/5 p-6 text-center">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="font-medium">Todos los equipos están al día</p>
              <p className="text-sm text-muted-foreground mt-1">
                No hay mantenimientos vencidos ni próximos a vencer.
              </p>
            </div>
          )}

          <Section
            title={`Vencidos (${vencidos.length})`}
            items={vencidos}
            icon={AlertTriangle}
            borderClass="border-destructive/30"
            bgClass="bg-destructive/5"
            titleClass="text-destructive"
            isCoordinadora={isCoordinadora}
            onCreate={openQuickCreate}
          />

          <Section
            title={`Próximos 30 días (${proximos.length})`}
            items={proximos}
            icon={Clock}
            borderClass="border-warning/30"
            bgClass="bg-warning/5"
            titleClass="text-warning"
            isCoordinadora={isCoordinadora}
            onCreate={openQuickCreate}
          />

          {!todoAlDia && (
            <Section
              title={`Al día (${alDia.length})`}
              items={alDia}
              icon={CheckCircle}
              borderClass="border-success/30"
              bgClass="bg-success/5"
              titleClass="text-success"
              isCoordinadora={isCoordinadora}
              onCreate={openQuickCreate}
            />
          )}
        </>
      )}

      {view === 'calendario' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              Vencido
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              Próximo (≤30 días)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              Orden activa
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Al día
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <EventsCalendar events={events} />
          </div>
        </div>
      )}

      <QuickPreventivoDialog
        info={quickCreateInfo}
        open={quickCreateInfo !== null}
        onOpenChange={open => { if (!open) setQuickCreateInfo(null) }}
        onCreated={handleCreated}
      />
    </div>
  )
}
