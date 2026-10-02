import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import LoginModal from './LoginModal';
import { BRAND_NAME } from './brand';
import './public.css';

/**
 * Shell for every public page: fixed navbar, dark teal header band,
 * page content, footer and the staff sign-in modal.
 *
 * - hero:     content rendered inside the dark band (below the navbar)
 * - compact:  shorter band for inner pages (title + subtitle)
 * - title / subtitle / eyebrow: convenience header for inner pages
 */
function PublicLayout({ hero, title, subtitle, eyebrow, compact = !hero, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(() => Boolean(location.state?.openLogin));

  /* Scroll to #hash targets (e.g. /#about from another page) */
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  const closeLogin = () => {
    setLoginOpen(false);
    // Drop the "open login" flag so a reload doesn't reopen the modal
    if (location.state?.openLogin) {
      navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null });
    }
  };

  return (
    <div className="lp-root">
      <div className={`lp-dark-band${compact ? ' lp-dark-band--compact' : ''}`}>
        <PublicNavbar onLogin={() => setLoginOpen(true)} />
        {hero}
        {!hero && (title || subtitle) && (
          <div className="lp-page-head">
            {eyebrow && <span className="lp-page-eyebrow">{eyebrow}</span>}
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
      </div>

      <main className="lp-page-main">{children}</main>

      <PublicFooter onLogin={() => setLoginOpen(true)} />

      <LoginModal open={loginOpen} onClose={closeLogin} brandName={BRAND_NAME} />
    </div>
  );
}

export default PublicLayout;
