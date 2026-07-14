import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Search } from "lucide-react";
import "./MultiSelectPicker.css";

function MultiSelectPicker({
  options = [],
  value = [],
  onChange,
  placeholder = "Select items...",
  getOptionLabel,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyles, setDropdownStyles] = useState({});

  /* Follow trigger position for Portal rendering */
  useEffect(() => {
    if (!open) return;
    const updateBounds = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyles({
          position: "fixed",
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
          zIndex: 999999,
        });
      }
    };
    updateBounds();

    window.addEventListener("scroll", updateBounds, true);
    window.addEventListener("resize", updateBounds);

    return () => {
      window.removeEventListener("scroll", updateBounds, true);
      window.removeEventListener("resize", updateBounds);
    };
  }, [open]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      const isOutsideTrigger =
        containerRef.current && !containerRef.current.contains(e.target);
      const isOutsideDropdown = dropdownRef.current
        ? !dropdownRef.current.contains(e.target)
        : true;

      if (isOutsideTrigger && isOutsideDropdown) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedSet = new Set(value.map(String));

  const toggle = (id) => {
    const sid = String(id);
    const next = selectedSet.has(sid)
      ? value.filter((v) => String(v) !== sid)
      : [...value, id];
    onChange(next);
  };

  const remove = (id, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => String(v) !== String(id)));
  };

  const filtered = options.filter((o) => {
    const label = getOptionLabel ? getOptionLabel(o) : o.name;
    return label?.toLowerCase().includes(search.toLowerCase());
  });

  const selectedOptions = options.filter((o) => selectedSet.has(String(o.id)));

  return (
    <div className="msp-wrapper" ref={containerRef}>
      {/* Trigger box */}
      <div
        className={`msp-trigger ${open ? "msp-trigger--open" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        {/* Chips or placeholder */}
        <div className="msp-chips">
          {selectedOptions.length === 0 ? (
            <span className="msp-placeholder">{placeholder}</span>
          ) : (
            selectedOptions.map((o) => (
              <span key={o.id} className="msp-chip">
                {getOptionLabel ? getOptionLabel(o) : o.name}
                <button
                  type="button"
                  className="msp-chip-remove"
                  onClick={(e) => remove(o.id, e)}
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={15}
          className={`msp-chevron ${open ? "msp-chevron--up" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            className="msp-dropdown"
            style={dropdownStyles}
            ref={dropdownRef}
          >
            {/* Search */}
            <div className="msp-search-wrap">
              <Search size={13} className="msp-search-icon" />
              <input
                autoFocus
                type="text"
                className="msp-search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <ul className="msp-list">
              {filtered.length === 0 ? (
                <li className="msp-empty">No results</li>
              ) : (
                filtered.map((o) => {
                  const selected = selectedSet.has(String(o.id));
                  return (
                    <li
                      key={o.id}
                      className={`msp-option ${selected ? "msp-option--selected" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(o.id);
                      }}
                    >
                      <span className="msp-option-check">
                        {selected ? "✓" : ""}
                      </span>
                      {getOptionLabel ? getOptionLabel(o) : o.name}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer count */}
            {value.length > 0 && (
              <div className="msp-footer">
                {value.length} selected —{" "}
                <button
                  type="button"
                  className="msp-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default MultiSelectPicker;
