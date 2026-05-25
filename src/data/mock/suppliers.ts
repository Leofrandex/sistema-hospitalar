import type { Supplier } from '@/types/supplier'

const SUPPLIERS: Supplier[] = [
  { id: 'sup-01', name: 'GE Healthcare Latam', country: 'Colombia', contactName: 'María López', email: 'mlopez@ge.com', phone: '+57-1-555-0100', createdAt: new Date('2020-03-15') },
  { id: 'sup-02', name: 'Philips Medical Systems', country: 'Panamá', contactName: 'Carlos Vega', email: 'cvega@philips.com', phone: '+507-555-0200', createdAt: new Date('2019-08-20') },
  { id: 'sup-03', name: 'Mindray Medical Internacional', country: 'México', contactName: 'Ana Torres', email: 'atorres@mindray.com', phone: '+52-55-555-0300', createdAt: new Date('2021-01-10') },
  { id: 'sup-04', name: 'Fujifilm SonoSite Latam', country: 'Colombia', contactName: 'Luis Ríos', email: 'lrios@fujifilm.com', phone: '+57-4-555-0400', createdAt: new Date('2022-04-05') },
  { id: 'sup-05', name: 'ZOLL Medical Latinoamérica', country: 'Argentina', contactName: 'Paula Díaz', email: 'pdiaz@zoll.com', phone: '+54-11-555-0500', createdAt: new Date('2021-09-18') },
  { id: 'sup-06', name: 'Parker Laboratories Inc.', country: 'Estados Unidos', contactName: 'James Smith', email: 'jsmith@parkerlabs.com', phone: '+1-973-555-0600', createdAt: new Date('2020-11-22') },
  { id: 'sup-07', name: 'Masimo Corp. Distribuidora', country: 'Chile', contactName: 'Roberto Núñez', email: 'rnunez@masimo.com', phone: '+56-2-555-0700', createdAt: new Date('2022-07-30') },
  { id: 'sup-08', name: 'Insumos Médicos Andinos', country: 'Venezuela', contactName: 'Sofía Bermúdez', email: 'sofia@imaandinos.com', phone: '0212-555-0800', createdAt: new Date('2023-02-14') },
]

let _suppliers = [...SUPPLIERS]

export function getSuppliers(): Supplier[] {
  return _suppliers
}

export function getSupplierById(id: string): Supplier | undefined {
  return _suppliers.find(s => s.id === id)
}
