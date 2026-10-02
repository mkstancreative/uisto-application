import { Copy, Wand2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PasswordInput from './PasswordInput';
import PasswordChecklist from './PasswordChecklist';
import { copyToClipboard, generatePassword } from './passwordTools';

/** Temporary password an HR manager sets for someone else: generate, copy, live checklist. */
function TempPasswordField({ label = 'Temporary password', value, onChange, required = true, disabled }) {
  const copy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) toast.success('Password copied.');
    else toast.error('Could not copy — select the password and copy it manually.');
  };

  return (
    <PasswordInput
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      autoComplete="off"
      initiallyVisible
      placeholder="At least 8 characters"
      actions={
        <>
          <button
            type="button"
            className="pw-action-btn"
            onClick={() => onChange(generatePassword())}
            disabled={disabled}
          >
            <Wand2 size={14} /> Generate
          </button>
          <button type="button" className="pw-action-btn" onClick={copy} disabled={disabled || !value}>
            <Copy size={14} /> Copy
          </button>
        </>
      }
    >
      <PasswordChecklist password={value} />
    </PasswordInput>
  );
}

export default TempPasswordField;
