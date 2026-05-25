import { useNavigate } from 'react-router-dom'
import { Building2, Wrench, Package, CreditCard, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getServiceOrders } from '@/data/mock/service-orders'
import { getSales } from '@/data/mock/sales'
import { getPayments } from '@/data/mock/payments'
import { formatCurrency, daysUntil } from '@/lib/format'

function StatRow({ label, value, badge }: { label: string; value: string | number; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        {badge}
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

export default function Departamentos() {
  const navigate = useNavigate()
  const orders = getServiceOrders()
  const sales = getSales()
  const payments = getPayments()

  const st = {
    porRevisar: orders.filter(o => o.type === 'revision-fabrica' && o.status === 'pendiente').length,
    enRevision: orders.filter(o => o.type === 'revision-fabrica' && o.status === 'en-progreso').length,
    revisados: orders.filter(o => o.type === 'revision-fabrica' && o.status === 'completada').length,
    anomalias: orders.filter(o => o.outcome === 'anomalia').length,
    mantPendientes: orders.filter(o => o.type === 'preventivo' && o.status !== 'completada').length,
    mantVencidos: orders.filter(o => o.type === 'preventivo' && o.dueDate && daysUntil(o.dueDate) < 0 && o.status !== 'completada').length,
  }

  const log = {
    porEntregar: sales.filter(s => s.deliveryStatus === 'por-entregar').length,
    enEntrega: sales.filter(s => s.deliveryStatus === 'en-entrega').length,
    entregados: sales.filter(s => s.deliveryStatus === 'entregado').length,
    docsIncompletos: sales.filter(s => !s.crmDataComplete && s.deliveryStatus !== 'entregado').length,
    totalVentas: sales.length,
  }

  const cob = {
    mora: payments.filter(p => p.status === 'mora').length,
    totalMora: payments.filter(p => p.status === 'mora').reduce((s, p) => s + p.amount, 0),
    proximos: payments.filter(p => p.status === 'pendiente' && daysUntil(p.dueDate) <= 7 && daysUntil(p.dueDate) >= 0).length,
    pagados: payments.filter(p => p.status === 'pagado').length,
    totalCobros: payments.length,
  }

  const depts = [
    {
      id: 'servicio-tecnico',
      label: 'Servicio Técnico',
      icon: Wrench,
      path: '/modulos/servicio-tecnico',
      iconColor: 'bg-primary/10 text-primary',
      stats: (
        <>
          <StatRow label="Por revisar" value={st.porRevisar} badge={st.porRevisar > 0 ? <Badge variant="warning" className="text-xs">Pendiente</Badge> : null} />
          <StatRow label="En revisión" value={st.enRevision} />
          <StatRow label="Revisados" value={st.revisados} />
          <StatRow label="Anomalías" value={st.anomalias} badge={st.anomalias > 0 ? <Badge variant="destructive" className="text-xs">Alerta</Badge> : null} />
          <StatRow label="Mantenimientos vencidos" value={st.mantVencidos} badge={st.mantVencidos > 0 ? <Badge variant="destructive" className="text-xs">Alerta</Badge> : null} />
        </>
      ),
    },
    {
      id: 'logistica',
      label: 'Logística',
      icon: Package,
      path: '/modulos/logistica',
      iconColor: 'bg-secondary/10 text-secondary',
      stats: (
        <>
          <StatRow label="Por entregar" value={log.porEntregar} badge={log.porEntregar > 0 ? <Badge variant="warning" className="text-xs">Pendiente</Badge> : null} />
          <StatRow label="En entrega" value={log.enEntrega} />
          <StatRow label="Entregados" value={log.entregados} />
          <StatRow label="Docs. incompletos" value={log.docsIncompletos} badge={log.docsIncompletos > 0 ? <Badge variant="destructive" className="text-xs">Alerta</Badge> : null} />
          <StatRow label="Total ventas" value={log.totalVentas} />
        </>
      ),
    },
    {
      id: 'cobranzas',
      label: 'Cobranzas',
      icon: CreditCard,
      path: '/modulos/cobranzas',
      iconColor: 'bg-success/10 text-success',
      stats: (
        <>
          <StatRow label="En mora" value={cob.mora} badge={cob.mora > 0 ? <Badge variant="destructive" className="text-xs">Alerta</Badge> : null} />
          <StatRow label="Monto en mora" value={formatCurrency(cob.totalMora)} />
          <StatRow label="Vencen esta semana" value={cob.proximos} badge={cob.proximos > 0 ? <Badge variant="warning" className="text-xs">Próximos</Badge> : null} />
          <StatRow label="Pagos confirmados" value={cob.pagados} />
          <StatRow label="Total cuotas" value={cob.totalCobros} />
        </>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departamentos"
        description="Métricas por departamento con acceso directo a cada módulo"
        icon={Building2}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {depts.map(dept => (
          <Card key={dept.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${dept.iconColor}`}>
                    <dept.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">{dept.label}</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => navigate(dept.path)}
                >
                  Ver módulo
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {dept.stats}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
