import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  tone?: 'default' | 'danger'
  width?: number | string
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, tone = 'default', width = 560, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        width,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.55), transparent 60%)',
      }}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 max-h-[88vh] overflow-hidden',
        'bg-paper text-ink border rounded-lg shadow-pop',
        tone === 'danger' ? 'border-wine' : 'border-rule',
        'flex flex-col',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

function DialogHeader({
  eyebrow,
  title,
  italic,
  tone = 'default',
  showClose = true,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  italic?: React.ReactNode
  tone?: 'default' | 'danger'
  showClose?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-[26px] pt-[22px] pb-[18px] border-b border-rule', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className={cn(
            'text-[11px] tracking-[0.2em] uppercase font-semibold',
            tone === 'danger' ? 'text-wine' : 'text-sepia',
          )}>
            {eyebrow}
          </div>
        )}
        <DialogPrimitive.Title className="font-serif font-normal text-[24px] leading-tight tracking-tight mt-1.5">
          {title}
          {italic && <em className="text-sepia"> {italic}</em>}
        </DialogPrimitive.Title>
      </div>
      {showClose && (
        <DialogPrimitive.Close
          className="flex-shrink-0 w-7 h-7 rounded-full border border-rule flex items-center justify-center text-sepia hover:text-ink hover:bg-sepia-soft transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13.5px] leading-relaxed text-ink/80', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-[26px] py-5 overflow-y-auto', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 px-[22px] py-3.5 border-t border-rule bg-ink/[0.02]',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
}
