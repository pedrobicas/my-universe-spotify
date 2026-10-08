import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Home, Library, LogOut, Menu, Music2, Settings, User, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const navigation = [
  { name: 'Início', href: '/dashboard', icon: Home },
  { name: 'Playlists', href: '/playlists', icon: Library },
  { name: 'Descobrir', href: '/discoveries', icon: Compass },
]

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setProfileOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const avatar = user?.images?.[0]?.url || '/default-user.svg'

  return (
    <>
      <aside className="sidebar" aria-label="Navegação principal">
        <Link className="brand" to="/dashboard" aria-label="My Universe — início">
          <span className="brand-mark"><Music2 size={19} strokeWidth={2.4} /></span>
          <span className="brand-copy">
            <strong>MY UNIVERSE</strong>
            <small>Spotify companion</small>
          </span>
        </Link>

        <nav className="sidebar-nav">
          <p className="sidebar-label">Navegação</p>
          {navigation.map(({ name, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-account" ref={menuRef}>
          <button
            className="account-trigger"
            onClick={() => setProfileOpen((value) => !value)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <img src={avatar} alt="" onError={(e) => { e.currentTarget.src = '/default-user.svg' }} />
            <span className="account-copy">
              <strong>{user?.display_name || 'Sua conta'}</strong>
              <small>Ver perfil</small>
            </span>
            <span className="account-dot" />
          </button>

          {profileOpen && (
            <div className="account-menu" role="menu">
              <Link to="/profile" role="menuitem"><User size={17} /> Perfil</Link>
              <Link to="/settings" role="menuitem"><Settings size={17} /> Configurações</Link>
              <button type="button" onClick={handleLogout} role="menuitem"><LogOut size={17} /> Sair</button>
            </div>
          )}
        </div>
      </aside>

      <header className="mobile-header">
        <Link className="mobile-brand" to="/dashboard"><Music2 size={18} /> <strong>MY UNIVERSE</strong></Link>
        <button className="icon-button" onClick={() => setMobileOpen((value) => !value)} aria-label="Abrir menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="mobile-nav-sheet">
          {navigation.map(({ name, href, icon: Icon }) => (
            <NavLink key={href} to={href} className={({ isActive }) => `mobile-nav-link${isActive ? ' is-active' : ''}`}>
              <Icon size={19} /> {name}
            </NavLink>
          ))}
          <div className="mobile-nav-divider" />
          <Link to="/profile" className="mobile-nav-link"><User size={19} /> Perfil</Link>
          <Link to="/settings" className="mobile-nav-link"><Settings size={19} /> Configurações</Link>
          <button className="mobile-nav-link" onClick={handleLogout}><LogOut size={19} /> Sair</button>
        </div>
      )}
    </>
  )
}

export default Navbar
