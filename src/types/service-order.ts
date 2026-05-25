export type ServiceOrderType =
  | 'revision-fabrica'
  | 'instalacion'
  | 'preventivo'
  | 'correctivo'
  | 'predictivo'

export type ServiceOrderStatus =
  | 'pendiente'
  | 'asignada'
  | 'en-progreso'
  | 'en-espera-repuestos'
  | 'completada'
  | 'cancelada'

export interface ServiceOrder {
  id: string
  type: ServiceOrderType
  status: ServiceOrderStatus
  equipmentId: string
  clientId?: string
  country: 've' | 'pa'
  assignedTo?: string
  createdBy: string
  scheduledDate?: Date
  dueDate?: Date
  completedAt?: Date
  parentOrderId?: string
  outcome?: 'exitoso' | 'anomalia' | 'emitido'
  anomalyDescription?: string
  requiresParts?: boolean
  notes?: string
  createdAt: Date
}
