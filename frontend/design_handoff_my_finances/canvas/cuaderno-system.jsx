// Cuaderno design system — shared chrome and tokens.
// Light "paper" palette is the default; the dark "Tinta" palette is exposed
// for the Inversiones panel.

const C = {
  paper:     '#f4ecdd',
  paper2:    '#ede2cd',
  ink:       '#1a1612',
  rule:      '#c9bca0',
  ruleSoft:  'rgba(201,188,160,0.5)',
  sepia:     '#7c5a2a',
  sepiaSoft: 'rgba(124,90,42,0.12)',
  sage:      '#5e7a4f',
  wine:      '#9a3a2e',
  gold:      '#d4a657',
};

const fontSans  = '"Hanken Grotesk", system-ui, sans-serif';
const fontSerif = '"Newsreader", serif';
const fontMono  = '"JetBrains Mono", monospace';

// ─────────────────────────── Sidebar (shared) ────────────────────────────────
// Reused on every full-app page so the chrome stays consistent.
function CuadernoSidebar({ active = 'Hoy', subtitle = 'Cuaderno de cuentas' }) {
  const items = [
    'Hoy',
    'Transacciones',
    'Categorías',
    'Reportes',
    'Metas',
  ];
  return (
    <aside style={{
      width: 224, padding: '28px 22px',
      borderRight: `1px solid ${C.rule}`,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{
        fontFamily: fontSerif, fontWeight: 500, fontSize: 22,
        letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        MyFinances<span style={{ color: C.wine }}>.</span>
      </div>
      <div style={{
        fontSize: 10.5, color: C.sepia, marginTop: 4,
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>{subtitle}</div>

      <nav style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((label) => {
          const a = label === active;
          return (
            <button key={label} style={{
              all: 'unset', cursor: 'pointer', padding: '8px 10px', borderRadius: 4,
              fontFamily: fontSerif, fontSize: 17, letterSpacing: '-0.01em',
              fontStyle: a ? 'italic' : 'normal',
              background: a ? C.ink : 'transparent',
              color: a ? C.paper : C.ink,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {a && <span style={{ fontSize: 11 }}>❧</span>}
              {label}
            </button>
          );
        })}
        <div style={{ height: 1, background: C.rule, margin: '10px 0' }} />
        <button style={{
          all: 'unset', cursor: 'pointer', padding: '8px 10px', borderRadius: 4,
          fontFamily: fontSerif, fontSize: 17, letterSpacing: '-0.01em',
          color: C.ink, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          Inversiones
        </button>
      </nav>

      <div style={{
        marginTop: 'auto', fontSize: 11.5, color: C.sepia, lineHeight: 1.55,
        fontStyle: 'italic', fontFamily: fontSerif,
      }}>
        «Quien no sabe lo que gasta, ignora lo que vale.»
      </div>
    </aside>
  );
}

// ───────────────────────────── Page shell ────────────────────────────────────
// Full-app frame: sidebar + scrollable main area. All app screens use this.
function CuadernoPage({ active, subtitle, children }) {
  return (
    <div className="artboard" style={{
      width: 1280, height: 800, background: C.paper, color: C.ink,
      fontFamily: fontSans, display: 'flex',
      backgroundImage:
        'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 50%),' +
        'radial-gradient(circle at 80% 90%, rgba(196,170,120,0.18), transparent 40%)',
    }}>
      <CuadernoSidebar active={active} subtitle={subtitle} />
      <main style={{ flex: 1, padding: '32px 44px', overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

// ───────────────────────────── Small primitives ──────────────────────────────
function PageHead({ eyebrow, title, children, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      marginBottom: 22,
    }}>
      <div>
        <div style={{
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: C.sepia, fontWeight: 600,
        }}>{eyebrow}</div>
        <h1 style={{
          fontFamily: fontSerif, fontWeight: 400, fontSize: 36,
          letterSpacing: '-0.025em', lineHeight: 1.05, margin: '6px 0 0',
        }}>{title}{children}</h1>
      </div>
      {right}
    </div>
  );
}

function InkButton({ children, variant = 'solid', icon }) {
  const solid = variant === 'solid';
  return (
    <button style={{
      all: 'unset', cursor: 'pointer',
      background: solid ? C.ink : 'transparent',
      color: solid ? C.paper : C.ink,
      border: solid ? 'none' : `1px solid ${C.rule}`,
      padding: '11px 18px', borderRadius: solid ? 999 : 6,
      fontSize: 13.5, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>}
      {children}
    </button>
  );
}

function PaperCard({ children, padding = '18px 22px', style = {} }) {
  return (
    <div style={{
      border: `1px solid ${C.rule}`, borderRadius: 8,
      background: 'rgba(255,255,255,0.4)',
      padding, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      marginBottom: 14,
    }}>
      <div style={{
        fontFamily: fontSerif, fontSize: 19, fontStyle: 'italic', fontWeight: 500,
      }}>{children}</div>
      {right}
    </div>
  );
}

window.Cuaderno = {
  C, fontSans, fontSerif, fontMono,
  CuadernoSidebar, CuadernoPage, PageHead, InkButton, PaperCard, SectionTitle,
};
