// Overlays · desktop modales + mobile bottom sheets + toasts.
// All sit on top of a dimmed scrim. Stay inside the artboard.

const { C: vC, fontSans: vSans, fontSerif: vSerif, fontMono: vMono } = window.Cuaderno;
const { fmt: vFmt, CATEGORIES_FULL: vCATS } = window.MF;

// ──────────────────────────── primitives ──────────────────────────────────

function Scrim({ children, width = 1280, height = 800, behind, dim = 0.35, paper = true }) {
  // The "behind" content is a faded/blurred preview of the underlying page
  // so the user gets that overlay-on-top-of-something feel.
  return (
    <div className="artboard" style={{
      width, height, background: paper ? vC.paper : '#1f2a38',
      color: vC.ink, fontFamily: vSans,
      position: 'relative', overflow: 'hidden',
      backgroundImage: paper
        ? 'radial-gradient(circle at 25% 8%, rgba(255,255,255,0.55), transparent 55%),' +
          'radial-gradient(circle at 90% 100%, rgba(196,170,120,0.16), transparent 50%)'
        : 'radial-gradient(circle at 20% 10%, rgba(212,168,90,0.07), transparent 55%)',
    }}>
      {/* Behind (the underlying app, dimmed) */}
      <div style={{
        position: 'absolute', inset: 0,
        filter: 'blur(3px)', opacity: 0.7,
        pointerEvents: 'none',
      }}>{behind}</div>
      {/* Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: paper ? `rgba(26,22,18,${dim})` : `rgba(0,0,0,${dim + 0.1})`,
      }} />
      {children}
    </div>
  );
}

function ModalShell({ children, width = 560, height = 'auto' }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width, maxHeight: '88%',
      background: vC.paper, color: vC.ink,
      border: `1px solid ${vC.rule}`,
      borderRadius: 12,
      boxShadow: '0 28px 60px -20px rgba(26,22,18,0.45), 0 0 0 1px rgba(26,22,18,0.04)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      backgroundImage:
        'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.55), transparent 60%)',
    }}>{children}</div>
  );
}

function ModalHead({ eyebrow, title, italic }) {
  return (
    <div style={{
      padding: '22px 26px 18px',
      borderBottom: `1px solid ${vC.rule}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    }}>
      <div>
        {eyebrow && (
          <div style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: vC.sepia, fontWeight: 600,
          }}>{eyebrow}</div>
        )}
        <div style={{
          fontFamily: vSerif, fontSize: 26, letterSpacing: '-0.025em',
          marginTop: 4, lineHeight: 1.1, fontWeight: 400,
        }}>{title}{italic && <em style={{ color: vC.sepia }}> {italic}</em>}</div>
      </div>
      <button style={{
        all: 'unset', cursor: 'pointer',
        width: 30, height: 30, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: vC.sepia, fontSize: 18,
        border: `1px solid ${vC.rule}`,
        background: 'rgba(255,255,255,0.5)',
      }}>×</button>
    </div>
  );
}

function ModalFoot({ children }) {
  return (
    <div style={{
      padding: '14px 22px', display: 'flex', justifyContent: 'flex-end',
      gap: 8, borderTop: `1px solid ${vC.rule}`,
      background: 'rgba(26,22,18,0.02)',
    }}>{children}</div>
  );
}

function FieldLabel({ children, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: vC.sepia, fontWeight: 600, marginBottom: 5,
    }}>
      <span>{children}</span>
      {right}
    </div>
  );
}

function LineInput({ value, placeholder, size = 17, mono = false, focused = false }) {
  return (
    <div style={{
      borderBottom: `1px solid ${focused ? vC.ink : value ? vC.ink : vC.rule}`,
      paddingBottom: 6,
      fontFamily: mono ? vMono : vSerif,
      fontSize: size, color: value ? vC.ink : vC.sepia,
      fontStyle: !value && placeholder ? 'italic' : 'normal',
      letterSpacing: mono ? '0' : '-0.01em',
    }}>
      {value || placeholder}
      {focused && (
        <span style={{
          display: 'inline-block', width: 1.5, height: size,
          background: vC.ink, marginLeft: 3, verticalAlign: 'middle',
          animation: 'modal-blink 1s infinite',
        }} />
      )}
      <style>{`@keyframes modal-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function Btn({ children, variant = 'ink', arrow, danger }) {
  if (variant === 'ghost') {
    return (
      <button style={{
        all: 'unset', cursor: 'pointer',
        padding: '11px 18px',
        fontFamily: vSerif, fontStyle: 'italic',
        fontSize: 13.5, color: vC.sepia, fontWeight: 500,
      }}>{children}</button>
    );
  }
  if (variant === 'outline') {
    return (
      <button style={{
        all: 'unset', cursor: 'pointer',
        padding: '10px 18px', borderRadius: 6,
        border: `1px solid ${vC.rule}`,
        background: 'rgba(255,255,255,0.4)',
        fontSize: 13, fontWeight: 600, color: vC.ink,
      }}>{children}</button>
    );
  }
  return (
    <button style={{
      all: 'unset', cursor: 'pointer',
      background: danger ? vC.wine : vC.ink, color: vC.paper,
      padding: '11px 18px', borderRadius: 999,
      fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {children}
      {arrow && <span style={{ fontSize: 15 }}>↵</span>}
    </button>
  );
}

// ──────────────────────────── BehindShim ──────────────────────────────────
// A simplified version of the underlying page (just outlines). Cheaper than
// pulling the whole component and looking identical doesn't matter under blur+dim.
function BehindShim() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 224, borderRight: `1px solid ${vC.rule}` }} />
      <div style={{ flex: 1, padding: '40px 44px' }}>
        <div style={{ width: 200, height: 14, background: vC.sepia, opacity: 0.5, borderRadius: 2 }} />
        <div style={{ width: 360, height: 36, background: vC.ink, opacity: 0.5, borderRadius: 4, marginTop: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 28 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 100, background: 'rgba(255,255,255,0.4)', border: `1px solid ${vC.rule}`, borderRadius: 8 }} />
          ))}
        </div>
        <div style={{ marginTop: 14, height: 240, background: 'rgba(255,255,255,0.4)', border: `1px solid ${vC.rule}`, borderRadius: 8 }} />
      </div>
    </div>
  );
}

function BehindShimDark() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 224, borderRight: `1px solid #36465a` }} />
      <div style={{ flex: 1, padding: '40px 44px' }}>
        <div style={{ width: 200, height: 14, background: '#c7a974', opacity: 0.5, borderRadius: 2 }} />
        <div style={{ width: 360, height: 36, background: '#ecdfbd', opacity: 0.4, borderRadius: 4, marginTop: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 28 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 86, background: 'rgba(255,255,255,0.03)', border: `1px solid #36465a`, borderRadius: 8 }} />
          ))}
        </div>
        <div style={{ marginTop: 14, height: 280, background: 'rgba(255,255,255,0.03)', border: `1px solid #36465a`, borderRadius: 8 }} />
      </div>
    </div>
  );
}

// ──────────────────────────── 1 · NUEVO GASTO (FULL) ─────────────────────
function ModalNewExpense() {
  return (
    <Scrim behind={<BehindShim />}>
      <ModalShell width={620}>
        <ModalHead eyebrow="Anotar movimiento" title="Nuevo" italic="gasto." />

        {/* Body */}
        <div style={{ padding: '24px 26px 8px', overflow: 'auto' }}>
          {/* Type tabs */}
          <div style={{
            display: 'inline-flex', gap: 4, padding: 4, marginBottom: 22,
            border: `1px solid ${vC.rule}`, borderRadius: 999,
            background: 'rgba(255,255,255,0.5)',
          }}>
            {[
              ['Gasto', true],
              ['Ingreso', false],
              ['Transferencia', false],
            ].map(([label, active]) => (
              <span key={label} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12.5,
                background: active ? vC.ink : 'transparent',
                color: active ? vC.paper : vC.sepia,
                fontFamily: vSerif, fontStyle: active ? 'italic' : 'normal',
                cursor: 'pointer',
              }}>{label}</span>
            ))}
          </div>

          {/* Hero amount input */}
          <div style={{ marginBottom: 26 }}>
            <FieldLabel right={<span style={{ fontFamily: vMono, color: vC.sepia, letterSpacing: '0.04em' }}>ARS</span>}>Importe</FieldLabel>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              paddingBottom: 8, borderBottom: `1.5px solid ${vC.ink}`,
            }}>
              <span style={{ fontFamily: vSerif, fontSize: 30, color: vC.sepia }}>$</span>
              <span style={{ fontFamily: vSerif, fontSize: 52, letterSpacing: '-0.03em', lineHeight: 1 }}>4.200</span>
              <span style={{
                width: 1.5, height: 38, background: vC.ink, marginLeft: 4,
                animation: 'modal-blink 1s infinite',
              }} />
            </div>
          </div>

          {/* Description + category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 22 }}>
            <div>
              <FieldLabel>Descripción</FieldLabel>
              <LineInput value="Café y medialunas" />
            </div>
            <div>
              <FieldLabel>Categoría</FieldLabel>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 999,
                border: `1px solid ${vC.ink}`,
                background: 'rgba(26,22,18,0.04)',
                fontFamily: vSerif, fontSize: 14,
                width: 'fit-content',
              }}>
                <span style={{ fontSize: 14 }}>🍽</span>
                Restaurantes
                <span style={{ color: vC.sepia, marginLeft: 4, fontSize: 12 }}>▾</span>
              </div>
            </div>
          </div>

          {/* Date + account */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
            <div>
              <FieldLabel>Fecha</FieldLabel>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 8,
                paddingBottom: 6, borderBottom: `1px solid ${vC.rule}`,
              }}>
                <span style={{ fontFamily: vSerif, fontSize: 17 }}>Hoy</span>
                <span style={{ fontFamily: vMono, fontSize: 11, color: vC.sepia }}>14 may · 14:32</span>
              </div>
            </div>
            <div>
              <FieldLabel>Cuenta</FieldLabel>
              <LineInput value="Banco Galicia · 🏦" />
            </div>
          </div>

          {/* Tags chips */}
          <div style={{ marginBottom: 22 }}>
            <FieldLabel>Etiquetas <span style={{ fontFamily: vSerif, fontStyle: 'italic', textTransform: 'none', color: vC.sepia, letterSpacing: 'normal' }}>· opcional</span></FieldLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span style={{
                padding: '4px 10px', borderRadius: 999,
                background: vC.sepiaSoft, color: vC.sepia,
                fontSize: 11.5, fontWeight: 600,
              }}>desayuno</span>
              <span style={{
                padding: '4px 10px', borderRadius: 999,
                background: vC.sepiaSoft, color: vC.sepia,
                fontSize: 11.5, fontWeight: 600,
              }}>oficina</span>
              <span style={{
                padding: '4px 10px', borderRadius: 999, border: `1px dashed ${vC.rule}`,
                color: vC.sepia, fontSize: 11.5, fontFamily: vSerif, fontStyle: 'italic',
                cursor: 'pointer',
              }}>+ agregar</span>
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 18 }}>
            <FieldLabel>Nota</FieldLabel>
            <div style={{
              fontFamily: vSerif, fontStyle: 'italic', fontSize: 14,
              color: vC.sepia, paddingBottom: 6, borderBottom: `1px solid ${vC.rule}`,
            }}>Reunión con Mariano para hablar del proyecto…</div>
          </div>

          {/* Repeat toggle */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0',
            borderTop: `1px dashed ${vC.rule}`,
          }}>
            <div>
              <div style={{ fontFamily: vSerif, fontSize: 14 }}>Repetir cada mes</div>
              <div style={{ fontSize: 11.5, color: vC.sepia, marginTop: 1 }}>El sistema lo anota solo el día 14 de cada mes</div>
            </div>
            <div style={{
              width: 36, height: 20, borderRadius: 999,
              background: vC.sepiaSoft, position: 'relative',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 999, background: vC.paper,
                position: 'absolute', top: 3, left: 3,
              }} />
            </div>
          </div>
        </div>

        <ModalFoot>
          <Btn variant="ghost">Cancelar</Btn>
          <Btn variant="outline">Guardar y otro</Btn>
          <Btn arrow>Guardar</Btn>
        </ModalFoot>
      </ModalShell>
    </Scrim>
  );
}

