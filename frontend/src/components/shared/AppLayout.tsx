import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Fini } from '@/components/shared/Fini'
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
    'flex items-center gap-2 px-3.5 py-2 rounded-pill font-serif text-[16px] leading-none tracking-tight font-semibold',
    'transition-colors',
    isActive
      ? 'bg-ink text-paper'
      : 'text-ink hover:bg-pig-soft',
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
        <div className="flex items-center gap-2.5">
          <Fini mood="happy" size={44} animated coin />
          <div>
            <div className="font-serif font-bold text-[21px] tracking-tight leading-none">
              My-Finances
            </div>
            <div className="text-[10.5px] tracking-[0.14em] uppercase text-pig-deep mt-1 font-bold">
              con Fini 🪙
            </div>
          </div>
        </div>

        <nav className="mt-9 flex flex-col gap-0.5">
          {mainItems.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navItemClass(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-pill bg-pig" />}
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
                  {isActive && <span className="w-1.5 h-1.5 rounded-pill bg-pig" />}
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
                {isActive && <span className="w-1.5 h-1.5 rounded-pill bg-pig" />}
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

          <p className="mt-6 text-[11.5px] leading-snug text-sepia font-semibold">
            Fini dice: «anotá ese gasto antes de que se escape» 🐷
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
