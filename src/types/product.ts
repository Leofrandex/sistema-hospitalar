export type ProductKind = 'equipo' | 'insumo'
export type ProductCategory =
  | 'ultrasonido'
  | 'rayos-x'
  | 'monitor'
  | 'desfibrilador'
  | 'consumible'
  | 'repuesto'
  | 'otros'

export interface Product {
  id: string
  sku: string
  name: string
  brand: string
  kind: ProductKind
  category: ProductCategory
  referencePrice: number
  currency: 'USD' | 'VES'
  description?: string
}
