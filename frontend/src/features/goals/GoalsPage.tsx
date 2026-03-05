import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Plus, Trash2, ChevronRight, X, Target } from 'lucide-react'
import { goalsApi } from '@/api/goals'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import type { CreateGoalRequest, GoalStatus } from '@/types/goal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Requerido').max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().positive('Debe ser mayor a 0'),
  monthlyTargetAmount: z.coerce.number().positive().optional(),
  startDate: z.string().min(1, 'Requerido'),
  targetDate: z.string().optional(),
  icon: z.string().max(10).optional(),
  autoContribution: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

const STATUS_CONFIG: Record<GoalStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'destructive'; color: string }> = {
  IN_PROGRESS: { label: 'En progreso', variant: 'default', color: 'bg-blue-500' },
  COMPLETED: { label: 'Completada', variant: 'success', color: 'bg-emerald-500' },
  ON_HOLD: { label: 'En pausa', variant: 'warning', color: 'bg-amber-500' },
  CANCELED: { label: 'Cancelada', variant: 'destructive', color: 'bg-red-500' },
}

export default function GoalsPage() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'ALL'>('ALL')

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getAll,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { autoContribution: false },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateGoalRequest) => goalsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      cancelForm()
      toast.success('Meta creada correctamente')
    },
    onError: () => toast.error('Error al crear la meta'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Meta eliminada')
    },
    onError: () => toast.error('Error al eliminar la meta'),
  })

  function cancelForm() { setShowForm(false); reset() }

  async function onSubmit(data: FormData) {
    await createMutation.mutateAsync(data as CreateGoalRequest)
  }

  const filtered = statusFilter === 'ALL' ? goals : goals.filter((g) => g.status === statusFilter)

  const statusCounts = goals.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metas de ahorro</h1>
          <p className="text-gray-500 text-sm mt-0.5">Definí tus objetivos y seguí tu progreso</p>
        </div>
        <Button size="sm" onClick={() => { cancelForm(); setShowForm(true) }} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nueva meta
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Nueva meta</CardTitle>
            <button onClick={cancelForm} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-5 gap-3">
                <div className="col-span-1 space-y-1.5">
                  <Label className="text-gray-700 font-medium">Ícono</Label>
                  <Input placeholder="🎯" {...register('icon')} />
                </div>
                <div className="col-span-4 space-y-1.5">
                  <Label className="text-gray-700 font-medium">Nombre</Label>
                  <Input placeholder="ej. Fondo de vacaciones" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-gray-700 font-medium">Descripción (opcional)</Label>
                <Input placeholder="Descripción breve" {...register('description')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Monto objetivo</Label>
                <Input type="number" step="0.01" placeholder="5000" {...register('targetAmount')} />
                {errors.targetAmount && <p className="text-xs text-red-500">{errors.targetAmount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Meta mensual (opcional)</Label>
                <Input type="number" step="0.01" placeholder="500" {...register('monthlyTargetAmount')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Fecha de inicio</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Fecha objetivo (opcional)</Label>
                <Input type="date" {...register('targetDate')} />
              </div>
              <div className="col-span-2 flex gap-2 pt-1">
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? 'Creando…' : 'Crear meta'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={cn('px-3 py-1.5 rounded-md text-xs font-semibold transition-all', statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
          >
            Todas ({goals.length})
          </button>
          {(Object.entries(STATUS_CONFIG) as [GoalStatus, typeof STATUS_CONFIG[GoalStatus]][]).map(([s, cfg]) => (
            statusCounts[s] ? (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn('px-3 py-1.5 rounded-md text-xs font-semibold transition-all', statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
              >
                {cfg.label} ({statusCounts[s]})
              </button>
            ) : null
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Sin metas todavía</p>
            <p className="text-gray-400 text-sm mt-1">Creá tu primera meta de ahorro para empezar</p>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => { cancelForm(); setShowForm(true) }}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Crear meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => {
            const cfg = STATUS_CONFIG[g.status]
            return (
              <Card key={g.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{g.icon ?? '🎯'}</span>
                        <p className="font-semibold text-gray-900">{g.name}</p>
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      </div>
                      {g.description && <p className="text-sm text-gray-500 mb-3">{g.description}</p>}
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', cfg.color)}
                          style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatCurrency(g.currentAmount, user?.currency)} ahorrado</span>
                        <span className="font-semibold text-gray-700">
                          {g.progressPercentage.toFixed(1)}% de {formatCurrency(g.targetAmount, user?.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        to={`/goals/${g.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => { if (window.confirm(`¿Eliminar "${g.name}"?`)) deleteMutation.mutate(g.id) }}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
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
      )}
    </div>
  )
}
