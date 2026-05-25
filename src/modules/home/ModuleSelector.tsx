import { useNavigate } from 'react-router-dom'
import { Wrench, Package, CreditCard, BarChart2, ShoppingBag, ArrowRight, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { canAccess } from '@/lib/access'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import type { ModuleName } from '@/types/user'

const MODULES = [
  {
    id: 'servicio-tecnico' as ModuleName,
    label: 'Servicio Técnico',
    description: 'Revisiones de equipos nuevos, mantenimiento preventivo y reportes técnicos.',
    icon: Wrench,
    path: '/modulos/servicio-tecnico',
    color: 'from-primary/10 to-primary/5 border-primary/20',
    iconColor: 'text-primary bg-primary/10',
  },
  {
    id: 'logistica' as ModuleName,
    label: 'Logística',
    description: 'Gestión de ventas, validación de documentación y seguimiento de entregas.',
    icon: Package,
    path: '/modulos/logistica',
    color: 'from-secondary/10 to-secondary/5 border-secondary/20',
    iconColor: 'text-secondary bg-secondary/10',
  },
  {
    id: 'cobranzas' as ModuleName,
    label: 'Cobranzas',
    description: 'Control de pagos, cuotas, alertas de mora y calendario de vencimientos.',
    icon: CreditCard,
    path: '/modulos/cobranzas',
    color: 'from-success/10 to-success/5 border-success/20',
    iconColor: 'text-success bg-success/10',
  },
  {
    id: 'supervisor' as ModuleName,
    label: 'Dashboard Supervisor',
    description: 'Métricas globales, detección de cuellos de botella y análisis histórico.',
    icon: BarChart2,
    path: '/modulos/supervisor',
    color: 'from-warning/10 to-warning/5 border-warning/20',
    iconColor: 'text-warning bg-warning/10',
  },
  {
    id: 'compras' as ModuleName,
    label: 'Compras',
    description: 'Trazabilidad de órdenes de compra y rotación de equipos/insumos.',
    icon: ShoppingBag,
    path: '/modulos/compras',
    color: 'from-sky-500/10 to-sky-500/5 border-sky-500/20',
    iconColor: 'text-sky-600 bg-sky-500/10',
  },
]

export default function ModuleSelector() {
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleModule(id: ModuleName, path: string) {
    if (user && !canAccess(user.role, id)) {
      toast.error('Acceso restringido', {
        description: `No tienes permiso para acceder al módulo de ${MODULES.find(m => m.id === id)?.label}.`,
      })
      return
    }
    navigate(path)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Bienvenido, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Selecciona el módulo al que deseas acceder</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map(mod => {
          const accessible = user ? canAccess(user.role, mod.id) : false

          return (
            <Card
              key={mod.id}
              onClick={() => handleModule(mod.id, mod.path)}
              className={cn(
                'cursor-pointer group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-br border',
                mod.color,
                !accessible && 'opacity-60',
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn('rounded-lg p-2.5', mod.iconColor)}>
                        <mod.icon className="h-5 w-5" />
                      </div>
                      {!accessible && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <h2 className="font-semibold text-foreground text-lg leading-tight">{mod.label}</h2>
                    <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{mod.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p>Accediendo como <span className="font-medium text-foreground">{user?.name}</span> · Rol: <span className="font-medium text-foreground capitalize">{user?.role}</span></p>
      </div>
    </div>
  )
}
