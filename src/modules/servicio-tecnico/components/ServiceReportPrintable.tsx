import { useEffect } from 'react'
import type { ServiceOrder } from '@/types/service-order'
import type { Equipment } from '@/types/equipment'
import type { Client } from '@/types/client'
import type { Contract } from '@/types/contract'
import type { FieldReport, ServiceTimes } from '@/types/field-report'
import type { User } from '@/types/user'
import { formatDate } from '@/lib/format'
import {
  REPORT_SERVICE_TYPE_ORDER,
  REPORT_SERVICE_TYPE_LABEL,
  getReportServiceTypeChecks,
} from '@/lib/service-type-mapping'

interface Props {
  order: ServiceOrder
  equipment: Equipment | undefined
  client: Client | undefined
  contract: Contract | undefined
  fieldReport: FieldReport
  technician: User | undefined
  onClose: () => void
}

function fmtDay(d: Date | string | undefined): string {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return ''
  return formatDate(date)
}

function row(label: string, value: string | undefined) {
  return (
    <div className="flex gap-2 text-[10px] leading-tight">
      <span className="font-semibold">{label}</span>
      <span className="flex-1 border-b border-black/60">{value ?? ''}</span>
    </div>
  )
}

function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px]">
      <span
        className="inline-block w-3 h-3 border border-black/80 text-center leading-[10px] font-semibold"
        aria-hidden
      >
        {checked ? '✕' : ''}
      </span>
      <span className="uppercase">{label}</span>
    </div>
  )
}

