import * as React from 'react'
import { cn } from '@/lib/utils'

type CuadernoVariant = 'sepia' | 'sage' | 'wine' | 'ink'
type LegacyVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'

export type BadgeVariant = CuadernoVariant | LegacyVariant

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const legacyAlias: Record<LegacyVariant, CuadernoVariant> = {
  default:     'ink',
  secondary:   'sepia',
  destructive: 'wine',
  success:     'sage',
  warning:     'sepia',
  outline:     'sepia',
}

const variantClasses: Record<CuadernoVariant, string> = {
  sepia: 'bg-sepia-soft text-sepia',
  sage:  'bg-sage-soft text-sage',
  wine:  'bg-wine-soft text-wine',
  ink:   'bg-ink text-paper',
}

function resolve(variant: BadgeVariant): CuadernoVariant {
  return (variant in legacyAlias) ? legacyAlias[variant as LegacyVariant] : (variant as CuadernoVariant)
}

function Badge({ className, variant = 'sepia', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold leading-none',
        variantClasses[resolve(variant)],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
