import { useState } from 'react'
import { Upload, FilePlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BulkUploadWizard } from './BulkUploadWizard'
import { IndividualEntryForm } from './IndividualEntryForm'

type Mode = 'menu' | 'bulk' | 'individual'

export default function DataLoadTab() {
  const [mode, setMode] = useState<Mode>('menu')

  if (mode === 'bulk') return <BulkUploadWizard onExit={() => setMode('menu')} />
  if (mode === 'individual') return <IndividualEntryForm onExit={() => setMode('menu')} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carga de Data"
        description="Importa la base instalada desde Excel o agrega equipos uno a uno"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('bulk')}
          className="rounded-lg border border-border p-6 text-left hover:border-primary transition-colors"
        >
          <Upload className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-semibold">Carga masiva (Excel)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sube un archivo .xlsx con la base instalada. Soporta hojas Público y Privado.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode('individual')}
          className="rounded-lg border border-border p-6 text-left hover:border-primary transition-colors"
        >
          <FilePlus className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-semibold">Agregar individualmente</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Captura un cliente + equipo + (opcional) garantía con un formulario guiado.
          </p>
        </button>
      </div>
    </div>
  )
}
