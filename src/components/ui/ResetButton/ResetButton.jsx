import React from "react";
import "./resetbutton.css";

function ResetButton({ onClick, disabled, loading = false, style }) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`reset-button ${loading ? "loading" : ""}`}
        aria-disabled={disabled || loading}
        style={style}
      >
        {loading ? "Resetting..." : "Reset Filters"}
      </button>
    </div>
  );
}

export default ResetButton;