// ──────────────────────────── 2 · NUEVA INVERSIÓN ─────────────────────────
function ModalNewInvestment() {
  const types = [
    { id: 'ACCION', label: 'Acción', icon: '◐' },
    { id: 'BONO', label: 'Bono', icon: '◑' },
    { id: 'PF', label: 'Plazo fijo', icon: '⌛' },
    { id: 'CRYPTO', label: 'Crypto', icon: '◆' },
    { id: 'ETF', label: 'ETF', icon: '▦' },
    { id: 'CEDEAR', label: 'CEDEAR', icon: '◇' },
  ];

  const initial = 250000;
  const current = 312500;
  const roi = ((current - initial) / initial) * 100;

  // Tinta colors
  const T = {
    bg: '#1f2a38', bg2: '#27374a', rule: '#36465a',
    ink: '#ecdfbd', sepia: '#c7a974', sage: '#9ec79c', gold: '#d4a85a',
  };

  return (
    <Scrim behind={<BehindShimDark />} paper={false} dim={0.5}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 660, maxHeight: '88%',
        background: T.bg, color: T.ink,
        border: `1px solid ${T.rule}`,
        borderRadius: 12,
        boxShadow: '0 32px 70px -20px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: vSans,
      }}>
        {/* Head */}
        <div style={{
          padding: '22px 26px 18px',
          borderBottom: `1px solid ${T.rule}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.sepia, fontWeight: 600 }}>
              Sumar al portafolio
            </div>
            <div style={{ fontFamily: vSerif, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4, color: T.ink }}>
              Nueva <em style={{ color: T.sepia }}>posición.</em>
            </div>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer',
            width: 30, height: 30, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.sepia, fontSize: 18,
            border: `1px solid ${T.rule}`,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 26px 8px' }}>
          {/* Type — cards */}
          <div style={{
            fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: T.sepia, fontWeight: 600, marginBottom: 8,
          }}>Tipo de inversión</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 22 }}>
            {types.map((t) => {
              const active = t.id === 'CRYPTO';
              return (
                <div key={t.id} style={{
                  border: active ? `1.5px solid ${T.gold}` : `1px solid ${T.rule}`,
                  borderRadius: 8, padding: '12px 8px',
                  background: active ? 'rgba(212,168,90,0.08)' : 'rgba(255,255,255,0.025)',
                  textAlign: 'center', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 18, color: active ? T.gold : T.sepia }}>{t.icon}</div>
                  <div style={{
                    fontFamily: vSerif, fontSize: 12, marginTop: 4,
                    color: T.ink, fontStyle: active ? 'italic' : 'normal',
                  }}>{t.label}</div>
                </div>
              );
            })}
          </div>

          {/* Description + ticker */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.sepia, fontWeight: 600, marginBottom: 5 }}>
                Descripción
              </div>
              <div style={{
                borderBottom: `1px solid ${T.ink}`, paddingBottom: 6,
                fontFamily: vSerif, fontSize: 17, color: T.ink,
              }}>Bitcoin · cuenta Binance</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.sepia, fontWeight: 600, marginBottom: 5 }}>
                Ticker
              </div>
              <div style={{
                borderBottom: `1px solid ${T.ink}`, paddingBottom: 6,
                fontFamily: vSerif, fontSize: 17, color: T.gold, letterSpacing: '0.02em',
              }}>BTC</div>
            </div>
          </div>

          {/* Capital pair */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.sepia, fontWeight: 600, marginBottom: 5 }}>
                Capital inicial
              </div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 8,
                paddingBottom: 6, borderBottom: `1px solid ${T.ink}`,
              }}>
                <span style={{ fontFamily: vSerif, fontSize: 22, color: T.sepia }}>$</span>
                <span style={{ fontFamily: vSerif, fontSize: 28, letterSpacing: '-0.025em' }}>250.000</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.sepia, fontWeight: 600, marginBottom: 5 }}>
                Capital actual
              </div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 8,
                paddingBottom: 6, borderBottom: `1px solid ${T.ink}`,
              }}>
                <span style={{ fontFamily: vSerif, fontSize: 22, color: T.sepia }}>$</span>
                <span style={{ fontFamily: vSerif, fontSize: 28, letterSpacing: '-0.025em' }}>312.500</span>
              </div>
            </div>
          </div>

          {/* Live ROI */}
          <div style={{
            marginTop: 22, padding: '14px 18px',
            border: `1px solid ${T.rule}`, borderRadius: 10,
            background: 'rgba(158,199,156,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 10.5, color: T.sepia, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                Rendimiento calculado
              </div>
              <div style={{ fontSize: 11.5, color: T.sepia, marginTop: 2, fontFamily: vSerif, fontStyle: 'italic' }}>
                ganancia de $ 62.500
              </div>
            </div>
            <div style={{ fontFamily: vSerif, fontSize: 32, fontStyle: 'italic', color: T.sage, letterSpacing: '-0.02em' }}>
              + {roi.toFixed(1)} %
            </div>
          </div>

          {/* Linked transaction option */}
          <div style={{
            marginTop: 22, paddingTop: 18, paddingBottom: 8,
            borderTop: `1px dashed ${T.rule}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              border: `1.5px solid ${T.ink}`, background: T.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.bg, fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>✓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: vSerif, fontSize: 14, color: T.ink }}>Crear transacción de gasto vinculada</div>
              <div style={{ fontSize: 11.5, color: T.sepia, marginTop: 1 }}>
                Se anotará automáticamente un gasto de $ 250.000 en la categoría <em style={{ fontFamily: vSerif }}>Inversiones</em> con fecha de hoy.
              </div>
            </div>
          </div>
        </div>

        {/* Foot */}
        <div style={{
          padding: '14px 22px', display: 'flex', justifyContent: 'flex-end',
          gap: 8, borderTop: `1px solid ${T.rule}`,
          background: 'rgba(0,0,0,0.15)',
        }}>
          <button style={{
            all: 'unset', cursor: 'pointer',
            padding: '11px 18px',
            fontFamily: vSerif, fontStyle: 'italic',
            fontSize: 13.5, color: T.sepia,
          }}>Cancelar</button>
          <button style={{
            all: 'unset', cursor: 'pointer',
            background: T.gold, color: T.bg,
            padding: '11px 18px', borderRadius: 999,
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            Sumar posición <span style={{ fontSize: 15 }}>↵</span>
          </button>
        </div>
      </div>
    </Scrim>
  );
}

