import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Pencil, X, TrendingUp, TrendingDown, Briefcase } from 'lucide-react'
import { investmentsApi } from '@/api/investments'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import type { CreateInvestmentRequest, Investment } from '@/types/investment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

const INVESTMENT_TYPES = [
  { value: 'ACCION', label: 'Acciones' },
  { value: 'BONO', label: 'Bonos' },
  { value: 'PLAZO_FIJO', label: 'Plazo Fijo' },
  { value: 'CRYPTO', label: 'Criptomonedas' },
  { value: 'FONDO', label: 'Fondos de Inversión' },
  { value: 'ETF', label: 'ETF' },
  { value: 'INMUEBLE', label: 'Inmuebles' },
  { value: 'CEDEAR', label: 'CEDEARs' },
  { value: 'DIVISA', label: 'Divisas/Forex' },
  { value: 'COMMODITIES', label: 'Commodities' },
  { value: 'OTRO', label: 'Otro' },
]

const schema = z.object({
  type: z.string().min(1, 'Requerido'),
  description: z.string().min(1, 'Requerido').max(200),
  initialCapital: z.coerce.number().positive('Debe ser mayor a 0'),
  currentCapital: z.coerce.number().min(0, 'No puede ser negativo'),
  notes: z.string().max(500).optional(),
  createLinkedTransaction: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export default function InvestmentsPage() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)

  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: investmentsApi.getAll,
  })

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ['investments', 'portfolio'],
    queryFn: investmentsApi.getPortfolioSummary,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { createLinkedTransaction: false, type: 'ACCION' },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateInvestmentRequest) => investmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investments'] })
      qc.invalidateQueries({ queryKey: ['account', 'summary'] })
      cancelForm()
      toast.success('Inversión creada correctamente')
    },
    onError: () => toast.error('Error al crear la inversión'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => investmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investments'] })
      qc.invalidateQueries({ queryKey: ['account', 'summary'] })
      cancelForm()
      toast.success('Inversión actualizada')
    },
    onError: () => toast.error('Error al actualizar la inversión'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => investmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investments'] })
      qc.invalidateQueries({ queryKey: ['account', 'summary'] })
      toast.success('Inversión eliminada')
    },
    onError: () => toast.error('Error al eliminar la inversión'),
  })

  function startEdit(inv: Investment) {
    setEditing(inv)
    reset({
      type: inv.type,
      description: inv.description,
      initialCapital: inv.initialCapital,
      currentCapital: inv.currentCapital,
      notes: inv.notes ?? '',
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    if (editing) await updateMutation.mutateAsync({ id: editing.id, data })
    else await createMutation.mutateAsync(data as CreateInvestmentRequest)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inversiones</h1>
          <p className="text-gray-500 text-sm mt-0.5">Seguí el rendimiento de tu portafolio</p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(true) }} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nueva inversión
        </Button>
      </div>

      {/* Portfolio summary */}
      {loadingPortfolio ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : portfolio && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium">Total invertido</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(portfolio.totalInvested, user?.currency)}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium">Valor actual</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(portfolio.totalCurrentValue, user?.currency)}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium">Ganancia/Pérdida</p>
              <p className={cn('text-xl font-bold', portfolio.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {formatCurrency(portfolio.totalProfit, user?.currency)}
              </p>
            </CardContent>
          </Card>
          <Card className={cn('shadow-sm border-gray-100', portfolio.overallROI >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
            <CardContent className="p-4">
              <p className={cn('text-xs mb-1 font-medium', portfolio.overallROI >= 0 ? 'text-emerald-600' : 'text-red-600')}>ROI Total</p>
              <p className={cn('text-xl font-bold', portfolio.overallROI >= 0 ? 'text-emerald-700' : 'text-red-600')}>
                {formatPercent(portfolio.overallROI)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">
              {editing ? 'Editar inversión' : 'Nueva inversión'}
            </CardTitle>
            <button onClick={cancelForm} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Tipo de inversión</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  {...register('type')}
                >
                  {INVESTMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-gray-700 font-medium">Descripción</Label>
                <Input placeholder="ej. Acciones de Apple Inc." {...register('description')} />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Capital inicial</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('initialCapital')} />
                {errors.initialCapital && <p className="text-xs text-red-500">{errors.initialCapital.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Capital actual</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('currentCapital')} />
                {errors.currentCapital && <p className="text-xs text-red-500">{errors.currentCapital.message}</p>}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-gray-700 font-medium">Notas (opcional)</Label>
                <Input placeholder="Notas adicionales" {...register('notes')} />
              </div>
              {!editing && (
                <div className="col-span-2 flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <input type="checkbox" id="linked" {...register('createLinkedTransaction')} className="rounded accent-blue-600" />
                  <label htmlFor="linked" className="text-sm text-blue-700 font-medium cursor-pointer">
                    Crear transacción de gasto vinculada automáticamente
                  </label>
                </div>
              )}
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

      {/* Investment list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : investments.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Sin inversiones todavía</p>
            <p className="text-gray-400 text-sm mt-1">Agregá tu primera inversión para empezar a seguir tu portafolio</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => { cancelForm(); setShowForm(true) }}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nueva inversión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investments.map((inv) => {
            const profit = inv.currentCapital - inv.initialCapital
            const positive = profit >= 0
            const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label ?? inv.type
            return (
              <Card key={inv.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-1.5 text-xs font-semibold">{typeLabel}</Badge>
                      <p className="font-semibold text-gray-900 truncate">{inv.description}</p>
                      {inv.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{inv.notes}</p>}
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => startEdit(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('¿Eliminar esta inversión?')) deleteMutation.mutate(inv.id) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Invertido</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.initialCapital, user?.currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Actual</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.currentCapital, user?.currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">P&L</p>
                      <div className={cn('flex items-center gap-1 text-sm font-bold', positive ? 'text-emerald-600' : 'text-red-500')}>
                        {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {formatPercent(inv.roi)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
