import { Search } from "lucide-react";
import "./searchInput.css";

function SearchInput({ value, onChange, onClear, placeholder, autoFocus = false }) {
  const clear = () => (onClear ? onClear() : onChange(""));

  return (
    <div className="search-box">
      <Search size={15} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder || "Search by name, ID or email…"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
        autoFocus={autoFocus}
      />

      {value && (
        <button type="button" className="search-clear" onClick={clear} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}

export default SearchInput;
