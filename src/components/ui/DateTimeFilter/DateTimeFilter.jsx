import React from "react";
import "../SelectFilters/SelectFilters.css";

const DateTimeFilters = ({
  startDateTime,
  endDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
}) => {
  const clearStart = () => onStartDateTimeChange("");
  const clearEnd = () => onEndDateTimeChange("");

  return (
    <div className="date-filters">
      {/* Start DateTime */}
      <div className="filter-container">
        <label className="filter-label">Start Date & Time</label>
        <div className="select-wrapper">
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => onStartDateTimeChange(e.target.value)}
            className="filter-select"
          />

          <div className="icon-group">
            {startDateTime && (
              <button type="button" className="clear-btn" onClick={clearStart}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* End DateTime */}
      <div className="filter-container">
        <label className="filter-label">End Date & Time</label>
        <div className="select-wrapper">
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => onEndDateTimeChange(e.target.value)}
            className="filter-select"
          />

          <div className="icon-group">
            {endDateTime && (
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

export default DateTimeFilters;
