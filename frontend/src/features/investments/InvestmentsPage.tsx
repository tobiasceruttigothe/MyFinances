import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Pencil, Trash2 } from 'lucide-react'
import { investmentsApi } from '@/api/investments'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import type { CreateInvestmentRequest, Investment } from '@/types/investment'
import { Input } from '@/components/ui/input'
import { CardSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'

const INVESTMENT_TYPES = [
  { value: 'ACCION',      label: 'Acciones' },
  { value: 'BONO',        label: 'Bonos' },
  { value: 'PLAZO_FIJO',  label: 'Plazo Fijo' },
  { value: 'CRYPTO',      label: 'Criptomonedas' },
  { value: 'FONDO',       label: 'Fondos de Inversión' },
  { value: 'ETF',         label: 'ETF' },
  { value: 'INMUEBLE',    label: 'Inmuebles' },
  { value: 'CEDEAR',      label: 'CEDEARs' },
  { value: 'DIVISA',      label: 'Divisas/Forex' },
  { value: 'COMMODITIES', label: 'Commodities' },
  { value: 'OTRO',        label: 'Otro' },
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

// Placeholder sparkline: hasta que el backend exponga history, derivamos una
// trayectoria deterministica del id (semilla) y el roi (pendiente).
function syntheticSpark(seed: number, slope: number, count = 12): number[] {
  const pts: number[] = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const drift = slope * t
    const noise = Math.sin(seed * 1.7 + i * 0.9) * Math.max(Math.abs(slope) * 0.15, 0.8)
    pts.push(drift + noise)
  }
  return pts
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 80, h = 22
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ')
  const lastY = h - ((data[data.length - 1] - min) / range) * h
  const stroke = positive ? 'var(--color-sage)' : 'var(--color-wine)'
  return (
    <svg width={w} height={h} aria-hidden style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={lastY} r={1.8} fill={stroke} />
    </svg>
  )
}

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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
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

  const totalCurrent = portfolio?.totalCurrentValue ?? 0
  const overallPositive = (portfolio?.overallROI ?? 0) >= 0

  return (
    <div
      data-mode="tinta"
      className="-mx-11 -my-8 px-11 py-8 min-h-[calc(100vh-0px)] bg-paper text-ink"
    >
      <div className="space-y-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">
              Portafolio · {investments.length} {investments.length === 1 ? 'posición' : 'posiciones'}
            </div>
            <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1.5">
              Tu portafolio{' '}
              {portfolio ? (
                <em className={cn('not-italic font-serif italic', overallPositive ? 'text-sage' : 'text-wine')}>
                  rinde {formatPercent(portfolio.overallROI)}.
                </em>
              ) : (
                <em className="text-sepia">en revisión.</em>
              )}
            </h1>
          </div>
          <button
            onClick={() => { cancelForm(); setShowForm(true) }}
            className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none"
          >
            <span className="text-base leading-none">+</span> Nueva posición
          </button>
        </div>

        {loadingPortfolio ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 border border-rule rounded-md bg-paper-2/40 overflow-hidden">
            <StatCell label="Invertido" value={formatCurrency(portfolio.totalInvested, user?.currency)} hint="capital colocado" />
            <StatCell
              label="Valor actual"
              value={formatCurrency(portfolio.totalCurrentValue, user?.currency)}
              hint={`${portfolio.totalInvestments} ${portfolio.totalInvestments === 1 ? 'activo' : 'activos'}`}
              withLeftRule
            />
            <StatCell
              label="Ganancia bruta"
              value={`${overallPositive ? '+ ' : '− '}${formatCurrency(Math.abs(portfolio.totalProfit), user?.currency)}`}
              hint={`ROI ${formatPercent(portfolio.overallROI)}`}
              primary
              positive={overallPositive}
              withLeftRule
            />
          </div>
        )}

        {showForm && (
          <section className="border border-ink rounded-md bg-paper-2/60 p-[22px]">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif italic font-medium text-[19px]">
                {editing ? 'Editar posición' : 'Nueva posición'}
              </h2>
              <button onClick={cancelForm} className="text-sepia hover:text-ink transition-colors" aria-label="Cerrar">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-5">
              <div className="flex flex-col">
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-sepia font-semibold mb-1.5">Tipo</span>
                <select
                  className="font-serif text-[17px] bg-transparent outline-none px-0 py-1.5 border-b border-rule focus:border-ink transition-colors text-ink"
                  {...register('type')}
                >
                  {INVESTMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-paper text-ink">{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.type.message}</p>}
              </div>

              <div className="col-span-1">
                <Input label="Descripción" placeholder="ej. AAPL · Apple Inc." {...register('description')} />
                {errors.description && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <Input label="Capital inicial" type="number" step="0.01" placeholder="0.00" {...register('initialCapital')} />
                {errors.initialCapital && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.initialCapital.message}</p>}
              </div>

              <div>
                <Input label="Capital actual" type="number" step="0.01" placeholder="0.00" {...register('currentCapital')} />
                {errors.currentCapital && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.currentCapital.message}</p>}
              </div>

              <div className="col-span-2">
                <Input label="Notas" placeholder="Detalles adicionales" {...register('notes')} />
              </div>

              {!editing && (
                <label className="col-span-2 flex items-center gap-3 text-[13px] font-serif italic text-sepia cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('createLinkedTransaction')}
                    className="accent-gold"
                  />
                  Crear gasto vinculado en el cuaderno de cuentas
                </label>
              )}

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

        <section className="border border-rule rounded-md bg-paper-2/40">
          <div className="grid grid-cols-[80px_1fr_100px_130px_130px_90px_70px] gap-3 px-[22px] py-3 border-b border-rule text-[10.5px] tracking-[0.16em] uppercase text-sepia font-semibold">
            <span>Activo</span>
            <span>Descripción</span>
            <span className="text-right">30 d</span>
            <span className="text-right">Invertido</span>
            <span className="text-right">Actual</span>
            <span className="text-right">ROI</span>
            <span className="text-right">Peso</span>
          </div>

          {isLoading ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-[22px] py-3.5 border-b border-rule-soft last:border-b-0">
                  <div className="h-4 bg-sepia-soft animate-pulse rounded-sm" />
                </div>
              ))}
            </div>
          ) : investments.length === 0 ? (
            <p className="font-serif italic text-sepia text-[15px] text-center py-12">
              Aún no anotaste ninguna posición.
            </p>
          ) : (
            investments.map((inv, i, arr) => {
              const positive = inv.roi >= 0
              const peso = totalCurrent > 0 ? (inv.currentCapital / totalCurrent) * 100 : 0
              const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label ?? inv.type
              const spark = syntheticSpark(inv.id, inv.roi)
              return (
                <div
                  key={inv.id}
                  className={cn(
                    'group grid grid-cols-[80px_1fr_100px_130px_130px_90px_70px] gap-3 items-center px-[22px] py-3.5',
                    i < arr.length - 1 && 'border-b border-rule-soft',
                  )}
                >
                  <span className="font-serif text-[16px] font-medium text-gold tracking-tight truncate">
                    {ticker(inv.description)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-serif text-[15px] truncate">{inv.description}</div>
                    <div className="text-[11px] text-sepia mt-0.5 truncate">
                      {typeLabel}
                      {inv.notes && ` · ${inv.notes}`}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Sparkline data={spark} positive={positive} />
                  </div>
                  <span className="font-mono text-[12.5px] text-right text-ink">
                    {new Intl.NumberFormat('es-AR').format(inv.initialCapital)}
                  </span>
                  <span className="font-mono text-[13px] text-right text-ink font-medium">
                    {new Intl.NumberFormat('es-AR').format(inv.currentCapital)}
                  </span>
                  <span className={cn('font-serif italic text-[16px] text-right', positive ? 'text-sage' : 'text-wine')}>
                    {formatPercent(inv.roi)}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-[11.5px] text-sepia">{peso.toFixed(1)}%</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(inv)} className="text-sepia hover:text-ink transition-colors" aria-label="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('¿Eliminar esta posición?')) deleteMutation.mutate(inv.id) }}
                        className="text-sepia hover:text-wine transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </section>

        {portfolio && portfolio.byType.length > 0 && (
          <section className="border border-rule rounded-md bg-paper-2/40 p-[14px_22px]">
            <div className="flex items-baseline justify-between mb-3 text-[11px] tracking-[0.16em] uppercase text-sepia font-semibold">
              <span>Alocación por tipo</span>
              <span className="font-serif italic normal-case tracking-normal text-[12px]">
                Σ 100,0 %
              </span>
            </div>
            <div className="flex h-1.5 rounded-sm overflow-hidden">
              {portfolio.byType.map((b, i) => {
                const peso = totalCurrent > 0 ? (b.totalCurrentCapital / totalCurrent) * 100 : 0
                return (
                  <div
                    key={b.type}
                    style={{ width: `${peso}%`, background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
              {portfolio.byType.map((b, i) => {
                const peso = totalCurrent > 0 ? (b.totalCurrentCapital / totalCurrent) * 100 : 0
                const typeLabel = INVESTMENT_TYPES.find((t) => t.value === b.type)?.label ?? b.type
                return (
                  <div key={b.type} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                    />
                    <span className="font-serif">{typeLabel}</span>
                    <span className="font-mono text-[11px] text-sepia">{peso.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

const ALLOCATION_COLORS = [
  'var(--color-gold)',
  'var(--color-sage)',
  'var(--color-sepia)',
  'var(--color-wine)',
  'rgba(199, 169, 116, 0.7)',
  'rgba(158, 199, 156, 0.7)',
  'rgba(210, 126, 126, 0.7)',
  'rgba(212, 168, 90, 0.7)',
]

function StatCell({
  label, value, hint, primary, positive, withLeftRule,
}: {
  label: string
  value: string
  hint?: string
  primary?: boolean
  positive?: boolean
  withLeftRule?: boolean
}) {
  return (
    <div
      className={cn(
        'p-[20px_24px]',
        withLeftRule && 'md:border-l border-rule',
        primary && 'bg-sage/[0.05]',
      )}
    >
      <div className="text-[11px] tracking-[0.18em] uppercase text-sepia font-semibold">{label}</div>
      <div
        className={cn(
          'font-serif font-normal mt-1.5 leading-none tracking-tight',
          primary ? `text-[36px] ${positive ? 'text-sage' : 'text-wine'}` : 'text-[30px] text-ink',
        )}
      >
        {value}
      </div>
      {hint && <div className="text-[11.5px] text-sepia mt-2">{hint}</div>}
    </div>
  )
}

function ticker(description: string) {
  // Si la descripción empieza con un ticker en mayúscula (3-5 letras), lo usa.
  // Si no, primera palabra en mayúscula con tope 5 chars.
  const match = description.match(/^([A-Z]{2,5})\b/)
  if (match) return match[1]
  return description.split(/[\s·]/)[0]?.slice(0, 5).toUpperCase() ?? '·'
}
