import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import './layout.css';

function Sidebar({
  navItems = [],
  logoIcon = '🎓',
  logoTitle = 'LMS Portal',
  logoSub = 'University',
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /* Auto-open the group whose child matches current path */
  const [openDropdown, setOpenDropdown] = useState(() => {
    for (const section of navItems) {
      for (const item of section.items) {
        if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
          return item.label;
        }
      }
    }
    return null;
  });

  /* Hover-peek: sidebar visually expands on hover when collapsed */
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    if (collapsed) setHovered(true);
  };

  const handleMouseLeave = () => {
    // Small delay so the sidebar doesn't snap closed instantly
    leaveTimer.current = setTimeout(() => setHovered(false), 120);
  };

  /* While peeking (collapsed + hovered), allow dropdowns to open */
  const isPeeking = collapsed && hovered;

  const toggleDropdown = (label) => {
    if (collapsed && !isPeeking) return;
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const isActive = (path) => path && location.pathname === path;

  const isGroupActive = (item) =>
    item.children?.some((c) => location.pathname.startsWith(c.path));

  const handleNav = (path) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <nav
      className={[
        'sidebar',
        /* Only apply collapsed styles when NOT peeking */
        collapsed && !isPeeking ? 'collapsed' : '',
        isPeeking ? 'peeking' : '',
        mobileOpen ? 'mobile-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Logo ── */}
      <div className="sb-logo">
        <img src={logoIcon} className="sb-logo-icon" alt="Logo" />
        <div className="sb-logo-text">
          <h2>{logoTitle}</h2>
          <span>{logoSub}</span>
        </div>
      </div>

      {/* ── Nav items ── */}
      <div className="sb-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sb-section-label">{section.section}</div>

            {section.items.map((item) => {
              const hasChildren = !!item.children;
              const active = hasChildren
                ? isGroupActive(item)
                : isActive(item.path);
              const dropOpen = openDropdown === item.label;

              return (
                <div key={item.label}>
                  {/* Parent item */}
                  <div
                    className={`sb-item${active ? ' active' : ''}`}
                    data-tip={item.label}
                    onClick={() =>
                      hasChildren
                        ? toggleDropdown(item.label)
                        : handleNav(item.path)
                    }
                  >
                    <span className="sb-icon">{item.icon}</span>
                    <span className="sb-label">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`sb-chevron${dropOpen ? ' open' : ''}`}
                      />
                    )}
                  </div>

                  {/* Dropdown children */}
                  {hasChildren && (
                    <div className={`sb-dropdown${dropOpen ? ' open' : ''}`}>
                      {item.children.map((child) => (
                        <div
                          key={child.path}
                          className={`sb-sub-item${isActive(child.path) ? ' active' : ''}`}
                          onClick={() => handleNav(child.path)}
                        >
                          <span className="sb-sub-dot" />
                          {child.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Collapse toggle ── */}
      <div className="sb-footer">
        <button
          className="sb-collapse-btn"
          data-tip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => {
            setCollapsed((v) => !v);
            setHovered(false); // clear peek when toggling
          }}
        >
          <span className="sb-icon">
            {collapsed && !isPeeking ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </span>
          <span className="sb-label">Collapse</span>
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