// ──────────────────────────── 3 · EDITAR META ─────────────────────────────
function ModalEditGoal() {
  return (
    <Scrim behind={<BehindShim />}>
      <ModalShell width={620}>
        <ModalHead eyebrow="Bariloche · 65 %" title="Editar" italic="meta." />

        {/* Tabs */}
        <div style={{
          padding: '0 26px', borderBottom: `1px solid ${vC.rule}`,
          display: 'flex', gap: 0,
        }}>
          {[
            ['Detalles', false],
            ['Aportes', false],
            ['Plan', true],
          ].map(([label, active], i) => (
            <button key={i} style={{
              all: 'unset', cursor: 'pointer',
              padding: '12px 18px', marginBottom: -1,
              fontFamily: vSerif, fontSize: 15,
              fontStyle: active ? 'italic' : 'normal',
              color: active ? vC.ink : vC.sepia,
              borderBottom: active ? `2px solid ${vC.ink}` : '2px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* Body — Plan tab */}
        <div style={{ padding: '24px 26px 8px' }}>
          <div style={{ fontFamily: vSerif, fontStyle: 'italic', fontSize: 15, color: vC.sepia, marginBottom: 18 }}>
            ¿Cuánto querés aportar por mes? Ajustá el slider y mirá cuándo llegás.
          </div>

          {/* Slider visual */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel right={
              <span style={{ fontFamily: vMono, color: vC.ink, letterSpacing: '0.04em' }}>$ 50.000</span>
            }>Aporte mensual</FieldLabel>
            <div style={{ position: 'relative', height: 36, paddingTop: 14 }}>
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 18, height: 4,
                background: vC.sepiaSoft, borderRadius: 999,
              }} />
              <div style={{
                position: 'absolute', left: 0, top: 18, height: 4, width: '40%',
                background: vC.ink, borderRadius: 999,
              }} />
              <div style={{
                position: 'absolute', left: '40%', top: 12, width: 16, height: 16,
                borderRadius: 999, background: vC.ink, border: `3px solid ${vC.paper}`,
                boxShadow: '0 0 0 1px ' + vC.ink,
                transform: 'translateX(-50%)',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: vMono, fontSize: 10.5, color: vC.sepia, marginTop: 2,
            }}>
              <span>$ 10.000</span>
              <span>$ 200.000</span>
            </div>
          </div>

          {/* Outcome */}
          <div style={{
            padding: '18px 22px', borderRadius: 10,
            background: 'rgba(94,122,79,0.07)',
            border: `1px solid ${vC.rule}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 18,
          }}>
            <div>
              <div style={{ fontFamily: vSerif, fontStyle: 'italic', fontSize: 14, color: vC.sepia }}>
                Vas a llegar a tu meta
              </div>
              <div style={{ fontFamily: vSerif, fontSize: 28, letterSpacing: '-0.02em', marginTop: 2 }}>
                en agosto · <em style={{ color: vC.sage }}>3 meses</em>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: vSerif, fontStyle: 'italic', fontSize: 14, color: vC.sepia }}>
                Faltan
              </div>
              <div style={{ fontFamily: vSerif, fontSize: 22, fontStyle: 'italic' }}>$ 175.000</div>
            </div>
          </div>

          {/* Variants */}
          <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: vC.sepia, fontWeight: 600, marginBottom: 8 }}>
            Alternativas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { aporte: '$ 25.000/mes', eta: 'Octubre 2026', meses: '6 meses' },
              { aporte: '$ 50.000/mes', eta: 'Agosto 2026', meses: '3 meses', active: true },
              { aporte: '$ 100.000/mes', eta: 'Julio 2026', meses: '2 meses' },
              { aporte: '$ 175.000 una vez', eta: 'Esta semana', meses: 'inmediato' },
            ].map((v, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
                gap: 12, padding: '10px 14px', borderRadius: 8,
                background: v.active ? 'rgba(26,22,18,0.05)' : 'transparent',
                border: `1px solid ${v.active ? vC.ink : vC.ruleSoft}`,
                alignItems: 'center', cursor: 'pointer',
              }}>
                <span style={{ fontFamily: vSerif, fontSize: 14, fontStyle: v.active ? 'italic' : 'normal' }}>
                  {v.aporte}
                </span>
                <span style={{ fontSize: 12, color: vC.sepia }}>{v.eta}</span>
                <span style={{ fontFamily: vMono, fontSize: 11.5, color: vC.sepia, textAlign: 'right' }}>{v.meses}</span>
              </div>
            ))}
          </div>
        </div>

        <ModalFoot>
          <Btn variant="ghost">Cancelar</Btn>
          <Btn arrow>Aplicar plan</Btn>
        </ModalFoot>
      </ModalShell>
    </Scrim>
  );
}

// ──────────────────────────── 4 · EDITAR CATEGORÍA ───────────────────────
function ModalEditCategory() {
  const colors = [vC.sepia, vC.wine, vC.sage, vC.gold, '#6a909e', '#a07b4f', '#8aa67a', '#b8895a'];
  const glyphs = ['❧', '✦', '◐', '◯', '◇', '✶', '⌬', '◑', '⛁', '⌘', '⌛', '☼'];

  return (
    <Scrim behind={<BehindShim />}>
      <ModalShell width={540}>
        <ModalHead eyebrow="Categoría · gasto" title="Editar" italic="restaurantes." />

        <div style={{ padding: '22px 26px 8px' }}>
          {/* Name */}
          <div style={{ marginBottom: 22 }}>
            <FieldLabel>Nombre</FieldLabel>
            <LineInput value="Restaurantes" focused />
          </div>

          {/* Glyph picker */}
          <div style={{ marginBottom: 22 }}>
            <FieldLabel>Glifo</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {glyphs.map((g, i) => {
                const active = i === 1;
                return (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: active ? `1.5px solid ${vC.ink}` : `1px solid ${vC.rule}`,
                    background: active ? 'rgba(26,22,18,0.06)' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: vSerif, fontSize: 16, color: vC.ink, cursor: 'pointer',
                  }}>{g}</div>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, color: vC.sepia, marginTop: 8, fontFamily: vSerif, fontStyle: 'italic' }}>
              Glifos editoriales — sin emoji, para mantener el tono cuaderno.
            </div>
          </div>

          {/* Color picker */}
          <div style={{ marginBottom: 22 }}>
            <FieldLabel>Color del acento</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {colors.map((c, i) => {
                const active = i === 1;
                return (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: 999, background: c,
                    border: active ? `2px solid ${vC.paper}` : '2px solid transparent',
                    boxShadow: active ? '0 0 0 1.5px ' + vC.ink : '0 0 0 1px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }} />
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel right={<span style={{ fontFamily: vMono, color: vC.sepia, letterSpacing: '0.04em' }}>ARS/mes</span>}>
              Presupuesto mensual
            </FieldLabel>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              paddingBottom: 6, borderBottom: `1px solid ${vC.ink}`,
            }}>
              <span style={{ fontFamily: vSerif, fontSize: 22, color: vC.sepia }}>$</span>
              <span style={{ fontFamily: vSerif, fontSize: 26, letterSpacing: '-0.02em' }}>80.000</span>
            </div>
            <div style={{ fontSize: 11.5, color: vC.sepia, marginTop: 6, fontFamily: vSerif, fontStyle: 'italic' }}>
              El mes pasado gastaste $ 76.200 en esta categoría.
            </div>
          </div>

          {/* Preview */}
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${vC.rule}`,
            background: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(154,58,46,0.12)', color: vC.wine,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: vSerif, fontSize: 16,
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: vSerif, fontSize: 14 }}>Restaurantes</div>
              <div style={{ fontSize: 11, color: vC.sepia }}>Presupuesto · $ 80.000/mes</div>
            </div>
            <div style={{ fontSize: 10.5, color: vC.sepia, fontFamily: vSerif, fontStyle: 'italic' }}>preview</div>
          </div>
        </div>

        <ModalFoot>
          <Btn variant="ghost">Archivar</Btn>
          <Btn variant="outline">Cancelar</Btn>
          <Btn arrow>Guardar</Btn>
        </ModalFoot>
      </ModalShell>
    </Scrim>
  );
}

// ──────────────────────────── 5 · CONFIRM DESTRUCTIVE ────────────────────
function ModalDestroy() {
  return (
    <Scrim behind={<BehindShim />} dim={0.5}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 460,
        background: vC.paper, color: vC.ink,
        border: `1px solid ${vC.wine}`,
        borderRadius: 12,
        boxShadow: '0 28px 60px -20px rgba(154,58,46,0.4), 0 0 0 4px rgba(154,58,46,0.06)',
        padding: '28px 30px 22px',
      }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 999,
          background: 'rgba(154,58,46,0.12)', color: vC.wine,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: vSerif, fontStyle: 'italic', fontSize: 24,
          marginBottom: 16,
        }}>!</div>

        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: vC.wine, fontWeight: 600 }}>
          Acción permanente
        </div>
        <div style={{
          fontFamily: vSerif, fontSize: 24, letterSpacing: '-0.02em',
          marginTop: 6, marginBottom: 10, lineHeight: 1.15,
        }}>
          ¿Eliminar la meta <em style={{ color: vC.sepia }}>«Vacaciones Bariloche»</em>?
        </div>
        <div style={{ fontSize: 13.5, color: '#3a322a', lineHeight: 1.55, marginBottom: 18 }}>
          Vas a perder los 7 aportes registrados ($ 325.000 en total) y el historial
          de la meta. Esta acción no se puede deshacer.
        </div>

        {/* Confirmation input */}
        <div style={{
          padding: '14px 16px',
          background: 'rgba(154,58,46,0.06)',
          border: `1px dashed ${vC.wine}`,
          borderRadius: 8, marginBottom: 8,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: vC.wine, fontWeight: 600, marginBottom: 5 }}>
            Escribí <span style={{ fontFamily: vMono, letterSpacing: '0.02em' }}>ELIMINAR</span> para confirmar
          </div>
          <div style={{
            fontFamily: vMono, fontSize: 18, letterSpacing: '0.08em',
            paddingBottom: 4, borderBottom: `1px solid ${vC.wine}`,
          }}>ELIMINAR<span style={{ animation: 'modal-blink 1s infinite', borderRight: `1.5px solid ${vC.wine}` }}>&nbsp;</span></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Btn variant="ghost">Cancelar</Btn>
          <Btn danger>Eliminar meta</Btn>
        </div>
      </div>
    </Scrim>
  );
}

