import React, { useState } from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import { useUpdateStudentOlevel } from '../../../hooks/useStudents';
import { toast } from 'react-toastify';

/* ── Reference data ── */
const EXAM_TYPES = [
  'WAEC MAY/JUNE',
  'WAEC NOV/DEC',
  'NECO JUNE/JULY',
  'NECO NOV/DEC',
  'GCE',
  'NABTEB',
];

const GRADES = [
  'A1',
  'B2',
  'B3',
  'C4',
  'C5',
  'C6',
  'D7',
  'E8',
  'F9',
  'P7',
  'P8',
  'CA',
  'ABS',
];

const SUBJECTS = [
  'Agricultural Science',
  'Animal Husbandry',
  'Arabic',
  'Basic Electronics',
  'Biology',
  'Book Keeping',
  'Building Construction',
  'Chemistry',
  'Christian Religious Knowledge',
  'Civic Education',
  'Commerce',
  'Computer Studies / ICT',
  'Cultural and Creative Arts',
  'Data Processing',
  'Economics',
  'English Language',
  'Fine and Applied Arts',
  'Financial Accounting',
  'Further Mathematics',
  'Geography',
  'Government',
  'Hausa',
  'Health Education',
  'Health Science',
  'History',
  'Home Economics',
  'Igbo',
  'Insurance',
  'Islamic Studies',
  'Literature in English',
  'Marketing',
  'Mathematics',
  'Metalwork',
  'Music',
  'Office Practice',
  'Painting & Decoration',
  'Physical Education',
  'Physics',
  'Radio, TV & Electronics Works',
  'Social Studies',
  'Store Keeping',
  'Technical Drawing',
  'Theatre Arts',
  'Typewriting',
  'Visual Art',
  'Woodwork',
  'Yoruba',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1999 }, (_, i) =>
  String(currentYear - i),
);

const SUBJECT_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function SittingSection({ n, label, form, set }) {
  const pfx = `s${n}`;
  return (
    <div className="olevel-sitting">
      <div className="olevel-sitting-title">{label}</div>

      <div className="form-grid">
        <div className="form-group col-2">
          <label className="modal-label">Exam Type</label>
          <select
            className="modal-input"
            value={form[`examtype${n}`] ?? ''}
            onChange={set(`examtype${n}`)}
          >
            <option value="" hidden>
              — Select Exam Type —
            </option>
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Year */}
        <div className="form-group col-2">
          <label className="modal-label">Exam Year</label>
          <select
            className="modal-input"
            value={form[`examyr${n}`] ?? ''}
            onChange={set(`examyr${n}`)}
          >
            <option value="" hidden>
              — Select Year —
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Number */}
        <div className="form-group col-1">
          <label className="modal-label">Exam Number / Index No.</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. NOV36346Cf"
            value={form[`examnumber${n}`] ?? ''}
            onChange={set(`examnumber${n}`)}
          />
        </div>
      </div>

      {/* Subject rows */}
      <div className="olevel-subjects-grid">
        <div className="olevel-subjects-head">
          <span>Subject</span>
          <span>Grade</span>
        </div>
        {SUBJECT_SLOTS.map((slot) => {
          const subKey = `${pfx}s${slot}`;
          const gradeKey = `${pfx}s${slot}g`;
          return (
            <div key={slot} className="olevel-subject-row">
              <select
                className="modal-input"
                value={form[subKey] ?? ''}
                onChange={set(subKey)}
              >
                <option value="">— Subject {slot} —</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="modal-input"
                value={form[gradeKey] ?? ''}
                onChange={set(gradeKey)}
              >
                <option value="">Grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── helpers ── */
const SECOND_SITTING_KEYS = [
  'examtype2',
  'examyr2',
  'examnumber2',
  ...SUBJECT_SLOTS.flatMap((s) => [`s2s${s}`, `s2s${s}g`]),
];

function clearSecond(prev) {
  const next = { ...prev };
  SECOND_SITTING_KEYS.forEach((k) => {
    next[k] = '';
  });
  return next;
}

function OlevelMutate({ data, onClose }) {
  /* Detect if existing data already has a 2nd sitting filled */
  const hasExisting2nd =
    data &&
    (data.examtype2 ||
      data.examnumber2 ||
      SUBJECT_SLOTS.some((s) => data[`s2s${s}`]));

  const [showSecond, setShowSecond] = useState(Boolean(hasExisting2nd));

  const [form, setForm] = useState(() => {
    if (!data) return { student_id: '' };
    const f = { student_id: data.id ?? data.student_id ?? '' };
    const keys = [
      'examtype1',
      'examyr1',
      'examnumber1',
      'examtype2',
      'examyr2',
      'examnumber2',
    ];
    SUBJECT_SLOTS.forEach((s) => {
      keys.push(`s1s${s}`, `s1s${s}g`, `s2s${s}`, `s2s${s}g`);
    });
    keys.forEach((k) => {
      f[k] = data[k] ?? '';
    });
    return f;
  });

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleToggleSecond = () => {
    if (showSecond) {
      /* Clear all 2nd-sitting fields when hiding */
      setForm(clearSecond);
    }
    setShowSecond((v) => !v);
  };

  const { mutate: updateOlevel, isPending } = useUpdateStudentOlevel();

  const onSubmit = (e) => {
    e.preventDefault();
    updateOlevel(form, {
      onSuccess: () => {
        toast.success('O-Level results updated successfully');
        onClose();
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to update O-Level results');
      },
    });
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Update O-Level Results"
      subtitle={data ? `${data.fname ?? ''} ${data.lname ?? ''}`.trim() : ''}
      size="wide"
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="olevel-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : 'Save O-Level Results'}
          </button>
        </>
      }
    >
      <form id="olevel-form" onSubmit={onSubmit} className="olevel-form-wrap">
        <SittingSection n={1} label="1st Sitting" form={form} set={set} />

        {/* ── 2nd sitting toggle ── */}
        <button
          type="button"
          className={`olevel-toggle-btn${showSecond ? ' active' : ''}`}
          onClick={handleToggleSecond}
        >
          {showSecond ? '✕ Remove 2nd Sitting' : '+ Add 2nd Sitting'}
        </button>

        {showSecond && (
          <SittingSection n={2} label="2nd Sitting" form={form} set={set} />
        )}
      </form>
    </CustomModal>
  );
}

export default OlevelMutate;
