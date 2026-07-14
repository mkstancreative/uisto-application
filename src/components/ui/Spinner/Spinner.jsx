import React from "react";
import "./Spinner.css";

function Spinner({ size = 20, color = "#fff", text = "Processing" }) {
  return (
    <div className="spinner-wrapper">
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          borderColor: `${color} transparent transparent transparent`,
        }}
      />
      <span className="spinner-text">{text}</span>
    </div>
  );
}

export default Spinner;