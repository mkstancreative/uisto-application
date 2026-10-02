import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BRAND_NAME } from './brand';

const NAV_LINKS = [
  { label: 'Home', to: '/', end: true },
  { label: 'Vacancies', to: '/careers' },
  { label: 'Track Application', to: '/track' },
  { label: 'About', to: '/#about', hash: true },
  { label: 'Features', to: '/#features', hash: true },
];

function PublicNavbar({ onLogin }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  const action = isAuthenticated ? (
    <Link to="/admin" className="lp-btn lp-btn-lime" onClick={close}>
      <LayoutDashboard size={16} /> Dashboard
    </Link>
  ) : (
    <button
      className="lp-btn lp-btn-lime"
      onClick={() => {
        close();
        onLogin();
      }}
    >
      Sign In
    </button>
  );

  return (
    <header className={`lp-nav-wrap${scrolled ? ' scrolled' : ''}`}>
      <nav className="lp-nav" aria-label="Main">
        <Link to="/" className="lp-brand" onClick={close}>
          <img src="/logo.png" alt="" className="lp-brand-logo" />
          <span>{BRAND_NAME}</span>
        </Link>

        <span className="lp-nav-divider" />

        <ul className={`lp-nav-links${open ? ' open' : ''}`}>
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              {l.hash ? (
                <Link to={l.to} onClick={close}>
                  {l.label}
                </Link>
              ) : (
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={close}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {l.label}
                </NavLink>
              )}
            </li>
          ))}
          <li className="lp-nav-mobile-actions">{action}</li>
        </ul>

        <div className="lp-nav-actions">{action}</div>

        <button
          className="lp-nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
    </header>
  );
}

export default PublicNavbar;
