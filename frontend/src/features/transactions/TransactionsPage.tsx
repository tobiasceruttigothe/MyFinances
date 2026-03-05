import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Pencil, X, Search, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionsApi } from '@/api/transactions'
import { categoriesApi } from '@/api/categories'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import type { CreateTransactionRequest, Transaction } from '@/types/transaction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableRowSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const schema = z.object({
  description: z.string().min(1, 'Requerido').max(100),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.coerce.number().min(1, 'Seleccioná una categoría'),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
})
type FormData = z.infer<typeof schema>

export default function TransactionsPage() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
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
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      transactionsApi.update(id, data),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-500 text-sm mt-0.5">Administrá tus ingresos y gastos</p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(true) }} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nueva transacción
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">
              {editing ? 'Editar transacción' : 'Nueva transacción'}
            </CardTitle>
            <button onClick={cancelForm} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-gray-700 font-medium">Descripción</Label>
                <Input placeholder="ej. Supermercado" {...register('description')} />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Monto</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('amount')} />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Tipo</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  {...register('type')}
                >
                  <option value="EXPENSE">Gasto</option>
                  <option value="INCOME">Ingreso</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Categoría</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  {...register('categoryId')}
                >
                  <option value="">Seleccioná una categoría</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Fecha (opcional)</Label>
                <Input type="datetime-local" {...register('date')} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-gray-700 font-medium">Notas (opcional)</Label>
                <Input placeholder="Notas adicionales" {...register('notes')} />
              </div>

              <div className="col-span-2 flex gap-2 pt-1">
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? 'Guardando…' : editing ? 'Actualizar' : 'Crear'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                filterType === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {f === 'ALL' ? 'Todas' : f === 'INCOME' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Buscar transacción…"
            className="pl-9 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} transacciones</span>
      </div>

      {/* List */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => <TableRowSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowLeftRight className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Sin transacciones</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Probá con otra búsqueda' : 'Creá tu primera transacción'}
            </p>
            {!search && (
              <Button
                size="sm"
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => { cancelForm(); setShowForm(true) }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nueva transacción
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center px-5 py-4 hover:bg-gray-50/60 transition-colors group">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                  style={{ backgroundColor: t.type === 'INCOME' ? '#d1fae5' : '#fee2e2' }}
                >
                  {t.type === 'INCOME'
                    ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                    : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{formatDate(t.date)}</span>
                    <Badge variant="secondary" className="text-[11px] py-0">{t.categoryName}</Badge>
                  </div>
                </div>
                <span className={cn('text-sm font-bold mx-4', t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500')}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${t.description}"?`)) deleteMutation.mutate(t.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
