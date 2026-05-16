import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

type Variant = 'ink' | 'outline' | 'ghost' | 'danger'
type Size = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  ink:     'bg-ink text-paper rounded-pill hover:opacity-90',
  outline: 'border border-rule text-ink rounded-sm hover:bg-sepia-soft',
  ghost:   'font-serif italic text-sepia hover:text-ink',
  danger:  'bg-wine text-paper rounded-pill hover:opacity-90',
}

const sizeClasses: Record<Size, string> = {
  default: 'px-[18px] py-[11px] text-[13.5px]',
  sm:      'px-3 py-2 text-[12px]',
  lg:      'px-6 py-3 text-[15px]',
  icon:    'h-9 w-9 justify-center p-0',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'ink', size = 'default', asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 font-sans font-semibold leading-none cursor-pointer whitespace-nowrap transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {icon}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button }
