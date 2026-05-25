export type ContactRole = 'biomedica' | 'unidad_ejecutora' | 'general'

export interface SiteContact {
  role: ContactRole
  name: string
  phone?: string
  email?: string
}

export interface Site {
  id: string
  clientId: string
  name: string            // "ULAPPS Máximo Herrera" (público) o clínica (privado)
  address?: string
  city?: string
  contacts: SiteContact[]
  notes?: string
  createdAt: Date
}
