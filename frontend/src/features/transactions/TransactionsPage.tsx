import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Pencil, Trash2 } from 'lucide-react'
import { transactionsApi } from '@/api/transactions'
import { categoriesApi } from '@/api/categories'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import type { CreateTransactionRequest, Transaction } from '@/types/transaction'
import { Input } from '@/components/ui/input'
import { TableRowSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, cn } from '@/lib/utils'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const schema = z.object({
  description: z.string().min(1, 'Requerido').max(100),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.coerce.number().min(1, 'Seleccioná una categoría'),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
})
type FormData = z.infer<typeof schema>

type Filter = 'ALL' | 'INCOME' | 'EXPENSE'
const FILTER_LABELS: Record<Filter, string> = { ALL: 'Todas', INCOME: 'Ingresos', EXPENSE: 'Gastos' }

function dayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`
}

function timeLabel(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function TransactionsPage() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getAll,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { type: 'EXPENSE' },
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['account', 'summary'] })
      setShowForm(false)
      reset()
      toast.success('Transacción creada correctamente')
    },
    onError: () => toast.error('Error al crear la transacción'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => transactionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['account', 'summary'] })
      setEditing(null)
      reset()
      setShowForm(false)
      toast.success('Transacción actualizada')
    },
    onError: () => toast.error('Error al actualizar la transacción'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['account', 'summary'] })
      toast.success('Transacción eliminada')
    },
    onError: () => toast.error('Error al eliminar la transacción'),
  })

  function startEdit(t: Transaction) {
    setEditing(t)
    reset({
      description: t.description,
      amount: t.amount,
      type: t.type,
      categoryId: t.categoryId,
      notes: t.notes ?? '',
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data })
    } else {
      await createMutation.mutateAsync(data as CreateTransactionRequest)
    }
  }

  const filtered = transactions
    .filter((t) => filterType === 'ALL' || t.type === filterType)
    .filter((t) => !search || t.description.toLowerCase().includes(search.toLowerCase()))

  const grouped = filtered.reduce<Record<string, { label: string; items: Transaction[] }>>((acc, t) => {
    const k = dayKey(t.date)
    if (!acc[k]) acc[k] = { label: dayLabel(t.date), items: [] }
    acc[k].items.push(t)
    return acc
  }, {})

  const currentMonth = MONTHS[new Date().getMonth()]

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">Cuaderno</div>
          <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1">
            Transacciones <em className="text-sepia">de {currentMonth}</em>
          </h1>
        </div>
        <button
          onClick={() => { cancelForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none"
        >
          <span className="text-base leading-none">+</span> Nueva transacción
        </button>
      </div>

      {showForm && (
        <section className="border border-ink rounded-md bg-paper/60 backdrop-blur-[2px] p-[22px]">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif italic font-medium text-[19px]">
              {editing ? 'Editar transacción' : 'Anotar una transacción'}
            </h2>
            <button onClick={cancelForm} className="text-sepia hover:text-ink transition-colors" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <Input label="Descripción" placeholder="ej. Café con leche" {...register('description')} />
              {errors.description && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <Input label="Monto" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.amount.message}</p>}
            </div>

            <div className="flex flex-col">
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-sepia font-semibold mb-1.5">Tipo</span>
              <select
                className="font-serif text-[17px] bg-transparent outline-none px-0 py-1.5 border-b border-rule focus:border-ink transition-colors"
                {...register('type')}
              >
                <option value="EXPENSE">Gasto</option>
                <option value="INCOME">Ingreso</option>
              </select>
            </div>

            <div className="flex flex-col">
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-sepia font-semibold mb-1.5">Categoría</span>
              <select
                className="font-serif text-[17px] bg-transparent outline-none px-0 py-1.5 border-b border-rule focus:border-ink transition-colors"
                {...register('categoryId')}
              >
                <option value="">Seleccioná una categoría</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <Input label="Fecha" type="datetime-local" {...register('date')} />
            </div>

            <div className="col-span-2">
              <Input label="Notas" placeholder="Detalles adicionales" {...register('notes')} />
            </div>

            <div className="col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando…' : editing ? 'Actualizar' : 'Guardar ↵'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="font-serif italic text-sepia hover:text-ink transition-colors text-[14px]"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="flex items-baseline gap-6 flex-wrap">
        <div className="flex items-baseline gap-5">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => {
            const active = filterType === f
            return (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={cn(
                  'font-serif text-[14px] transition-colors',
                  active
                    ? 'italic text-ink underline underline-offset-4 decoration-gold'
                    : 'text-sepia hover:text-ink',
                )}
              >
                {FILTER_LABELS[f]}
              </button>
            )
          })}
        </div>
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Buscar transacción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-[11.5px] text-sepia ml-auto font-mono">
          {filtered.length} mov.
        </span>
      </div>

      <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px]">
        {isLoading ? (
          <>{[...Array(6)].map((_, i) => <TableRowSkeleton key={i} />)}</>
        ) : filtered.length === 0 ? (
          <p className="font-serif italic text-sepia text-[15px] text-center py-12">
            {search ? 'Nada coincide con esa búsqueda.' : 'La página del mes está en blanco.'}
          </p>
        ) : (
          <div>
            {Object.entries(grouped).map(([k, group]) => {
              const dayNet = group.items.reduce((s, t) => s + (t.type === 'INCOME' ? t.amount : -t.amount), 0)
              return (
                <div key={k}>
                  <div className="flex items-baseline justify-between px-[22px] py-2.5 border-b border-rule">
                    <span className="text-[11px] tracking-[0.18em] uppercase text-sepia font-semibold">{group.label}</span>
                    <span className={cn('font-mono text-[11.5px]', dayNet >= 0 ? 'text-sage' : 'text-ink')}>
                      Neto {dayNet >= 0 ? '+ ' : '− '}
                      {formatCurrency(Math.abs(dayNet), user?.currency)}
                    </span>
                  </div>
                  {group.items.map((t, i, arr) => (
                    <div
                      key={t.id}
                      className={cn(
                        'group grid grid-cols-[70px_1fr_160px_140px_60px] gap-4 items-center px-[22px] py-2.5',
                        i < arr.length - 1 && 'border-b border-rule-soft',
                      )}
                    >
                      <span className="font-mono text-[11.5px] text-sepia">{timeLabel(t.date)}</span>
                      <span className="font-serif text-base truncate">{t.description}</span>
                      <span className="text-[11.5px] text-sepia truncate">{t.categoryName}</span>
                      <span className={cn('font-serif text-[18px] text-right', t.type === 'INCOME' ? 'text-sage' : 'text-ink')}>
                        {t.type === 'INCOME' ? '+ ' : '− '}
                        {formatCurrency(t.amount, user?.currency)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => startEdit(t)}
                          className="p-1 text-sepia hover:text-ink transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar "${t.description}"?`)) deleteMutation.mutate(t.id)
                          }}
                          className="p-1 text-sepia hover:text-wine transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
