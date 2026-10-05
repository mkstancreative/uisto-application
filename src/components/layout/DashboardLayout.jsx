import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import './layout.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';


// New key so everyone starts in light mode; the old key defaulted to dark
const THEME_KEY = 'uisto.theme';

function DashboardLayout({
  navItems = [],
  logoIcon = '/logo.png',
  logoTitle = 'Netpro',
  logoSub = 'Recruitment Portal',
  userName = 'User',
  userRole = 'Staff',
  userEmail = '',
  userInitials = 'US',
}) {
  /* ── Sidebar collapsed state (persisted) ── */
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sb_collapsed')) ?? false;
    } catch {
      return false;
    }
  });

  /* ── Theme (persisted, default = light) ── */
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  /* ── Mobile sidebar ── */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Persist collapse */
  useEffect(() => {
    localStorage.setItem('sb_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  /* Apply / remove light-mode class on <html> */
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      /* storage unavailable — theme just won't persist */
    }
  }, [darkMode]);

  /* Close mobile sidebar on resize to desktop */
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="dashboard-shell">
      {mobileOpen && (
        <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        navItems={navItems}
        logoIcon={logoIcon}
        logoTitle={logoTitle}
        logoSub={logoSub}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ── Main column ── */}
      <div className={`dashboard-main${collapsed ? ' collapsed' : ''}`}>
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          userInitials={userInitials}
        />

        {/* ── Page content (injected by the router via <Outlet />) ── */}
        <main className="dashboard-content w-full flex flex-col items-center">
          <div className="w-full min-w-0 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;
