import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { X, Trash2 } from 'lucide-react'
import { goalsApi } from '@/api/goals'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'
import type { CreateGoalRequest, Goal, GoalStatus } from '@/types/goal'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatCurrency, cn } from '@/lib/utils'

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

const STATUS_LABELS: Record<GoalStatus, string> = {
  IN_PROGRESS: 'En progreso',
  COMPLETED:   'Completadas',
  ON_HOLD:     'En pausa',
  CANCELED:    'Canceladas',
}

export default function GoalsPage() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'ALL'>('ALL')
  const [toDelete, setToDelete] = useState<Goal | null>(null)

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
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
      setToDelete(null)
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

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const combinedPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  const nextToFinish = [...goals]
    .filter((g) => g.status === 'IN_PROGRESS')
    .sort((a, b) => b.progressPercentage - a.progressPercentage)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">
            Metas · {statusCounts.IN_PROGRESS ?? 0} activas
          </div>
          <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1">
            Tus <em className="text-sepia">propósitos.</em>
          </h1>
        </div>
        <button
          onClick={() => { cancelForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none"
        >
          <span className="text-base leading-none">+</span> Nueva meta
        </button>
      </div>

      {showForm && (
        <section className="border border-ink rounded-md bg-paper/60 backdrop-blur-[2px] p-[22px]">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif italic font-medium text-[19px]">Nueva meta</h2>
            <button onClick={cancelForm} className="text-sepia hover:text-ink transition-colors" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-5">
            <div className="col-span-2 grid grid-cols-[80px_1fr] gap-4">
              <Input label="Ícono" placeholder="◇" {...register('icon')} />
              <div>
                <Input label="Nombre" placeholder="ej. Fondo de vacaciones" {...register('name')} />
                {errors.name && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="col-span-2">
              <Input label="Descripción" placeholder="Detalle breve" {...register('description')} />
            </div>
            <div>
              <Input label="Monto objetivo" type="number" step="0.01" placeholder="5000" {...register('targetAmount')} />
              {errors.targetAmount && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.targetAmount.message}</p>}
            </div>
            <div>
              <Input label="Meta mensual" type="number" step="0.01" placeholder="500" {...register('monthlyTargetAmount')} />
            </div>
            <div>
              <Input label="Fecha de inicio" type="date" {...register('startDate')} />
              {errors.startDate && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <Input label="Fecha objetivo" type="date" {...register('targetDate')} />
            </div>
            <div className="col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none disabled:opacity-50"
              >
                {isSubmitting ? 'Creando…' : 'Guardar ↵'}
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

      <div className="grid grid-cols-1 md:grid-cols-3 border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] overflow-hidden">
        <SummaryCell label="Total ahorrado" value={formatCurrency(totalSaved, user?.currency)} hint="entre todas las metas" />
        <SummaryCell
          label="Objetivo combinado"
          value={formatCurrency(totalTarget, user?.currency)}
          hint={`${combinedPct.toFixed(0)} % alcanzado`}
          withLeftRule
        />
        <SummaryCell
          label="Próxima en cumplir"
          value={nextToFinish?.name ?? '—'}
          hint={nextToFinish ? `${nextToFinish.progressPercentage.toFixed(0)} % completada` : 'sin metas activas'}
          primary
          withLeftRule
        />
      </div>

      <div className="flex items-baseline gap-0 border-b border-rule">
        {(['ALL', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELED'] as const).map((key) => {
          const count = key === 'ALL' ? goals.length : statusCounts[key] ?? 0
          if (key !== 'ALL' && count === 0) return null
          const active = statusFilter === key
          const label = key === 'ALL' ? 'Todas' : STATUS_LABELS[key]
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                'px-4 py-2.5 font-serif text-[15px] -mb-px border-b-2 flex items-baseline gap-2 transition-colors',
                active ? 'italic text-ink border-ink' : 'text-sepia border-transparent hover:text-ink',
              )}
            >
              {label}
              <span className="font-mono text-[10.5px] text-sepia not-italic">{count}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-md bg-sepia-soft animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="font-serif italic text-sepia text-[15px] text-center py-12">
          Sin metas todavía. <button onClick={() => setShowForm(true)} className="underline underline-offset-[3px] hover:text-ink">Creá la primera →</button>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((g) => {
            const near = g.progressPercentage >= 80
            return (
              <article key={g.id} className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[20px_22px]">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-md bg-sepia-soft flex items-center justify-center text-[24px] text-ink flex-shrink-0">
                    {g.icon ?? '◇'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link to={`/goals/${g.id}`} className="font-serif text-[19px] font-medium leading-tight hover:underline underline-offset-4 decoration-rule">
                        {g.name}
                      </Link>
                      <span className={cn('font-serif italic text-[22px] leading-none', near ? 'text-sage' : 'text-ink')}>
                        {g.progressPercentage.toFixed(0)} %
                      </span>
                    </div>
                    <div className="text-[11.5px] text-sepia mt-0.5 tracking-wide">
                      {STATUS_LABELS[g.status]}
                      {g.targetDate && ` · ETA ${new Date(g.targetDate).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })}`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-1.5 bg-sepia-soft rounded-pill overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500', near ? 'bg-sage' : 'bg-ink')}
                    style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 font-mono text-[11.5px] text-sepia">
                  <span>{formatCurrency(g.currentAmount, user?.currency)}</span>
                  <span>{formatCurrency(g.targetAmount, user?.currency)}</span>
                </div>

                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-dashed border-rule text-[12px]">
                  <span className="text-sepia">Aporte mensual</span>
                  <div className="flex items-center gap-3">
                    <span className="font-serif italic">
                      {g.monthlyTargetAmount ? formatCurrency(g.monthlyTargetAmount, user?.currency) : '—'}
                    </span>
                    <button
                      onClick={() => setToDelete(g)}
                      className="text-sepia hover:text-wine transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={
          <>
            ¿Eliminar la meta <em className="text-sepia">«{toDelete?.name}»</em>?
          </>
        }
        description={
          <>
            Vas a perder el historial de aportes ({formatCurrency(toDelete?.currentAmount ?? 0, user?.currency)} acumulados)
            y la meta entera. Esta acción no se puede deshacer.
          </>
        }
        typeToConfirm="ELIMINAR"
        confirmLabel="Eliminar meta"
        loading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  )
}

function SummaryCell({
  label, value, hint, primary, withLeftRule,
}: {
  label: string
  value: string
  hint?: string
  primary?: boolean
  withLeftRule?: boolean
}) {
  return (
    <div
      className={cn(
        'p-[18px_22px]',
        withLeftRule && 'md:border-l border-rule',
        primary && 'bg-sage/[0.06]',
      )}
    >
      <div className="text-[11px] tracking-[0.18em] uppercase text-sepia font-semibold">{label}</div>
      <div className={cn('font-serif font-normal mt-1.5 leading-[1.1] tracking-tight', primary ? 'text-[22px] text-sage' : 'text-[26px] text-ink')}>
        {value}
      </div>
      {hint && <div className="text-[11.5px] text-sepia mt-2">{hint}</div>}
    </div>
  )
}
