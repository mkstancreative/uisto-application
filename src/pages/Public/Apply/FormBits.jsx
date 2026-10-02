import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const idFor = (path) => `ap-${String(path).replace(/[^a-zA-Z0-9]+/g, '-')}`;

function Label({ htmlFor, id, label, required, optional }) {
  const Tag = htmlFor ? 'label' : 'span';
  return (
    <Tag className="pub-label" htmlFor={htmlFor} id={id}>
      {label}
      {required && <span className="pub-req"> *</span>}
      {optional && <span className="pub-optional"> (optional)</span>}
    </Tag>
  );
}

function FieldShell({ path, label, required, optional, hint, error, className = '', plain, icon: Icon, children }) {
  const id = idFor(path);
  return (
    <div className={`lp-field ap-field ${error ? 'invalid' : ''} ${className}`}>
      <Label htmlFor={id} label={label} required={required} optional={optional} />
      <div className={`lp-input-wrap${plain || !Icon ? ' plain' : ''}`}>
        {Icon && <Icon size={16} className="lp-input-icon" />}
        {children(id)}
      </div>
      {hint && !error && (
        <span className="pub-field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="pub-field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({
  path,
  label,
  value,
  onChange,
  error,
  required,
  optional,
  hint,
  className,
  icon,
  type = 'text',
  ...rest
}) {
  return (
    <FieldShell {...{ path, label, required, optional, hint, error, className, icon }}>
      {(id) => (
        <input
          id={id}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, error, hint)}
          aria-required={required || undefined}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  path,
  label,
  value,
  onChange,
  error,
  required,
  optional,
  hint,
  className,
  options,
  placeholder = 'Select…',
  disabled,
}) {
  return (
    <FieldShell {...{ path, label, required, optional, hint, error, className }} plain>
      {(id) => (
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, error, hint)}
          aria-required={required || undefined}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            );
          })}
        </select>
      )}
    </FieldShell>
  );
}

/** Pill-style radio group. */
export function ChoiceGroup({ path, label, value, onChange, error, required, options, className = '' }) {
  const id = idFor(path);
  return (
    <div
      className={`lp-field ap-field ${error ? 'invalid' : ''} ${className}`}
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <Label id={`${id}-label`} label={label} required={required} />
      <div className="ap-choices">
        {options.map((o) => (
          <label key={o.value} className={`ap-choice${value === o.value ? ' selected' : ''}`}>
            <input
              type="radio"
              name={id}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              aria-invalid={error ? 'true' : undefined}
            />
            <span className="ap-choice-dot">{value === o.value && <Check size={12} />}</span>
            {o.label}
          </label>
        ))}
      </div>
      {error && (
        <span className="pub-field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/** Free-form list of short tags: Enter or comma adds, × removes. */
export function TagInput({ path, label, values, onChange, placeholder, hint, max = 30, className = '' }) {
  const id = idFor(path);
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const parts = String(raw)
      .split(',')
      .map((s) => s.trim().slice(0, 80))
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...values];
    parts.forEach((p) => {
      if (next.length < max && !next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    });
    if (next.length !== values.length) onChange(next);
    setDraft('');
  };

  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && values.length) {
      remove(values.length - 1);
    }
  };

  return (
    <div className={`lp-field ap-field ${className}`}>
      <Label htmlFor={id} label={label} optional />
      <div className="ap-tags">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="ap-tag">
            {v}
            <button type="button" onClick={() => remove(i)} aria-label={`Remove ${v}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={values.length >= max ? `Maximum of ${max}` : placeholder}
          disabled={values.length >= max}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(',')) add(v);
            else setDraft(v);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint && (
        <span className="pub-field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}

/** Numbered step indicator. Steps up to `maxStep` can be revisited. */
export function Stepper({ steps, current, maxStep, onSelect }) {
  return (
    <nav className="ap-stepper" aria-label="Application steps">
      <ol>
        {steps.map((s, i) => {
          const state =
            i === current ? 'current' : i < current ? 'done' : i <= maxStep ? 'visited' : 'todo';
          const reachable = i <= maxStep && i !== current;
          return (
            <li key={s.id} className={`ap-step ap-step--${state}`}>
              <button
                type="button"
                onClick={() => reachable && onSelect(i)}
                disabled={!reachable}
                aria-current={i === current ? 'step' : undefined}
              >
                <span className="ap-step-num">{i < current ? <Check size={14} /> : i + 1}</span>
                <span className="ap-step-label">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="ap-stepper-mobile">
        <span>
          Step {current + 1} of {steps.length}
        </span>
        <strong>{steps[current]?.label}</strong>
        <div className="ap-stepper-bar">
          <span style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
    </nav>
  );
}

export function StepIntro({ title, children }) {
  return (
    <header className="ap-step-intro">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}
