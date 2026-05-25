import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'

interface SignaturePadProps {
  label: string
  onChange: (dataUrl: string | undefined) => void
  value?: string
  className?: string
}

export function SignaturePad({ label, onChange, value, className }: SignaturePadProps) {
  const ref = useRef<SignatureCanvas>(null)

  function handleEnd() {
    if (ref.current && !ref.current.isEmpty()) {
      onChange(ref.current.toDataURL('image/png'))
    }
  }

  function handleClear() {
    ref.current?.clear()
    onChange(undefined)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="border rounded-md overflow-hidden bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="black"
          canvasProps={{ className: 'w-full', height: 160 }}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex justify-between items-center">
        {value ? (
          <span className="text-xs text-success font-medium">Firma capturada</span>
        ) : (
          <span className="text-xs text-muted-foreground">Firma en el recuadro de arriba</span>
        )}
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          Limpiar
        </Button>
      </div>
    </div>
  )
}
