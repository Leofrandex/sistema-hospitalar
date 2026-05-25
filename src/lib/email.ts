/*
  Email stub — currently logs to console with [email:dry-run] prefix.

  To enable real email sending:
  1. Set VITE_EMAILS_ENABLED=true in .env
  2. Create a Supabase Edge Function that calls Resend:

     // supabase/functions/send-email/index.ts
     import { Resend } from 'resend'
     const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

     Deno.serve(async (req) => {
       const { to, subject, html } = await req.json()
       await resend.emails.send({ from: 'noreply@hospitalarve.com', to, subject, html })
       return new Response(JSON.stringify({ ok: true }))
     })

  3. Replace sendEmail below to call that edge function via fetch.
*/

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
}

const EMAILS_ENABLED = import.meta.env.VITE_EMAILS_ENABLED === 'true'

export const ASISTENTE_EMAIL =
  import.meta.env.VITE_ASISTENTE_EMAIL ?? 'asistente.st@hospitalarve.com'

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!EMAILS_ENABLED) {
    console.log('[email:dry-run]', JSON.stringify(payload, null, 2))
    return
  }
  // Replace with Supabase Edge Function call when ready:
  // await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
  //   body: JSON.stringify(payload),
  // })
  console.warn('[email] Emails enabled but no send implementation configured.')
}

export async function sendAnomalyAlert(params: {
  equipmentModel: string
  serialNumber: string
  technicianName: string
  notes: string
}): Promise<void> {
  return sendEmail({
    to: 'supervisores@hospitalarve.com',
    subject: `⚠️ Anomalía detectada — ${params.equipmentModel} (S/N: ${params.serialNumber})`,
    html: `
      <h2>Anomalía en revisión de equipo</h2>
      <p><strong>Equipo:</strong> ${params.equipmentModel}</p>
      <p><strong>Número de serie:</strong> ${params.serialNumber}</p>
      <p><strong>Técnico:</strong> ${params.technicianName}</p>
      <p><strong>Notas:</strong> ${params.notes}</p>
      <p>Por favor revise el módulo de Servicio Técnico para más detalles.</p>
    `,
  })
}

export async function sendPaymentReminder(params: {
  clientName: string
  clientEmail: string
  dueDate: string
  amount: number
  installmentNumber: number
  totalInstallments: number
}): Promise<void> {
  return sendEmail({
    to: params.clientEmail,
    subject: `Recordatorio de pago — Cuota ${params.installmentNumber}/${params.totalInstallments}`,
    html: `
      <h2>Recordatorio de pago — Hospitalar</h2>
      <p>Estimado/a ${params.clientName},</p>
      <p>Le recordamos que tiene un pago pendiente:</p>
      <p><strong>Cuota:</strong> ${params.installmentNumber} de ${params.totalInstallments}</p>
      <p><strong>Fecha de vencimiento:</strong> ${params.dueDate}</p>
      <p><strong>Monto:</strong> $${params.amount.toFixed(2)}</p>
      <p>Para consultas, comuníquese con el departamento de cobranzas.</p>
    `,
  })
}
