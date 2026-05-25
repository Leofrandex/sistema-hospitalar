export type PurchaseOrderStatus = 'emitida' | 'en-transito' | 'recibida' | 'cancelada'

export interface PurchaseOrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  currency: 'USD' | 'VES'
}

export interface PurchaseOrderStatusChange {
  status: PurchaseOrderStatus
  changedAt: Date
  note?: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  emissionDate: Date
  estimatedArrivalDate: Date
  actualArrivalDate?: Date
  status: PurchaseOrderStatus
  totalCost: number
  currency: 'USD' | 'VES'
  items: PurchaseOrderItem[]
  statusHistory: PurchaseOrderStatusChange[]
  notes?: string
  createdAt: Date
}
