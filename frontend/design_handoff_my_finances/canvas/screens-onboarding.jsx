// Onboarding flow — both desktop and mobile.
// 5 desktop steps + 3 mobile steps. All in the Cuaderno paper aesthetic.

const { C: oC, fontSans: oSans, fontSerif: oSerif, fontMono: oMono } = window.Cuaderno;

// ──────────────────────────── shared bits ──────────────────────────────────

// Shell — paper background, no sidebar (user is not "in" the app yet)
function OnbShell({ children, mobile = false }) {
  const w = mobile ? 460 : 1280;
  const h = mobile ? 920 : 800;
  return (
    <div className="artboard" style={{
      width: w, height: h, background: oC.paper, color: oC.ink,
      fontFamily: oSans, position: 'relative', overflow: 'hidden',
      backgroundImage:
        'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.55), transparent 55%),' +
        'radial-gradient(circle at 80% 90%, rgba(196,170,120,0.22), transparent 50%)',
    }}>
      {children}
    </div>
  );
}

function ProgressDots({ step, total = 5, mobile = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === step ? 24 : 8, height: 4, borderRadius: 999,
          background: i <= step ? oC.ink : oC.sepiaSoft,
          transition: 'width 0.2s',
        }} />
      ))}
      <span style={{
        marginLeft: 6, fontSize: 11, color: oC.sepia, fontFamily: oMono,
        letterSpacing: '0.04em',
      }}>{step + 1}/{total}</span>
    </div>
  );
}

function OnbHeader({ step, total = 5 }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '24px 44px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', zIndex: 10,
    }}>
      <div style={{ fontFamily: oSerif, fontSize: 18, letterSpacing: '-0.02em', fontWeight: 500 }}>
        MyFinances<span style={{ color: oC.wine }}>.</span>
      </div>
      <ProgressDots step={step} total={total} />
      <span style={{
        fontFamily: oSerif, fontStyle: 'italic', fontSize: 13, color: oC.sepia,
        cursor: 'pointer',
      }}>saltar</span>
    </div>
  );
}

function PrimaryCTA({ children, arrow = true, full = false }) {
  return (
    <button style={{
      all: 'unset', cursor: 'pointer',
      background: oC.ink, color: oC.paper,
      padding: '13px 22px', borderRadius: 999,
      fontSize: 14, fontWeight: 600, letterSpacing: '0.01em',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      width: full ? '100%' : 'auto',
      boxSizing: 'border-box',
      justifyContent: 'center',
    }}>
      {children}
      {arrow && <span style={{ fontSize: 16 }}>→</span>}
    </button>
  );
}

