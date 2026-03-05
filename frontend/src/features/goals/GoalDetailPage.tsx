import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Target } from 'lucide-react'
import { goalsApi } from '@/api/goals'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { cn } from '@/lib/utils'

const contributionSchema = z.object({
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  notes: z.string().max(300).optional(),
})
type ContributionForm = z.infer<typeof contributionSchema>

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'destructive'; bar: string }> = {
  IN_PROGRESS: { label: 'En progreso', variant: 'default', bar: 'bg-blue-500' },
  COMPLETED: { label: 'Completada', variant: 'success', bar: 'bg-emerald-500' },
  ON_HOLD: { label: 'En pausa', variant: 'warning', bar: 'bg-amber-500' },
  CANCELED: { label: 'Cancelada', variant: 'destructive', bar: 'bg-red-500' },
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const goalId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()

  const { data: goal, isLoading: loadingGoal } = useQuery({
    queryKey: ['goals', goalId],
    queryFn: () => goalsApi.getById(goalId),
  })

  const { data: stats } = useQuery({
    queryKey: ['goals', goalId, 'statistics'],
    queryFn: () => goalsApi.getStatistics(goalId),
  })

  const { data: contributions = [] } = useQuery({
    queryKey: ['goals', goalId, 'contributions'],
    queryFn: () => goalsApi.getContributions(goalId),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContributionForm>({
    resolver: zodResolver(contributionSchema) as any,
  })

  const addContribution = useMutation({
    mutationFn: (data: ContributionForm) =>
      goalsApi.addContribution(goalId, { amount: data.amount, notes: data.notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId] })
      qc.invalidateQueries({ queryKey: ['goals', goalId, 'statistics'] })
      qc.invalidateQueries({ queryKey: ['goals', goalId, 'contributions'] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      reset()
      toast.success('Contribución agregada')
    },
    onError: () => toast.error('Error al agregar la contribución'),
  })

  if (loadingGoal) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Target className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-gray-500 font-medium">Meta no encontrada</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-blue-500 hover:underline">
          Volver
        </button>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG['IN_PROGRESS']

  const chartData = stats?.monthlyBreakdown.slice(-6).map((m) => ({
    name: m.monthLabel.slice(0, 3),
    Contribuido: m.contributed,
    Objetivo: m.monthlyTarget,
  })) ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {goal.icon ?? '🎯'} {goal.name}
        </h1>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 mb-1 font-medium">Ahorrado</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(goal.currentAmount, user?.currency)}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">Objetivo</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(goal.targetAmount, user?.currency)}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 mb-1 font-medium">Progreso</p>
            <p className="text-xl font-bold text-emerald-700">{formatPercent(goal.progressPercentage)}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">Faltante</p>
            <p className="text-xl font-bold text-gray-700">{formatCurrency(goal.remainingAmount, user?.currency)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex justify-between text-sm mb-3 text-gray-600">
            <span className="font-medium">{formatCurrency(goal.currentAmount, user?.currency)}</span>
            <span className="font-semibold text-gray-900">{formatPercent(goal.progressPercentage)} completado</span>
            <span className="font-medium">{formatCurrency(goal.targetAmount, user?.currency)}</span>
          </div>
          <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', cfg.bar)}
              style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
            />
          </div>
          {goal.targetDate && (
            <p className="text-xs text-gray-400 mt-2.5">Fecha objetivo: {formatDate(goal.targetDate)}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Add contribution */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Agregar contribución</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit((d) => addContribution.mutate(d))} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Monto</Label>
                <Input type="number" step="0.01" placeholder="500.00" className="bg-white border-gray-200" {...register('amount')} />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Notas (opcional)</Label>
                <Input placeholder="ej. Ahorrado del sueldo de marzo" className="bg-white border-gray-200" {...register('notes')} />
              </div>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                {isSubmitting ? 'Agregando…' : 'Agregar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
                { label: 'Promedio mensual', value: formatCurrency(stats.averageMonthlyContribution, user?.currency) },
                { label: 'Meses con contribuciones', value: stats.monthsWithContributions.toString() },
                { label: 'Meses con objetivo cumplido', value: stats.monthsWithFullTarget.toString() },
                ...(stats.bestMonthLabel ? [{ label: 'Mejor mes', value: `${stats.bestMonthLabel} (${formatCurrency(stats.bestMonthAmount, user?.currency)})` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly chart */}
      {chartData.length > 0 && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">Contribuciones mensuales (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => formatCurrency(v as number, user?.currency)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                {stats?.monthlyTarget && (
                  <ReferenceLine y={stats.monthlyTarget} stroke="#3b82f6" strokeDasharray="4 2" label={{ value: 'Objetivo', fontSize: 11, fill: '#3b82f6' }} />
                )}
                <Bar dataKey="Contribuido" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Contribution history */}
      {contributions.length > 0 && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Historial de contribuciones</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {contributions.slice().reverse().map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(c.contributionDate)}</p>
                    {c.notes && <p className="text-xs text-gray-400 mt-0.5">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                    <span className="text-sm font-bold text-emerald-600">+{formatCurrency(c.amount, user?.currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
