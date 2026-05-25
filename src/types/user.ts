export type Role =
  | 'tecnico'
  | 'coordinadora'
  | 'asistente'
  | 'logistica'
  | 'cobranzas'
  | 'supervisor'
  | 'compras'
  | 'cliente'

export type ModuleName =
  | 'servicio-tecnico'
  | 'logistica'
  | 'cobranzas'
  | 'supervisor'
  | 'compras'
  | 'portal-servicio-tecnico'
  | 'portal-cobranzas'
  | 'portal-despacho'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  department: string
  avatar?: string
  cedula?: string
  clientId?: string  // solo poblado cuando role === 'cliente'
  createdAt: Date
}
