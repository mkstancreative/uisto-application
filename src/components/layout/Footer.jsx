import React from "react";
import { Zap } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="dashboard-footer">
      <div className="df-left">
        <span className="df-dot" />
        <span>UISTO Careers · Recruitment Portal</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          opacity: 0.6,
          fontSize: 11,
        }}
      >
        <Zap size={11} style={{ color: "var(--accent-ink)" }} />
        <span>
          THE UNIVERSITY OF INNOVATION, SCIENCE AND TECHNOLOGY &copy; {year}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
