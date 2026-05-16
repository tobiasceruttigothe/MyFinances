import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  wrapClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapClassName, label, type, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full font-serif text-[17px] bg-transparent outline-none px-0 py-1.5',
          'border-b border-rule focus:border-ink transition-colors',
          'placeholder:text-sepia placeholder:italic',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )

    if (!label) return input

    return (
      <div className={cn('flex flex-col', wrapClassName)}>
        <span className="text-[10.5px] uppercase tracking-[0.14em] text-sepia font-semibold mb-1.5">
          {label}
        </span>
        {input}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
