import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const mainItems = [
  { to: '/dashboard',    label: 'Hoy' },
  { to: '/transactions', label: 'Transacciones' },
  { to: '/categories',   label: 'Categorías' },
  { to: '/reports',      label: 'Reportes' },
  { to: '/goals',        label: 'Metas' },
]

const asideItems = [
  { to: '/investments', label: 'Inversiones' },
]

function navItemClass(isActive: boolean) {
  return cn(
    'flex items-center gap-2 px-2.5 py-2 rounded-xs font-serif text-[17px] leading-none tracking-tight',
    'transition-colors',
    isActive
      ? 'bg-ink text-paper italic'
      : 'text-ink hover:bg-sepia-soft',
  )
}

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen text-ink">
      <aside className="w-56 flex flex-col px-[22px] py-7 border-r border-rule flex-shrink-0">
        <div>
          <div className="font-serif font-medium text-[22px] tracking-tight leading-none">
            MyFinances<span className="text-wine">.</span>
          </div>
          <div className="text-[10.5px] tracking-[0.16em] uppercase text-sepia mt-1 font-semibold">
            Cuaderno de cuentas
          </div>
        </div>

        <nav className="mt-9 flex flex-col gap-0.5">
          {mainItems.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navItemClass(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="text-[11px]">❧</span>}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="h-px bg-rule my-2.5" />

          {asideItems.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navItemClass(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="text-[11px]">❧</span>}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 flex flex-col gap-1">
          <NavLink to="/profile" className={({ isActive }) => navItemClass(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <span className="text-[11px]">❧</span>}
                <span>{user ? `${user.firstName} ${user.lastName}` : 'Perfil'}</span>
              </>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-left px-2.5 py-2 rounded-xs font-serif italic text-[15px] text-sepia hover:text-wine transition-colors"
          >
            Cerrar sesión
          </button>

          <p className="mt-6 font-serif italic text-[11.5px] leading-snug text-sepia">
            «Quien no sabe lo que gasta, ignora lo que vale.»
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="px-11 py-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
