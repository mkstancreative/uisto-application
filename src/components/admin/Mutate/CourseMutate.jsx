import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLecturers } from '../../../hooks/useAdmin';
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useCourses';
import { useDepartments } from '../../../hooks/useDepartments';
import { useLevels } from '../../../hooks/useLevels';
import { useSemesters } from '../../../hooks/useSemesters';
import CustomModal from '../../ui/CustomModal/CustomModal';
import MultiSelectPicker from '../../ui/MultiSelectPicker/MultiSelectPicker';
import Spinner from '../../ui/Spinner/Spinner';

/* MultiSelectPicker expects { id, name } — these helpers convert to/from that */
const toPicker = (arr = [], labelKey = 'name') =>
  arr.map((item) => ({
    id: String(item.id),
    name: item[labelKey] ?? String(item.id),
  }));

function CourseMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const department_ids = Array.isArray(data.departments)
    ? data.departments.map((d) => String(d.id))
    : (data.departments?._ids?.map(String) ?? []);

  // same for teachers
  const teacher_ids = Array.isArray(data.teachers)
    ? data.teachers.map((t) => String(t.id))
    : (data.teachers?._ids?.map(String) ?? []);

  const [form, setForm] = useState({
    name: data?.name ?? '',
    subjectcode: data?.subjectcode ?? '',
    department_ids,
    level_id: String(data?.level_id ?? ''),
    semester_id: String(data?.semester_id ?? ''),
    creditload: data?.creditload ?? '',
    teacher_ids,
  });

  /* Lookup data */
  const { data: deptRes } = useDepartments({ limit: 1000 });
  const { data: levelRes } = useLevels({ limit: 1000 });
  const { data: semesterRes } = useSemesters({ limit: 1000 });
  const { data: lectRes } = useLecturers({ limit: 1000 });

  const departments = deptRes?.data || [];
  const levels = levelRes?.data || [];
  const semesters = semesterRes?.data || [];
  const lecturers = lectRes?.data || [];

  const { mutate: createCourse, isPending: creating } = useCreateCourse();
  const { mutate: updateCourse, isPending: updating } = useUpdateCourse();
  const isPending = creating || updating;

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      subjectcode: form.subjectcode,
      semester_id: form.semester_id,
      level_id: form.level_id,
      creditload: form.creditload,
      departments: { _ids: form.department_ids },
      teachers: { _ids: form.teacher_ids },
      ...(isEdit ? { id: data.id } : {}),
    };

    if (isEdit) {
      updateCourse(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Course updated successfully');
        },
        onError: (err) =>
          toast.error(err?.message || 'Failed to update course'),
      });
    } else {
      createCourse(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Course created successfully');
        },
        onError: (err) =>
          toast.error(err?.message || 'Failed to create course'),
      });
    }
  };

  const canSubmit =
    form.name.trim() &&
    form.subjectcode.trim() &&
    form.department_ids.length > 0 &&
    form.level_id &&
    form.semester_id &&
    form.teacher_ids.length > 0;

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Course' : 'Create Course'}
      subtitle="Assign departments, level, semester, and lecturers."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="course-form"
            className="modal-submit"
            disabled={isPending || !canSubmit}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Course'
            ) : (
              'Create Course'
            )}
          </button>
        </>
      }
    >
      <form id="course-form" className="form-grid" onSubmit={onSubmit}>
        {/* Course Name */}
        <div className="form-group col-2">
          <label className="modal-label">Course Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Introduction to Computer Science"
            value={form.name}
            onChange={set('name')}
          />
        </div>

        {/* Course Code */}
        <div className="form-group col-2">
          <label className="modal-label">Course Code</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. CSC 101"
            value={form.subjectcode}
            onChange={set('subjectcode')}
          />
        </div>

        {/* Departments — MultiSelectPicker needs { id, name } */}
        <div className="form-group col-2">
          <label className="modal-label">Departments</label>
          <MultiSelectPicker
            placeholder="Select departments..."
            options={toPicker(departments)}
            value={form.department_ids}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, department_ids: val }))
            }
          />
        </div>

        {/* Level */}
        <div className="form-group col-2">
          <label className="modal-label">Level</label>
          <select
            className="modal-input"
            value={form.level_id}
            onChange={set('level_id')}
          >
            <option value="">— Select Level —</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="form-group col-2">
          <label className="modal-label">Semester</label>
          <select
            className="modal-input"
            value={form.semester_id}
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

        {/* Credit Load */}
        <div className="form-group col-2">
          <label className="modal-label">Credit Units</label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 3"
            value={form.creditload}
            onChange={set('creditload')}
            min={1}
            max={6}
          />
        </div>

        {/* Teachers — MultiSelectPicker needs { id, name } */}
        <div className="form-group col-2">
          <label className="modal-label">Teachers</label>
          <MultiSelectPicker
            placeholder="Select lecturers..."
            options={lecturers.map((l) => ({
              id: String(l.id),
              name:
                `${l.firstname ?? ''} ${l.lastname ?? ''}`.trim() ||
                l.name ||
                `Lecturer ${l.id}`,
            }))}
            value={form.teacher_ids}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, teacher_ids: val }))
            }
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default CourseMutate;
