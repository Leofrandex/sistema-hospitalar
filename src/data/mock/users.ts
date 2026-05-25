import type { User } from '@/types/user'

export const MOCK_USERS: User[] = [
  {
    id: 'u-demo',
    email: 'demo@hospitalarve.com',
    name: 'Usuario Demo',
    role: 'supervisor',
    department: 'Gerencia General',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'u-01',
    email: 'carlos.gomez@hospitalarve.com',
    name: 'Carlos Gómez',
    role: 'tecnico',
    department: 'Servicio Técnico',
    cedula: '8-901-2345',
    createdAt: new Date('2023-03-01'),
  },
  {
    id: 'u-02',
    email: 'maria.torres@hospitalarve.com',
    name: 'María Torres',
    role: 'tecnico',
    department: 'Servicio Técnico',
    cedula: '9-712-456',
    createdAt: new Date('2022-07-15'),
  },
  {
    id: 'u-03',
    email: 'jorge.ramirez@hospitalarve.com',
    name: 'Jorge Ramírez',
    role: 'logistica',
    department: 'Logística',
    createdAt: new Date('2023-01-10'),
  },
  {
    id: 'u-04',
    email: 'ana.silva@hospitalarve.com',
    name: 'Ana Silva',
    role: 'cobranzas',
    department: 'Cobranzas',
    createdAt: new Date('2022-11-20'),
  },
  {
    id: 'u-05',
    email: 'pedro.gonzalez@hospitalarve.com',
    name: 'Pedro González',
    role: 'supervisor',
    department: 'Gerencia',
    createdAt: new Date('2020-05-01'),
  },
  {
    id: 'u-06',
    email: 'laura.perez@hospitalarve.com',
    name: 'Laura Pérez',
    role: 'coordinadora',
    department: 'Servicio Técnico',
    createdAt: new Date('2023-06-01'),
  },
  {
    id: 'u-07',
    email: 'karina.rodriguez@hospitalarve.com',
    name: 'Karina Rodríguez',
    role: 'asistente',
    department: 'Servicio Técnico',
    avatar: undefined,
    createdAt: new Date('2023-08-01'),
  },
  {
    id: 'u-cli-01',
    email: 'contacto@clinicasanfernando.pa',
    name: 'Clínica San Fernando',
    role: 'cliente',
    department: 'Cliente',
    clientId: 'c-16',
    createdAt: new Date('2025-03-15'),
  },
  {
    id: 'u-cli-02',
    email: 'admin@huc.ve',
    name: 'Hospital Universitario de Caracas',
    role: 'cliente',
    department: 'Cliente',
    clientId: 'c-05',
    createdAt: new Date('2025-04-01'),
  },
]

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(u => u.id === id)
}

export function getUsersByRole(role: User['role']): User[] {
  return MOCK_USERS.filter(u => u.role === role)
}
