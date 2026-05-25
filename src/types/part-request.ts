export type PartRequestStatus = 'solicitado' | 'en-tramite' | 'recibido' | 'cancelado'

export interface PartRequest {
  id: string
  serviceOrderId: string
  description: string
  status: PartRequestStatus
  requestedAt: Date
  resolvedAt?: Date
  notes?: string
}
