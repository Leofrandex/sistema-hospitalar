export type DeliveryStatus = 'por-entregar' | 'en-entrega' | 'entregado'
export type PaymentPlan = 'contado' | 'cuotas'

export interface SaleDocument {
  cedula?: string
  rif?: string
  planVenta?: string
  soportePago?: string
  contrato?: string
}

export interface SaleStatusChange {
  status: DeliveryStatus
  changedAt: Date
  note?: string
}

export interface Sale {
  id: string
  clientId: string
  equipmentId: string
  sellerId: string
  price: number
  currency: 'USD' | 'VES'
  paymentPlan: PaymentPlan
  totalInstallments?: number
  deliveryDate: Date
  deliveryStatus: DeliveryStatus
  statusHistory: SaleStatusChange[]
  documents: SaleDocument
  crmDataComplete: boolean
  contractGenerated: boolean
  createdAt: Date
}
