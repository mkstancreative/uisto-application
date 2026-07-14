import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../api/api';
import { useAdmissionModes } from '../../../hooks/useAdmissionMode';
import { useDepartments } from '../../../hooks/useDepartments';
import { useFaculties } from '../../../hooks/useFaculties';
import { useLevels } from '../../../hooks/useLevels';
import { useProgramme } from '../../../hooks/useProgrammes';
import { useCountries, useLgas, useStates } from '../../../hooks/useSettings';
import {
  useCreateApplicant,
  useUpdateApplicant,
} from '../../../hooks/useStudents';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import './StudentMutate.css';

/* ── Step labels ─────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Academic' },
  { id: 4, label: 'Parents & Docs' },
];

const PROGRAMME_TYPES = [
  { id: 1, name: 'Full Time' },
  { id: 2, name: 'Part Time' },
  { id: 3, name: 'Distance Learning' },
];

const formatDobForInput = (dob) => {
  if (!dob) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
  const parts = dob.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dob;
};

function NewApplicantMutate({ data = {}, closeModal }) {
  const isEdit = Boolean(data?.id);
  const [step, setStep] = useState(1);

  /* ── API data ──────────────────────────────────────── */
  const { data: levelsRes } = useLevels();
  const { data: programmesRes } = useProgramme();
  const { data: departmentsRes } = useDepartments();
  const { data: facultiesRes } = useFaculties();
  const { data: modesRes } = useAdmissionModes();

  const levels = levelsRes?.data ?? [];
  const allProgrammes = programmesRes?.data ?? [];
  const allDepartments = departmentsRes?.data ?? [];
  const faculties = facultiesRes?.data ?? [];
  const modes = modesRes?.data ?? [];

  const { data: countriesRes } = useCountries();
  const { data: statesRes } = useStates();
  const { data: lgasRes } = useLgas();

  const countries = countriesRes?.data ?? [];
  const states = statesRes?.data ?? [];
  const lgas = lgasRes?.data ?? [];

  /* ── Mutations ─────────────────────────────────────── */
  const { mutate: createApplicant, isPending: creating } = useCreateApplicant();
  const { mutate: updateApplicant, isPending: updating } = useUpdateApplicant();
  const isPending = creating || updating;

  /* ── Passport ──────────────────────────────────────── */
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [passportPreview, setPassportPreview] = useState(
    data?.passporturl ? `${BASE_URL}/img/${data.passporturl}` : null,
  );
  const resolvedStateId = String(data?.state_id ?? '');
  const resolvedLgaId = String(data?.lga_id ?? '');

  /* ── Form state ─────────────────────────────────────── */
  const [form, setForm] = useState({
    fname: data?.fname ?? '',
    lname: data?.lname ?? '',
    mname: data?.mname ?? '',
    gender: data?.gender ?? '',
    dob: formatDobForInput(data?.dob),
    email: data?.email ?? '',
    phone: data?.phone ?? '',
    nin: data?.nin ?? '',
    jambregno: data?.jambregno ?? '',
    jamb: data?.jamb ?? '',
    country_id: String(data?.country_id ?? '160'),
    state_id: resolvedStateId,
    lga_id: resolvedLgaId,
    address: data?.address ?? '',
    community: data?.community ?? '',
    faculty_id: String(data?.faculty_id ?? ''),
    department_id: String(data?.department_id ?? ''),
    programme_id: String(data?.programme_id ?? ''),
    level_id: String(data?.level_id ?? ''),
    mode_id: String(data?.mode_id ?? ''),
    programetype_id: String(data?.programetype_id ?? ''),
    previousschool: data?.previousschool ?? '',
    fathersname: data?.fathersname ?? '',
    mothersname: data?.mothersname ?? '',
    fatherphone: data?.fatherphone ?? '',
    motherphone: data?.motherphone ?? '',
    fathersjob: data?.fathersjob ?? '',
    mothersjob: data?.mothersjob ?? '',
  });

  /* ── File state (create uses plural keys from payload) ─ */
  const [files, setFiles] = useState({
    passporturls: null, // passport photo file
    olevelresulturls: null, // O'Level result
    jamb_notifications: null, // JAMB notification slip
    jambresults: null, // JAMB result
  });

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setFileField = (key) => (e) =>
    setFiles((prev) => ({ ...prev, [key]: e.target.files[0] ?? null }));

  /* ── Dependent dropdowns (Dynamic) ─────────────────── */
  const selectedCountryName = countries.find(
    (c) => String(c.id) === String(form.country_id),
  )?.name;
  const selectedStateName = states.find(
    (s) => String(s.id) === String(form.state_id),
  )?.name;

  const filteredDepartments = form.faculty_id
    ? allDepartments.filter(
        (d) => String(d.faculty_id) === String(form.faculty_id),
      )
    : allDepartments;

  /* ── Camera ────────────────────────────────────────── */
  const startCamera = async () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCapturing(true);
      setTimeout(() => videoRef.current?.play().catch(console.error), 60);
    } catch {
      toast.error('Could not access camera. Check browser permissions.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/png');
    video.srcObject?.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    setPassportPreview(dataUrl);
    setCapturing(false);
  };

  /* ── Step validation ───────────────────────────────── */
  const stepValid = () => {
    if (step === 1)
      return (
        form.fname &&
        form.lname &&
        form.gender &&
        form.dob &&
        form.email &&
        form.phone &&
        form.jambregno &&
        form.jamb
      );
    if (step === 2) return form.state_id && form.address;
    if (step === 3)
      return (
        form.faculty_id &&
        form.department_id &&
        form.programme_id &&
        form.level_id &&
        form.mode_id
      );
    return true;
  };

  /* ── Build FormData ─────────────────────────────────── */
  const buildFormData = () => {
    const fd = new FormData();

    // Append all non-empty text fields
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, String(v));
    });

    // Append id on edit
    if (isEdit) fd.append('id', data.id);

    // Append file fields — empty JSON object `{}` when not provided (matching payload)
    Object.entries(files).forEach(([k, v]) => {
      if (v) {
        fd.append(k, v);
      } else {
        fd.append(k, JSON.stringify({}));
      }
    });

    return fd;
  };

  /* ── Submit ────────────────────────────────────────── */
  const onSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!stepValid()) return;

    const doSubmit = (fd) => {
      const mutate = isEdit ? updateApplicant : createApplicant;
      mutate(fd, {
        onSuccess: (res) => {
          toast.success(
            res?.message ??
              (isEdit
                ? 'Applicant updated!'
                : 'Applicant created successfully!'),
          );
          closeModal?.();
        },
        onError: (err) => toast.error(err?.message ?? 'Something went wrong.'),
      });
    };

    const fd = buildFormData();

    // If passport was taken via camera (base64), convert to blob first
    if (passportPreview?.startsWith('data:') && !files.passporturls) {
      fetch(passportPreview)
        .then((r) => r.blob())
        .then((blob) => {
          fd.set('passporturls', blob, 'passport.png');
          doSubmit(fd);
        });
    } else {
      doSubmit(fd);
    }
  };

  /* ── Step nav ──────────────────────────────────────── */
  const next = () => {
    if (!stepValid()) {
      toast.warning('Please fill in all required fields before continuing.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  /* ── Footer ────────────────────────────────────────── */
  const footer = (
    <>
      <button type="button" className="modal-cancel" onClick={closeModal}>
        Cancel
      </button>
      {step > 1 && (
        <button type="button" className="modal-cancel" onClick={back}>
          ← Back
        </button>
      )}
      {step < STEPS.length ? (
        <button type="button" className="modal-submit" onClick={next}>
          Next →
        </button>
      ) : (
        <button
          type="button"
          className="modal-submit"
          disabled={isPending}
          onClick={onSubmit}
        >
          {isPending ? (
            <Spinner />
          ) : isEdit ? (
            'Update Applicant'
          ) : (
            'Create Applicant'
          )}
        </button>
      )}
    </>
  );

  /* ── Render ────────────────────────────────────────── */
  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Applicant' : 'New Applicant'}
      subtitle={
        isEdit
          ? `Editing: ${data?.fname ?? ''} ${data?.lname ?? ''} — Step ${step} of ${STEPS.length} — ${STEPS[step - 1].label}`
          : `Step ${step} of ${STEPS.length} — ${STEPS[step - 1].label}`
      }
      size="wide"
      onClose={closeModal}
      footer={footer}
    >
      {/* Step indicator */}
      <div className="step-indicator">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`step-dot ${s.id < step ? 'done' : s.id === step ? 'active' : ''}`}
          >
            <span className="step-dot-num">{s.id < step ? '✓' : s.id}</span>
            <span className="step-dot-label">{s.label}</span>
          </div>
        ))}
      </div>

      <form id="applicant-form" className="form-grid" onSubmit={onSubmit}>
        {/* ═══════════════ STEP 1 — PERSONAL ═══════════════ */}
        {step === 1 && (
          <>
            {/* Passport Photo */}
            <div className="form-group col-1" style={{ alignItems: 'center' }}>
              <label className="modal-label">Passport Photo</label>
              <div className="passport-capture-box">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    display: capturing ? 'block' : 'none',
                    width: 200,
                    borderRadius: 8,
                    border: '2px solid var(--border)',
                    background: '#000',
                  }}
                />
                {capturing && (
                  <button
                    type="button"
                    className="modal-submit"
                    onClick={capturePhoto}
                    style={{ marginTop: 8 }}
                  >
                    📸 Capture Photo
                  </button>
                )}
                {!capturing && !passportPreview && (
                  <div className="passport-placeholder">
                    <button
                      type="button"
                      className="modal-cancel"
                      onClick={startCamera}
                    >
                      📷 Open Camera
                    </button>
                    <span
                      style={{ margin: '0 8px', color: 'var(--text-muted)' }}
                    >
                      or
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setFiles((p) => ({ ...p, passporturls: f }));
                          setPassportPreview(URL.createObjectURL(f));
                        }
                      }}
                    />
                  </div>
                )}
                {passportPreview && !capturing && (
                  <div
                    style={{ position: 'relative', display: 'inline-block' }}
                  >
                    <img
                      src={passportPreview}
                      alt="Passport"
                      style={{
                        width: 130,
                        height: 130,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '2px solid var(--accent-gold, #f59e0b)',
                      }}
                    />
                    <button
                      type="button"
                      title="Remove photo"
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: 'var(--danger, #e74c3c)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        cursor: 'pointer',
                        fontSize: 13,
                        lineHeight: '22px',
                        textAlign: 'center',
                      }}
                      onClick={() => {
                        setPassportPreview(null);
                        setFiles((p) => ({ ...p, passporturls: null }));
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>

            <div className="form-group col-3">
              <label className="modal-label">First Name *</label>
              <input
                className="modal-input"
                placeholder="e.g. Uchechukwu"
                value={form.fname}
                onChange={setField('fname')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Last Name *</label>
              <input
                className="modal-input"
                placeholder="e.g. Nzewi"
                value={form.lname}
                onChange={setField('lname')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Middle Name</label>
              <input
                className="modal-input"
                placeholder="e.g. Dorathy"
                value={form.mname}
                onChange={setField('mname')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Gender *</label>
              <select
                className="modal-input"
                value={form.gender}
                onChange={setField('gender')}
              >
                <option value="" hidden>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Date of Birth *</label>
              <input
                type="date"
                className="modal-input"
                value={form.dob}
                onChange={setField('dob')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Phone *</label>
              <input
                className="modal-input"
                placeholder="e.g. 08060407160"
                value={form.phone}
                onChange={setField('phone')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Email *</label>
              <input
                type="email"
                className="modal-input"
                placeholder="e.g. applicant@mail.com"
                value={form.email}
                onChange={setField('email')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">NIN</label>
              <input
                className="modal-input"
                placeholder="e.g. 60660294136"
                value={form.nin}
                onChange={setField('nin')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">JAMB Reg. No. *</label>
              <input
                className="modal-input"
                placeholder="e.g. 202210653493IA"
                value={form.jambregno}
                onChange={setField('jambregno')}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">JAMB Score *</label>
              <input
                type="number"
                className="modal-input"
                placeholder="e.g. 121"
                value={form.jamb}
                onChange={setField('jamb')}
              />
            </div>
          </>
        )}

        {/* ═══════════════ STEP 2 — LOCATION ═══════════════ */}
        {step === 2 && (
          <>
            <div className="form-group col-3">
              <label className="modal-label">Country</label>
              <select
                className="modal-input"
                value={form.country_id}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    country_id: e.target.value,
                    state_id: '',
                    lga_id: '',
                  }))
                }
              >
                <option hidden>Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-3">
              <label className="modal-label">State *</label>
              <select
                className="modal-input"
                value={form.state_id}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    state_id: e.target.value,
                    lga_id: '',
                  }))
                }
              >
                <option hidden>Select State</option>
                {states
                  .filter(
                    (s) =>
                      !selectedCountryName || s.country === selectedCountryName,
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group col-3">
              <label className="modal-label">LGA</label>
              <select
                className="modal-input"
                value={form.lga_id}
                onChange={setField('lga_id')}
              >
                <option hidden>Select LGA</option>
                {lgas
                  .filter(
                    (l) => !selectedStateName || l.state === selectedStateName,
                  )
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Home Address *</label>
              <input
                className="modal-input"
                placeholder="e.g. No 5 Main Street, Abuja"
                value={form.address}
                onChange={setField('address')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Community</label>
              <input
                className="modal-input"
                placeholder="e.g. Abuja"
                value={form.community}
                onChange={setField('community')}
              />
            </div>
          </>
        )}

        {/* ═══════════════ STEP 3 — ACADEMIC ═══════════════ */}
        {step === 3 && (
          <>
            <div className="form-group col-2">
              <label className="modal-label">School *</label>
              <select
                className="modal-input"
                value={form.faculty_id}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    faculty_id: e.target.value,
                    department_id: '',
                    programme_id: '',
                  }))
                }
              >
                <option hidden>Select School</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Department *</label>
              <select
                className="modal-input"
                value={form.department_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department_id: e.target.value }))
                }
                disabled={!form.faculty_id}
              >
                <option hidden>Select Department</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Programme *</label>
              <select
                className="modal-input"
                value={form.programme_id}
                onChange={setField('programme_id')}
              >
                <option hidden>Select Programme</option>
                {allProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Level *</label>
              <select
                className="modal-input"
                value={form.level_id}
                onChange={setField('level_id')}
              >
                <option hidden>Select Level</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Admission Mode *</label>
              <select
                className="modal-input"
                value={form.mode_id}
                onChange={setField('mode_id')}
              >
                <option value="" hidden>
                  Select Mode
                </option>
                {modes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Programme Type</label>
              <select
                className="modal-input"
                value={form.programetype_id}
                onChange={setField('programetype_id')}
              >
                <option hidden>Select Type</option>
                {PROGRAMME_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-1">
              <label className="modal-label">
                Previous School / O'Level Subjects
              </label>
              <textarea
                className="modal-input"
                rows={3}
                placeholder="e.g. English Language, CRK, Agriculture and Physics"
                value={form.previousschool}
                onChange={setField('previousschool')}
              />
            </div>
          </>
        )}

        {/* ═══════════════ STEP 4 — PARENTS & DOCS ═══════════════ */}
        {step === 4 && (
          <>
            <div className="form-group col-2">
              <label className="modal-label">Father's Name</label>
              <input
                className="modal-input"
                placeholder="e.g. Mr. John Nzewi"
                value={form.fathersname}
                onChange={setField('fathersname')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Father's Phone</label>
              <input
                className="modal-input"
                placeholder="e.g. 08060407160"
                value={form.fatherphone}
                onChange={setField('fatherphone')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Father's Occupation</label>
              <input
                className="modal-input"
                placeholder="e.g. Engineer"
                value={form.fathersjob}
                onChange={setField('fathersjob')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Mother's Name</label>
              <input
                className="modal-input"
                placeholder="e.g. Mrs. Grace Nzewi"
                value={form.mothersname}
                onChange={setField('mothersname')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Mother's Phone</label>
              <input
                className="modal-input"
                placeholder="e.g. 08060407160"
                value={form.motherphone}
                onChange={setField('motherphone')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Mother's Occupation</label>
              <input
                className="modal-input"
                placeholder="e.g. Civil Servant"
                value={form.mothersjob}
                onChange={setField('mothersjob')}
              />
            </div>

            <div className="form-group col-1 section-title-divider">
              <p>Upload Documents</p>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">
                Passport Photo (file upload)
              </label>
              <input
                type="file"
                className="modal-input"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    setFiles((p) => ({ ...p, passporturls: f }));
                    setPassportPreview(URL.createObjectURL(f));
                  }
                }}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">O'Level Result (WAEC/NECO)</label>
              <input
                type="file"
                className="modal-input"
                accept="image/*,.pdf"
                onChange={setFileField('olevelresulturls')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">JAMB Notification Slip</label>
              <input
                type="file"
                className="modal-input"
                accept="image/*,.pdf"
                onChange={setFileField('jamb_notifications')}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">JAMB Result</label>
              <input
                type="file"
                className="modal-input"
                accept="image/*,.pdf"
                onChange={setFileField('jambresults')}
              />
            </div>
          </>
        )}
      </form>
    </CustomModal>
  );
}

export default NewApplicantMutate;
