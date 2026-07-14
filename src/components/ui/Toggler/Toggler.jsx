import React from "react";
import "./Toggler.css";

function Toggler({ checked, onChange, disabled }) {
  return (
    <label className={`toggle-switch ${disabled ? "disabled" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="slider" />
    </label>
  );
}

export default Toggler;
