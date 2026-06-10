// Categories + Profile screens.

const { C: cC, fontSans: cSans, fontSerif: cSerif, fontMono: cMono,
        CuadernoPage: CCP, PageHead: CPH, InkButton: CIB, PaperCard: CPC, SectionTitle: CST } = window.Cuaderno;
const { fmt: cFmt, CATEGORIES_FULL: CATS } = window.MF;

// ──────────────────────────────── CATEGORÍAS ───────────────────────────────
function CategoriesScreen() {
  const expenses = CATS.filter((c) => c.kind === 'EXPENSE');
  const incomes  = CATS.filter((c) => c.kind === 'INCOME');

  return (
    <CCP active="Categorías" subtitle="Cuaderno de cuentas">
      <CPH eyebrow="Categorías · 10 activas" title="Tus " right={<CIB icon="+">Nueva categoría</CIB>}>
        <em style={{ color: cC.sepia }}>etiquetas.</em>
      </CPH>

      {/* tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 18,
        borderBottom: `1px solid ${cC.rule}`,
      }}>
        {[
          ['Gastos', 8, true],
          ['Ingresos', 2, false],
          ['Archivadas', 3, false],
        ].map(([label, count, active], i) => (
          <button key={i} style={{
            all: 'unset', cursor: 'pointer',
            padding: '10px 18px', fontFamily: cSerif, fontSize: 15,
            fontStyle: active ? 'italic' : 'normal',
            color: active ? cC.ink : cC.sepia,
            borderBottom: active ? `2px solid ${cC.ink}` : '2px solid transparent',
            marginBottom: -1,
            display: 'flex', alignItems: 'baseline', gap: 6,
          }}>
            {label}
            <span style={{
              fontFamily: cMono, fontSize: 10.5,
              color: cC.sepia, fontStyle: 'normal',
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Expense categories */}
      <CPC padding="0">
        {/* header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 110px 130px 1fr 70px',
          gap: 12, padding: '12px 22px',
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: cC.sepia, fontWeight: 600,
          borderBottom: `1px solid ${cC.rule}`,
        }}>
          <span></span>
          <span>Categoría</span>
          <span style={{ textAlign: 'right' }}>Tx mes</span>
          <span style={{ textAlign: 'right' }}>Gastado</span>
          <span>Uso del presupuesto</span>
          <span style={{ textAlign: 'right' }}>Acciones</span>
        </div>
        {expenses.map((c, i) => {
          const pct = c.budget ? Math.min((c.month / c.budget) * 100, 130) : 0;
          const over = c.budget && c.month > c.budget;
          return (
            <div key={c.name} style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 110px 130px 1fr 70px',
              gap: 12, padding: '14px 22px', alignItems: 'center',
              borderBottom: i < expenses.length - 1 ? `1px solid ${cC.ruleSoft}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: cC.sepiaSoft, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily: cSerif, fontSize: 16 }}>{c.name}</div>
                {c.budget && (
                  <div style={{ fontSize: 11, color: cC.sepia, marginTop: 1 }}>
                    presupuesto {cFmt(c.budget)}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: cMono, fontSize: 12, color: cC.sepia, textAlign: 'right' }}>{c.txs}</span>
              <span style={{ fontFamily: cSerif, fontSize: 16, textAlign: 'right' }}>{cFmt(c.month)}</span>
              {/* budget bar */}
              <div>
                <div style={{ height: 5, background: cC.sepiaSoft, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: Math.min(pct, 100) + '%', height: '100%',
                    background: over ? cC.wine : c.color,
                  }} />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginTop: 4,
                  fontSize: 10.5, color: over ? cC.wine : cC.sepia, fontFamily: cMono,
                }}>
                  <span>{pct.toFixed(0)}% usado</span>
                  {over && <span style={{ fontStyle: 'italic', fontFamily: cSerif, fontSize: 11 }}>excedido</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <button style={{
                  all: 'unset', cursor: 'pointer', padding: '4px 8px',
                  fontFamily: cSerif, fontSize: 12, fontStyle: 'italic', color: cC.sepia,
                }}>editar</button>
              </div>
            </div>
          );
        })}
      </CPC>

      {/* Income categories — small footer block */}
      <div style={{
        marginTop: 16, fontSize: 11, color: cC.sepia,
        letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600,
        marginBottom: 8,
      }}>
        Categorías de ingreso · {incomes.length}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {incomes.map((c) => (
          <div key={c.name} style={{
            border: `1px solid ${cC.rule}`, borderRadius: 999,
            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.4)',
          }}>
            <span style={{ fontSize: 14 }}>{c.icon}</span>
            <span style={{ fontFamily: cSerif, fontSize: 14 }}>{c.name}</span>
            <span style={{ fontFamily: cMono, fontSize: 11, color: cC.sepia }}>
              {cFmt(c.month)} · {c.txs} tx
            </span>
          </div>
        ))}
      </div>
    </CCP>
  );
}

