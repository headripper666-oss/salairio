import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, TrendingUp, Timer, Banknote,
  Settings2, CalendarRange, LogOut,
} from 'lucide-react'
import { signOut } from '@/lib/firebase'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/home',     Icon: Home,          label: 'Accueil',          section: 'main' },
  { path: '/summary',  Icon: TrendingUp,     label: 'Synthèse mensuelle', section: 'main' },
  { path: '/counter',  Icon: Timer,          label: 'Compteur heures',  section: 'main' },
  { path: '/bonuses',  Icon: Banknote,       label: 'Primes',           section: 'main' },
  { path: '/annual',   Icon: CalendarRange,  label: 'Tableau annuel',   section: 'views' },
  { path: '/settings', Icon: Settings2,      label: 'Réglages',         section: 'config' },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Menu principal">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo" aria-hidden="true">S</div>
        <span className="sidebar-app-name">Salairio</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>

        {NAV_ITEMS.map(({ path, Icon, label }) => {
          const isActive = location.pathname === path

          return (
            <NavLink
              key={path}
              to={path}
              className={`sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="sidebar-link-label">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer utilisateur */}
      <div className="sidebar-footer">
        {user?.email && (
          <p className="sidebar-user-email" title={user.email}>
            {user.email}
          </p>
        )}
        <button className="logout-btn" onClick={handleLogout} type="button">
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
