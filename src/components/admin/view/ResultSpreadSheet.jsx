import React, { useRef, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { useResultSpreadSheet } from '../../../hooks/useResults';
import { useSystemSettings } from '../../../hooks/useSettings';
import { BASE_URL } from '../../../api/api';
import './ResultSpreadSheet.css';

const gradePoint = (grade) => {
  const map = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  return map[(grade ?? '').toUpperCase()] ?? 0;
};

function groupByStudent(results) {
  const map = new Map();
  for (const r of results) {
    const key = r.regno;
    if (!map.has(key)) {
      map.set(key, {
        student: r.student,
        faculty: r.faculty,
        department: r.department,
        level: r.level,
        semester: r.semester,
        session: r.session,
        subjects: [],
      });
    }
    map.get(key).subjects.push({
      subjectcode: r.subject?.subjectcode ?? '',
      subjectname: r.subject?.name ?? '',
      creditload: Number(r.creditload) || 0,
      grade: r.grade ?? '',
      score: r.score ?? '-',
      ca: r.ca ?? '-',
      total: r.total ?? '-',
    });
  }
  return map;
}

function computeStats(subjects) {
  let tgp = 0,
    tnu = 0;
  for (const s of subjects) {
    const pts = gradePoint(s.grade) * s.creditload;
    tgp += pts;
    tnu += s.creditload;
  }
  const gpa = tnu > 0 ? (tgp / tnu).toFixed(2) : '0.00';
  return { tgp, tnu, gpa };
}

function collectSubjectColumns(studentMap) {
  const seen = new Map();
  for (const entry of studentMap.values()) {
    for (const s of entry.subjects) {
      if (!seen.has(s.subjectcode)) {
        seen.set(s.subjectcode, {
          code: s.subjectcode,
          name: s.subjectname,
          creditload: s.creditload,
        });
      }
    }
  }
  return Array.from(seen.values());
}

const PrintableSheet = React.forwardRef(function PrintableSheet(
  {
    studentMap,
    subjectCols,
    filterInfo,
    school,
    carryoverStudents,
    carryoverCourses,
  },
  ref,
) {
  const logoSrc = school?.logo ? `${BASE_URL}/img/${school.logo}` : null;
  const schoolName = school?.name ?? 'University of Nigeria';
  const schoolAddr = school?.address ?? '';
  const schoolWeb = school?.website ?? '';
  const schoolEmail = school?.email ?? '';
  const schoolPhone = school?.phone ?? '';
  const registrar = school?.registrar ?? 'Registrar';

  const monogram = schoolName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 3);

  const [logoFail, setLogoFail] = React.useState(false);

  const rows = Array.from(studentMap.entries());

  return (
    <div className="rss-printable" ref={ref}>
      {/* Watermark */}
      <div className="rss-watermark" aria-hidden>
        <span>OFFICIAL</span>
      </div>

      <div className="rss-content">
        {/* ── School header ── */}
        <div className="rss-header">
          <div className="rss-logo-wrap">
            {logoSrc && !logoFail ? (
              <img
                src={logoSrc}
                alt="University Logo"
                onError={() => setLogoFail(true)}
              />
            ) : (
              <div className="rss-logo-fallback">{monogram}</div>
            )}
          </div>

          <div className="rss-school-text">
            <p className="rss-school-name">{schoolName}</p>
            {schoolAddr && <p className="rss-school-addr">{schoolAddr}</p>}
            <p className="rss-school-contact">
              {[schoolEmail, schoolPhone, schoolWeb]
                .filter(Boolean)
                .join('  |  ')}
            </p>
          </div>

          <div className="rss-header-right">
            <div className="rss-emblem">
              OFFICIAL
              <br />
              SEAL
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="rss-divider" />

        {/* ── Sheet title ── */}
        <div className="rss-sheet-title">
          <h2>Composite Result Sheet</h2>
        </div>

        {/* ── Filter metadata ── */}
        <div className="rss-info-grid">
          <div className="rss-info-row">
            <span className="rss-info-label">School:</span>
            <span className="rss-info-value">
              {filterInfo.faculty || 'All Schools'}
            </span>
          </div>
          <div className="rss-info-row">
            <span className="rss-info-label">Semester:</span>
            <span className="rss-info-value">
              {filterInfo.semester || 'All Semesters'}
            </span>
          </div>
          <div className="rss-info-row">
            <span className="rss-info-label">Department:</span>
            <span className="rss-info-value">
              {filterInfo.department || 'All Departments'}
            </span>
          </div>
          <div className="rss-info-row">
            <span className="rss-info-label">Session:</span>
            <span className="rss-info-value">
              {filterInfo.session || 'All Sessions'}
            </span>
          </div>
          <div className="rss-info-row">
            <span className="rss-info-label">Level:</span>
            <span className="rss-info-value">
              {filterInfo.level || 'All Levels'}
            </span>
          </div>
          <div className="rss-info-row">
            <span className="rss-info-label">Generated:</span>
            <span className="rss-info-value">
              {new Date().toLocaleString('en-GB')}
            </span>
          </div>
        </div>

        {/* ── No-data fallback ── */}
        {rows.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '24px 0' }}>
            No results found for the selected filters.
          </p>
        ) : (
          <div className="rss-table-wrap">
            <table className="rss-table">
              <thead>
                {/* ── Row 1: fixed cols + subject codes (rotated) + group labels ── */}
                <tr>
                  <th rowSpan={2} className="rss-th-fixed">
                    #
                  </th>
                  <th rowSpan={2} className="rss-th-fixed">
                    MATRIC NO.
                  </th>
                  <th rowSpan={2} className="rss-th-fixed rss-th-name">
                    NAME
                  </th>
                  {/* Subject codes — rotated vertical text */}
                  {subjectCols.map((s) => (
                    <th key={s.code} className="rss-th-subject" title={s.name}>
                      <div className="rss-th-rotate">{s.code}</div>
                    </th>
                  ))}
                  {/* Group headers */}
                  <th colSpan={3} className="rss-th-group rss-th-current">
                    CURRENT
                  </th>
                  <th colSpan={4} className="rss-th-group rss-th-previous">
                    PREVIOUS
                  </th>
                  <th colSpan={3} className="rss-th-group rss-th-cumulative">
                    CUMULATIVE
                  </th>
                  <th rowSpan={2} className="rss-th-fixed">
                    REMARK
                  </th>
                </tr>

                {/* ── Row 2: credit loads + stat sub-columns ── */}
                <tr>
                  {/* Credit load per subject */}
                  {subjectCols.map((s) => (
                    <th key={s.code + '-cl'} className="rss-th-creditload">
                      {s.creditload ?? '—'}
                    </th>
                  ))}
                  {/* CURRENT */}
                  <th className="rss-th-stat">TGP</th>
                  <th className="rss-th-stat">TNU</th>
                  <th className="rss-th-stat">GPA</th>
                  {/* PREVIOUS */}
                  <th className="rss-th-stat">TGP</th>
                  <th className="rss-th-stat">TNU</th>
                  <th className="rss-th-stat">GPA</th>
                  <th className="rss-th-stat">c.GPA</th>
                  {/* CUMULATIVE */}
                  <th className="rss-th-stat">TGP</th>
                  <th className="rss-th-stat">TNU</th>
                  <th className="rss-th-stat">GPA</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(([regno, entry], idx) => {
                  const st = entry.student;
                  const fullName = [st?.fname, st?.mname, st?.lname]
                    .filter(Boolean)
                    .map((s) => s.trim())
                    .join(' ');
                  const stats = computeStats(entry.subjects);

                  // Build a quick lookup: subjectcode → subject record
                  const subMap = {};
                  for (const s of entry.subjects) {
                    subMap[s.subjectcode] = s;
                  }

                  // Derive carry-over flag & remark
                  const hasFail = entry.subjects.some((s) => s.grade === 'F');
                  const remark = hasFail ? 'F (CO)' : 'PASS';

                  return (
                    <tr key={regno}>
                      <td>{idx + 1}</td>
                      <td className="rss-td-mono">{regno}</td>
                      <td className="rss-td-left">{fullName}</td>

                      {/* Grade per subject */}
                      {subjectCols.map((col) => {
                        const sub = subMap[col.code];
                        return (
                          <td key={col.code + '-g'}>
                            {sub ? (
                              <span
                                className={`rss-grade rss-grade-${(sub.grade ?? 'F').toUpperCase()}`}
                              >
                                {sub.grade}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        );
                      })}

                      {/* CURRENT */}
                      <td>{stats.tgp}</td>
                      <td>{stats.tnu}</td>
                      <td>{stats.gpa}</td>

                      {/* PREVIOUS — no previous data in API; render blanks */}
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>

                      {/* CUMULATIVE — same as current when no previous */}
                      <td>{stats.tgp}</td>
                      <td>{stats.tnu}</td>
                      <td>{stats.gpa}</td>

                      <td
                        className={`rss-remark ${hasFail ? 'rss-remark-fail' : 'rss-remark-pass'}`}
                      >
                        {remark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'left', paddingLeft: 6 }}>
                    Total Students: {rows.length}
                  </td>
                  <td colSpan={subjectCols.length + 10 + 1}>
                    Subjects Offered: {subjectCols.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ── Carry Over Students section ── */}
        {carryoverStudents && carryoverStudents.length > 0 && (
          <div className="rss-carryover-section">
            {/* Section divider */}
            <div className="rss-divider" style={{ margin: '20px 0 12px' }} />
            <p className="rss-carryover-label">Carry Over Students</p>

            <div className="rss-table-wrap">
              <table className="rss-table">
                <thead>
                  <tr>
                    <th className="rss-th-fixed">#</th>
                    <th className="rss-th-fixed">MATRIC NO.</th>
                    <th className="rss-th-fixed rss-th-name">NAME</th>
                    {/* Carry-over course columns */}
                    {(carryoverCourses ?? []).map((c) => (
                      <th
                        key={c.subject?.subjectcode}
                        className="rss-th-subject"
                        title={c.subject?.name}
                      >
                        <div className="rss-th-rotate">
                          {c.subject?.subjectcode}
                        </div>
                      </th>
                    ))}
                    <th colSpan={3} className="rss-th-group rss-th-current">
                      CURRENT
                    </th>
                    <th colSpan={4} className="rss-th-group rss-th-previous">
                      PREVIOUS
                    </th>
                    <th colSpan={3} className="rss-th-group rss-th-cumulative">
                      CUMULATIVE
                    </th>
                    <th className="rss-th-fixed">REMARK</th>
                  </tr>
                  <tr>
                    {(carryoverCourses ?? []).map((c) => (
                      <th
                        key={c.subject?.subjectcode + '-cl'}
                        className="rss-th-creditload"
                      >
                        {c.creditload ?? '—'}
                      </th>
                    ))}
                    <th className="rss-th-stat">TGP</th>
                    <th className="rss-th-stat">TNU</th>
                    <th className="rss-th-stat">GPA</th>
                    <th className="rss-th-stat">TGP</th>
                    <th className="rss-th-stat">TNU</th>
                    <th className="rss-th-stat">GPA</th>
                    <th className="rss-th-stat">c.GPA</th>
                    <th className="rss-th-stat">TGP</th>
                    <th className="rss-th-stat">TNU</th>
                    <th className="rss-th-stat">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {carryoverStudents.map((co, idx) => {
                    const st = co.student;
                    const fullName = [st?.fname, st?.mname, st?.lname]
                      .filter(Boolean)
                      .map((s) => s.trim())
                      .join(' ');
                    const coStats = computeStats(
                      (carryoverCourses ?? []).map((c) => ({
                        grade: c.regno === co.regno ? c.grade : '—',
                        creditload: Number(c.creditload) || 0,
                      })),
                    );
                    return (
                      <tr key={co.regno + '-co'}>
                        <td>{idx + 1}</td>
                        <td className="rss-td-mono">{co.regno}</td>
                        <td className="rss-td-left">{fullName}</td>
                        {(carryoverCourses ?? []).map((c) => (
                          <td key={c.subject?.subjectcode + '-cog'}>
                            <span
                              className={`rss-grade rss-grade-${(co.grade ?? 'F').toUpperCase()}`}
                            >
                              {co.grade}
                            </span>
                          </td>
                        ))}
                        <td>{coStats.tgp}</td>
                        <td>{coStats.tnu}</td>
                        <td>{coStats.gpa}</td>
                        <td>—</td>
                        <td>—</td>
                        <td>—</td>
                        <td>—</td>
                        <td>{coStats.tgp}</td>
                        <td>{coStats.tnu}</td>
                        <td>{coStats.gpa}</td>
                        <td className="rss-remark rss-remark-fail">F (CO)</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Signature block ── */}
        <div className="rss-signatures">
          <div className="rss-sig-block">
            <div className="rss-sig-line" />
            <strong>HOD:</strong>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: _____________
          </div>
          <div className="rss-sig-block" style={{ textAlign: 'center' }}>
            <div className="rss-sig-line" />
            <strong>Dean:</strong>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: _____________
          </div>
          <div className="rss-sig-block" style={{ textAlign: 'right' }}>
            <div className="rss-sig-line" />
            <strong>{registrar}</strong>
          </div>
        </div>

        {/* ── Page footer ── */}
        <div className="rss-footer">
          <p>
            This is a computer-generated result sheet. Valid without a
            handwritten signature.
          </p>
          <p>
            {schoolName}
            {schoolAddr ? ` · ${schoolAddr}` : ''}
            {schoolWeb ? ` · ${schoolWeb}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
});

function ResultSpreadSheet({
  faculties,
  departments,
  levels,
  semesters,
  sessions,
  closeModal,
}) {
  const [localParams, setLocalParams] = useState({
    faculty_id: '',
    department_id: '',
    level_id: '',
    semester_id: '',
    session_id: '',
  });

  const [activePayload, setActivePayload] = useState(null);

  const setFilter = (key) => (e) => {
    const value = e.target.value;
    setLocalParams((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'faculty_id') {
        next.department_id = '';
      }
      return next;
    });
  };

  const handleFetch = () => {
    /* Build POST payload — strip empty strings so the API can filter correctly */
    const payload = {};
    if (localParams.faculty_id)
      payload.faculty_id = Number(localParams.faculty_id);
    if (localParams.department_id)
      payload.department_id = Number(localParams.department_id);
    if (localParams.level_id) payload.level_id = Number(localParams.level_id);
    if (localParams.semester_id)
      payload.semester_id = Number(localParams.semester_id);
    if (localParams.session_id)
      payload.session_id = Number(localParams.session_id);
    setActivePayload(payload);
  };

  /* ── Data — POST request via useResultSpreadSheet ── */
  const {
    data: response,
    isLoading,
    isFetching,
  } = useResultSpreadSheet(activePayload ?? {}, {
    enabled: activePayload !== null,
  });
  /* ── Extract all sections from the rich API response ── */
  const results = useMemo(() => response?.data ?? [], [response]);
  const carryoverStudents = useMemo(() => response?.students ?? [], [response]);
  const carryoverCourses = useMemo(
    () => response?.carryover_courses ?? [],
    [response],
  );

  const { data: settingsRes } = useSystemSettings(1);
  const school = settingsRes?.data ?? null;

  /* ── Derived data ── */
  const studentMap = useMemo(() => groupByStudent(results), [results]);
  const subjectCols = useMemo(
    () => collectSubjectColumns(studentMap),
    [studentMap],
  );

  /* ── Build filter labels for the printed sheet ── */
  const filterInfo = useMemo(() => {
    const fac = faculties.find(
      (f) => String(f.id) === String(localParams.faculty_id),
    );
    const dep = departments.find(
      (d) => String(d.id) === String(localParams.department_id),
    );
    const lv = levels.find(
      (l) => String(l.id) === String(localParams.level_id),
    );
    const sem = semesters.find(
      (s) => String(s.id) === String(localParams.semester_id),
    );
    const ses = sessions.find(
      (s) => String(s.id) === String(localParams.session_id),
    );
    return {
      faculty: fac?.name ?? '',
      department: dep?.name ?? '',
      level: lv?.name ?? '',
      semester: sem?.name ?? '',
      session: ses?.name ?? '',
    };
  }, [localParams, faculties, departments, levels, semesters, sessions]);

  /* ── Print ── */
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Composite_Result_Sheet${
      filterInfo.department
        ? '_' + filterInfo.department.replace(/\s+/g, '_')
        : ''
    }${filterInfo.session ? '_' + filterInfo.session : ''}`,
  });

  const hasData = studentMap.size > 0 || carryoverStudents.length > 0;
  const loading = activePayload !== null && (isLoading || isFetching);

  /* ── Render via portal ── */
  const content = (
    <div
      className="rss-overlay"
      onClick={(e) => e.target === e.currentTarget && closeModal?.()}
    >
      <div className="rss-modal">
        {/* Toolbar */}
        <div className="rss-toolbar">
          <div className="rss-toolbar-left">
            <span className="rss-badge">📊 Result Sheet</span>
            <p className="rss-toolbar-title">Composite Result Sheet</p>
          </div>
          <div className="rss-toolbar-actions">
            <button
              className="rss-btn-print"
              onClick={handlePrint}
              disabled={!hasData || loading}
            >
              🖨️ Print / Export PDF
            </button>
            <button className="rss-btn-close" onClick={closeModal}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="rss-filters">
          <div className="rss-filter-group">
            <label>Faculty</label>
            <select
              value={localParams.faculty_id}
              onChange={setFilter('faculty_id')}
            >
              <option value="" disabled selected hidden>
                Select Faculty
              </option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rss-filter-group">
            <label>Department</label>
            <select
              value={localParams.department_id}
              disabled={!localParams.faculty_id}
              onChange={setFilter('department_id')}
            >
              <option value="" disabled selected hidden>
                Select Department
              </option>
              {departments
                .filter(
                  (d) =>
                    !localParams.faculty_id ||
                    String(d.faculty_id) === String(localParams.faculty_id),
                )
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="rss-filter-group">
            <label>Level</label>
            <select
              value={localParams.level_id}
              onChange={setFilter('level_id')}
            >
              <option value="" disabled selected hidden>
                Select Level
              </option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rss-filter-group">
            <label>Session</label>
            <select
              value={localParams.session_id}
              onChange={setFilter('session_id')}
            >
              <option value="" disabled selected hidden>
                Select Session
              </option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rss-filter-group">
            <label>Semester</label>
            <select
              value={localParams.semester_id}
              onChange={setFilter('semester_id')}
            >
              <option value="" disabled selected hidden>
                Select Semester
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="rss-filter-fetch-btn"
            onClick={handleFetch}
            disabled={loading}
          >
            {loading ? 'Loading…' : '🔍 Load Sheet'}
          </button>
        </div>

        {/* Scroll / preview area */}
        <div className="rss-scroll">
          {loading ? (
            <div className="rss-state">
              <span className="rss-state-icon">⏳</span>
              <p className="rss-state-title">Fetching results…</p>
              <p className="rss-state-sub">Please wait while data loads.</p>
            </div>
          ) : !hasData ? (
            <div className="rss-state">
              <span className="rss-state-icon">📋</span>
              <p className="rss-state-title">No results loaded</p>
              <p className="rss-state-sub">
                Use the filters above and click <strong>Load Sheet</strong> to
                generate the result spreadsheet.
              </p>
            </div>
          ) : (
            <PrintableSheet
              ref={printRef}
              studentMap={studentMap}
              subjectCols={subjectCols}
              filterInfo={filterInfo}
              school={school}
              carryoverStudents={carryoverStudents}
              carryoverCourses={carryoverCourses}
            />
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

export default ResultSpreadSheet;
