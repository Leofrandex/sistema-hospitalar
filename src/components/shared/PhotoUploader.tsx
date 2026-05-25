import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'

interface PhotoUploaderProps {
  label: string
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  required?: boolean
  className?: string
}

export function PhotoUploader({ label, value, onChange, maxFiles = 10, required, className }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f))
    onChange([...value, ...newUrls].slice(0, maxFiles))
  }

  function handleRemove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Upload trigger */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={value.length >= maxFiles}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 transition-colors text-sm',
          value.length >= maxFiles
            ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border hover:border-primary hover:text-primary cursor-pointer',
        )}
      >
        <Upload className="h-4 w-4" />
        {value.length >= maxFiles ? 'Límite alcanzado' : `Agregar fotos (${value.length}/${maxFiles})`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Thumbnail grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-border">
              <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {required && value.length === 0 && (
        <p className="text-xs text-destructive">Mínimo 1 foto requerida</p>
      )}
    </div>
  )
}
