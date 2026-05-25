export type PaymentStatus = 'pendiente' | 'pagado' | 'mora'

export interface Payment {
  id: string
  saleId: string
  clientId: string
  installmentNumber: number
  totalInstallments: number
  dueDate: Date
  amount: number
  currency: 'USD' | 'VES'
  status: PaymentStatus
  paidDate?: Date
  notes?: string
}
