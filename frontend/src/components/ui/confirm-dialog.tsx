import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eyebrow?: string
  title: React.ReactNode
  italicTitle?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  typeToConfirm?: string
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  italicTitle,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  typeToConfirm,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  const requiresTyping = Boolean(typeToConfirm)
  const matches = !requiresTyping || typed.trim() === typeToConfirm
  const canConfirm = matches && !loading

  const confirmClass =
    tone === 'danger'
      ? 'bg-wine text-paper rounded-pill px-[18px] py-[10px]'
      : 'bg-ink text-paper rounded-pill px-[18px] py-[10px]'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent tone={tone} width={460}>
        <DialogHeader
          eyebrow={eyebrow ?? (tone === 'danger' ? 'Acción permanente' : undefined)}
          title={title}
          italic={italicTitle}
          tone={tone}
        />
        <DialogBody className="space-y-4">
          {description && <DialogDescription>{description}</DialogDescription>}
          {requiresTyping && (
            <div className="border border-dashed border-wine rounded-md bg-wine-soft px-4 py-3">
              <div className="text-[11px] tracking-[0.14em] uppercase text-wine font-semibold mb-1.5">
                Escribí <span className="font-mono tracking-wider">{typeToConfirm}</span> para confirmar
              </div>
              <input
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="w-full bg-transparent outline-none font-mono text-[16px] tracking-wider border-b border-wine pb-1 text-ink placeholder:text-wine/50"
                placeholder={typeToConfirm}
                aria-label={`Escribí ${typeToConfirm} para confirmar`}
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <button
              type="button"
              className="font-serif italic text-[14px] text-sepia hover:text-ink transition-colors px-3 py-2"
            >
              {cancelLabel}
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={() => { if (canConfirm) onConfirm() }}
            disabled={!canConfirm}
            className={`${confirmClass} text-[13.5px] font-semibold leading-none disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
