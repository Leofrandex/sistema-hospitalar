import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'

interface FileDropzoneProps {
  label: string
  accept?: string
  value?: string
  onChange?: (url: string | undefined) => void
  className?: string
}

export function FileDropzone({ label, accept = '.pdf,.jpg,.jpeg,.png', value, onChange, className }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | undefined>(value ? label : undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const url = URL.createObjectURL(file)
    setFileName(file.name)
    onChange?.(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    setFileName(undefined)
    onChange?.(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasFile = !!fileName || !!value

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      />
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border-2 border-dashed p-3 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          hasFile ? 'border-success/50 bg-success/5' : 'hover:border-muted-foreground/40',
        )}
      >
        {hasFile ? (
          <>
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-success truncate">{fileName ?? label}</p>
              <p className="text-xs text-muted-foreground">Documento cargado</p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleRemove}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-md bg-muted p-2 shrink-0">
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{label}</p>
              <p className="text-xs text-muted-foreground">Arrastra aquí o haz clic para seleccionar</p>
            </div>
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          </>
        )}
      </div>
    </div>
  )
}
