import React, { useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { BASE_URL } from '../../../api/api';
import { useTranscripts } from '../../../hooks/useResults';
import { useSystemSettings } from '../../../hooks/useSettings';
import './StudentTranscriptView.css';

/* ── Grade helpers ── */
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
const gradePoint = (g) => GRADE_POINTS[(g ?? '').toUpperCase()] ?? 0;

function computeGpa(results) {
  let tgp = 0,
    tnu = 0;
  for (const r of results) {
    const cl = Number(r.creditload) || 0;
    tgp += gradePoint(r.grade) * cl;
    tnu += cl;
  }
  return { tgp, tnu, gpa: tnu > 0 ? (tgp / tnu).toFixed(2) : '0.00' };
}

function groupBySemester(results) {
  const map = new Map();
  for (const r of results) {
    const key = `${r.session_id}-${r.semester_id}`;
    if (!map.has(key)) {
      map.set(key, {
        session: r.session,
        semester: r.semester,
        level: r.level,
        results: [],
      });
    }
    map.get(key).results.push(r);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.session?.id !== b.session?.id)
      return (a.session?.id ?? 0) - (b.session?.id ?? 0);
    return (a.semester?.id ?? 0) - (b.semester?.id ?? 0);
  });
}

/* ────────────── Printable component ────────────── */
const PrintableTranscript = React.forwardRef(function PrintableTranscript(
  { student, groups, school },
  ref,
) {
  const logoSrc = school?.logo ? `${BASE_URL}/img/${school.logo}` : null;
  const schoolName = school?.name ?? 'Claretian University of Nigeria';
  const [logoFail, setLogoFail] = React.useState(false);

  const monogram = schoolName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 3);

  const fullName = [student?.fname, student?.mname, student?.lname]
    .filter(Boolean)
    .map((s) => s.trim())
    .join(' ');

  const passportSrc = student?.passporturl
    ? `${BASE_URL}/img/${student.passporturl}`
    : null;

  /* Cumulative across all groups */
  const allResults = groups.flatMap((g) => g.results);
  const cumulative = computeGpa(allResults);

  return (
    <div className="stv-printable" ref={ref}>
      {/* Watermark */}
      <div className="stv-watermark" aria-hidden>
        <span>OFFICIAL</span>
      </div>

      <div className="stv-content">
        {/* ── School header ── */}
        <div className="stv-header">
          <div className="stv-logo-wrap">
            {logoSrc && !logoFail ? (
              <img src={logoSrc} alt="Logo" onError={() => setLogoFail(true)} />
            ) : (
              <div className="stv-logo-fallback">{monogram}</div>
            )}
          </div>
          <div className="stv-school-text">
            <p className="stv-school-name">{schoolName}</p>
            {school?.address && (
              <p className="stv-school-addr">{school.address}</p>
            )}
            <p className="stv-school-contact">
              {[school?.email, school?.phone, school?.website]
                .filter(Boolean)
                .join('  |  ')}
            </p>
          </div>
          <div className="stv-header-right">
            <div className="stv-emblem">
              OFFICIAL
              <br />
              SEAL
            </div>
          </div>
        </div>

        <div className="stv-divider" />
        <div className="stv-sheet-title">
          <h2>Academic Transcript</h2>
        </div>

        {/* ── Student info ── */}
        <div className="stv-student-section">
          <div className="stv-student-left">
            {passportSrc ? (
              <img
                src={passportSrc}
                alt={fullName}
                className="stv-passport"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="stv-passport stv-passport-fallback">
                {(student?.fname?.[0] ?? '') + (student?.lname?.[0] ?? '')}
              </div>
            )}
          </div>
          <div className="stv-student-grid">
            {[
              ['Full Name', fullName],
              ['Matric No.', student?.regno ?? '—'],
              ['Email', student?.email ?? '—'],
              ['Date of Birth', student?.dob ?? '—'],
              ['Gender', student?.gender ?? '—'],
              ['Dept.', student?.department?.name ?? '—'],
              ['Faculty', student?.faculty?.name ?? '—'],
              ['Level', student?.level?.name ?? '—'],
              ['Programme', student?.programme?.name ?? '—'],
              ['Status', student?.status ?? '—'],
            ].map(([label, value]) => (
              <div className="stv-info-row" key={label}>
                <span className="stv-info-label">{label}:</span>
                <span className="stv-info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stv-divider" />

        {/* ── Results per semester ── */}
        {groups.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '24px 0' }}>
            No results recorded for this student.
          </p>
        ) : (
          groups.map((group, gi) => {
            const stats = computeGpa(group.results);
            const hasCarryover = group.results.some((r) => r.grade === 'F');
            return (
              <div className="stv-semester-block" key={gi}>
                <div className="stv-semester-header">
                  <span className="stv-sem-label">
                    {group.session?.name ?? '—'} &mdash;{' '}
                    {group.semester?.name ?? '—'}
                  </span>
                  <span className="stv-sem-level">
                    {group.level?.name ?? '—'}
                  </span>
                </div>
                <table className="stv-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credit Load</th>
                      <th>CA Score</th>
                      <th>Exam Score</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.results.map((r, idx) => {
                      const pass = r.grade !== 'F';
                      return (
                        <tr key={r.id}>
                          <td>{idx + 1}</td>
                          <td className="stv-td-mono">
                            {r.subject?.subjectcode ?? '—'}
                          </td>
                          <td className="stv-td-left">
                            {r.subject?.name ?? '—'}
                          </td>
                          <td>{r.creditload ?? '—'}</td>
                          <td>{r.ca ?? '—'}</td>
                          <td>{r.score ?? '—'}</td>
                          <td>
                            <strong>{r.total ?? '—'}</strong>
                          </td>
                          <td>
                            <span
                              className={`stv-grade stv-grade-${(r.grade ?? 'F').toUpperCase()}`}
                            >
                              {r.grade ?? '—'}
                            </span>
                          </td>
                          <td
                            className={
                              pass ? 'stv-remark-pass' : 'stv-remark-fail'
                            }
                          >
                            {r.iscarryover === 'yes'
                              ? 'C/O'
                              : pass
                                ? 'PASS'
                                : 'FAIL'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={3}
                        style={{ textAlign: 'left', paddingLeft: 6 }}
                      >
                        Courses: {group.results.length}
                      </td>
                      <td>
                        <strong>{stats.tnu}</strong>
                      </td>
                      <td colSpan={2} />
                      <td colSpan={2}>
                        <strong>GPA: {stats.gpa}</strong>
                      </td>
                      <td
                        className={
                          hasCarryover ? 'stv-remark-fail' : 'stv-remark-pass'
                        }
                      >
                        <strong>{hasCarryover ? 'C/O' : 'PASS'}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })
        )}

        {/* ── Cumulative summary ── */}
        {groups.length > 0 && (
          <div className="stv-cumulative">
            <div className="stv-cumulative-row">
              <span>Total Credit Units Earned:</span>
              <strong>{cumulative.tnu}</strong>
            </div>
            <div className="stv-cumulative-row">
              <span>Total Grade Points:</span>
              <strong>{cumulative.tgp}</strong>
            </div>
            <div className="stv-cumulative-row stv-gpa-highlight">
              <span>Cumulative GPA (CGPA):</span>
              <strong>{cumulative.gpa}</strong>
            </div>
          </div>
        )}

        {/* ── Signatures ── */}
        <div className="stv-signatures">
          <div className="stv-sig-block">
            <div className="stv-sig-line" />
            <strong>HOD:</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date:
            _____________
          </div>
          <div className="stv-sig-block" style={{ textAlign: 'center' }}>
            <div className="stv-sig-line" />
            <strong>Dean:</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date:
            _____________
          </div>
          <div className="stv-sig-block" style={{ textAlign: 'right' }}>
            <div className="stv-sig-line" />
            <strong>{school?.registrar ?? 'Registrar'}</strong>
          </div>
        </div>

        <div className="stv-footer">
          <p>
            This is a computer-generated transcript. Valid without a handwritten
            signature.
          </p>
          <p>
            {schoolName}
            {school?.address ? ` · ${school.address}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
});

/* ────────────── Main component ────────────── */
function StudentTranscriptView({ studentId, orderData, closeModal }) {
  const { data: response, isLoading } = useTranscripts(studentId);
  const { data: settingsRes } = useSystemSettings(1);

  const student = response?.data ?? null;
  const results = useMemo(() => student?.results ?? [], [student]);
  const school = settingsRes?.data ?? null;

  const groups = useMemo(() => groupBySemester(results), [results]);

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Transcript_${student?.regno ?? studentId}`,
  });

  const content = (
    <div
      className="stv-overlay"
      onClick={(e) => e.target === e.currentTarget && closeModal?.()}
    >
      <div className="stv-modal">
        {/* Toolbar */}
        <div className="stv-toolbar">
          <div className="stv-toolbar-left">
            <span className="stv-badge">📜 Transcript</span>
            <p className="stv-toolbar-title">
              {student
                ? `${student.fname ?? ''} ${student.lname ?? ''} — ${student.regno ?? ''}`
                : 'Loading…'}
            </p>
          </div>
          <div className="stv-toolbar-actions">
            {/* Order info chips */}
            {orderData && (
              <>
                <span className="stv-order-chip">📦 Order #{orderData.id}</span>
                <span className="stv-order-chip">
                  {orderData.courier?.name ?? 'Courier'}
                </span>
                <span className="stv-order-chip stv-chip-status">
                  {orderData.status}
                </span>
              </>
            )}
            <button
              className="stv-btn-print"
              onClick={handlePrint}
              disabled={isLoading || groups.length === 0}
            >
              🖨️ Print / Export PDF
            </button>
            <button className="stv-btn-close" onClick={closeModal}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div className="stv-scroll">
          {isLoading ? (
            <div className="stv-state">
              <span className="stv-state-icon">⏳</span>
              <p className="stv-state-title">Loading transcript…</p>
            </div>
          ) : !student ? (
            <div className="stv-state">
              <span className="stv-state-icon">📋</span>
              <p className="stv-state-title">No data found</p>
              <p className="stv-state-sub">
                Transcript data could not be loaded.
              </p>
            </div>
          ) : (
            <PrintableTranscript
              ref={printRef}
              student={student}
              groups={groups}
              school={school}
            />
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

export default StudentTranscriptView;
