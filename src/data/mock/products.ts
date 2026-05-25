import type { Product } from '@/types/product'

const PRODUCTS: Product[] = [
  // Equipos — ultrasonido
  { id: 'prod-01', sku: 'USG-LOGIQ-E10', name: 'LOGIQ E10', brand: 'GE Healthcare', kind: 'equipo', category: 'ultrasonido', referencePrice: 48000, currency: 'USD', description: 'Ecógrafo diagnóstico premium con IA integrada' },
  { id: 'prod-02', sku: 'USG-DC80', name: 'Mindray DC-80', brand: 'Mindray', kind: 'equipo', category: 'ultrasonido', referencePrice: 28000, currency: 'USD', description: 'Ecógrafo de alto desempeño' },
  { id: 'prod-03', sku: 'USG-VOLUSON-E8', name: 'Voluson E8', brand: 'GE Healthcare', kind: 'equipo', category: 'ultrasonido', referencePrice: 62000, currency: 'USD', description: 'Ecógrafo obstétrico 4D' },
  { id: 'prod-04', sku: 'USG-EDGE-II', name: 'Sonosite Edge II', brand: 'Fujifilm', kind: 'equipo', category: 'ultrasonido', referencePrice: 22000, currency: 'USD', description: 'Ecógrafo portátil de emergencias' },

  // Equipos — rayos-x
  { id: 'prod-05', sku: 'RX-DEF656', name: 'Definium 656 HD', brand: 'GE Healthcare', kind: 'equipo', category: 'rayos-x', referencePrice: 85000, currency: 'USD', description: 'Sistema de rayos X digital HD' },
  { id: 'prod-06', sku: 'RX-DDC90', name: 'DigitalDiagnost C90', brand: 'Philips', kind: 'equipo', category: 'rayos-x', referencePrice: 95000, currency: 'USD', description: 'Sala de rayos X digital directo' },

  // Equipos — monitores
  { id: 'prod-07', sku: 'MON-MX750', name: 'IntelliVue MX750', brand: 'Philips', kind: 'equipo', category: 'monitor', referencePrice: 18500, currency: 'USD', description: 'Monitor de signos vitales multiparamétrico' },
  { id: 'prod-08', sku: 'MON-B650', name: 'CARESCAPE B650', brand: 'GE Healthcare', kind: 'equipo', category: 'monitor', referencePrice: 15000, currency: 'USD', description: 'Monitor de cuidados críticos' },

  // Equipos — desfibriladores
  { id: 'prod-09', sku: 'DEF-HSXL', name: 'HeartStart XL+', brand: 'Philips', kind: 'equipo', category: 'desfibrilador', referencePrice: 12000, currency: 'USD', description: 'Desfibrilador/monitor profesional' },
  { id: 'prod-10', sku: 'DEF-ZOLL-R', name: 'ZOLL R Series', brand: 'ZOLL Medical', kind: 'equipo', category: 'desfibrilador', referencePrice: 14500, currency: 'USD', description: 'Monitor/desfibrilador con RCP guiada' },

  // Insumos — consumibles
  { id: 'prod-11', sku: 'INS-GEL-USG', name: 'Gel conductor ecográfico 5L', brand: 'Parker Laboratories', kind: 'insumo', category: 'consumible', referencePrice: 45, currency: 'USD', description: 'Gel acústico Aquasonic 100' },
  { id: 'prod-12', sku: 'INS-PAPEL-ECG', name: 'Papel térmico ECG 50mm (caja x20)', brand: 'Nasiff', kind: 'insumo', category: 'consumible', referencePrice: 38, currency: 'USD' },
  { id: 'prod-13', sku: 'INS-ELECTR-ECG', name: 'Electrodos desechables ECG (caja x1000)', brand: '3M', kind: 'insumo', category: 'consumible', referencePrice: 55, currency: 'USD' },
  { id: 'prod-14', sku: 'INS-SPO2-SENSOR', name: 'Sensor SpO2 adulto reutilizable', brand: 'Masimo', kind: 'insumo', category: 'consumible', referencePrice: 180, currency: 'USD', description: 'Compatible Philips/GE' },
  { id: 'prod-15', sku: 'INS-BAT-DEF', name: 'Batería de repuesto desfibrilador', brand: 'Philips', kind: 'insumo', category: 'consumible', referencePrice: 220, currency: 'USD', description: 'Para HeartStart XL+ y MRx' },

  // Insumos — repuestos
  { id: 'prod-16', sku: 'REP-CABLE-PAC', name: 'Cable de paciente 5 derivaciones', brand: 'GE Healthcare', kind: 'insumo', category: 'repuesto', referencePrice: 145, currency: 'USD' },
  { id: 'prod-17', sku: 'REP-TRANSDUCTOR-C1', name: 'Transductor convexa C1-5', brand: 'Mindray', kind: 'insumo', category: 'repuesto', referencePrice: 3200, currency: 'USD', description: 'Compatible DC-70 y DC-80' },
  { id: 'prod-18', sku: 'REP-FILTRO-HEPA', name: 'Filtro HEPA ventilador (pack x5)', brand: 'Dräger', kind: 'insumo', category: 'repuesto', referencePrice: 95, currency: 'USD' },
  { id: 'prod-19', sku: 'REP-MANGUITO-NIBP', name: 'Manguito NIBP adulto reutilizable', brand: 'Philips', kind: 'insumo', category: 'repuesto', referencePrice: 65, currency: 'USD' },
  { id: 'prod-20', sku: 'INS-IMPR-USG', name: 'Papel impresora ultrasónica (rollo x10)', brand: 'Sony', kind: 'insumo', category: 'consumible', referencePrice: 42, currency: 'USD' },
]

let _products = [...PRODUCTS]

export function getProducts(): Product[] {
  return _products
}

export function getProductById(id: string): Product | undefined {
  return _products.find(p => p.id === id)
}

export function updateProduct(id: string, updates: Partial<Product>): Product | undefined {
  const idx = _products.findIndex(p => p.id === id)
  if (idx === -1) return undefined
  _products[idx] = { ..._products[idx], ...updates }
  return _products[idx]
}