// ──────────────────────────── 6 · TOASTS (PAPER STRIPS) ──────────────────
function ToastDemo() {
  return (
    <Scrim behind={<BehindShim />} dim={0.05}>
      {/* Stack of toasts bottom-right */}
      <div style={{
        position: 'absolute', bottom: 30, right: 30,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Success */}
        <div style={{
          background: vC.paper, color: vC.ink,
          border: `1px solid ${vC.sage}`,
          borderLeft: `4px solid ${vC.sage}`,
          borderRadius: 6, width: 380,
          padding: '12px 16px',
          boxShadow: '0 18px 30px -16px rgba(26,22,18,0.32)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: 'rgba(94,122,79,0.15)', color: vC.sage,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: vSerif, fontSize: 16, fontStyle: 'italic', flexShrink: 0,
          }}>✓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: vSerif, fontStyle: 'italic', fontSize: 15, color: vC.sage }}>
              Anotado.
            </div>
            <div style={{ fontSize: 12.5, color: vC.sepia, marginTop: 2 }}>
              $ 4.200 en Restaurantes · hoy 14:32
            </div>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer',
            color: vC.sepia, fontSize: 14, marginTop: -2,
          }}>×</button>
        </div>

        {/* Info — neutral */}
        <div style={{
          background: vC.paper, color: vC.ink,
          border: `1px solid ${vC.rule}`,
          borderLeft: `4px solid ${vC.sepia}`,
          borderRadius: 6, width: 380,
          padding: '12px 16px',
          boxShadow: '0 18px 30px -16px rgba(26,22,18,0.32)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: vC.sepiaSoft, color: vC.sepia,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: vSerif, fontSize: 14, fontStyle: 'italic', flexShrink: 0,
          }}>i</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: vSerif, fontStyle: 'italic', fontSize: 15, color: vC.ink }}>
              Recordatorio: aporte de mayo.
            </div>
            <div style={{ fontSize: 12.5, color: vC.sepia, marginTop: 2 }}>
              Faltan tres días para tu aporte mensual de $ 50.000 a Bariloche.
            </div>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer',
            color: vC.sepia, fontSize: 14, marginTop: -2,
          }}>×</button>
        </div>

        {/* Error */}
        <div style={{
          background: vC.paper, color: vC.ink,
          border: `1px solid ${vC.wine}`,
          borderLeft: `4px solid ${vC.wine}`,
          borderRadius: 6, width: 380,
          padding: '12px 16px',
          boxShadow: '0 18px 30px -16px rgba(26,22,18,0.32)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: 'rgba(154,58,46,0.12)', color: vC.wine,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: vSerif, fontSize: 16, fontStyle: 'italic', flexShrink: 0,
          }}>!</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: vSerif, fontStyle: 'italic', fontSize: 15, color: vC.wine }}>
              Excediste el presupuesto.
            </div>
            <div style={{ fontSize: 12.5, color: vC.sepia, marginTop: 2 }}>
              Restaurantes · llevás 112% de $ 80.000.
            </div>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer',
            color: vC.sepia, fontSize: 14, marginTop: -2,
          }}>×</button>
        </div>
      </div>

      {/* Tip label, top-left */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        background: 'rgba(26,22,18,0.7)', color: vC.paper,
        padding: '6px 12px', borderRadius: 999,
        fontFamily: vSerif, fontStyle: 'italic', fontSize: 13,
      }}>Toasts · 3 variantes</div>
    </Scrim>
  );
}

