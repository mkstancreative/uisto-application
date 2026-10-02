import React, { useId } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { DOC_ACCEPT, formatBytes, validateDoc } from './utils';

/**
 * PDF/DOC/DOCX picker (≤ 10 MB). Invalid files are rejected through
 * onError and never reach onChange.
 */
function FileField({ label, required, optional, hint, file, error, onChange, onError, disabled }) {
  const id = useId();

  const pick = (e) => {
    const chosen = e.target.files?.[0];
    e.target.value = '';
    if (!chosen) return;
    const problem = validateDoc(chosen);
    if (problem) {
      onError?.(problem);
      return;
    }
    onError?.('');
    onChange(chosen);
  };

  return (
    <div className={`pub-file${error ? ' invalid' : ''}`}>
      <span className="pub-label" id={`${id}-label`}>
        {label}
        {required && <span className="pub-req"> *</span>}
        {optional && <span className="pub-optional"> (optional)</span>}
      </span>

      {file ? (
        <div className="pub-file-chosen">
          <span className="pub-file-icon">
            <FileText size={18} />
          </span>
          <div className="pub-file-meta">
            <strong title={file.name}>{file.name}</strong>
            <span>{formatBytes(file.size)}</span>
          </div>
          <button
            type="button"
            className="pub-file-remove"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="pub-file-drop" htmlFor={id}>
          <UploadCloud size={22} />
          <span>
            <strong>Choose a file</strong>
            <small>{hint ?? 'PDF, DOC or DOCX · max 10 MB'}</small>
          </span>
        </label>
      )}

      <input
        id={id}
        type="file"
        accept={DOC_ACCEPT}
        className="pub-file-input"
        onChange={pick}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
      />

      {error && <span className="pub-field-error">{error}</span>}
    </div>
  );
}

export default FileField;
