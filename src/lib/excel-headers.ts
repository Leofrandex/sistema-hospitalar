import { normalizeHeader } from '@/modules/servicio-tecnico/data-load/lib/normalize-header'

export type TargetField =
  | 'client.name'
  | 'client.notes'
  | 'client.phone'
  | 'client.email'
  | 'site.name'
  | 'site.address'
  | 'site.city'
  | 'site.contact.biomedica.name'
  | 'site.contact.biomedica.phone'
  | 'site.contact.biomedica.email'
  | 'site.contact.unidad_ejecutora.name'
  | 'site.contact.unidad_ejecutora.phone'
  | 'site.contact.unidad_ejecutora.email'
  | 'site.contact.general.name'
  | 'equipment.equipmentType'
  | 'equipment.brand'
  | 'equipment.model'
  | 'equipment.serialNumber'
  | 'equipment.peripherals'
  | 'equipment.installationDate'
  | 'equipment.dispatchDate'
  | 'equipment.serviceArea'
  | 'equipment.assetTag'
  | 'equipment.license'
  | 'equipment.ctni'
  | 'equipment.purchaseOrder'
  | 'equipment.serviceHistory[]'
  | 'contract.warrantyText'
  | 'ignore'

export const HEADERS_PRIVADO: Record<string, TargetField> = {
  [normalizeHeader('Nombre de facturación')]: 'client.name',
  [normalizeHeader('Clinica / Hospital')]: 'site.name',
  [normalizeHeader('Dirección')]: 'site.address',
  [normalizeHeader('Contacto')]: 'site.contact.general.name',
  [normalizeHeader('Teléfono')]: 'client.phone',
  [normalizeHeader('Correo electrónico')]: 'client.email',
  [normalizeHeader('Notas')]: 'client.notes',
  [normalizeHeader('Equipo')]: 'equipment.equipmentType',
  [normalizeHeader('Marca')]: 'equipment.brand',
  [normalizeHeader('Modelo')]: 'equipment.model',
  [normalizeHeader('Serie')]: 'equipment.serialNumber',
  [normalizeHeader('Periféricos')]: 'equipment.peripherals',
  [normalizeHeader('Fecha de Instalación')]: 'equipment.installationDate',
  [normalizeHeader('Fecha de Entrega')]: 'equipment.dispatchDate',
  [normalizeHeader('Garantía')]: 'contract.warrantyText',
  [normalizeHeader('Departamento')]: 'equipment.serviceArea',
  [normalizeHeader('Ubicación')]: 'site.city',
  [normalizeHeader('1era. Visita')]: 'equipment.serviceHistory[]',
  [normalizeHeader('2da. Visita')]: 'equipment.serviceHistory[]',
  [normalizeHeader('Fecha')]: 'ignore',
  [normalizeHeader('Estatus')]: 'ignore',
  [normalizeHeader('Ing. Planificado para Visita')]: 'ignore',
  [normalizeHeader('Propuesta de Mtto.')]: 'ignore',
  [normalizeHeader('Observaciones')]: 'ignore',
}

export const HEADERS_PUBLICO: Record<string, TargetField> = {
  [normalizeHeader('Institución')]: 'client.name',
  [normalizeHeader('Nombre Hospital')]: 'site.name',
  [normalizeHeader('Dirección')]: 'site.address',
  [normalizeHeader('Contacto Biomédica')]: 'site.contact.biomedica.name',
  [normalizeHeader('Teléfono Biomédica')]: 'site.contact.biomedica.phone',
  [normalizeHeader('Correo de Biomédica')]: 'site.contact.biomedica.email',
  [normalizeHeader('Contacto Unidad Ejecutora')]: 'site.contact.unidad_ejecutora.name',
  [normalizeHeader('Teléfono Unidad Ejecutora')]: 'site.contact.unidad_ejecutora.phone',
  [normalizeHeader('Correo de Unidad Ejecutora')]: 'site.contact.unidad_ejecutora.email',
  [normalizeHeader('Notas')]: 'client.notes',
  [normalizeHeader('Equipo')]: 'equipment.equipmentType',
  [normalizeHeader('Marca')]: 'equipment.brand',
  [normalizeHeader('Modelo')]: 'equipment.model',
  [normalizeHeader('Serial')]: 'equipment.serialNumber',
  [normalizeHeader('Activo')]: 'equipment.assetTag',
  [normalizeHeader('Periféricos')]: 'equipment.peripherals',
  [normalizeHeader('Licencia')]: 'equipment.license',
  [normalizeHeader('Años de Garantía')]: 'contract.warrantyText',
  [normalizeHeader('CTNI')]: 'equipment.ctni',
  [normalizeHeader('Orden de Compras')]: 'equipment.purchaseOrder',
  [normalizeHeader('Fecha de Instalación')]: 'equipment.installationDate',
  [normalizeHeader('Fecha de Entrega')]: 'equipment.dispatchDate',
  [normalizeHeader('Departamento')]: 'equipment.serviceArea',
  [normalizeHeader('Ubicación')]: 'site.city',
  [normalizeHeader('En Garantia')]: 'ignore',
  [normalizeHeader('1era. Visita')]: 'equipment.serviceHistory[]',
  [normalizeHeader('2da. Visita')]: 'equipment.serviceHistory[]',
  [normalizeHeader('3era. Visita')]: 'equipment.serviceHistory[]',
  [normalizeHeader('4ta. Visita')]: 'equipment.serviceHistory[]',
  [normalizeHeader('5ta. Visita')]: 'equipment.serviceHistory[]',
}

export function getKnownMapping(
  schema: 'publico' | 'privado',
  rawHeader: string,
): TargetField | undefined {
  const dict = schema === 'publico' ? HEADERS_PUBLICO : HEADERS_PRIVADO
  return dict[normalizeHeader(rawHeader)]
}
