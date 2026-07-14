import React from 'react';
import './SelectFilters.css';

const SelectFilter = ({ label, options, value, onChange, name }) => {
  const handleClear = () => onChange('');

  return (
    <div className="filter-container">
      <label className="filter-label">{label}</label>
      <div className="select-wrapper">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`filter-select ${!value ? 'placeholder-active' : ''}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="icon-group">
          {value && (
            <button type="button" className="clear-btn" onClick={handleClear}>
              ×
            </button>
          )}
          <span className="chevron"></span>
        </div>
      </div>
    </div>
  );
};

export default SelectFilter;
