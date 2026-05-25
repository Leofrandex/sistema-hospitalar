import { NavLink, useNavigate } from 'react-router-dom'
import {
  Wrench, CreditCard, Truck, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { label: 'Servicio Técnico', path: '/portal/servicio-tecnico', icon: Wrench, available: true  },
  { label: 'Cobranzas',        path: '/portal/cobranzas',        icon: CreditCard, available: false },
  { label: 'Despacho',         path: '/portal/despacho',         icon: Truck,      available: false },
]

interface ClientSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function ClientSidebar({ collapsed, onToggle }: ClientSidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 shrink-0',
          collapsed ? 'w-[60px]' : 'w-[240px]',
        )}
      >
        <div className={cn('flex items-center h-16 border-b border-sidebar-border px-3 shrink-0', collapsed ? 'justify-center' : 'gap-3 px-4')}>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white leading-none">Hospitalar</p>
              <p className="text-xs text-white/60 mt-0.5">Portal del Cliente</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(item => (
            collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-white'
                          : 'text-white/70 hover:bg-sidebar-accent/60 hover:text-white',
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}{!item.available && ' — Próximamente'}
                </TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-white font-medium'
                      : 'text-white/70 hover:bg-sidebar-accent/60 hover:text-white',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
                {!item.available && (
                  <Badge variant="outline" className="ml-auto text-[10px] py-0 px-1.5 border-white/30 text-white/70">
                    Pronto
                  </Badge>
                )}
              </NavLink>
            )
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Cerrar sesión</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggle}
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Cerrar sesión</span>
              </button>
              <button
                onClick={onToggle}
                className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Contraer panel</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