function TimesTable({ times }: { times: ServiceTimes | undefined }) {
  const phases: Array<{ label: string; key: keyof ServiceTimes }> = [
    { label: 'Traslado (Ida)', key: 'travelOut' },
    { label: 'Espera', key: 'wait' },
    { label: 'Trabajo', key: 'work' },
    { label: 'Traslado (Regreso)', key: 'travelReturn' },
  ]
  return (
    <table className="w-full border-collapse text-[10px]">
      <thead>
        <tr>
          <th className="border border-black/70 px-1 py-0.5 text-left">Tiempo de trabajo</th>
          {phases.map(p => (
            <th key={p.key} className="border border-black/70 px-1 py-0.5">
              {p.label}
            </th>
          ))}
          <th className="border border-black/70 px-1 py-0.5">Nota</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-black/70 px-1 py-0.5 font-semibold">Inicio</td>
          {phases.map(p => (
            <td key={p.key} className="border border-black/70 px-1 py-0.5 text-center">
              {(times?.[p.key] as { start?: string } | undefined)?.start ?? ''}
            </td>
          ))}
          <td className="border border-black/70 px-1 py-0.5" rowSpan={2}>
            {times?.note ?? ''}
          </td>
        </tr>
        <tr>
          <td className="border border-black/70 px-1 py-0.5 font-semibold">Fin</td>
          {phases.map(p => (
            <td key={p.key} className="border border-black/70 px-1 py-0.5 text-center">
              {(times?.[p.key] as { end?: string } | undefined)?.end ?? ''}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

function SignatureBlock({
  title,
  image,
  name,
  cedula,
}: {
  title: string
  image?: string
  name?: string
  cedula?: string
}) {
  return (
    <div className="flex-1 border border-black/70 p-2 text-[10px] space-y-1">
      <p className="font-semibold uppercase text-center text-[9px]">{title}</p>
      <div className="h-14 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={image} className="max-h-14 object-contain" />
        ) : (
          <span className="text-black/30 text-[9px]">— sin firma —</span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="border-b border-black/60">FIRMA</p>
        <p><span className="font-semibold">NOMBRE: </span>{name ?? ''}</p>
        <p><span className="font-semibold">C.I.: </span>{cedula ?? ''}</p>
      </div>
    </div>
  )
}

export function ServiceReportPrintable({
  order,
  equipment,
  client,
  contract,
  fieldReport,
  technician,
  onClose,
}: Props) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const checks = getReportServiceTypeChecks(order.type, contract)
  const reportNumber = `${order.id.toUpperCase()}-V${fieldReport.visitNumber.toString().padStart(2, '0')}`

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #service-report-printable, #service-report-printable * { visibility: visible !important; }
          #service-report-printable {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 8mm !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 8mm; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/60 overflow-auto p-6 flex justify-center" onClick={onClose}>
        <div
          id="service-report-printable"
          className="bg-white text-black w-[210mm] min-h-[280mm] p-6 text-[10px] shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Action bar (not printed) */}
          <div className="no-print flex justify-end gap-2 mb-3">
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded border bg-white text-black hover:bg-gray-100"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded bg-primary text-white hover:bg-primary/90"
              onClick={() => window.print()}
            >
              Imprimir / Guardar PDF
            </button>
          </div>

          <header className="flex items-start justify-between border-b border-black/70 pb-2 mb-3">
            <div>
              <p className="font-bold text-base">HOSPITALAR</p>
              <p className="text-[9px]">R.U.C. 1871037-1-717108 · D.V. 68</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-base">INFORME DE SERVICIO</p>
              <p className="font-semibold">N° {reportNumber}</p>
            </div>
          </header>

          <section className="grid grid-cols-3 gap-3 text-[10px] mb-3">
            <div>
              <span className="font-semibold">FECHA DE SOLICITUD: </span>
              <span className="border-b border-black/60 inline-block min-w-[70px]">{fmtDay(order.createdAt)}</span>
            </div>
            <div>
              <span className="font-semibold">FECHA DE REALIZACIÓN: </span>
              <span className="border-b border-black/60 inline-block min-w-[70px]">{fmtDay(fieldReport.completedAt)}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold">TERMINADO: </span>
              <Checkbox checked={order.status === 'completada'} label="SI" />
              <Checkbox checked={order.status !== 'completada'} label="NO" />
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3 mb-3">
            <div className="border border-black/70 p-2 space-y-1">
              <p className="font-bold text-[10px] uppercase border-b border-black/40 mb-1">Datos del cliente</p>
              {row('Código:', client?.id)}
              {row('Nombre:', client?.name)}
              {row('Centro hospitalario:', client?.location)}
              {row('Dirección:', `${client?.city ?? ''}${client?.country ? ' · ' + client.country.toUpperCase() : ''}`)}
              {row('Servicio/Área:', equipment?.serviceArea)}
            </div>
            <div className="border border-black/70 p-2 space-y-1">
              <p className="font-bold text-[10px] uppercase border-b border-black/40 mb-1">Datos del equipo</p>
              {row('Equipo:', equipment?.description ?? equipment?.category)}
              {row('Marca:', equipment?.brand)}
              {row('Modelo:', equipment?.model)}
              {row('# Serie:', equipment?.serialNumber)}
              {row('Activo:', equipment?.assetTag)}
            </div>
            <div className="border border-black/70 p-2">
              <p className="font-bold text-[10px] uppercase border-b border-black/40 mb-1">Tipo de servicio</p>
              <div className="space-y-0.5">
                {REPORT_SERVICE_TYPE_ORDER.map(k => (
                  <Checkbox key={k} checked={checks[k]} label={REPORT_SERVICE_TYPE_LABEL[k]} />
                ))}
              </div>
            </div>
          </section>

          <section className="border border-black/70 p-2 mb-3">
            <p className="font-bold text-[10px] uppercase mb-1">Falla reportada</p>
            <p className="min-h-[3em] whitespace-pre-wrap leading-snug">
              {fieldReport.faultReported ?? order.notes ?? ''}
            </p>
          </section>

          <section className="border border-black/70 p-2 mb-3">
            <p className="font-bold text-[10px] uppercase mb-1">Trabajo realizado</p>
            <p className="min-h-[5em] whitespace-pre-wrap leading-snug">
              {fieldReport.workPerformed ?? ''}
            </p>
          </section>

          <section className="mb-3">
            <TimesTable times={fieldReport.times} />
          </section>

          <section className="mb-3">
            <p className="font-bold text-[10px] uppercase mb-1">Repuestos utilizados</p>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="border border-black/70 px-1 py-0.5 w-24">Código</th>
                  <th className="border border-black/70 px-1 py-0.5 w-16">Cant.</th>
                  <th className="border border-black/70 px-1 py-0.5 text-left">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {(fieldReport.partsUsed ?? []).map((p, idx) => (
                  <tr key={idx}>
                    <td className="border border-black/70 px-1 py-0.5">{p.code}</td>
                    <td className="border border-black/70 px-1 py-0.5 text-center">{p.quantity}</td>
                    <td className="border border-black/70 px-1 py-0.5">{p.description}</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 4 - (fieldReport.partsUsed?.length ?? 0)) }).map((_, idx) => (
                  <tr key={`empty-${idx}`}>
                    <td className="border border-black/70 px-1 py-0.5">&nbsp;</td>
                    <td className="border border-black/70 px-1 py-0.5">&nbsp;</td>
                    <td className="border border-black/70 px-1 py-0.5">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="border border-black/70 p-2 mb-3">
            <p className="font-bold text-[10px] uppercase mb-1">Observación</p>
            <p className="min-h-[3em] whitespace-pre-wrap leading-snug">
              {fieldReport.notes ?? ''}
            </p>
          </section>

          <section className="flex gap-2 mb-3">
            <SignatureBlock
              title="Técnico o Ing. Responsable"
              image={fieldReport.technicianSignature}
              name={technician?.name}
              cedula={technician?.cedula}
            />
            <SignatureBlock
              title="Ing. o Jefe de Mantenimiento / Biomédica"
              image={
                fieldReport.clientSignatureMode === 'digital'
                  ? fieldReport.clientSignatureData
                  : undefined
              }
              name={fieldReport.clientSignerName}
              cedula={fieldReport.clientSignerCedula}
            />
            <SignatureBlock
              title="Dirección Centro / Propietario"
              image={
                fieldReport.directorSignatureMode === 'digital'
                  ? fieldReport.directorSignatureData
                  : undefined
              }
              name={fieldReport.directorSignerName}
              cedula={fieldReport.directorSignerCedula}
            />
          </section>

          <footer className="text-center text-[8px] text-black/70 border-t border-black/40 pt-1">
            <p>CASA #21, CALLE 67 ESTE, SAN FRANCISCO · REPÚBLICA DE PANAMÁ</p>
            <p>TELÉFONO: (+507) 395-1900 / (+507) 6201-6588 · info@hospitalar.com.pa · servicio.tecnico@hospitalar.com.pa · www.hospitalar.com.pa</p>
          </footer>
        </div>
      </div>
    </>
  )
}
