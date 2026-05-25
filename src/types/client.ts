export interface Client {
  id: string
  name: string
  cedula?: string
  rif?: string
  location: string
  city: string
  phone: string
  email: string
  country: 've' | 'pa'
  isPublicSector: boolean
  notes?: string
  createdAt: Date
}
