import { NavLink, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Timer, CalendarRange, Settings2 } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/home',     Icon: Home,          label: 'Accueil'  },
  { path: '/summary',  Icon: TrendingUp,    label: 'Synthèse' },
  { path: '/counter',  Icon: Timer,         label: 'Compteur' },
  { path: '/annual',   Icon: CalendarRange, label: 'Annuel'   },
  { path: '/settings', Icon: Settings2,     label: 'Réglages' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navigation principale">
      {NAV_ITEMS.map(({ path, Icon, label }) => {
        const isActive = location.pathname === path

        return (
          <NavLink
            key={path}
            to={path}
            className={`nav-tab${isActive ? ' nav-tab--active' : ''}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="nav-tab-label">{label}</span>
            <span className="nav-tab-indicator" aria-hidden="true" />
          </NavLink>
        )
      })}
    </nav>
  )
}
