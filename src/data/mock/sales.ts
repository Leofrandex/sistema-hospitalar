import { addDays, subDays } from 'date-fns'
import type { Sale } from '@/types/sale'

const NOW = new Date()

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-01', clientId: 'c-01', equipmentId: 'eq-04', sellerId: 'seller-01', price: 35000, currency: 'USD',
    paymentPlan: 'contado', deliveryDate: subDays(NOW, 175), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 180) },
      { status: 'en-entrega', changedAt: subDays(NOW, 178) },
      { status: 'entregado', changedAt: subDays(NOW, 175) },
    ],
    documents: { cedula: 'doc_cedula.pdf', rif: 'doc_rif.pdf', planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_001.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 185),
  },
  {
    id: 'sale-02', clientId: 'c-02', equipmentId: 'eq-22', sellerId: 'seller-02', price: 8500, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 12, deliveryDate: subDays(NOW, 180), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 190) },
      { status: 'en-entrega', changedAt: subDays(NOW, 182) },
      { status: 'entregado', changedAt: subDays(NOW, 180) },
    ],
    documents: { cedula: 'doc_cedula.pdf', rif: undefined, planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_002.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 195),
  },
  {
    id: 'sale-03', clientId: 'c-03', equipmentId: 'eq-05', sellerId: 'seller-01', price: 32000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 24, deliveryDate: subDays(NOW, 195), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 205) },
      { status: 'en-entrega', changedAt: subDays(NOW, 197) },
      { status: 'entregado', changedAt: subDays(NOW, 195) },
    ],
    documents: { cedula: undefined, rif: 'doc_rif.pdf', planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_003.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 210),
  },
  {
    id: 'sale-04', clientId: 'c-04', equipmentId: 'eq-16', sellerId: 'seller-02', price: 12000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 18, deliveryDate: subDays(NOW, 360), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 370) },
      { status: 'en-entrega', changedAt: subDays(NOW, 363) },
      { status: 'entregado', changedAt: subDays(NOW, 360) },
    ],
    documents: { cedula: 'doc.pdf', rif: undefined, planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_004.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 375),
  },
  {
    id: 'sale-05', clientId: 'c-05', equipmentId: 'eq-10', sellerId: 'seller-01', price: 95000, currency: 'USD',
    paymentPlan: 'contado', deliveryDate: subDays(NOW, 355), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 365) },
      { status: 'en-entrega', changedAt: subDays(NOW, 358) },
      { status: 'entregado', changedAt: subDays(NOW, 355) },
    ],
    documents: { cedula: undefined, rif: 'doc_rif.pdf', planVenta: undefined, soportePago: 'doc_soporte.pdf', contrato: 'contrato_005.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 370),
  },
  {
    id: 'sale-06', clientId: 'c-06', equipmentId: 'eq-31', sellerId: 'seller-02', price: 18000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 12, deliveryDate: addDays(NOW, 5), deliveryStatus: 'por-entregar',
    statusHistory: [{ status: 'por-entregar', changedAt: subDays(NOW, 10) }],
    documents: { cedula: 'doc_cedula.pdf', rif: undefined, planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_006.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 15),
  },
  {
    id: 'sale-07', clientId: 'c-07', equipmentId: 'eq-06', sellerId: 'seller-01', price: 15000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 12, deliveryDate: subDays(NOW, 90), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 100) },
      { status: 'en-entrega', changedAt: subDays(NOW, 93) },
      { status: 'entregado', changedAt: subDays(NOW, 90) },
    ],
    documents: { cedula: undefined, rif: 'doc_rif.pdf', planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_007.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 105),
  },
  {
    id: 'sale-08', clientId: 'c-08', equipmentId: 'eq-17', sellerId: 'seller-02', price: 9500, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 18, deliveryDate: subDays(NOW, 275), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 285) },
      { status: 'entregado', changedAt: subDays(NOW, 275), note: 'Entrega directa sin etapa intermedia.' },
    ],
    documents: { cedula: 'doc.pdf', rif: undefined, planVenta: 'doc_plan.pdf', soportePago: 'doc_soporte.pdf', contrato: 'contrato_008.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 290),
  },
  {
    id: 'sale-09', clientId: 'c-09', equipmentId: 'eq-35', sellerId: 'seller-01', price: 22000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 24, deliveryDate: addDays(NOW, 14), deliveryStatus: 'por-entregar',
    statusHistory: [{ status: 'por-entregar', changedAt: subDays(NOW, 5) }],
    documents: { cedula: 'doc_cedula.pdf', rif: undefined, planVenta: 'doc_plan.pdf', soportePago: undefined, contrato: undefined },
    crmDataComplete: false, contractGenerated: false, createdAt: subDays(NOW, 8),
  },
  {
    id: 'sale-10', clientId: 'c-10', equipmentId: 'eq-07', sellerId: 'seller-02', price: 11000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 12, deliveryDate: subDays(NOW, 335), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 345) },
      { status: 'en-entrega', changedAt: subDays(NOW, 338) },
      { status: 'entregado', changedAt: subDays(NOW, 335) },
    ],
    documents: { cedula: 'doc.pdf', rif: undefined, planVenta: 'doc.pdf', soportePago: 'doc.pdf', contrato: 'contrato_010.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 350),
  },
  {
    id: 'sale-11', clientId: 'c-11', equipmentId: 'eq-11', sellerId: 'seller-01', price: 78000, currency: 'USD',
    paymentPlan: 'contado', deliveryDate: subDays(NOW, 115), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 125) },
      { status: 'en-entrega', changedAt: subDays(NOW, 118), note: 'Transporte especial requerido por peso del equipo.' },
      { status: 'entregado', changedAt: subDays(NOW, 115) },
    ],
    documents: { cedula: undefined, rif: 'doc_rif.pdf', planVenta: undefined, soportePago: 'doc.pdf', contrato: 'contrato_011.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 130),
  },
  {
    id: 'sale-12', clientId: 'c-12', equipmentId: 'eq-32', sellerId: 'seller-02', price: 13000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 18, deliveryDate: addDays(NOW, 3), deliveryStatus: 'en-entrega',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 7) },
      { status: 'en-entrega', changedAt: subDays(NOW, 2), note: 'Transporte asignado. En camino.' },
    ],
    documents: { cedula: 'doc.pdf', rif: undefined, planVenta: 'doc.pdf', soportePago: 'doc.pdf', contrato: 'contrato_012.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 12),
  },
  {
    id: 'sale-13', clientId: 'c-13', equipmentId: 'eq-12', sellerId: 'seller-01', price: 44000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 36, deliveryDate: subDays(NOW, 73), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 83) },
      { status: 'en-entrega', changedAt: subDays(NOW, 76) },
      { status: 'entregado', changedAt: subDays(NOW, 73) },
    ],
    documents: { cedula: undefined, rif: 'doc.pdf', planVenta: 'doc.pdf', soportePago: 'doc.pdf', contrato: 'contrato_013.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 88),
  },
  {
    id: 'sale-14', clientId: 'c-14', equipmentId: 'eq-34', sellerId: 'seller-02', price: 9000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 12, deliveryDate: addDays(NOW, 7), deliveryStatus: 'por-entregar',
    statusHistory: [{ status: 'por-entregar', changedAt: subDays(NOW, 3) }],
    documents: { cedula: 'doc.pdf', rif: undefined, planVenta: undefined, soportePago: undefined, contrato: undefined },
    crmDataComplete: false, contractGenerated: false, createdAt: subDays(NOW, 5),
  },
  {
    id: 'sale-15', clientId: 'c-15', equipmentId: 'eq-33', sellerId: 'seller-01', price: 120000, currency: 'USD',
    paymentPlan: 'contado', deliveryDate: addDays(NOW, 10), deliveryStatus: 'por-entregar',
    statusHistory: [{ status: 'por-entregar', changedAt: subDays(NOW, 2), note: 'Instalación especializada requerida.' }],
    documents: { cedula: undefined, rif: 'doc_rif.pdf', planVenta: undefined, soportePago: 'doc.pdf', contrato: undefined },
    crmDataComplete: false, contractGenerated: false, createdAt: subDays(NOW, 4),
  },
  {
    id: 'sale-16', clientId: 'c-05', equipmentId: 'eq-28', sellerId: 'seller-02', price: 55000, currency: 'USD',
    paymentPlan: 'cuotas', totalInstallments: 36, deliveryDate: subDays(NOW, 170), deliveryStatus: 'entregado',
    statusHistory: [
      { status: 'por-entregar', changedAt: subDays(NOW, 180) },
      { status: 'en-entrega', changedAt: subDays(NOW, 173) },
      { status: 'entregado', changedAt: subDays(NOW, 170) },
    ],
    documents: { cedula: undefined, rif: 'doc.pdf', planVenta: 'doc.pdf', soportePago: 'doc.pdf', contrato: 'contrato_016.pdf' },
    crmDataComplete: true, contractGenerated: true, createdAt: subDays(NOW, 185),
  },
]

let _sales: Sale[] = INITIAL_SALES.map(s => ({ ...s }))

export function getSales(): Sale[] {
  return _sales
}

export function getSaleById(id: string): Sale | undefined {
  return _sales.find(s => s.id === id)
}

export function updateSale(id: string, updates: Partial<Sale>): Sale | undefined {
  const idx = _sales.findIndex(s => s.id === id)
  if (idx === -1) return undefined
  _sales[idx] = { ..._sales[idx], ...updates }
  return _sales[idx]
}
