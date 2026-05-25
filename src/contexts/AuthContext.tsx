import { createContext, useContext, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { User } from '@/types/user'

const DEMO_USER: User = {
  id: 'u-demo',
  email: 'demo@hospitalarve.com',
  name: 'Usuario Demo',
  role: 'supervisor',
  department: 'Gerencia General',
  avatar: undefined,
  createdAt: new Date('2024-01-01'),
}

const COORDINADORA_USER: User = {
  id: 'u-06',
  email: 'laura.perez@hospitalarve.com',
  name: 'Laura Pérez',
  role: 'coordinadora',
  department: 'Servicio Técnico',
  avatar: undefined,
  createdAt: new Date('2023-06-01'),
}

const TECNICO_USER: User = {
  id: 'u-01',
  email: 'carlos.gomez@hospitalarve.com',
  name: 'Carlos Gómez',
  role: 'tecnico',
  department: 'Servicio Técnico',
  avatar: undefined,
  createdAt: new Date('2023-03-01'),
}

const ASISTENTE_USER: User = {
  id: 'u-07',
  email: 'karina.rodriguez@hospitalarve.com',
  name: 'Karina Rodríguez',
  role: 'asistente',
  department: 'Servicio Técnico',
  avatar: undefined,
  createdAt: new Date('2023-08-01'),
}

const CLIENTE_SF_USER: User = {
  id: 'u-cli-01',
  email: 'contacto@clinicasanfernando.pa',
  name: 'Clínica San Fernando',
  role: 'cliente',
  department: 'Cliente',
  clientId: 'c-16',
  avatar: undefined,
  createdAt: new Date('2025-03-15'),
}

const CLIENTE_HUC_USER: User = {
  id: 'u-cli-02',
  email: 'admin@huc.ve',
  name: 'Hospital Universitario de Caracas',
  role: 'cliente',
  department: 'Cliente',
  clientId: 'c-05',
  avatar: undefined,
  createdAt: new Date('2025-04-01'),
}

const CREDENTIALS = {
  'demo@hospitalarve.com':            { password: 'demo123',  user: DEMO_USER },
  'laura.perez@hospitalarve.com':     { password: 'demo123',  user: COORDINADORA_USER },
  'karina.rodriguez@hospitalarve.com':{ password: 'demo123',  user: ASISTENTE_USER },
  'carlos.gomez@hospitalarve.com':    { password: 'demo123',  user: TECNICO_USER },
  'contacto@clinicasanfernando.pa':   { password: 'demo123',  user: CLIENTE_SF_USER },
  'admin@huc.ve':                     { password: 'demo123',  user: CLIENTE_HUC_USER },
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('hospitalar-user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(email: string, password: string) {
    const entry = CREDENTIALS[email as keyof typeof CREDENTIALS]
    if (!entry || entry.password !== password) {
      return { ok: false, error: 'Credenciales incorrectas. Intenta de nuevo.' }
    }
    setUser(entry.user)
    sessionStorage.setItem('hospitalar-user', JSON.stringify(entry.user))
    return { ok: true }
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem('hospitalar-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RequireStaff({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'cliente') return <Navigate to="/portal" replace />
  return <>{children}</>
}

export function RequireClient({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'cliente') return <Navigate to="/modulos" replace />
  return <>{children}</>
}
