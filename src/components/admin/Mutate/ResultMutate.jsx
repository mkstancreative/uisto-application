import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCourses } from '../../../hooks/useCourses';
import { useDepartments } from '../../../hooks/useDepartments';
import { useFaculties } from '../../../hooks/useFaculties';
import { useLevels } from '../../../hooks/useLevels';
import { useCreateResult, useUpdateResult } from '../../../hooks/useResults';
import { useSemesters } from '../../../hooks/useSemesters';
import { useSessions } from '../../../hooks/useSessions';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

/* Single student row inside the result entry table */
function StudentRow({ entry, onChange }) {
  return (
    <tr>
      <td style={{ padding: '8px 10px', fontSize: 12 }}>
        <div style={{ fontWeight: 600 }}>
          {entry.fname} {entry.lname}
        </div>
        <code style={{ fontSize: 10, color: '#64748b' }}>{entry.regno}</code>
      </td>
      <td style={{ padding: '8px 6px' }}>
        <input
          type="number"
          min={0}
          max={100}
          className="modal-input"
          style={{ width: 70, textAlign: 'center', padding: '4px 6px' }}
          value={entry.ca ?? ''}
          placeholder="CA"
          onChange={(e) =>
            onChange(entry.student_id ?? entry.id, 'ca', e.target.value)
          }
        />
      </td>
      <td style={{ padding: '8px 6px' }}>
        <input
          type="number"
          min={0}
          max={100}
          className="modal-input"
          style={{ width: 70, textAlign: 'center', padding: '4px 6px' }}
          value={entry.score ?? ''}
          placeholder="Exam"
          onChange={(e) =>
            onChange(entry.student_id ?? entry.id, 'score', e.target.value)
          }
        />
      </td>
      <td
        style={{
          padding: '8px 10px',
          fontSize: 12,
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        {entry.ca !== '' && entry.score !== ''
          ? Number(entry.ca) + Number(entry.score)
          : '—'}
      </td>
    </tr>
  );
}

function ResultMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  /* ── Filter selectors ── */
  const [filter, setFilter] = useState({
    faculty_id: data?.faculty_id ?? '',
    department_id: data?.department_id ?? '',
    subject_id: data?.subject_id ?? '',
    semester_id: data?.semester_id ?? '',
    session_id: data?.session_id ?? '',
    level_id: data?.level_id ?? '',
    document: '',
  });

  /* ── Result rows keyed by student_id ── */
  const [resultMap, setResultMap] = useState(() => {
    if (isEdit && data) {
      return {
        [data.student_id]: {
          student_id: data.student_id,
          fname: data.student?.fname ?? '',
          lname: data.student?.lname ?? '',
          regno: data.regno,
          ca: data.ca ?? '',
          score: data.score ?? '',
          total: data.total ?? Number(data.ca || 0) + Number(data.score || 0),
        },
      };
    }
    return {};
  });

  /* ── Reference data ── */
  const { data: facultyRes } = useFaculties({ limit: 1000 });
  const { data: deptRes } = useDepartments({ limit: 1000 });
  const { data: semesterRes } = useSemesters({ limit: 1000 });
  const { data: sessionRes } = useSessions({ limit: 1000 });
  const { data: levelRes } = useLevels({ limit: 1000 });
  const { data: courseRes } = useCourses(
    filter.department_id
      ? { department_id: filter.department_id, level_id: filter.level_id }
      : { limit: 1000 },
  );

  const faculties = facultyRes?.data || [];
  const departments = (deptRes?.data || []).filter(
    (d) =>
      !filter.faculty_id || String(d.faculty_id) === String(filter.faculty_id),
  );
  const semesters = semesterRes?.data || [];
  const sessions = sessionRes?.data || [];
  const levels = levelRes?.data || [];
  const courses = courseRes?.data || [];

  const setF = (key) => (e) => {
    const value = e.target.value;
    setFilter((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'faculty_id') {
        next.department_id = '';
        next.subject_id = '';
      }
      if (key === 'department_id') {
        next.subject_id = '';
      }
      if (key === 'level_id') {
        next.subject_id = '';
      }
      return next;
    });
  };

  /* ── Student row update ── */
  const handleRowChange = (studentId, field, value) => {
    setResultMap((prev) => {
      const current = prev[studentId];
      const updated = { ...current, [field]: value };
      // Compute total whenever ca or score changes
      updated.total = Number(updated.ca || 0) + Number(updated.score || 0);
      return { ...prev, [studentId]: updated };
    });
  };

  const rows = Object.values(resultMap);

  /* ── Mutations ── */
  const { mutate: createResult, isPending: creating } = useCreateResult();
  const { mutate: updateResult, isPending: updating } = useUpdateResult();
  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      const studentEntry = Object.values(resultMap)[0];
      const payload = {
        ...filter,
        id: data.id,
        ca: studentEntry.ca,
        score: studentEntry.score,
        grade: data.grade ?? '—',
        remark: data.remark ?? '',
        creditload: data.creditload ?? data.subject?.creditload ?? '0',
        iscarryover: data.iscarryover ?? 'no',
      };

      updateResult(payload, {
        onSuccess: () => {
          toast.success('Result updated successfully');
          closeModal();
        },
        onError: (err) =>
          toast.error(err?.message || 'Failed to update result'),
      });
    } else {
      createResult(filter, {
        onSuccess: () => {
          toast.success('Result uploaded successfully');
          closeModal();
        },
        onError: (err) =>
          toast.error(err?.message || 'Failed to upload result'),
      });
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Edit Result' : 'Upload Results'}
      subtitle="Select the filters then enter CA and Exam scores for each student."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="result-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Result'
            ) : (
              'Upload Results'
            )}
          </button>
        </>
      }
    >
      <form id="result-form" onSubmit={onSubmit}>
        {/* ── Filter grid ── */}
        <div className="form-grid" style={{ marginBottom: 20 }}>
          {/* Faculty */}
          <div className="form-group col-2">
            <label className="modal-label">
              School <span className="req">*</span>
            </label>
            <select
              className="modal-input"
              value={filter.faculty_id}
              onChange={setF('faculty_id')}
              required
            >
              <option value="" hidden>
                — Select School —
              </option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="form-group col-2">
            <label className="modal-label">
              Department <span className="req">*</span>
            </label>
            <select
              className="modal-input"
              value={filter.department_id}
              onChange={setF('department_id')}
              disabled={!filter.faculty_id}
              required
            >
              <option value="" hidden>
                — Select Department —
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="form-group col-2">
            <label className="modal-label">
              Level <span className="req">*</span>
            </label>
            <select
              className="modal-input"
              value={filter.level_id}
              onChange={setF('level_id')}
              required
            >
              <option value="">— Select Level —</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject / Course */}
          <div className="form-group col-2">
            <label className="modal-label">
              Courses <span className="req">*</span>
            </label>
            <select
              className="modal-input"
              value={filter.subject_id}
              onChange={setF('subject_id')}
              required
            >
              <option value="">— Select Courses —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.subjectcode ? `${c.subjectcode} — ` : ''}
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div className="form-group col-2">
            <label className="modal-label">
              Session <span className="req">*</span>
            </label>
            <select
              className="modal-input"
              value={filter.session_id}
              onChange={setF('session_id')}
              required
            >
              <option value="">— Select Session —</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="form-group col-2">
            <label className="modal-label">
              Semester <span className="req">*</span>
            </label>
            <select
              className="modal-input"
              value={filter.semester_id}
              onChange={setF('semester_id')}
              required
            >
              <option value="">— Select Semester —</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <>
              {/* Upload Document */}
              <div className="form-group col-2">
                <label className="modal-label">Upload Document</label>
                <input
                  type="file"
                  className="modal-input"
                  accept=".xls,.xlsx"
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      document: e.target.files[0] ?? null,
                    }))
                  }
                />
                <p className="modal-hint">Only Excel Supported.</p>
              </div>
            </>
          )}
        </div>

        {/* ── Student score rows (edit mode only — one student) ── */}
        {isEdit && rows.length > 0 && (
          <div
            style={{
              overflowX: 'auto',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    background: '#f8fafc',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748b',
                  }}
                >
                  <th style={{ padding: '10px 10px', textAlign: 'left' }}>
                    Student
                  </th>
                  <th
                    style={{
                      padding: '10px 6px',
                      textAlign: 'center',
                      width: 90,
                    }}
                  >
                    CA
                  </th>
                  <th
                    style={{
                      padding: '10px 6px',
                      textAlign: 'center',
                      width: 90,
                    }}
                  >
                    Exam
                  </th>
                  <th
                    style={{
                      padding: '10px 10px',
                      textAlign: 'center',
                      width: 80,
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <StudentRow
                    key={r.student_id}
                    entry={r}
                    onChange={handleRowChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create mode: scores go in result object which backend fills from students */}
        {!isEdit && (
          <>
            <div>
              <a href="/RESULT_SAMPLE.xlsx" download="RESULT_SAMPLE.xlsx">
                Download Sample
              </a>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', padding: '8px 0' }}>
              After selecting the filters above, the system will apply scores to
              all matching students in the selected department, level, session
              and semester.
            </p>
          </>
        )}
      </form>
    </CustomModal>
  );
}

export default ResultMutate;
