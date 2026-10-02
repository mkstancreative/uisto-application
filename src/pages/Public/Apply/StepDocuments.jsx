import React from 'react';
import { Info } from 'lucide-react';
import FileField from '../shared/FileField';
import { DOCUMENTS } from './applyForm';
import { StepIntro } from './FormBits';

function StepDocuments({ files, errors, onFile, onFileError, disabled }) {
  return (
    <>
      <StepIntro title="Documents">
        Upload your documents as PDF, DOC or DOCX files of up to 10 MB each.
      </StepIntro>

      <div className="ap-docs">
        {DOCUMENTS.map((d) => (
          <div key={d.key} className="ap-doc">
            <FileField
              label={d.label}
              required={d.required}
              optional={!d.required}
              file={files[d.key]}
              error={errors[`files.${d.key}`]}
              onChange={(f) => onFile(d.key, f)}
              onError={(msg) => onFileError(d.key, msg)}
              disabled={disabled}
            />
            <p className="pub-field-hint">{d.hint}</p>
          </div>
        ))}
      </div>

      <div className="lp-form-alert info">
        <Info size={16} />
        <span>
          Files aren&apos;t saved in your draft. If you leave this page you&apos;ll need to attach them
          again.
        </span>
      </div>
    </>
  );
}

export default StepDocuments;
