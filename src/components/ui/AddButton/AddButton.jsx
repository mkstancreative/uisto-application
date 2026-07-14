import React from "react";
import { Plus } from "lucide-react";
import "./AddButton.css";

function AddButton({ text = "Add", onClick, icon }) {
  return (
    <button className="add-btn" onClick={onClick}>
      {icon ? icon : <Plus size={16} />}
      {text}
    </button>
  );
}

export default AddButton;