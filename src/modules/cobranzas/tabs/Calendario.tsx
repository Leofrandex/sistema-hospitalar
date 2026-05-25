import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EventsCalendar, type CalendarEvent } from '@/components/calendar/EventsCalendar'
import { getPayments } from '@/data/mock/payments'
import { getClientById } from '@/data/mock/clients'
import { daysUntil } from '@/lib/format'
import { useNotifications } from '@/contexts/NotificationsContext'
import { sendPaymentReminder } from '@/lib/email'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'

export default function CalendarioCob() {
  const payments = useMemo(() => getPayments(), [])
  const { notify } = useNotifications()

  const events: CalendarEvent[] = useMemo(() =>
    payments
      .filter(p => p.status !== 'pagado')
      .map(p => {
        const client = getClientById(p.clientId)
        const days = daysUntil(p.dueDate)
        const variant = p.status === 'mora' ? 'danger' : days <= 3 ? 'warning' : 'default'

        return {
          id: p.id,
          date: p.dueDate,
          title: `${client?.name ?? '?'} — Cuota ${p.installmentNumber}/${p.totalInstallments} ($${p.amount})`,
          variant,
          onClick: async () => {
            if (!client) return

            notify({
              type: 'info',
              module: 'cobranzas',
              title: 'Recordatorio enviado',
              message: `${client.name} fue notificado sobre su cuota ${p.installmentNumber}/${p.totalInstallments}`,
            })

            if (client.email) {
              await sendPaymentReminder({
                clientName: client.name,
                clientEmail: client.email,
                dueDate: formatDate(p.dueDate),
                amount: p.amount,
                installmentNumber: p.installmentNumber,
                totalInstallments: p.totalInstallments,
              })
            }

            toast.success('Recordatorio enviado', { description: `${client.name} fue notificado.` })
          },
        }
      })
  , [payments, notify])

  const legend = [
    { color: 'bg-destructive', label: 'En mora' },
    { color: 'bg-warning', label: 'Vence en ≤3 días' },
    { color: 'bg-primary', label: 'Pendiente' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Calendario de pagos"
        description="Vista mensual de todos los vencimientos de cuotas"
        icon={Calendar}
      />

      <div className="flex gap-4 flex-wrap">
        {legend.map(l => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4">
        <EventsCalendar events={events} />
      </div>
    </div>
  )
}
