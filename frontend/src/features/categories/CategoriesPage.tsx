import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Pencil, X, Tag, ArrowRight } from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { useToast } from '@/components/ui/toast'
import type { Category, CreateCategoryRequest } from '@/types/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Requerido').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().max(200).optional(),
})
type FormData = z.infer<typeof schema>

export default function CategoriesPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [tab, setTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')

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

  const filtered = categories.filter((c) => c.type === tab)
  const rootCategories = filtered.filter((c) => !c.parentId)
  const childCategories = filtered.filter((c) => !!c.parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organizá tus transacciones por categoría</p>
        </div>
        <Button size="sm" onClick={() => { cancelForm(); setShowForm(true) }} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nueva categoría
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </CardTitle>
            <button onClick={cancelForm} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Nombre</Label>
                <Input placeholder="ej. Supermercado" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
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
              <div className="col-span-2 space-y-1.5">
                <Label className="text-gray-700 font-medium">Descripción (opcional)</Label>
                <Input placeholder="Descripción breve" {...register('description')} />
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

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg w-fit">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-semibold transition-all',
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t === 'EXPENSE' ? 'Gastos' : 'Ingresos'}
            <span className={cn('ml-2 text-xs px-1.5 py-0.5 rounded-full', tab === t ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500')}>
              {filtered.length}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Sin categorías de {tab === 'EXPENSE' ? 'gastos' : 'ingresos'}</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => { cancelForm(); setShowForm(true) }}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Crear categoría
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Root categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rootCategories.map((c) => {
              const children = childCategories.filter((ch) => ch.parentId === c.id)
              return (
                <Card key={c.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        {c.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[11px]">
                            {c.transactionCount} transacciones
                          </Badge>
                          <span className="text-xs font-medium text-gray-600">{formatCurrency(c.totalAmount)}</span>
                        </div>
                        {children.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {children.map((ch) => (
                              <div key={ch.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                <span>{ch.name}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-400">{ch.transactionCount} trans.</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-3 flex-shrink-0">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`¿Eliminar "${c.name}"?`)) deleteMutation.mutate(c.id) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Orphan child categories (edge case) */}
          {childCategories.filter((ch) => !rootCategories.find((r) => r.id === ch.parentId)).length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Subcategorías</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {childCategories
                  .filter((ch) => !rootCategories.find((r) => r.id === ch.parentId))
                  .map((c) => (
                    <Card key={c.id} className="border-gray-100 shadow-sm">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <Badge variant="secondary" className="text-[11px] mt-1">{c.transactionCount} trans.</Badge>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { if (window.confirm(`¿Eliminar "${c.name}"?`)) deleteMutation.mutate(c.id) }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
