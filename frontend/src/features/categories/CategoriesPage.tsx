import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Pencil, Trash2 } from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { useToast } from '@/components/ui/use-toast'
import type { Category, CreateCategoryRequest } from '@/types/category'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatCurrency, cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Requerido').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().max(200).optional(),
})
type FormData = z.infer<typeof schema>

const GLYPHS = ['◇', '◯', '◐', '✦', '❧', '☼', '✜', '※']
function glyphFor(c: Category) {
  return GLYPHS[c.id % GLYPHS.length]
}

export default function CategoriesPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [tab, setTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { type: tab } })

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      cancelForm()
      toast.success('Categoría creada correctamente')
    },
    onError: () => toast.error('Error al crear la categoría'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      cancelForm()
      toast.success('Categoría actualizada')
    },
    onError: () => toast.error('Error al actualizar la categoría'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setToDelete(null)
      toast.success('Categoría eliminada')
    },
    onError: () => toast.error('No se puede eliminar: la categoría tiene transacciones o subcategorías asociadas'),
  })

  function startEdit(c: Category) {
    setEditing(c)
    reset({ name: c.name, type: c.type, description: c.description ?? '' })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    if (editing) await updateMutation.mutateAsync({ id: editing.id, data })
    else await createMutation.mutateAsync(data)
  }

  const expenseList = categories.filter((c) => c.type === 'EXPENSE')
  const incomeList = categories.filter((c) => c.type === 'INCOME')
  const filtered = tab === 'EXPENSE' ? expenseList : incomeList
  const rootCategories = filtered.filter((c) => !c.parentId)
  const childCategories = filtered.filter((c) => !!c.parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">
            Categorías · {categories.length} activas
          </div>
          <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1">
            Tus <em className="text-sepia">etiquetas.</em>
          </h1>
        </div>
        <button
          onClick={() => { cancelForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none"
        >
          <span className="text-base leading-none">+</span> Nueva categoría
        </button>
      </div>

      {showForm && (
        <section className="border border-ink rounded-md bg-paper/60 backdrop-blur-[2px] p-[22px]">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif italic font-medium text-[19px]">
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
            <button onClick={cancelForm} className="text-sepia hover:text-ink transition-colors" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-5">
            <div>
              <Input label="Nombre" placeholder="ej. Supermercado" {...register('name')} />
              {errors.name && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.name.message}</p>}
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
            <div className="col-span-2">
              <Input label="Descripción" placeholder="Detalle breve" {...register('description')} />
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

      <div className="flex items-baseline gap-0 border-b border-rule">
        {([
          ['EXPENSE', 'Gastos', expenseList.length] as const,
          ['INCOME', 'Ingresos', incomeList.length] as const,
        ]).map(([key, label, count]) => {
          const active = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'px-4 py-2.5 font-serif text-[15px] -mb-px border-b-2 flex items-baseline gap-2 transition-colors',
                active
                  ? 'italic text-ink border-ink'
                  : 'text-sepia border-transparent hover:text-ink',
              )}
            >
              {label}
              <span className="font-mono text-[10.5px] text-sepia not-italic">{count}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-md bg-sepia-soft animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="font-serif italic text-sepia text-[15px] text-center py-12">
          Sin categorías de {tab === 'EXPENSE' ? 'gastos' : 'ingresos'} todavía.
        </p>
      ) : (
        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px]">
          <div className="grid grid-cols-[40px_1fr_90px_130px_70px] gap-3 px-[22px] py-3 border-b border-rule text-[11px] tracking-[0.16em] uppercase text-sepia font-semibold">
            <span></span>
            <span>Categoría</span>
            <span className="text-right">Tx</span>
            <span className="text-right">Total</span>
            <span className="text-right">Acciones</span>
          </div>

          {rootCategories.map((c, i, arr) => {
            const children = childCategories.filter((ch) => ch.parentId === c.id)
            return (
              <div key={c.id}>
                <Row
                  category={c}
                  onEdit={() => startEdit(c)}
                  onDelete={() => setToDelete(c)}
                  isLast={i === arr.length - 1 && children.length === 0}
                />
                {children.map((ch, j) => (
                  <Row
                    key={ch.id}
                    category={ch}
                    indent
                    onEdit={() => startEdit(ch)}
                    onDelete={() => setToDelete(ch)}
                    isLast={i === arr.length - 1 && j === children.length - 1}
                  />
                ))}
              </div>
            )
          })}

          {childCategories
            .filter((ch) => !rootCategories.find((r) => r.id === ch.parentId))
            .map((ch, i, arr) => (
              <Row
                key={ch.id}
                category={ch}
                indent
                onEdit={() => startEdit(ch)}
                onDelete={() => setToDelete(ch)}
                isLast={i === arr.length - 1}
              />
            ))}
        </section>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={
          <>
            ¿Eliminar la categoría <em className="text-sepia">«{toDelete?.name}»</em>?
          </>
        }
        description={
          toDelete?.transactionCount
            ? <>Esta categoría tiene <strong>{toDelete.transactionCount}</strong> {toDelete.transactionCount === 1 ? 'transacción' : 'transacciones'}. El backend va a rechazar el borrado si quedan transacciones o subcategorías asociadas — primero re-asignalas.</>
            : <>Si la categoría no tiene transacciones ni subcategorías, se elimina definitivamente. No se puede deshacer.</>
        }
        typeToConfirm="ELIMINAR"
        confirmLabel="Eliminar categoría"
        loading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  )
}

function Row({
  category, indent, isLast, onEdit, onDelete,
}: {
  category: Category
  indent?: boolean
  isLast?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'group grid grid-cols-[40px_1fr_90px_130px_70px] gap-3 items-center px-[22px] py-3',
        !isLast && 'border-b border-rule-soft',
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-md',
        indent ? 'w-7 h-7 bg-transparent text-sepia text-[14px] ml-2' : 'w-8 h-8 bg-sepia-soft text-ink text-[16px]',
      )}>
        {indent ? '↳' : glyphFor(category)}
      </div>
      <div>
        <div className="font-serif text-base">{category.name}</div>
        {category.description && (
          <div className="text-[11px] text-sepia mt-0.5 truncate">{category.description}</div>
        )}
      </div>
      <span className="font-mono text-[12px] text-sepia text-right">{category.transactionCount}</span>
      <span className="font-serif text-[16px] text-right">{formatCurrency(category.totalAmount)}</span>
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="font-serif italic text-[12px] text-sepia hover:text-ink transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="text-sepia hover:text-wine transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
