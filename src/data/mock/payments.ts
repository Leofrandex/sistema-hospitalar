import { addMonths, subMonths, subDays } from 'date-fns'
import type { Payment } from '@/types/payment'

const NOW = new Date()

function mkPayments(
  saleId: string,
  clientId: string,
  total: number,
  installments: number,
  baseAmount: number,
  startMonthsAgo: number,
): Payment[] {
  const result: Payment[] = []
  for (let i = 1; i <= installments; i++) {
    const due = addMonths(subMonths(NOW, startMonthsAgo), i - 1)
    let status: Payment['status']
    let paidDate: Date | undefined

    if (due < subDays(NOW, 15)) {
      status = Math.random() < 0.85 ? 'pagado' : 'mora'
      if (status === 'pagado') paidDate = subDays(due, Math.floor(Math.random() * 5))
    } else if (due < NOW) {
      status = Math.random() < 0.6 ? 'pagado' : 'mora'
      if (status === 'pagado') paidDate = subDays(due, 1)
    } else {
      status = 'pendiente'
    }

    result.push({
      id: `pay-${saleId}-${i}`,
      saleId,
      clientId,
      installmentNumber: i,
      totalInstallments: installments,
      dueDate: due,
      amount: baseAmount,
      currency: 'USD',
      status,
      paidDate,
    })
  }
  return result
}

const _paymentsRaw: Payment[] = [
  // sale-02: Dr. Andrés Pérez — 12 cuotas $708/mes iniciando hace 6 meses
  ...mkPayments('sale-02', 'c-02', 8500, 12, 708, 6),
  // sale-03: Centro Médico Las Mercedes — 24 cuotas $1333/mes hace 7 meses
  ...mkPayments('sale-03', 'c-03', 32000, 24, 1333, 7),
  // sale-04: Dra. Gabriela Sánchez — 18 cuotas $666/mes hace 12 meses
  ...mkPayments('sale-04', 'c-04', 12000, 18, 666, 12),
  // sale-06: Dr. Luis Fernández — 12 cuotas $1500/mes, inicio hace 1 mes
  ...mkPayments('sale-06', 'c-06', 18000, 12, 1500, 1),
  // sale-07: Clínica Santa Sofía — 12 cuotas $1250/mes hace 4 meses
  ...mkPayments('sale-07', 'c-07', 15000, 12, 1250, 4),
  // sale-08: Dra. María Quintero — 18 cuotas $528/mes hace 9 meses
  ...mkPayments('sale-08', 'c-08', 9500, 18, 528, 9),
  // sale-09: Instituto Aragua — 24 cuotas $917/mes, inicio hace 1 mes
  ...mkPayments('sale-09', 'c-09', 22000, 24, 917, 1),
  // sale-10: Dr. Ricardo Mora — 12 cuotas $917/mes hace 11 meses
  ...mkPayments('sale-10', 'c-10', 11000, 12, 917, 11),
  // sale-12: Dra. Sofía Blanco — 18 cuotas $722/mes hace 1 mes
  ...mkPayments('sale-12', 'c-12', 13000, 18, 722, 1),
  // sale-13: Centro de Imágenes del Este — 36 cuotas $1222/mes hace 3 meses
  ...mkPayments('sale-13', 'c-13', 44000, 36, 1222, 3),
  // sale-14: Dr. Jorge Castillo — 12 cuotas $750/mes, inicio hace 0 meses
  ...mkPayments('sale-14', 'c-14', 9000, 12, 750, 0),
  // sale-16: Hospital Universitario — 36 cuotas $1528/mes hace 6 meses
  ...mkPayments('sale-16', 'c-05', 55000, 36, 1528, 6),
]

// Fix seeded random to be deterministic by overriding a few specific records
// Ensure at least some mora records are visible
_paymentsRaw.filter((_, i) => i % 15 === 3 || i % 23 === 0).forEach(p => {
  if (p.dueDate < NOW) {
    p.status = 'mora'
    p.paidDate = undefined
  }
})

let _payments: Payment[] = [..._paymentsRaw]

export function getPayments(): Payment[] {
  return _payments
}

export function getPaymentById(id: string): Payment | undefined {
  return _payments.find(p => p.id === id)
}

export function getPaymentsBySale(saleId: string): Payment[] {
  return _payments.filter(p => p.saleId === saleId)
}

export function getPaymentsByClient(clientId: string): Payment[] {
  return _payments.filter(p => p.clientId === clientId)
}

export function updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
  const idx = _payments.findIndex(p => p.id === id)
  if (idx === -1) return undefined
  _payments[idx] = { ..._payments[idx], ...updates }
  return _payments[idx]
}
