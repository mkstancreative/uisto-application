import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import './layout.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';


function DashboardLayout({
  navItems = [],
  logoIcon = '/logo.png',
  logoTitle = 'UISTO Careers',
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

  /* ── Dark mode (persisted, default = dark) ── */
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ems_dark_mode')) ?? true;
    } catch {
      return true;
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
    localStorage.setItem('ems_dark_mode', JSON.stringify(darkMode));
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
          <div className="w-full max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;
