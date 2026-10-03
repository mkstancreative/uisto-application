import React from "react";
import { Plus } from "lucide-react";
import "./AddButton.css";

function AddButton({ text = "Add", onClick, icon, disabled = false, type = "button" }) {
  return (
    <button type={type} className="add-btn" onClick={onClick} disabled={disabled}>
      {icon ? icon : <Plus size={16} />}
      {text}
    </button>
  );
}

export default AddButton;
