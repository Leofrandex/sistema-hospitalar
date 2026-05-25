import type { ServiceOrderType } from '@/types/service-order'
import type { Contract } from '@/types/contract'

export type ReportServiceType =
  | 'instalacion'
  | 'garantia'
  | 'contrato-mantenimiento'
  | 'reparacion-correctivo'
  | 'montaje-desmontaje'
  | 'revision-diagnostico'
  | 'retiro-entrega'
  | 'demostracion'
  | 'entrenamiento'
  | 'preventivo'
  | 'otros'

export const REPORT_SERVICE_TYPE_LABEL: Record<ReportServiceType, string> = {
  instalacion: 'INSTALACIÓN',
  garantia: 'GARANTÍA',
  'contrato-mantenimiento': 'CONTRATO MANTENIMIENTO',
  'reparacion-correctivo': 'REPARACIÓN/ MANT. CORRECTIVO',
  'montaje-desmontaje': 'MONTAJE/DESMONTAJE',
  'revision-diagnostico': 'REVISIÓN/DIAGNÓSTICO',
  'retiro-entrega': 'RETIRO/ENTREGA',
  demostracion: 'DEMOSTRACIÓN',
  entrenamiento: 'ENTRENAMIENTO',
  preventivo: 'MANT. PREVENTIVO',
  otros: 'OTROS',
}

export const REPORT_SERVICE_TYPE_ORDER: ReportServiceType[] = [
  'instalacion',
  'garantia',
  'contrato-mantenimiento',
  'reparacion-correctivo',
  'montaje-desmontaje',
  'revision-diagnostico',
  'retiro-entrega',
  'demostracion',
  'entrenamiento',
  'preventivo',
  'otros',
]

export function getReportServiceTypeChecks(
  orderType: ServiceOrderType,
  contract: Contract | undefined,
): Record<ReportServiceType, boolean> {
  const checks = Object.fromEntries(
    REPORT_SERVICE_TYPE_ORDER.map(k => [k, false]),
  ) as Record<ReportServiceType, boolean>

  switch (orderType) {
    case 'instalacion':
      checks.instalacion = true
      break
    case 'preventivo':
      checks.preventivo = true
      if (contract && contract.status === 'activo') {
        checks['contrato-mantenimiento'] = true
      }
      break
    case 'correctivo':
      checks['reparacion-correctivo'] = true
      break
    case 'revision-fabrica':
    case 'predictivo':
      checks['revision-diagnostico'] = true
      break
  }
  return checks
}
