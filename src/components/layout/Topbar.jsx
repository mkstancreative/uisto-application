import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    Sun,
    Moon,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
} from "lucide-react";

/* ── Page titles for the staff portal ── */
const PAGE_TITLES = {
    "/admin": "Dashboard",
    "/admin/applications": "Applications",
    "/admin/shortlist": "Shortlist by Job",
    "/admin/shortlist-history": "Shortlist History",
    "/admin/jobs": "Vacancies",
    "/admin/positions": "Positions",
    "/admin/requirements": "Requirements",
    "/admin/subcadres": "Subcadres",
    "/admin/staff": "Staff Users",
    "/admin/profile": "My Account",
};

const titleFromPath = (pathname) =>
    PAGE_TITLES[pathname.replace(/\/+$/, "")] ?? "Recruitment Portal";

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
    const [profileOpen, setProfileOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const profileRef = useRef(null);

    const pageTitle = titleFromPath(location.pathname);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSignOut = async () => {
        if (signingOut) return;
        setSigningOut(true);
        await logout();
        navigate("/", { replace: true });
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
                    <div className="tb-breadcrumb">UISTO Careers › {pageTitle}</div>
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

                {/* ── Profile / Avatar ── */}
                <div className="tb-profile" ref={profileRef}>
                    <button
                        className="tb-avatar-btn"
                        onClick={() => setProfileOpen((v) => !v)}
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
                                    setProfileOpen(false);
                                    navigate("/admin/profile");
                                }}
                            >
                                <User size={15} /> My Account
                            </div>
                            <div className="tb-pd-divider" />

                            <div
                                className="tb-pd-item danger"
                                onClick={handleSignOut}
                            >
                                <LogOut size={15} /> {signingOut ? "Signing out…" : "Sign Out"}
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