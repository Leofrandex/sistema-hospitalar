export type PreServiceRequestStatus = 'pendiente' | 'aprobada' | 'rechazada'

export interface PreServiceRequest {
  id: string
  orderId: string
  tecnicoId: string
  herramientas: string
  status: PreServiceRequestStatus
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  coordinadoraNotes?: string
}
