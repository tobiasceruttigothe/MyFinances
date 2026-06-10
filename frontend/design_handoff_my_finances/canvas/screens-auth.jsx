// Login + Register — paper notebook "cover".
// Centered card; the marketing column on the left tells the story.

const { C: aC, fontSans: aSans, fontSerif: aSerif, fontMono: aMono } = window.Cuaderno;

// ──────────────────────────────── LOGIN ────────────────────────────────────
function LoginScreen() {
  return (
    <div className="artboard" style={{
      width: 1280, height: 800, background: aC.paper, color: aC.ink,
      fontFamily: aSans, display: 'flex',
      backgroundImage:
        'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.5), transparent 50%),' +
        'radial-gradient(circle at 75% 80%, rgba(196,170,120,0.22), transparent 45%)',
    }}>
      {/* Left — story column */}
      <section style={{
        flex: 1.05, padding: '64px 64px 56px',
        borderRight: `1px solid ${aC.rule}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontFamily: aSerif, fontSize: 26, letterSpacing: '-0.02em', fontWeight: 500 }}>
          MyFinances<span style={{ color: aC.wine }}>.</span>
        </div>
        <div style={{
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: aC.sepia, fontWeight: 600, marginTop: 4,
        }}>Cuaderno de cuentas</div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600 }}>
            Bienvenido, otra vez.
          </div>
          <h1 style={{
            fontFamily: aSerif, fontWeight: 400, fontSize: 52,
            letterSpacing: '-0.025em', lineHeight: 1.05, margin: '10px 0 18px',
            maxWidth: 480,
          }}>
            «Quien no sabe lo que gasta, <em style={{ color: aC.sepia }}>ignora lo que vale.»</em>
          </h1>
          <p style={{
            fontSize: 15, lineHeight: 1.55, color: '#3a322a', maxWidth: 440,
            margin: 0,
          }}>
            Tu cuaderno está esperándote. Entrá y seguí escribiendo dónde se
            van tus pesos — y de paso, dónde van a ir.
          </p>
        </div>

        {/* tiny "today" preview, like a page peeking */}
        <div style={{
          marginTop: 36, border: `1px solid ${aC.rule}`, borderRadius: 6,
          padding: '12px 16px', background: 'rgba(255,255,255,0.4)',
          maxWidth: 360, transform: 'rotate(-1deg)',
          boxShadow: '0 8px 20px -12px rgba(26,22,18,0.25)',
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600 }}>
            Página de hoy · 14 de mayo
          </div>
          <div style={{
            marginTop: 8, display: 'flex', justifyContent: 'space-between',
            fontFamily: aMono, fontSize: 11.5, color: aC.ink,
          }}>
            <span>14:32 · Coto Caballito</span>
            <span>− $ 12.840</span>
          </div>
          <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontFamily: aMono, fontSize: 11.5 }}>
            <span>09:00 · Sueldo mayo</span>
            <span style={{ color: aC.sage }}>+ $ 520.000</span>
          </div>
          <div style={{
            marginTop: 10, paddingTop: 8,
            borderTop: `1px dashed ${aC.rule}`,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: aC.sepia, fontStyle: 'italic', fontFamily: aSerif }}>Neto del día</span>
            <span style={{ fontFamily: aSerif, fontSize: 15, color: aC.sage }}>+ $ 507.160</span>
          </div>
        </div>
      </section>

      {/* Right — form */}
      <section style={{
        flex: 0.95, padding: '64px 72px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600 }}>
            Acceder
          </div>
          <h2 style={{
            fontFamily: aSerif, fontWeight: 400, fontSize: 36,
            letterSpacing: '-0.025em', lineHeight: 1.05, margin: '6px 0 28px',
          }}>
            Abrí <em style={{ color: aC.sepia }}>tu cuaderno.</em>
          </h2>

          {/* fields */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600, marginBottom: 6 }}>
              Email
            </div>
            <div style={{
              borderBottom: `1px solid ${aC.ink}`, paddingBottom: 6,
              fontFamily: aSerif, fontSize: 18,
            }}>tobias.cerutti@gmail.com</div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: aC.sepia, fontWeight: 600, marginBottom: 6,
            }}>
              <span>Contraseña</span>
              <span style={{ textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>Olvidé</span>
            </div>
            <div style={{
              borderBottom: `1px solid ${aC.rule}`, paddingBottom: 6,
              fontFamily: aSerif, fontSize: 18, letterSpacing: '0.2em',
              color: aC.ink,
            }}>••••••••••</div>
          </div>

          {/* primary button */}
          <button style={{
            all: 'unset', cursor: 'pointer', width: '100%',
            background: aC.ink, color: aC.paper, padding: '14px 18px',
            borderRadius: 999, fontSize: 14, fontWeight: 600,
            textAlign: 'center', letterSpacing: '0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxSizing: 'border-box',
          }}>
            Entrar al cuaderno
            <span style={{ fontSize: 16 }}>→</span>
          </button>

          {/* divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '22px 0', fontSize: 11.5, color: aC.sepia,
            fontStyle: 'italic', fontFamily: aSerif,
          }}>
            <div style={{ flex: 1, height: 1, background: aC.rule }} /> o continuá con <div style={{ flex: 1, height: 1, background: aC.rule }} />
          </div>

          <button style={{
            all: 'unset', cursor: 'pointer', width: '100%',
            border: `1px solid ${aC.rule}`, padding: '12px 18px',
            borderRadius: 999, fontSize: 13.5, fontWeight: 600,
            textAlign: 'center', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.4)',
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 999,
              background: 'conic-gradient(from -90deg, #ea4335, #fbbc04 90deg, #34a853 180deg, #4285f4 270deg, #ea4335)',
              display: 'inline-block',
            }} />
            Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: aC.sepia }}>
            ¿Primera vez? <span style={{ color: aC.ink, fontFamily: aSerif, fontStyle: 'italic', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>Empezá tu cuaderno</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────── REGISTER ──────────────────────────────────
function RegisterScreen() {
  return (
    <div className="artboard" style={{
      width: 1280, height: 800, background: aC.paper, color: aC.ink,
      fontFamily: aSans, display: 'flex',
      backgroundImage:
        'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.5), transparent 50%),' +
        'radial-gradient(circle at 75% 80%, rgba(196,170,120,0.22), transparent 45%)',
    }}>
      <section style={{
        flex: 1.05, padding: '64px 64px 56px',
        borderRight: `1px solid ${aC.rule}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontFamily: aSerif, fontSize: 26, letterSpacing: '-0.02em', fontWeight: 500 }}>
          MyFinances<span style={{ color: aC.wine }}>.</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600, marginTop: 4 }}>
          Cuaderno de cuentas
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600 }}>
            Empezá hoy
          </div>
          <h1 style={{ fontFamily: aSerif, fontWeight: 400, fontSize: 52, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '10px 0 24px', maxWidth: 480 }}>
            La primera página de <em style={{ color: aC.sepia }}>tu vida financiera.</em>
          </h1>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
            {[
              ['Anotá un gasto en cinco segundos.', 'Sin formularios largos. Línea de cuaderno y enter.'],
              ['Tus inversiones en otra tapa.', 'Plazo fijo, CEDEARs y crypto en un mismo lugar.'],
              ['Metas que llegan solas.', 'Aportes automáticos y proyección visible.'],
            ].map(([h, p], i) => (
              <li key={i} style={{ display: 'flex', gap: 14 }}>
                <span style={{
                  fontFamily: aSerif, fontStyle: 'italic', fontSize: 22, color: aC.sepia,
                  width: 24, flexShrink: 0,
                }}>{['I', 'II', 'III'][i]}</span>
                <div>
                  <div style={{ fontFamily: aSerif, fontSize: 17, fontWeight: 500 }}>{h}</div>
                  <div style={{ fontSize: 13, color: '#3a322a', marginTop: 2 }}>{p}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{
        flex: 0.95, padding: '52px 72px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600 }}>
            Crear cuenta
          </div>
          <h2 style={{ fontFamily: aSerif, fontWeight: 400, fontSize: 32, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '6px 0 24px' }}>
            Abrí <em style={{ color: aC.sepia }}>un cuaderno nuevo.</em>
          </h2>

          {/* fields stacked */}
          {[
            ['Nombre', 'Tobías'],
            ['Apellido', 'Cerutti'],
            ['Email', 'tobias.cerutti@gmail.com'],
            ['Contraseña', '••••••••••', 'pw'],
          ].map(([l, v, type], i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600, marginBottom: 5 }}>
                {l}
              </div>
              <div style={{
                borderBottom: `1px solid ${i < 3 ? aC.ink : aC.rule}`, paddingBottom: 5,
                fontFamily: aSerif, fontSize: 17, letterSpacing: type === 'pw' ? '0.2em' : 'normal',
              }}>{v}</div>
            </div>
          ))}

          {/* Currency selector */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: aC.sepia, fontWeight: 600, marginBottom: 7 }}>
              Moneda principal
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                ['ARS', '$', true],
                ['USD', 'US$', false],
                ['EUR', '€', false],
              ].map(([code, sym, a], i) => (
                <button key={i} style={{
                  all: 'unset', cursor: 'pointer', padding: '6px 12px',
                  borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: a ? aC.ink : 'transparent',
                  color: a ? aC.paper : aC.ink,
                  border: a ? 'none' : `1px solid ${aC.rule}`,
                  display: 'flex', alignItems: 'center', gap: 6, fontFamily: aSerif, fontStyle: a ? 'italic' : 'normal',
                }}>
                  {sym} {code}
                </button>
              ))}
            </div>
          </div>

          <button style={{
            all: 'unset', cursor: 'pointer', width: '100%',
            background: aC.ink, color: aC.paper, padding: '14px 18px',
            borderRadius: 999, fontSize: 14, fontWeight: 600,
            textAlign: 'center', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Abrir mi cuaderno
            <span style={{ fontSize: 16 }}>→</span>
          </button>

          <div style={{ marginTop: 14, fontSize: 11, color: aC.sepia, textAlign: 'center', lineHeight: 1.5 }}>
            Al continuar aceptás los <span style={{ textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}>términos</span> y la <span style={{ textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}>política de privacidad</span>.
          </div>

          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: aC.sepia }}>
            ¿Ya tenés cuenta? <span style={{ color: aC.ink, fontFamily: aSerif, fontStyle: 'italic', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>Entrá</span>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
