import React, { useState, useEffect, useRef } from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import { useUpdateSystemSettings } from '../../../hooks/useSettings';
import { useSessions } from '../../../hooks/useSessions';
import { useSemesters } from '../../../hooks/useSemesters';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../api/api';
import { Upload } from 'lucide-react';

/* All text/number inputs that map directly to payload keys */
const FIELDS = [
  /* ── Institution ── */
  { key: 'name', label: 'Institution Name', type: 'text', full: true },
  { key: 'description', label: 'Short Description', type: 'text', full: true },
  { key: 'address', label: 'Address', type: 'text', full: true },

  /* ── Contact ── */
  { key: 'email', label: 'Email', type: 'email', full: false },
  { key: 'phone', label: 'Phone', type: 'text', full: false },

  /* ── Leadership ── */
  { key: 'rector', label: 'Rector', type: 'text', full: false },
  {
    key: 'rectorcerts',
    label: 'Rector Certifications',
    type: 'text',
    full: false,
  },
  { key: 'registrar', label: 'Registrar', type: 'text', full: false },
  {
    key: 'registrarcerts',
    label: 'Registrar Certifications',
    type: 'text',
    full: false,
  },
  { key: 'doa', label: 'Director of Academics', type: 'text', full: false },

  /* ── Prefixes & Formats ── */
  { key: 'invoiceprefix', label: 'Invoice Prefix', type: 'text', full: false },
  { key: 'adminprefix', label: 'Admin Prefix', type: 'text', full: false },
  { key: 'staffprefix', label: 'Staff Prefix', type: 'text', full: false },
  { key: 'regnoformat', label: 'Reg No Format', type: 'text', full: false },
  {
    key: 'application_no_prefix',
    label: 'Application No Prefix',
    type: 'text',
    full: false,
  },

  /* ── Finance ── */
  { key: 'regfee', label: 'Registration Fee (₦)', type: 'number', full: false },
];

function SystemMutate({ settings, closeModal }) {
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileRef = useRef(null);

  const { data: sessionsResponse } = useSessions();
  const sessions = sessionsResponse?.data || [];

  const { data: semestersResponse } = useSemesters();
  const semesters = semestersResponse?.data || [];

  const { mutate: updateSettings, isPending } = useUpdateSystemSettings();

  useEffect(() => {
    if (settings) {
      const setStates = () => {
        const filled = {};
        FIELDS.forEach(({ key }) => {
          filled[key] = settings[key] ?? '';
        });
        filled.session_id = settings.session_id ?? '';
        filled.semester_id = settings.semester_id ?? '';
        setForm(filled);
        setLogoFile(null);
        setLogoPreview(null);
      };
      setStates();
    }
  }, [settings]);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Build payload — only attach `logos` when a real File has been selected
    const payload = { ...form, id: settings?.id };
    if (logoFile) payload.logos = logoFile;

    updateSettings(payload, {
      onSuccess: () => {
        toast.success('System settings updated successfully');
        closeModal();
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to update system settings');
      },
    });
  };

  return (
    <CustomModal
      isOpen={true}
      title="Edit System Settings"
      subtitle="Update the institutional profile and configuration."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="system-settings-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="system-settings-form" className="form-grid" onSubmit={onSubmit}>
        {/* Logo Upload */}
        <div className="form-group col-2">
          <label className="modal-label">Institution Logo</label>

          {/* Current logo preview */}
          {settings?.logo && !logoPreview && (
            <div className="sys-logo-preview">
              <img
                src={`${BASE_URL}/img/${settings.logo}`}
                alt="Current logo"
                className="sys-logo-img"
              />
              <span className="sys-logo-hint">
                Current logo — click below to replace
              </span>
            </div>
          )}

          {logoPreview && (
            <div className="sys-logo-preview">
              <img
                src={logoPreview}
                alt="New logo preview"
                className="sys-logo-img"
              />
              <span className="sys-logo-hint">
                {logoFile?.name} — will be uploaded on save
              </span>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="modal-input"
            style={{ display: 'none' }}
            onChange={handleLogoChange}
          />
          <button
            type="button"
            className="modal-submit"
            onClick={() => fileRef.current?.click()}
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: 'fit-content',
            }}
          >
            <Upload size={14} />
            {logoFile ? 'Change Logo' : 'Upload New Logo'}
          </button>
        </div>

        <div className="form-group col-2"></div>

        {/* Dynamic text / number fields */}
        {FIELDS.map(({ key, label, type, full }) => (
          <div key={key} className={`form-group ${full ? 'col-2' : ''}`}>
            <label className="modal-label">{label}</label>
            <input
              type={type}
              className="modal-input"
              value={form[key] ?? ''}
              onChange={set(key)}
            />
          </div>
        ))}

        {/* Active Session (dropdown) */}
        <div className="form-group">
          <label className="modal-label">Active Session</label>
          <select
            className="modal-input"
            value={form.session_id ?? ''}
            onChange={set('session_id')}
          >
            <option value="">— Select Session —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Active Semester (dropdown) */}
        <div className="form-group">
          <label className="modal-label">Active Semester</label>
          <select
            className="modal-input"
            value={form.semester_id ?? ''}
            onChange={set('semester_id')}
          >
            <option value="">— Select Semester —</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CustomModal>
  );
}

export default SystemMutate;