function GhostCTA({ children }) {
  return (
    <button style={{
      all: 'unset', cursor: 'pointer',
      padding: '13px 22px',
      fontSize: 14, fontWeight: 500, color: oC.sepia,
      fontFamily: oSerif, fontStyle: 'italic',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      ← {children}
    </button>
  );
}

// ──────────────────────────────── 1 · BIENVENIDA ───────────────────────────
function OnbWelcome() {
  return (
    <OnbShell>
      <OnbHeader step={0} />

      {/* Two-column composition like the login */}
      <div style={{ display: 'flex', height: '100%' }}>
        <section style={{
          flex: 1.1, padding: '120px 64px 56px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          borderRight: `1px solid ${oC.rule}`,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
            Comenzá tu primera página
          </div>
          <h1 style={{
            fontFamily: oSerif, fontWeight: 400, fontSize: 64,
            letterSpacing: '-0.03em', lineHeight: 1.02, margin: '14px 0 22px',
            maxWidth: 540,
          }}>
            Un cuaderno para <em style={{ color: oC.sepia }}>tu vida financiera.</em>
          </h1>
          <p style={{
            fontSize: 16, lineHeight: 1.55, color: '#3a322a', maxWidth: 480,
            margin: '0 0 36px',
          }}>
            No es un dashboard, ni una hoja de cálculo. Es un cuaderno donde se anota
            lo que entra, lo que sale y dónde va lo que se guarda. Vamos a configurarlo
            en menos de dos minutos.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PrimaryCTA>Empezar</PrimaryCTA>
            <span style={{ fontSize: 12, color: oC.sepia, marginLeft: 16, fontFamily: oSerif, fontStyle: 'italic' }}>
              · 4 pasos · 90 segundos
            </span>
          </div>
        </section>

        {/* Right — preview of an open notebook page */}
        <section style={{
          flex: 1, position: 'relative', padding: '120px 60px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Stacked papers — building visual */}
          <div style={{
            width: 360, position: 'relative',
            transform: 'rotate(-1.5deg)',
          }}>
            {/* under sheet */}
            <div style={{
              position: 'absolute', top: 12, left: 14, right: -14, height: 380,
              background: oC.paper2, borderRadius: 4,
              border: `1px solid ${oC.rule}`,
              boxShadow: '0 8px 16px -10px rgba(26,22,18,0.2)',
              transform: 'rotate(2.5deg)',
            }} />
            {/* top page */}
            <div style={{
              position: 'relative', background: 'rgba(255,255,255,0.6)',
              border: `1px solid ${oC.rule}`, borderRadius: 6, padding: '24px 26px',
              boxShadow: '0 18px 30px -16px rgba(26,22,18,0.28)',
            }}>
              <div style={{
                fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: oC.sepia, fontWeight: 600,
              }}>14 de mayo · jueves</div>
              <div style={{
                fontFamily: oSerif, fontSize: 22, letterSpacing: '-0.02em',
                marginTop: 6, fontStyle: 'italic',
              }}>El día empieza con sueldo.</div>

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  ['09:00', 'Sueldo mayo', '+ $ 520.000', 'sage'],
                  ['14:32', 'Coto Caballito', '− $ 12.840', 'ink'],
                  ['18:45', 'SUBE recarga', '− $ 3.500', 'ink'],
                  ['21:08', 'Don Julio · cena', '− $ 24.500', 'ink'],
                ].map(([t, d, a, tone], i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '52px 1fr 96px',
                    gap: 10, fontSize: 13.5, alignItems: 'baseline',
                    paddingBottom: 6, borderBottom: `1px solid ${oC.ruleSoft}`,
                  }}>
                    <span style={{ fontFamily: oMono, fontSize: 11, color: oC.sepia }}>{t}</span>
                    <span style={{ fontFamily: oSerif }}>{d}</span>
                    <span style={{
                      fontFamily: oSerif, textAlign: 'right',
                      color: tone === 'sage' ? oC.sage : oC.ink,
                    }}>{a}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 12, paddingTop: 10,
                borderTop: `1px dashed ${oC.rule}`,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: oSerif, fontStyle: 'italic', fontSize: 13, color: oC.sepia }}>
                  Neto del día
                </span>
                <span style={{ fontFamily: oSerif, fontSize: 17, color: oC.sage }}>
                  + $ 479.160
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </OnbShell>
  );
}

// ──────────────────────────────── 2 · MONEDA + LOCALE ──────────────────────
function OnbCurrency() {
  return (
    <OnbShell>
      <OnbHeader step={1} />

      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '120px 60px 60px',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
          Paso 01 · base
        </div>
        <h1 style={{
          fontFamily: oSerif, fontWeight: 400, fontSize: 48,
          letterSpacing: '-0.025em', lineHeight: 1.05, margin: '12px 0 8px',
          textAlign: 'center', maxWidth: 720,
        }}>
          ¿En qué moneda <em style={{ color: oC.sepia }}>vivís?</em>
        </h1>
        <p style={{
          fontSize: 15, color: '#3a322a', textAlign: 'center', maxWidth: 540,
          margin: '0 0 36px', lineHeight: 1.55,
        }}>
          Es la moneda principal de tu cuaderno. Vas a poder agregar otras
          y registrar inversiones en cualquier moneda más adelante.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, maxWidth: 720, width: '100%', marginBottom: 24 }}>
          {[
            { code: 'ARS', sym: '$', name: 'Peso argentino', hint: 'Multi-moneda · MEP, CCL, USD blue', active: true },
            { code: 'USD', sym: 'US$', name: 'Dólar estadounidense', hint: 'Internacional' },
            { code: 'EUR', sym: '€', name: 'Euro', hint: 'Europa' },
          ].map((m) => (
            <div key={m.code} style={{
              border: m.active ? `1.5px solid ${oC.ink}` : `1px solid ${oC.rule}`,
              borderRadius: 12, padding: '20px 22px',
              background: m.active ? 'rgba(26,22,18,0.04)' : 'rgba(255,255,255,0.4)',
              position: 'relative', cursor: 'pointer',
            }}>
              {m.active && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 18, height: 18, borderRadius: 999, background: oC.ink,
                  color: oC.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>✓</span>
              )}
              <div style={{ fontFamily: oSerif, fontSize: 32, fontStyle: 'italic', color: oC.sepia }}>
                {m.sym}
              </div>
              <div style={{ fontFamily: oSerif, fontSize: 19, marginTop: 8, letterSpacing: '-0.01em' }}>
                {m.name}
              </div>
              <div style={{ fontSize: 11.5, color: oC.sepia, marginTop: 4 }}>
                {m.code} · {m.hint}
              </div>
            </div>
          ))}
        </div>

        {/* Locale tip */}
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          border: `1px solid ${oC.rule}`, borderRadius: 999,
          padding: '8px 16px', fontSize: 12, color: oC.sepia,
          fontFamily: oSerif, fontStyle: 'italic', marginBottom: 36,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            background: oC.ink, color: oC.paper,
            width: 22, height: 22, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11,
          }}>i</span>
          Detectamos que estás en Argentina · GMT-3 · formato decimal con coma
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GhostCTA>Atrás</GhostCTA>
          <PrimaryCTA>Continuar</PrimaryCTA>
        </div>
      </div>
    </OnbShell>
  );
}

