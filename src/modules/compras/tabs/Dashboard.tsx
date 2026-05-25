import { useMemo, useState } from 'react'
import { ShoppingBag, Package, Truck, Building2, DollarSign } from 'lucide-react'
import { subMonths } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { KpiCard } from '@/components/shared/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from '@/contexts/ThemeContext'
import { getPurchaseOrders, getProductRotation } from '@/data/mock/purchases'
import { getProductById } from '@/data/mock/products'
import { getSupplierById } from '@/data/mock/suppliers'
import { formatCurrency, formatDate } from '@/lib/format'
import { useNavigate } from 'react-router-dom'

const RANGE_OPTIONS = [
  { label: 'Últimos 3 meses', value: '3' },
  { label: 'Últimos 6 meses', value: '6' },
  { label: 'Últimos 12 meses', value: '12' },
]

export default function ComprasDashboard() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [range, setRange] = useState('6')

  const orders = getPurchaseOrders()

  const activeOrders = orders.filter(o => o.status === 'emitida' || o.status === 'en-transito')
  const quarterlySpend = orders
    .filter(o => o.status === 'recibida' && o.emissionDate >= subMonths(new Date(), 3))
    .reduce((sum, o) => sum + o.totalCost, 0)

  const rotation = useMemo(() => {
    const sinceDate = subMonths(new Date(), parseInt(range, 10))
    return getProductRotation(sinceDate)
  }, [range])

  const topRotation = rotation.slice(0, 10)

  const uniqueProductCount = rotation.length
  const activeSupplierIds = new Set(
    orders.filter(o => o.status !== 'cancelada').map(o => o.supplierId)
  )

  const upcomingArrivals = orders
    .filter(o => o.status !== 'recibida' && o.status !== 'cancelada')
    .sort((a, b) => a.estimatedArrivalDate.getTime() - b.estimatedArrivalDate.getTime())
    .slice(0, 5)

  const chartData = topRotation.map(r => {
    const product = getProductById(r.productId)
    const name = product ? (product.name.length > 22 ? product.name.slice(0, 22) + '…' : product.name) : r.productId
    return {
      name,
      fullName: product?.name ?? r.productId,
      Cantidad: r.totalQuantity,
      Órdenes: r.orderCount,
    }
  })

  const gridColor = theme === 'dark' ? '#2a2a3e' : '#e5e7eb'
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        description="Rotación de inventario y órdenes activas"
        icon={ShoppingBag}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Órdenes activas"
          value={activeOrders.length}
          icon={Truck}
          variant={activeOrders.length > 5 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Gasto último trimestre"
          value={formatCurrency(quarterlySpend)}
          icon={DollarSign}
          variant="default"
        />
        <KpiCard
          title="Productos ordenados"
          value={uniqueProductCount}
          icon={Package}
          variant="default"
        />
        <KpiCard
          title="Proveedores activos"
          value={activeSupplierIds.size}
          icon={Building2}
          variant="default"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Rotación de productos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Top 10 productos por cantidad total ordenada</p>
            </div>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-44 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Sin datos en el período seleccionado</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                  contentStyle={{
                    background: theme === 'dark' ? '#1a1a2e' : '#fff',
                    border: `1px solid ${gridColor}`,
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Cantidad" fill="hsl(245 49% 50% / 0.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Órdenes" fill="hsl(17 88% 58% / 0.85)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximas llegadas</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingArrivals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay órdenes pendientes de recibir.</p>
          ) : (
            <div className="space-y-0">
              {upcomingArrivals.map(order => {
                const supplier = getSupplierById(order.supplierId)
                return (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/modulos/compras/ordenes/${order.id}`)}
                    className="w-full flex items-center justify-between gap-4 py-2.5 border-b last:border-0 hover:bg-muted/40 rounded px-2 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{supplier?.name ?? order.supplierId}</p>
                      <p className="text-xs text-muted-foreground">{order.id} · {order.items.length} líneas · {formatCurrency(order.totalCost)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Llegada est.</p>
                      <p className="text-sm font-medium">{formatDate(order.estimatedArrivalDate)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
