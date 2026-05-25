import { useState, useMemo } from 'react'
import { Search, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { getPayments, updatePayment } from '@/data/mock/payments'
import { getClientById } from '@/data/mock/clients'
import { getSaleById } from '@/data/mock/sales'
import { getEquipmentById } from '@/data/mock/equipment'
import { formatDate, formatCurrency, daysUntil } from '@/lib/format'
import { useNotifications } from '@/contexts/NotificationsContext'
import { sendPaymentReminder } from '@/lib/email'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { PaymentStatus } from '@/types/payment'

const STATUS_OPTIONS: Array<{ value: PaymentStatus | 'todas'; label: string }> = [
  { value: 'todas', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'mora', label: 'En mora' },
  { value: 'pagado', label: 'Pagado' },
]

export default function Pagos() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'todas'>('todas')
  const [payments, setPayments] = useState(() => getPayments())
  const { notify } = useNotifications()

  const filtered = useMemo(() => {
    let list = [...payments]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => {
        const client = getClientById(p.clientId)
        return client?.name.toLowerCase().includes(q) || p.id.includes(q)
      })
    }

    if (statusFilter !== 'todas') {
      list = list.filter(p => p.status === statusFilter)
    }

    return list.sort((a, b) => {
      if (a.status === 'mora' && b.status !== 'mora') return -1
      if (b.status === 'mora' && a.status !== 'mora') return 1
      return a.dueDate.getTime() - b.dueDate.getTime()
    })
  }, [payments, search, statusFilter])

  async function handleNotify(paymentId: string) {
    const p = payments.find(x => x.id === paymentId)
    if (!p) return

    const client = getClientById(p.clientId)
    notify({
      type: 'info',
      module: 'cobranzas',
      title: 'Recordatorio enviado',
      message: `Recordatorio enviado a ${client?.name} para cuota ${p.installmentNumber}/${p.totalInstallments}`,
    })

    if (client?.email) {
      await sendPaymentReminder({
        clientName: client.name,
        clientEmail: client.email,
        dueDate: formatDate(p.dueDate),
        amount: p.amount,
        installmentNumber: p.installmentNumber,
        totalInstallments: p.totalInstallments,
      })
    }

    toast.success('Recordatorio enviado', { description: `${client?.name} fue notificado.` })
  }

  function handleMarkPaid(paymentId: string) {
    updatePayment(paymentId, { status: 'pagado', paidDate: new Date() })
    setPayments([...getPayments()])
    toast.success('Pago registrado')
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Pagos" description="Seguimiento de cuotas por cliente" icon={CreditCard} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as PaymentStatus | 'todas')}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(o => (
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
              <TableHead>Cuota</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => {
              const client = getClientById(p.clientId)
              const sale = getSaleById(p.saleId)
              const eq = sale ? getEquipmentById(sale.equipmentId) : undefined
              const days = daysUntil(p.dueDate)

              return (
                <TableRow key={p.id} className={cn(p.status === 'mora' && 'bg-destructive/5')}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{client?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{client?.city}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{eq?.model ?? '—'}</TableCell>
                  <TableCell className="text-sm">{p.installmentNumber}/{p.totalInstallments}</TableCell>
                  <TableCell className="text-sm">{formatDate(p.dueDate)}</TableCell>
                  <TableCell>
                    {p.status === 'pagado' ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <span className={cn('text-sm font-medium',
                        days < 0 ? 'text-destructive' : days <= 3 ? 'text-warning' : 'text-muted-foreground'
                      )}>
                        {days < 0 ? `${Math.abs(days)}d vencido` : days === 0 ? 'Hoy' : `${days}d`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(p.amount)}</TableCell>
                  <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    {p.status !== 'pagado' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleNotify(p.id)}
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          Notificar
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          className="h-7 text-xs"
                          onClick={() => handleMarkPaid(p.id)}
                        >
                          Pagado
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No se encontraron pagos.
          </div>
        )}
      </div>
    </div>
  )
}
