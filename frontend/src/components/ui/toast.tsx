import { useCallback, useState, type ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToastContext, type ToastContextValue, type ToastType } from './use-toast'

interface ToastEntry {
  id: string
  message: string
  type: ToastType
}

const accent: Record<ToastType, string> = {
  success: 'border-l-sage',
  error:   'border-l-wine',
  info:    'border-l-sepia',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (!open) setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value: ToastContextValue = {
    toast: addToast,
    success: (m) => addToast(m, 'success'),
    error: (m) => addToast(m, 'error'),
    info: (m) => addToast(m, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000} label="Notificaciones">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => handleOpenChange(t.id, open)}
            className={cn(
              'pointer-events-auto flex items-start gap-3 bg-paper border border-rule border-l-4',
              'rounded-sm px-4 py-3 shadow-pop',
              'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
              'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
              'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
              accent[t.type],
            )}
          >
            <ToastPrimitive.Title className="flex-1 font-serif italic text-[15px] leading-snug text-ink">
              {t.message}
            </ToastPrimitive.Title>
            <ToastPrimitive.Close
              className="text-sepia hover:text-ink transition-colors mt-0.5"
              aria-label="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full m-0 p-0 list-none outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
