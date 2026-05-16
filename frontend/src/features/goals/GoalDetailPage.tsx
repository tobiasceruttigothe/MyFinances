import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { goalsApi } from '@/api/goals'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, formatPercent, cn } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  CHART_RULE, CHART_SAGE, CHART_SEPIA,
  CHART_TICK_STYLE, CHART_GRID_PROPS, CHART_TOOLTIP_STYLE,
} from '@/lib/chart-colors'
import type { GoalStatus } from '@/types/goal'

const contributionSchema = z.object({
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  notes: z.string().max(300).optional(),
})
type ContributionForm = z.infer<typeof contributionSchema>

const STATUS_LABELS: Record<GoalStatus, string> = {
  IN_PROGRESS: 'En progreso',
  COMPLETED:   'Completada',
  ON_HOLD:     'En pausa',
  CANCELED:    'Cancelada',
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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContributionForm>({
    resolver: zodResolver(contributionSchema) as never,
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
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="text-center py-20">
        <p className="font-serif italic text-sepia text-[18px]">Meta no encontrada.</p>
        <button onClick={() => navigate(-1)} className="mt-4 font-serif italic text-sepia hover:text-ink underline underline-offset-[3px]">
          Volver
        </button>
      </div>
    )
  }

  const remaining = goal.remainingAmount
  const near = goal.progressPercentage >= 80

  const chartData = stats?.monthlyBreakdown.slice(-6).map((m) => ({
    name: m.monthLabel.slice(0, 3),
    Contribuido: m.contributed,
  })) ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="text-[11.5px] text-sepia tracking-wide">
        <Link to="/goals" className="hover:text-ink underline underline-offset-[3px]">← Metas</Link>
        <span> · {STATUS_LABELS[goal.status]}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-lg bg-sepia-soft flex items-center justify-center text-[44px] text-ink flex-shrink-0">
            {goal.icon ?? '◇'}
          </div>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">
              Meta · {STATUS_LABELS[goal.status]}
            </div>
            <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1">
              {goal.name}
            </h1>
            {goal.description && (
              <p className="font-serif italic text-[13px] text-sepia mt-1.5 max-w-md">
                «{goal.description}»
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px_26px]">
        <div className="flex items-end justify-between mb-3.5 gap-4 flex-wrap">
          <div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-sepia font-semibold">
              Ahorrado de {formatCurrency(goal.targetAmount, user?.currency)}
            </div>
            <div className="font-serif text-[44px] tracking-tight leading-none mt-1">
              {formatCurrency(goal.currentAmount, user?.currency)}
            </div>
          </div>
          <div className="text-right">
            <div className={cn('font-serif italic text-[32px] leading-none', near ? 'text-sage' : 'text-ink')}>
              {formatPercent(goal.progressPercentage)}
            </div>
            <div className="font-serif italic text-[11.5px] text-sepia mt-1">
              faltan {formatCurrency(remaining, user?.currency)}
            </div>
          </div>
        </div>
        <div className="h-2.5 bg-sepia-soft rounded-pill overflow-hidden">
          <div
            className={cn('h-full transition-all duration-700', near ? 'bg-sage' : 'bg-ink')}
            style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 mt-5 pt-3.5 border-t border-dashed border-rule">
          <Mini label="Aporte mensual" value={goal.monthlyTargetAmount ? formatCurrency(goal.monthlyTargetAmount, user?.currency) : '—'} />
          <Mini label="Fecha objetivo" value={goal.targetDate ? formatDate(goal.targetDate) : '—'} withLeftRule />
          <Mini label="Aportes hechos" value={`${contributions.length} ${contributions.length === 1 ? 'vez' : 'veces'}`} withLeftRule />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
          <h2 className="font-serif italic font-medium text-[19px] mb-4">Agregar contribución</h2>
          <form onSubmit={handleSubmit((d) => addContribution.mutate(d))} className="space-y-4">
            <div>
              <Input label="Monto" type="number" step="0.01" placeholder="500.00" {...register('amount')} />
              {errors.amount && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <Input label="Notas" placeholder="ej. Sueldo de marzo" {...register('notes')} />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none disabled:opacity-50"
            >
              <span className="text-base leading-none">+</span>
              {isSubmitting ? 'Agregando…' : 'Aporte'}
            </button>
          </form>
        </section>

        {stats && (
          <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
            <h2 className="font-serif italic font-medium text-[19px] mb-4">Estadísticas</h2>
            <div className="space-y-2">
              {[
                { label: 'Promedio mensual', value: formatCurrency(stats.averageMonthlyContribution, user?.currency) },
                { label: 'Meses con aportes', value: stats.monthsWithContributions.toString() },
                { label: 'Meses con objetivo cumplido', value: stats.monthsWithFullTarget.toString() },
                ...(stats.bestMonthLabel
                  ? [{ label: 'Mejor mes', value: `${stats.bestMonthLabel} · ${formatCurrency(stats.bestMonthAmount, user?.currency)}` }]
                  : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between border-b border-rule-soft pb-1.5 last:border-b-0">
                  <span className="text-[12px] text-sepia">{label}</span>
                  <span className="font-serif italic text-[14px]">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {chartData.length > 0 && (
        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
          <div className="flex items-baseline justify-between mb-3.5">
            <h2 className="font-serif italic font-medium text-[19px]">Trayectoria · últimos 6 meses</h2>
            {stats?.monthlyTarget && (
              <span className="text-[11px] text-sepia tracking-[0.14em] uppercase">
                Obj. {formatCurrency(stats.monthlyTarget, user?.currency)}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis dataKey="name" tick={CHART_TICK_STYLE} axisLine={{ stroke: CHART_RULE }} tickLine={false} />
              <YAxis tick={CHART_TICK_STYLE} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => formatCurrency(v as number, user?.currency)}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              {stats?.monthlyTarget && (
                <ReferenceLine
                  y={stats.monthlyTarget}
                  stroke={CHART_SEPIA}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              )}
              <Bar dataKey="Contribuido" fill={CHART_SAGE} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {contributions.length > 0 && (
        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px]">
          <div className="flex items-baseline justify-between px-[22px] py-3.5 border-b border-rule">
            <h2 className="font-serif italic font-medium text-[19px]">Aportes</h2>
            <span className="text-[11.5px] text-sepia">{contributions.length}</span>
          </div>
          <div>
            {contributions.slice().reverse().map((c, i, arr) => (
              <div
                key={c.id}
                className={cn(
                  'grid grid-cols-[90px_1fr_120px] gap-3 items-center px-[22px] py-2.5',
                  i < arr.length - 1 && 'border-b border-rule-soft',
                )}
              >
                <span className="font-mono text-[11.5px] text-sepia">{formatDate(c.contributionDate)}</span>
                <div>
                  <span className="font-serif text-[14px]">{c.notes ?? '—'}</span>
                  <span className="ml-2 text-[10.5px] uppercase tracking-[0.12em] text-sepia">{c.type}</span>
                </div>
                <span className="font-serif italic text-[16px] text-sage text-right">
                  + {formatCurrency(c.amount, user?.currency)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Mini({ label, value, withLeftRule }: { label: string; value: string; withLeftRule?: boolean }) {
  return (
    <div className={cn('px-0', withLeftRule && 'border-l border-rule-soft pl-5')}>
      <div className="text-[11px] tracking-[0.14em] uppercase text-sepia">{label}</div>
      <div className="font-serif italic text-[18px] mt-1">{value}</div>
    </div>
  )
}
