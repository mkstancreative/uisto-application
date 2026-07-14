import React, { useState, useMemo } from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import { useImportStudents } from '../../../hooks/useStudents';
import { useFaculties } from '../../../hooks/useFaculties';
import { useDepartments } from '../../../hooks/useDepartments';
import { useLevels } from '../../../hooks/useLevels';
import { useProgramme } from '../../../hooks/useProgrammes';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';

function ImportStudents({ closeModal }) {
  const [form, setForm] = useState({
    faculty_id: '',
    department_id: '',
    level_id: '',
    programme_id: '',
    students: null,
  });
  const [fileName, setFileName] = useState('');

  /* ── Reference data ── */
  const { data: facultyRes } = useFaculties();
  const { data: deptRes } = useDepartments();
  const { data: levelRes } = useLevels();
  const { data: programmeRes } = useProgramme();

  const faculties = facultyRes?.data ?? [];
  const allDepartments = useMemo(() => deptRes?.data ?? [], [deptRes]);
  const levels = levelRes?.data ?? [];
  const programmes = programmeRes?.data ?? [];

  /* ── Filter departments by selected faculty ── */
  const departments = useMemo(() => {
    if (!form.faculty_id) return allDepartments;
    return allDepartments.filter(
      (d) => String(d.faculty_id) === String(form.faculty_id),
    );
  }, [allDepartments, form.faculty_id]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  /* Reset department when faculty changes */
  const handleFacultyChange = (e) => {
    setForm((p) => ({ ...p, faculty_id: e.target.value, department_id: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, students: file }));
    setFileName(file.name);
  };

  const { mutate: importStudents, isPending } = useImportStudents();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.students) {
      toast.error('Please select an Excel / CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('faculty_id', form.faculty_id);
    formData.append('department_id', form.department_id);
    formData.append('level_id', form.level_id);
    formData.append('programme_id', form.programme_id);
    formData.append('students', form.students);

    importStudents(formData, {
      onSuccess: (res) => {
        toast.success(res?.message ?? 'Students imported successfully');
        closeModal();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message ?? 'Import failed'),
    });
  };

  return (
    <CustomModal
      isOpen
      title="Import Students"
      subtitle="Upload an Excel or CSV file to bulk-import students."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="import-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                <Upload size={15} /> Import
              </>
            )}
          </button>
        </>
      }
    >
      <form id="import-form" className="form-grid" onSubmit={onSubmit}>
        {/* Schools */}
        <div className="form-group col-2">
          <label className="modal-label">Schools</label>
          <select
            className="modal-input"
            value={form.faculty_id}
            onChange={handleFacultyChange}
          >
            <option value="">Select Schools</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department — filtered by faculty */}
        <div className="form-group col-2">
          <label className="modal-label">Department *</label>
          <select
            className="modal-input"
            value={form.department_id}
            onChange={set('department_id')}
            required
            disabled={!form.faculty_id}
          >
            <option value="" hidden>
              {form.faculty_id ? 'Select Department' : 'Select a School first'}
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
          <label className="modal-label">Level *</label>
          <select
            className="modal-input"
            value={form.level_id}
            onChange={set('level_id')}
            required
          >
            <option value="">Select Level</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Programme */}
        <div className="form-group col-2">
          <label className="modal-label">Programme</label>
          <select
            className="modal-input"
            value={form.programme_id}
            onChange={set('programme_id')}
          >
            <option value="">Select Programme</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* File upload */}
        <div className="form-group col-1">
          <label className="modal-label">Student File (Excel / CSV) *</label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              border: '2px dashed rgba(0,0,0,0.15)',
              borderRadius: 12,
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.02)',
              transition: 'border-color 0.15s',
            }}
          >
            <FileSpreadsheet
              size={28}
              style={{ color: '#22c55e', flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {fileName ? (
                <strong style={{ color: '#0a1120' }}>{fileName}</strong>
              ) : (
                'Click to browse or drag & drop your file here (.xlsx, .xls, .csv)'
              )}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
          <span className="cp-hint" style={{ marginTop: 4 }}>
            The file should have student data columns matching the system
            template.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}

export default ImportStudents;