// ──────────────────────────── 7 · MOBILE BOTTOM SHEET — GASTO ─────────────
function MobileSheetNewExpense() {
  return (
    <IOSDevice>
      <div style={{
        height: '100%', position: 'relative',
        background: vC.paper, color: vC.ink, fontFamily: vSans,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.55), transparent 60%),' +
          'radial-gradient(circle at 90% 95%, rgba(196,170,120,0.16), transparent 50%)',
      }}>
        {/* Behind shim */}
        <div style={{ height: '100%', opacity: 0.5, filter: 'blur(2px)', padding: '50px 22px 0' }}>
          <div style={{ width: 140, height: 12, background: vC.sepia, opacity: 0.6, borderRadius: 2 }} />
          <div style={{ width: 260, height: 28, background: vC.ink, opacity: 0.5, borderRadius: 4, marginTop: 8 }} />
          <div style={{
            height: 120, marginTop: 22,
            background: 'rgba(255,255,255,0.4)',
            border: `1px solid ${vC.rule}`, borderRadius: 12,
          }} />
        </div>

        {/* Dim */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,22,18,0.45)' }} />

        {/* Sheet — comes up from bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: vC.paper, color: vC.ink,
          borderRadius: '20px 20px 0 0',
          borderTop: `1px solid ${vC.rule}`,
          boxShadow: '0 -20px 40px -16px rgba(26,22,18,0.4)',
          padding: '12px 22px 40px',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.55), transparent 50%)',
        }}>
          {/* Handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 999, background: vC.rule,
            margin: '0 auto 14px',
          }} />

          <div style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: vC.sepia, fontWeight: 600 }}>
            Anotar gasto
          </div>
          <div style={{ fontFamily: vSerif, fontSize: 24, letterSpacing: '-0.02em', marginTop: 4, marginBottom: 18 }}>
            Nuevo <em style={{ color: vC.sepia }}>movimiento.</em>
          </div>

          {/* Amount hero */}
          <div style={{
            paddingBottom: 8, borderBottom: `1.5px solid ${vC.ink}`,
            marginBottom: 18,
            display: 'flex', alignItems: 'baseline', gap: 8,
          }}>
            <span style={{ fontFamily: vSerif, fontSize: 24, color: vC.sepia }}>$</span>
            <span style={{ fontFamily: vSerif, fontSize: 42, letterSpacing: '-0.03em', lineHeight: 1 }}>4.200</span>
            <span style={{
              width: 1.5, height: 32, background: vC.ink, marginLeft: 4,
              animation: 'modal-blink 1s infinite',
            }} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Descripción</FieldLabel>
            <LineInput value="Café y medialunas" />
          </div>

          {/* Category chips */}
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Categoría</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {[
                ['🛒', 'Super', false],
                ['🍽', 'Resto', true],
                ['🚇', 'Transporte', false],
                ['⚡', 'Servicios', false],
                ['⚕', 'Salud', false],
              ].map(([icon, label, active]) => (
                <span key={label} style={{
                  padding: '6px 11px', borderRadius: 999,
                  border: active ? `1px solid ${vC.ink}` : `1px solid ${vC.rule}`,
                  background: active ? vC.ink : 'rgba(255,255,255,0.4)',
                  color: active ? vC.paper : vC.ink,
                  fontFamily: vSerif, fontSize: 13,
                  fontStyle: active ? 'italic' : 'normal',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <span>{icon}</span>{label}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button style={{
            all: 'unset', cursor: 'pointer', width: '100%',
            background: vC.ink, color: vC.paper,
            padding: '14px', borderRadius: 999, marginTop: 6,
            fontSize: 14, fontWeight: 600, textAlign: 'center',
            boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Guardar <span style={{ fontSize: 15 }}>↵</span>
          </button>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, {
  ModalNewExpense, ModalNewInvestment, ModalEditGoal,
  ModalEditCategory, ModalDestroy, ToastDemo,
  MobileSheetNewExpense,
});
