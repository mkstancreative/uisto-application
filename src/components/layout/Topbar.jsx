import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    Search,
    Bell,
    Sun,
    Moon,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
} from "lucide-react";

import { useNotifications } from "../../hooks/useNotifications";
import { formatDate } from "../../utils/helpers";

/* ── Derive a human-readable page title from pathname ── */
const titleFromPath = (pathname) => {
    const segments = pathname.split("/").filter(Boolean);
    if (!segments.length) return "Dashboard";
    return segments
        .map((s) =>
            s
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
        )
        .join(" › ");
};

function Topbar({
    userName = "User",
    userRole = "Staff",
    userEmail = "",
    userInitials = "US",
    darkMode,
    setDarkMode,
    mobileOpen,
    setMobileOpen,
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Fetch dynamic notifications
    const { data: notifRes } = useNotifications();
    const fetchedNotifs = notifRes?.data ?? [];

    // Local set tracking read notification IDs
    const [readIds, setReadIds] = useState(new Set());

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const unreadCount = fetchedNotifs.filter((n) => !readIds.has(n.id)).length;
    const pageTitle = titleFromPath(location.pathname);
    const pathSegments = location.pathname.split("/").filter(Boolean);

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const markAllRead = () => {
        const allIds = fetchedNotifs.map((n) => n.id);
        setReadIds(new Set([...readIds, ...allIds]));
    };

    const markAsRead = (id) => {
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    return (
        <header className="topbar">
            {/* ── Left — mobile hamburger + page title ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Mobile menu toggle — shown via media-query style injected below */}
                <button
                    id="tb-mobile-menu"
                    className="tb-icon-btn"
                    style={{ display: "none" }}
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <div className="tb-left">
                    <div className="tb-page-title">{pageTitle}</div>
                    {pathSegments.length > 0 && (
                        <div className="tb-breadcrumb">
                            Home {pathSegments.map((s, i) => (
                                <span key={i}> › {s.charAt(0).toUpperCase() + s.slice(1)}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right cluster ── */}
            <div className="tb-right">

                {/* Dark / Light toggle */}
                <div
                    className={`tb-dm-toggle${darkMode ? " on" : ""}`}
                    onClick={() => setDarkMode((v) => !v)}
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    role="switch"
                    aria-checked={darkMode}
                >
                    <div className="tb-dm-knob">
                        {darkMode ? <Moon size={11} /> : <Sun size={11} />}
                    </div>
                </div>

                {/* ── Notifications ── */}
                <div style={{ position: "relative" }} ref={notifRef}>
                    <button
                        className="tb-icon-btn"
                        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                        onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                    >
                        <Bell size={17} />
                        {unreadCount > 0 && <span className="tb-badge" />}
                    </button>

                    {notifOpen && (
                        <div className="tb-notif-dropdown">
                            <div className="tb-notif-header">
                                <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                                {unreadCount > 0 && (
                                    <span className="tb-notif-mark" onClick={markAllRead}>
                                        Mark all read
                                    </span>
                                )}
                            </div>

                            {fetchedNotifs.length === 0 ? (
                                <div className="tb-notif-empty">No notifications</div>
                            ) : (
                                fetchedNotifs.map((n) => {
                                    const isRead = readIds.has(n.id);
                                    return (
                                        <div
                                            key={n.id}
                                            className="tb-notif-item"
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <span className={`tb-notif-dot${isRead ? " read" : ""}`} />
                                            <div className="tb-notif-text">
                                                <p>{n.title ?? n.message ?? "New notification"}</p>
                                                <span>{n.created_at ? formatDate(n.created_at) : "Just now"}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* ── Profile / Avatar ── */}
                <div className="tb-profile" ref={profileRef}>
                    <button
                        className="tb-avatar-btn"
                        onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                        aria-label="Profile menu"
                    >
                        <div className="tb-avatar">{userInitials}</div>
                        <div className="tb-avatar-info">
                            <span className="tb-avatar-name">{userName}</span>
                            <span className="tb-avatar-role">{userRole}</span>
                        </div>
                        <ChevronDown
                            size={13}
                            style={{
                                color: "var(--sb-text)",
                                transition: "transform 0.2s",
                                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                        />
                    </button>

                    {profileOpen && (
                        <div className="tb-profile-dropdown">
                            <div className="tb-pd-header">
                                <h4>{userName}</h4>
                                {userEmail && <p>{userEmail}</p>}
                            </div>
                            <div 
                                className="tb-pd-item" 
                                onClick={() => {
                                    const basePath = location.pathname.split('/')[1] || 'admin';
                                    navigate(`/${basePath}/my-profile`);
                                }}
                            >
                                <User size={15} /> My Profile
                            </div>
                            <div className="tb-pd-divider" />

                            <div
                                className="tb-pd-item danger"
                                onClick={() => { logout(); navigate("/", { replace: true }); }}
                            >
                                <LogOut size={15} /> Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Make mobile button visible via injected media query */}
            <style>{`
        @media (max-width: 900px) {
          #tb-mobile-menu { display: flex !important; }
        }
      `}</style>
        </header>
    );
}

export default Topbar;