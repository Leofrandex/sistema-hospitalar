import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export interface WizardStep {
  label: string
  description?: string
}

interface StepWizardProps {
  steps: WizardStep[]
  currentStep: number
  onNext: () => void
  onBack: () => void
  onComplete: () => void
  nextDisabled?: boolean
  completeLabel?: string
  children: React.ReactNode
}

export function StepWizard({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  nextDisabled = false,
  completeLabel = 'Completar',
  children,
}: StepWizardProps) {
  const isLast = currentStep === steps.length - 1

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                  idx < currentStep
                    ? 'bg-primary border-primary text-white'
                    : idx === currentStep
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground',
                )}
              >
                {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={cn('text-xs mt-1 whitespace-nowrap', idx === currentStep ? 'text-primary font-medium' : 'text-muted-foreground')}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 mb-4', idx < currentStep ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>{children}</div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} disabled={currentStep === 0}>
          Anterior
        </Button>
        {isLast ? (
          <Button type="button" onClick={onComplete} disabled={nextDisabled}>
            {completeLabel}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={nextDisabled}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}
