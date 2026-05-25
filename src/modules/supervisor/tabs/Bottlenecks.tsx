import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { getAggregatedMetrics } from '@/data/mock/metrics'
import { cn } from '@/lib/cn'
import { useTheme } from '@/contexts/ThemeContext'

export default function Bottlenecks() {
  const { theme } = useTheme()
  const metrics = getAggregatedMetrics()

  const chartData = metrics.map(m => ({
    name: m.label.length > 28 ? m.label.slice(0, 28) + '…' : m.label,
    fullLabel: m.label,
    Histórico: m.avgHistorical,
    'Últimos 30d': m.avg30Days,
    isBottleneck: m.isBottleneck,
    deltaPercent: m.deltaPercent,
  }))

  const gridColor = theme === 'dark' ? '#2a2a3e' : '#e5e7eb'
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuellos de Botella"
        description="Comparación entre el promedio histórico y los últimos 30 días por etapa del proceso"
        icon={TrendingUp}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.type} className={cn('border', m.isBottleneck && 'border-warning/40 bg-warning/5')}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-tight">{m.label}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={cn('text-2xl font-semibold', m.isBottleneck ? 'text-warning' : 'text-foreground')}>
                      {m.avg30Days}d
                    </span>
                    <span className={cn(
                      'text-xs font-medium',
                      m.deltaPercent > 20 ? 'text-destructive' : m.deltaPercent > 0 ? 'text-warning' : 'text-success',
                    )}>
                      {m.deltaPercent > 0 ? '+' : ''}{m.deltaPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Histórico: {m.avgHistorical}d</p>
                </div>
                {m.isBottleneck ? (
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Tiempos promedio por etapa</CardTitle>
              <CardDescription className="mt-1">
                Barras naranjas indican cuellos de botella (delta &gt; 20% sobre el histórico)
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary/70" />
                Histórico
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-secondary/80" />
                Últimos 30d
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fill: textColor, fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: textColor, fontSize: 11 }}
                label={{ value: 'Días', angle: -90, position: 'insideLeft', fill: textColor, fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => [`${value} días`, name]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ''}
                contentStyle={{
                  background: theme === 'dark' ? '#1a1a2e' : '#fff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="Histórico" fill="hsl(245 49% 50% / 0.7)" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="Últimos 30d"
                fill="hsl(17 88% 58% / 0.85)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {metrics.filter(m => m.isBottleneck).length === 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="text-sm text-success">
              Ninguna etapa supera el 20% del promedio histórico. Los procesos están dentro de los rangos esperados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
