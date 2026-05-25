import type { Role, ModuleName } from '@/types/user'

const ROLE_ACCESS: Record<Role, ModuleName[]> = {
  tecnico:      ['servicio-tecnico'],
  coordinadora: ['servicio-tecnico'],
  asistente:    ['servicio-tecnico'],
  logistica:    ['logistica'],
  cobranzas:    ['cobranzas'],
  compras:      ['compras'],
  supervisor:   ['servicio-tecnico', 'logistica', 'cobranzas', 'supervisor', 'compras'],
  cliente:      ['portal-servicio-tecnico', 'portal-cobranzas', 'portal-despacho'],
}

export function canAccess(role: Role, module: ModuleName): boolean {
  return ROLE_ACCESS[role]?.includes(module) ?? false
}

export function getAccessibleModules(role: Role): ModuleName[] {
  return ROLE_ACCESS[role] ?? []
}
