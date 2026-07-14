import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDepartments } from '../../../hooks/useDepartments';
import {
  useCreatePosition,
  useRequirements,
  useSubCadres,
  useUpdatePosition,
} from '../../../hooks/useJobs';
import CustomModal from '../../ui/CustomModal/CustomModal';
import MultiSelectPicker from '../../ui/MultiSelectPicker/MultiSelectPicker';
import Spinner from '../../ui/Spinner/Spinner';

function JobPositionMutate({ data, closeModal }) {
  const isEdit = Boolean(data?._id || data?.id);
  const idToUpdate = data?._id || data?.id;

  const [form, setForm] = useState({
    title: data?.title || '',
    cadre: data?.cadre || '',
    subcadre: data?.subcadre?._id || data?.subcadre?.id || data?.subcadre || '',
    department: data?.department?.name || data?.department || '',
    requirements: Array.isArray(data?.requirements)
      ? data?.requirements.map((r) => String(r?._id || r?.id || r))
      : [],
    requiredYearsExperience: data?.requiredYearsExperience || 0,
  });

  const { mutate: createPosition, isPending: creating } = useCreatePosition();
  const { mutate: updatePosition, isPending: updating } = useUpdatePosition();
  const isPending = creating || updating;

  const { data: reqRes } = useRequirements({ limit: 1000 });
  const requirementsOptions = (reqRes?.data || []).map((r) => ({
    id: r._id || r.id,
    name: r.name,
  }));

  const { data: subCadreRes } = useSubCadres({ limit: 1000 });
  const subCadreOptions = (subCadreRes?.data || []).map((s) => ({
    id: s._id || s.id,
    name: s.name,
  }));

  const { data: deptRes } = useDepartments({ limit: 1000 });
  const departmentOptions = (deptRes?.data || []).map((d) => ({
    id: d.name || d.id,
    name: d.name,
  }));

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      cadre: form.cadre,
      subcadre: form.subcadre,
      requirements: form.requirements,
      requiredYearsExperience: form.requiredYearsExperience,
    };

    if (form.cadre === 'Academic') {
      payload.department = form.department;
    }

    if (isEdit) {
      payload.id = idToUpdate;
      updatePosition(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Job Position updated successfully');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to update Job Position');
        },
      });
    } else {
      createPosition(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Job Position created successfully');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to create Job Position');
        },
      });
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Edit Job Position' : 'Add Job Position'}
      subtitle={
        isEdit ? 'Update position details.' : 'Create a new job position.'
      }
      size="wide"
      placement="center"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="job-position-form"
            className="modal-submit"
            disabled={isPending || !form.title.trim() || !form.cadre}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Position'
            )}
          </button>
        </>
      }
    >
      <form id="job-position-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-12">
          <label className="modal-label">
            Cadre <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            value={form.cadre}
            onChange={set('cadre')}
            required
          >
            <option value="">Select Cadre</option>
            <option value="Academic">Academic</option>
            <option value="Non-Academic">Non-Academic</option>
          </select>
        </div>

        <div className="form-group col-12">
          <label className="modal-label">
            Sub-Cadre <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            value={form.subcadre}
            onChange={set('subcadre')}
            required
          >
            <option value="">Select Sub-Cadre</option>
            {subCadreOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-12">
          <label className="modal-label">
            Position Title <span className="req">*</span>
          </label>
          <input
            type="text"
            className="modal-input"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Lecturer I"
            required
          />
        </div>

        {form.cadre === 'Academic' && (
          <>
            <div className="form-group col-12">
              <label className="modal-label">Department</label>
              <select
                className="modal-input"
                value={form.department}
                onChange={set('department')}
                placeholder="Select Department..."
              >
                <option value="">Select Department</option>
                {departmentOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="form-group col-12">
          <label className="modal-label">Required Years of Experience</label>
          <input
            type="number"
            className="modal-input"
            value={form.requiredYearsExperience}
            onChange={set('requiredYearsExperience')}
            placeholder="e.g. 3"
            min="0"
          />
        </div>
        <div className="form-group col-12">
          <label className="modal-label">Requirements</label>
          <MultiSelectPicker
            options={requirementsOptions}
            value={form.requirements}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, requirements: val }))
            }
            placeholder="Select Requirements..."
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default JobPositionMutate;