// ──────────────────────────────── PROFILE ──────────────────────────────────
function ProfileScreen() {
  return (
    <CCP active="" subtitle="Cuaderno de cuentas">
      <CPH eyebrow="Perfil" title="Hola, " right={<CIB variant="outline">Cerrar sesión</CIB>}>
        <em style={{ color: cC.sepia }}>Tobías.</em>
      </CPH>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 22 }}>
        {/* Left: identity card */}
        <CPC padding="22px">
          <div style={{
            width: 84, height: 84, borderRadius: 999,
            background: cC.ink, color: cC.paper, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: cSerif, fontSize: 34, fontStyle: 'italic',
            marginBottom: 16,
          }}>TC</div>
          <div style={{ fontFamily: cSerif, fontSize: 22, letterSpacing: '-0.02em' }}>Tobías Cerutti</div>
          <div style={{ fontSize: 12.5, color: cC.sepia, marginTop: 2 }}>tobias.cerutti@gmail.com</div>

          <div style={{
            marginTop: 18, paddingTop: 16,
            borderTop: `1px dashed ${cC.rule}`,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              ['Miembro desde', 'Enero 2026'],
              ['Plan', 'Personal'],
              ['Moneda', 'Pesos argentinos (ARS)'],
              ['Zona horaria', 'Buenos Aires · GMT-3'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11.5, color: cC.sepia, letterSpacing: '0.04em' }}>{l}</span>
                <span style={{ fontFamily: cSerif, fontSize: 13, fontStyle: 'italic' }}>{v}</span>
              </div>
            ))}
          </div>
        </CPC>

        {/* Right: settings sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Personal */}
          <CPC padding="20px 22px">
            <CST>Información personal</CST>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                ['Nombre', 'Tobías'],
                ['Apellido', 'Cerutti'],
                ['Email', 'tobias.cerutti@gmail.com'],
                ['Teléfono', '+54 9 11 5555-0123'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: cC.sepia, marginBottom: 6, fontWeight: 600 }}>{l}</div>
                  <div style={{
                    borderBottom: `1px solid ${cC.rule}`, paddingBottom: 6,
                    fontFamily: cSerif, fontSize: 16,
                  }}>{v}</div>
                </div>
              ))}
            </div>
          </CPC>

          {/* Preferences */}
          <CPC padding="20px 22px">
            <CST>Preferencias</CST>
            {[
              { l: 'Notificaciones por email', d: 'Resumen semanal cada lunes', on: true },
              { l: 'Recordatorios de gasto', d: 'Aviso si dejás un día sin registrar', on: true },
              { l: 'Modo claro/oscuro automático', d: 'Sigue la hora del día', on: false },
              { l: 'Compartir reportes con tu pareja', d: 'Acceso de lectura a María', on: false },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderTop: i > 0 ? `1px dashed ${cC.ruleSoft}` : 'none',
              }}>
                <div>
                  <div style={{ fontFamily: cSerif, fontSize: 15 }}>{p.l}</div>
                  <div style={{ fontSize: 11.5, color: cC.sepia, marginTop: 2 }}>{p.d}</div>
                </div>
                {/* toggle */}
                <div style={{
                  width: 36, height: 20, borderRadius: 999,
                  background: p.on ? cC.ink : cC.sepiaSoft,
                  position: 'relative', cursor: 'pointer',
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 999, background: cC.paper,
                    position: 'absolute', top: 3, left: p.on ? 19 : 3,
                    transition: 'left 0.15s',
                  }} />
                </div>
              </div>
            ))}
          </CPC>

          {/* Sessions / danger */}
          <CPC padding="20px 22px">
            <CST right={
              <span style={{ fontSize: 11, color: cC.sepia, letterSpacing: '0.12em', textTransform: 'uppercase' }}>2 activas</span>
            }>Sesiones activas</CST>
            {[
              { device: 'MacBook · Buenos Aires', last: 'Ahora', current: true },
              { device: 'iPhone 14 · Buenos Aires', last: 'hace 2 horas' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderTop: i > 0 ? `1px dashed ${cC.ruleSoft}` : 'none',
              }}>
                <div>
                  <div style={{ fontFamily: cSerif, fontSize: 15 }}>{s.device}</div>
                  <div style={{ fontSize: 11.5, color: cC.sepia, marginTop: 2 }}>
                    Última actividad · {s.last}
                  </div>
                </div>
                {s.current ? (
                  <span style={{ fontFamily: cSerif, fontSize: 12, fontStyle: 'italic', color: cC.sage }}>actual</span>
                ) : (
                  <button style={{ all: 'unset', cursor: 'pointer', fontFamily: cSerif, fontStyle: 'italic', fontSize: 12, color: cC.wine }}>
                    cerrar
                  </button>
                )}
              </div>
            ))}
          </CPC>
        </div>
      </div>
    </CCP>
  );
}

Object.assign(window, { CategoriesScreen, ProfileScreen });
