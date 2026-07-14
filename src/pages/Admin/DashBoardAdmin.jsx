import { CheckCircle, Shield } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./DashBoardAdmin.css";

/* ── Helpers ── */

function DashBoardAdmin() {
  const { user } = useAuth();

  /* ── Fetch aggregate data ── */

  /* ── Date/Time context ── */
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="page-container adb-root">
      {/* ════════ HERO ════════ */}
      <div className="adb-hero animate-fade-up">
        <div className="adb-hero-orb adb-orb-1" />
        <div className="adb-hero-orb adb-orb-2" />
        <div className="adb-hero-orb adb-orb-3" />

        <div className="adb-hero-inner">
          <div className="adb-hero-text">
            <p className="adb-hero-greeting">Welcome,</p>
            <h1>
              {user?.firstname} {user?.lastname}
            </h1>
            <p>Here is what's happening across the institution today.</p>
            <div className="adb-hero-badges">
              <span className="adb-hero-badge">
                <Shield size={11} /> Admin Access
              </span>
              <span className="adb-hero-badge">
                <CheckCircle size={11} /> System Online
              </span>
            </div>
          </div>
          <div className="adb-hero-date">
            <span>{dateStr}</span>
            <span className="adb-hero-time">{timeStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoardAdmin;
