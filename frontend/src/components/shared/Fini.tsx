import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/** Estados de ánimo de Fini, el chanchito alcancía. */
export type FiniMood = 'happy' | 'party' | 'worried' | 'sleepy' | 'neutral'

const INK = '#46323c'
const BODY = '#f59bb8'
const SNOUT = '#e0739c'
const BLUSH = 'rgba(224, 115, 156, 0.45)'
const COIN = '#e89b2d'

/**
 * Fini dibujado en SVG puro (sin assets externos). El cuerpo es siempre el
 * mismo; ojos, boca y extras (moneda, confeti, zzz) cambian según el mood.
 * El viewBox arranca en y=-14 porque la moneda del mood "party" (cy=2, r=8
 * más borde) y las "z" del sleepy sobresalen por encima del cuerpo.
 */
export function Fini({
  mood = 'happy',
  size = 64,
  className,
  animated = false,
  coin = false,
}: {
  mood?: FiniMood
  size?: number
  className?: string
  animated?: boolean
  /** Muestra la moneda entrando a la ranura (el mood "party" la trae siempre). */
  coin?: boolean
}) {
  return (
    <svg
      viewBox="0 -14 120 124"
      width={size}
      height={(size * 124) / 120}
      className={cn(animated && 'animate-fini-bounce', className)}
      role="img"
      aria-label={`Fini ${mood}`}
    >
      {/* orejas — grandes para que se lean incluso a 40px */}
      <path d="M27 29 Q18 3 46 12 Q36 19 38 27 Z" fill={BODY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M93 29 Q102 3 74 12 Q84 19 82 27 Z" fill={BODY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />

      {/* patitas */}
      <rect x="32" y="88" width="14" height="14" rx="6" fill={BODY} stroke={INK} strokeWidth="3" />
      <rect x="74" y="88" width="14" height="14" rx="6" fill={BODY} stroke={INK} strokeWidth="3" />

      {/* cuerpo alcancía */}
      <ellipse cx="60" cy="58" rx="44" ry="38" fill={BODY} stroke={INK} strokeWidth="3.5" />

      {/* ranura de moneda — apoyada sobre el contorno de la cabeza (el borde
          superior del cuerpo pasa por y≈18) para que no parezca que flota */}
      <rect x="46" y="15" width="28" height="6" rx="3" fill={INK} />

      {/* colita espiral */}
      <path d="M103 56 q9 -2 7 5 q-2 6 -8 3" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />

      {/* cachetes */}
      <circle cx="32" cy="62" r="6" fill={BLUSH} />
      <circle cx="88" cy="62" r="6" fill={BLUSH} />

      {/* hocico */}
      <ellipse cx="60" cy="64" rx="15" ry="11" fill={SNOUT} stroke={INK} strokeWidth="3" />
      <circle cx="55" cy="64" r="2.4" fill={INK} />
      <circle cx="65" cy="64" r="2.4" fill={INK} />

      {/* moneda entrando a la ranura — siempre en party, opcional con `coin` */}
      {(coin || mood === 'party') && (
        <g>
          <circle cx="60" cy="2" r="8" fill={COIN} stroke={INK} strokeWidth="2.5" />
          <text x="60" y="6" textAnchor="middle" fontSize="10" fontWeight="bold" fill={INK}>$</text>
        </g>
      )}

      {/* ojos + extras según mood */}
      {mood === 'happy' && (
        <>
          <path d="M40 46 q4 -5 8 0" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M72 46 q4 -5 8 0" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
      {mood === 'party' && (
        <>
          <path d="M40 46 q4 -5 8 0" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M72 46 q4 -5 8 0" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          {/* confeti */}
          <circle cx="16" cy="18" r="2.5" fill={COIN} />
          <circle cx="104" cy="14" r="2.5" fill={SNOUT} />
          <rect x="10" y="40" width="5" height="5" rx="1" fill={SNOUT} transform="rotate(20 12 42)" />
          <rect x="106" y="36" width="5" height="5" rx="1" fill={COIN} transform="rotate(-15 108 38)" />
        </>
      )}
      {mood === 'worried' && (
        <>
          <circle cx="44" cy="47" r="3.4" fill={INK} />
          <circle cx="76" cy="47" r="3.4" fill={INK} />
          <path d="M38 40 l10 3" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M82 40 l-10 3" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          {/* gotita */}
          <path d="M97 34 q5 7 0 9 q-5 -2 0 -9" fill="#9ec9e8" stroke={INK} strokeWidth="1.6" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <path d="M40 48 h9" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M71 48 h9" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <text x="100" y="22" fontSize="14" fontWeight="bold" fill={INK} fontFamily="Baloo 2, cursive">z</text>
          <text x="108" y="12" fontSize="10" fontWeight="bold" fill={INK} fontFamily="Baloo 2, cursive">z</text>
        </>
      )}
      {mood === 'neutral' && (
        <>
          <circle cx="44" cy="47" r="3.4" fill={INK} />
          <circle cx="76" cy="47" r="3.4" fill={INK} />
        </>
      )}
    </svg>
  )
}

/**
 * Globo de diálogo de Fini — para empty states, insights y onboarding.
 * Uso: <FiniSays mood="worried">Ojo, este mes gastaste de más.</FiniSays>
 */
export function FiniSays({
  mood = 'happy',
  size = 72,
  children,
  className,
  animated = true,
}: {
  mood?: FiniMood
  size?: number
  children: ReactNode
  className?: string
  animated?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Fini mood={mood} size={size} animated={animated} className="flex-shrink-0" />
      <div className="relative bg-paper-2 border-2 border-rule rounded-lg px-4 py-3 text-[14px] leading-snug font-semibold max-w-md">
        {/* colita del globo */}
        <span
          aria-hidden
          className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 bg-paper-2 border-l-2 border-b-2 border-rule rotate-45"
        />
        <span className="relative">{children}</span>
      </div>
    </div>
  )
}