// ──────────────────────────────── 3 · CATEGORÍAS ───────────────────────────
function OnbCategories() {
  const suggested = [
    { name: 'Supermercado', icon: '🛒', active: true, budget: 110000 },
    { name: 'Restaurantes', icon: '🍽', active: true, budget: 80000 },
    { name: 'Transporte', icon: '🚇', active: true, budget: 60000 },
    { name: 'Servicios', icon: '⚡', active: true, budget: 50000 },
    { name: 'Salud', icon: '⚕', active: true, budget: 40000 },
    { name: 'Entretenimiento', icon: '🎬', active: true, budget: 30000 },
    { name: 'Hogar', icon: '🏠', active: true, budget: 25000 },
    { name: 'Educación', icon: '📚', active: false, budget: 20000 },
    { name: 'Mascotas', icon: '🐾', active: false, budget: 15000 },
    { name: 'Regalos', icon: '🎁', active: false, budget: 12000 },
    { name: 'Suscripciones', icon: '✦', active: false, budget: 8000 },
    { name: 'Viajes', icon: '✈', active: false, budget: 50000 },
  ];

  return (
    <OnbShell>
      <OnbHeader step={2} />

      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        padding: '120px 80px 80px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
            Paso 02 · etiquetas
          </div>
          <h1 style={{
            fontFamily: oSerif, fontWeight: 400, fontSize: 42,
            letterSpacing: '-0.025em', lineHeight: 1.05, margin: '10px 0 8px',
          }}>
            ¿En qué <em style={{ color: oC.sepia }}>solés gastar?</em>
          </h1>
          <p style={{
            fontSize: 14.5, color: '#3a322a', maxWidth: 600,
            margin: 0, lineHeight: 1.55,
          }}>
            Elegí las categorías que vas a usar. Sugerimos algunas con un presupuesto
            de partida basado en gente como vos — los vas a poder editar siempre.
          </p>
        </div>

        <div style={{
          flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10, alignContent: 'start',
        }}>
          {suggested.map((s) => (
            <div key={s.name} style={{
              border: s.active ? `1.5px solid ${oC.ink}` : `1px dashed ${oC.rule}`,
              borderRadius: 10, padding: '12px 14px',
              background: s.active ? 'rgba(26,22,18,0.04)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: s.active ? oC.ink : oC.sepiaSoft, color: s.active ? oC.paper : oC.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: oSerif, fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                {s.active && (
                  <div style={{ fontFamily: oMono, fontSize: 10.5, color: oC.sepia, marginTop: 1 }}>
                    {new Intl.NumberFormat('es-AR').format(s.budget)}/mes
                  </div>
                )}
              </div>
              <span style={{
                width: 16, height: 16, borderRadius: 999,
                border: s.active ? 'none' : `1px solid ${oC.rule}`,
                background: s.active ? oC.ink : 'transparent',
                color: oC.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, flexShrink: 0,
              }}>{s.active ? '✓' : ''}</span>
            </div>
          ))}

          {/* Add custom */}
          <div style={{
            border: `1px dashed ${oC.rule}`,
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            color: oC.sepia,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'transparent', border: `1px dashed ${oC.rule}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>+</div>
            <span style={{ fontFamily: oSerif, fontSize: 14, fontStyle: 'italic' }}>Crear propia</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 22, borderTop: `1px solid ${oC.rule}`, marginTop: 22,
        }}>
          <span style={{ fontSize: 12, color: oC.sepia, fontFamily: oSerif, fontStyle: 'italic' }}>
            7 categorías elegidas · presupuesto mensual sugerido $ 395.000
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <GhostCTA>Atrás</GhostCTA>
            <PrimaryCTA>Continuar</PrimaryCTA>
          </div>
        </div>
      </div>
    </OnbShell>
  );
}

// ──────────────────────────────── 4 · BALANCE INICIAL ──────────────────────
function OnbBalance() {
  return (
    <OnbShell>
      <OnbHeader step={3} />

      <div style={{
        height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr',
        padding: '120px 60px 60px', gap: 60,
      }}>
        {/* Left — context */}
        <section style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
            Paso 03 · punto de partida
          </div>
          <h1 style={{
            fontFamily: oSerif, fontWeight: 400, fontSize: 42,
            letterSpacing: '-0.025em', lineHeight: 1.05, margin: '12px 0 14px',
          }}>
            Tu primer <em style={{ color: oC.sepia }}>asiento.</em>
          </h1>
          <p style={{
            fontSize: 15, color: '#3a322a', lineHeight: 1.55, margin: '0 0 18px',
            maxWidth: 400,
          }}>
            ¿Cuánto tenés ahora mismo entre cuentas, efectivo e inversiones?
            Tomamos esto como punto cero — no nos importa de dónde viene, sólo
            dónde estás parado hoy.
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.5)',
            border: `1px solid ${oC.rule}`, borderRadius: 10,
            padding: '14px 16px', maxWidth: 400,
            fontSize: 12.5, color: oC.sepia, lineHeight: 1.5,
          }}>
            <span style={{ fontFamily: oSerif, fontStyle: 'italic', color: oC.ink, fontSize: 13.5 }}>
              «Sé honesto con vos mismo.»
            </span>
            <br />
            Lo que anotes acá no se comparte con nadie. Es tu cuaderno.
          </div>
        </section>

        {/* Right — form */}
        <section style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {[
            { label: 'En tu cuenta bancaria', placeholder: '450.000', icon: '🏦', filled: true, value: '450.000' },
            { label: 'Efectivo', placeholder: '37.250', icon: '◯', filled: true, value: '37.250' },
            { label: 'Inversiones (estimado)', placeholder: '1.245.800', icon: '▲', filled: true, value: '1.245.800' },
          ].map((f, i) => (
            <div key={i} style={{
              marginBottom: 20,
              borderBottom: `1px solid ${f.filled ? oC.ink : oC.rule}`,
              paddingBottom: 8,
              display: 'grid', gridTemplateColumns: '28px 1fr 36px auto',
              gap: 10, alignItems: 'baseline',
            }}>
              <span style={{ fontSize: 16, color: oC.sepia }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600, marginBottom: 4 }}>
                  {f.label}
                </div>
                <div style={{
                  fontFamily: oSerif, fontSize: 26, letterSpacing: '-0.02em',
                  color: f.filled ? oC.ink : oC.sepia,
                  fontStyle: f.filled ? 'normal' : 'italic',
                }}>
                  {f.value || f.placeholder}
                </div>
              </div>
              <span style={{
                fontFamily: oSerif, fontSize: 18, color: oC.sepia, fontStyle: 'italic',
                alignSelf: 'end', paddingBottom: 2,
              }}>$</span>
              <span style={{
                fontFamily: oMono, fontSize: 10, color: oC.sepia, alignSelf: 'end',
                letterSpacing: '0.06em', paddingBottom: 4,
              }}>ARS</span>
            </div>
          ))}

          {/* Total */}
          <div style={{
            marginTop: 14, padding: '14px 18px',
            background: 'rgba(26,22,18,0.04)',
            border: `1px solid ${oC.ink}`, borderRadius: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          }}>
            <span style={{ fontFamily: oSerif, fontStyle: 'italic', fontSize: 15 }}>
              Patrimonio neto inicial
            </span>
            <span style={{ fontFamily: oSerif, fontSize: 30, letterSpacing: '-0.02em' }}>
              $ 1.733.050
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 28, justifyContent: 'flex-end' }}>
            <GhostCTA>Atrás</GhostCTA>
            <PrimaryCTA>Continuar</PrimaryCTA>
          </div>
        </section>
      </div>
    </OnbShell>
  );
}

// ──────────────────────────────── 5 · LISTO ────────────────────────────────
function OnbReady() {
  return (
    <OnbShell>
      <OnbHeader step={4} />

      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '120px 60px 60px',
        textAlign: 'center',
      }}>
        {/* Big seal */}
        <div style={{ position: 'relative', marginBottom: 30 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: 'block' }}>
            <circle cx="60" cy="60" r="56" fill="none" stroke={oC.ink} strokeWidth="1" />
            <circle cx="60" cy="60" r="48" fill="none" stroke={oC.sepia} strokeWidth="0.6" strokeDasharray="2 3" />
            <text x="60" y="58" textAnchor="middle" fontFamily="Newsreader, serif" fontStyle="italic" fontSize="34" fill={oC.ink}>TC</text>
            <text x="60" y="80" textAnchor="middle" fontFamily="Newsreader, serif" fontSize="9" fill={oC.sepia} letterSpacing="0.2em">MMXXVI</text>
            {/* Decorative flourish */}
            <path d="M 30 60 Q 60 30, 90 60" fill="none" stroke={oC.wine} strokeWidth="0.6" />
            <path d="M 30 60 Q 60 90, 90 60" fill="none" stroke={oC.wine} strokeWidth="0.6" />
          </svg>
        </div>

        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
          Tu cuaderno está abierto
        </div>
        <h1 style={{
          fontFamily: oSerif, fontWeight: 400, fontSize: 54,
          letterSpacing: '-0.03em', lineHeight: 1.02, margin: '12px 0 12px',
          maxWidth: 720,
        }}>
          A escribir, <em style={{ color: oC.sepia }}>Tobías.</em>
        </h1>
        <p style={{
          fontSize: 16, color: '#3a322a', maxWidth: 540, lineHeight: 1.55,
          margin: '0 0 36px',
        }}>
          Todo listo. Anotamos $ 1.733.050 como punto de partida y 7 categorías
          para empezar. Tu primera meta sugerida es un <em>fondo de emergencia</em>.
        </p>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['Moneda', 'ARS'],
            ['Categorías', '7'],
            ['Patrimonio inicial', '$ 1,73 M'],
            ['Plan', 'Personal'],
          ].map(([l, v]) => (
            <div key={l} style={{
              border: `1px solid ${oC.rule}`, borderRadius: 999,
              padding: '7px 14px',
              background: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'baseline', gap: 6,
              fontSize: 12,
            }}>
              <span style={{ color: oC.sepia, letterSpacing: '0.04em' }}>{l}</span>
              <span style={{ fontFamily: oSerif, fontStyle: 'italic', fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryCTA>Anotar mi primer gasto</PrimaryCTA>
          <button style={{
            all: 'unset', cursor: 'pointer',
            padding: '13px 22px', borderRadius: 999, border: `1px solid ${oC.rule}`,
            fontSize: 14, fontWeight: 500, color: oC.ink,
            background: 'rgba(255,255,255,0.4)',
          }}>Ir al cuaderno</button>
        </div>
      </div>
    </OnbShell>
  );
}

// ──────────────────────────── MOBILE ONBOARDING ────────────────────────────
function MOnbBase({ children }) {
  return (
    <IOSDevice>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: oC.paper, color: oC.ink, fontFamily: oSans,
        backgroundImage:
          'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.6), transparent 55%),' +
          'radial-gradient(circle at 85% 90%, rgba(196,170,120,0.22), transparent 50%)',
        padding: '64px 22px 40px',
      }}>{children}</div>
    </IOSDevice>
  );
}

function MOnbWelcome() {
  return (
    <MOnbBase>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: oSerif, fontSize: 16, letterSpacing: '-0.02em', fontWeight: 500 }}>
          MyFinances<span style={{ color: oC.wine }}>.</span>
        </div>
        <ProgressDots step={0} total={4} mobile />
      </div>

      {/* Notebook visual */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '24px 0',
      }}>
        <div style={{ position: 'relative', width: 240, transform: 'rotate(-2deg)' }}>
          <div style={{
            position: 'absolute', top: 10, left: 12, right: -8, height: 240,
            background: oC.paper2, borderRadius: 6,
            border: `1px solid ${oC.rule}`,
            transform: 'rotate(2deg)',
          }} />
          <div style={{
            position: 'relative', background: 'rgba(255,255,255,0.65)',
            border: `1px solid ${oC.rule}`, borderRadius: 6, padding: '20px 22px',
            boxShadow: '0 18px 30px -12px rgba(26,22,18,0.25)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
              día uno
            </div>
            <div style={{
              fontFamily: oSerif, fontSize: 22, fontStyle: 'italic',
              letterSpacing: '-0.02em', margin: '6px 0 12px',
            }}>Hoy empezás.</div>

            {[
              ['09:00', 'Sueldo', '+ $ 520k', oC.sage],
              ['—', 'Tu primer gasto', '...', oC.sepia],
              ['—', '...', '...', oC.sepia],
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '38px 1fr 60px',
                gap: 8, padding: '5px 0', fontSize: 12,
                borderBottom: `1px solid ${oC.ruleSoft}`,
                fontStyle: i > 0 ? 'italic' : 'normal',
                color: row[3],
              }}>
                <span style={{ fontFamily: oMono, fontSize: 10, color: oC.sepia }}>{row[0]}</span>
                <span style={{ fontFamily: oSerif }}>{row[1]}</span>
                <span style={{ fontFamily: oSerif, textAlign: 'right' }}>{row[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
          Bienvenido
        </div>
        <h1 style={{
          fontFamily: oSerif, fontWeight: 400, fontSize: 32,
          letterSpacing: '-0.025em', lineHeight: 1.05, margin: '6px 0 10px',
        }}>
          Un cuaderno para <em style={{ color: oC.sepia }}>tu plata.</em>
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#3a322a', margin: 0 }}>
          90 segundos de configuración y empezás a anotar.
        </p>
      </div>

      <PrimaryCTA full>Empezar</PrimaryCTA>

      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: oC.sepia }}>
        ¿Ya tenés cuenta? <span style={{ color: oC.ink, fontFamily: oSerif, fontStyle: 'italic', textDecoration: 'underline', textUnderlineOffset: 3 }}>Iniciar sesión</span>
      </div>
    </MOnbBase>
  );
}

function MOnbCurrency() {
  return (
    <MOnbBase>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: oSerif, fontStyle: 'italic', fontSize: 14, color: oC.sepia }}>← atrás</span>
        <ProgressDots step={1} total={4} mobile />
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
          Paso 01
        </div>
        <h1 style={{
          fontFamily: oSerif, fontWeight: 400, fontSize: 30,
          letterSpacing: '-0.025em', lineHeight: 1.1, margin: '6px 0 8px',
        }}>
          ¿En qué moneda <em style={{ color: oC.sepia }}>vivís?</em>
        </h1>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: '#3a322a', margin: '0 0 22px' }}>
          La principal de tu cuaderno. Podés agregar otras después.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { code: 'ARS', sym: '$', name: 'Peso argentino', hint: 'multi-moneda · MEP, CCL, USD blue', active: true },
            { code: 'USD', sym: 'US$', name: 'Dólar estadounidense', hint: 'internacional' },
            { code: 'EUR', sym: '€', name: 'Euro', hint: 'europa' },
          ].map((m) => (
            <div key={m.code} style={{
              border: m.active ? `1.5px solid ${oC.ink}` : `1px solid ${oC.rule}`,
              borderRadius: 12, padding: '14px 16px',
              background: m.active ? 'rgba(26,22,18,0.04)' : 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                fontFamily: oSerif, fontSize: 28, fontStyle: 'italic',
                color: oC.sepia, width: 38, textAlign: 'center',
              }}>{m.sym}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: oSerif, fontSize: 16 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: oC.sepia, marginTop: 1 }}>{m.code} · {m.hint}</div>
              </div>
              {m.active && (
                <span style={{
                  width: 22, height: 22, borderRadius: 999, background: oC.ink,
                  color: oC.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <PrimaryCTA full>Continuar</PrimaryCTA>
      </div>
    </MOnbBase>
  );
}

function MOnbBalance() {
  return (
    <MOnbBase>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: oSerif, fontStyle: 'italic', fontSize: 14, color: oC.sepia }}>← atrás</span>
        <ProgressDots step={2} total={4} mobile />
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600 }}>
          Paso 02 · punto cero
        </div>
        <h1 style={{
          fontFamily: oSerif, fontWeight: 400, fontSize: 28,
          letterSpacing: '-0.025em', lineHeight: 1.1, margin: '6px 0 6px',
        }}>
          ¿Cuánto tenés <em style={{ color: oC.sepia }}>hoy?</em>
        </h1>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: '#3a322a', margin: '0 0 22px' }}>
          Es tu punto cero. Privado. Editable después.
        </p>

        {[
          ['🏦', 'En cuenta bancaria', '450.000'],
          ['◯', 'Efectivo', '37.250'],
          ['▲', 'Inversiones (estimado)', '1.245.800'],
        ].map(([icon, label, val]) => (
          <div key={label} style={{
            marginBottom: 18, paddingBottom: 8, borderBottom: `1px solid ${oC.ink}`,
            display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 8, alignItems: 'baseline',
          }}>
            <span style={{ fontSize: 14, color: oC.sepia }}>{icon}</span>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: oC.sepia, fontWeight: 600, marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontFamily: oSerif, fontSize: 22, letterSpacing: '-0.02em' }}>
                $ {val}
              </div>
            </div>
          </div>
        ))}

        <div style={{
          marginTop: 18, padding: '12px 14px',
          background: 'rgba(26,22,18,0.04)',
          border: `1px solid ${oC.ink}`, borderRadius: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <span style={{ fontFamily: oSerif, fontStyle: 'italic', fontSize: 13 }}>
            Patrimonio inicial
          </span>
          <span style={{ fontFamily: oSerif, fontSize: 22, letterSpacing: '-0.02em' }}>
            $ 1.733.050
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <PrimaryCTA full>Continuar</PrimaryCTA>
      </div>
    </MOnbBase>
  );
}

Object.assign(window, {
  OnbWelcome, OnbCurrency, OnbCategories, OnbBalance, OnbReady,
  MOnbWelcome, MOnbCurrency, MOnbBalance,
});
