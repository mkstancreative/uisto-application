import React from "react";
import "../SelectFilters/SelectFilters.css";

const DateFilters = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const clearStart = () => onStartDateChange("");
  const clearEnd = () => onEndDateChange("");

  return (
    <div className="date-filters">
      {/* Start Date */}
      <div className="filter-container">
        <label className="filter-label">Start Date</label>
        <div className="select-wrapper">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="filter-select"
          />

          <div className="icon-group">
            {startDate && (
              <button type="button" className="clear-btn" onClick={clearStart}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* End Date */}
      <div className="filter-container">
        <label className="filter-label">End Date</label>
        <div className="select-wrapper">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="filter-select"
          />

          <div className="icon-group">
            {endDate && (
              <button type="button" className="clear-btn" onClick={clearEnd}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilters;
