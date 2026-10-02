import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import {
  CADRES,
  useAllPositions,
  useAllRequirements,
  useAllSubcadres,
  useCreatePosition,
  useUpdatePosition,
} from '../../../hooks/useConfig';
import { errorMessage } from '../../../api/api';
import { departmentsFrom, refId } from '../common/refs';
import CustomModal from '../../ui/CustomModal/CustomModal';
import MultiSelectPicker from '../../ui/MultiSelectPicker/MultiSelectPicker';
import Spinner from '../../ui/Spinner/Spinner';
import '../common/adminCommon.css';

function JobPositionMutate({ data, closeModal }) {
  const id = data?._id || data?.id;
  const isEdit = Boolean(id);

  const [form, setForm] = useState(() => ({
    cadre: data?.cadre || '',
    department: data?.department || '',
    subcadre: refId(data?.subcadre),
    title: data?.title || '',
    requiredYearsExperience: data?.requiredYearsExperience ?? 0,
    requirements: Array.isArray(data?.requirements) ? data.requirements.map(refId).filter(Boolean) : [],
  }));
  const [formError, setFormError] = useState('');

  const { mutate: createPosition, isPending: creating } = useCreatePosition();
  const { mutate: updatePosition, isPending: updating } = useUpdatePosition();
  const isPending = creating || updating;

  const { data: posRes } = useAllPositions();
  const { data: reqRes, isLoading: reqLoading } = useAllRequirements();
  const { data: subRes, isLoading: subLoading } = useAllSubcadres();

  const departments = useMemo(() => departmentsFrom(posRes?.data ?? []), [posRes]);

  const isAcademic = form.cadre === 'Academic';
  const isNonAcademic = form.cadre === 'Non-Academic';

  const subcadreOptions = (subRes?.data ?? []).filter(
    (s) => s.isActive !== false || refId(s) === form.subcadre,
  );

  const selected = new Set(form.requirements.map(String));
  const requirementOptions = (reqRes?.data ?? [])
    .filter(
      (r) =>
        selected.has(refId(r)) || (r.cadre === form.cadre && r.isActive !== false),
    )
    .map((r) => ({
      id: refId(r),
      name: r.isActive === false ? `${r.name} (inactive)` : r.name,
    }));

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onCadreChange = (e) => {
    const cadre = e.target.value;
    // Department/subcadre and requirements are cadre-specific
    setForm((prev) => ({ ...prev, cadre, department: '', subcadre: '', requirements: [] }));
  };

  const canSubmit =
    form.cadre &&
    form.title.trim() &&
    (!isAcademic || form.department.trim()) &&
    (!isNonAcademic || form.subcadre);

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!canSubmit) {
      setFormError(
        isAcademic
          ? 'Title and department are required.'
          : isNonAcademic
            ? 'Title and subcadre are required.'
            : 'Choose a cadre and enter a title.',
      );
      return;
    }

    const years = Number(form.requiredYearsExperience);
    const payload = {
      title: form.title.trim(),
      requirements: form.requirements,
      requiredYearsExperience: Number.isFinite(years) && years > 0 ? years : 0,
      ...(isAcademic ? { department: form.department.trim() } : {}),
      ...(isNonAcademic ? { subcadre: form.subcadre } : {}),
    };

    const handlers = {
      onSuccess: (res) => {
        toast.success(res?.message || (isEdit ? 'Position updated.' : 'Position created.'));
        closeModal();
      },
      onError: (err) => {
        const msg =
          err?.status === 409
            ? `A position called "${payload.title}" already exists ${
                isAcademic ? 'in this department' : 'in this subcadre'
              }.`
            : errorMessage(err, isEdit ? 'Could not update the position.' : 'Could not create the position.');
        setFormError(msg);
        toast.error(msg);
      },
    };

    if (isEdit) updatePosition({ id, ...payload }, handlers);
    else createPosition({ ...payload, cadre: form.cadre }, handlers);
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Edit Position' : 'Add Position'}
      subtitle={
        isEdit
          ? 'Changes apply to future vacancies for this position.'
          : 'Positions are the roles a vacancy can be opened for.'
      }
      size="wide"
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
            disabled={isPending || !canSubmit}
          >
            {isPending ? <Spinner text="Saving" /> : isEdit ? 'Save Changes' : 'Create Position'}
          </button>
        </>
      }
    >
      <form id="job-position-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="pos-cadre">
            Cadre <span className="req">*</span>
          </label>
          {isEdit ? (
            <>
              <div className="form-readonly">{form.cadre || '—'}</div>
              <span className="form-hint">The cadre cannot be changed after creation.</span>
            </>
          ) : (
            <select
              id="pos-cadre"
              className="modal-input"
              value={form.cadre}
              onChange={onCadreChange}
              required
            >
              <option value="">Select cadre</option>
              {CADRES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {isAcademic && (
          <div className="form-group col-2">
            <label className="modal-label" htmlFor="pos-department">
              Department <span className="req">*</span>
            </label>
            <input
              id="pos-department"
              type="text"
              className="modal-input"
              list="pos-department-options"
              value={form.department}
              onChange={set('department')}
              placeholder="e.g. Computer Science"
              required
            />
            <datalist id="pos-department-options">
              {departments.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
            <span className="form-hint">Pick an existing department or type a new one.</span>
          </div>
        )}

        {isNonAcademic && (
          <div className="form-group col-2">
            <label className="modal-label" htmlFor="pos-subcadre">
              Subcadre <span className="req">*</span>
            </label>
            <select
              id="pos-subcadre"
              className="modal-input"
              value={form.subcadre}
              onChange={set('subcadre')}
              disabled={subLoading}
              required
            >
              <option value="">
                {subLoading
                  ? 'Loading subcadres…'
                  : subcadreOptions.length
                    ? 'Select subcadre'
                    : 'No active subcadres — add one first'}
              </option>
              {subcadreOptions.map((s) => (
                <option key={refId(s)} value={refId(s)}>
                  {s.isActive === false ? `${s.name} (inactive)` : s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!form.cadre && <div className="form-group col-2" />}

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="pos-title">
            Position title <span className="req">*</span>
          </label>
          <input
            id="pos-title"
            type="text"
            className="modal-input"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Lecturer I"
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="pos-years">
            Required years of experience
          </label>
          <input
            id="pos-years"
            type="number"
            className="modal-input"
            value={form.requiredYearsExperience}
            onChange={set('requiredYearsExperience')}
            min="0"
            step="1"
            placeholder="0"
          />
        </div>

        <div className="form-group col-12">
          <label className="modal-label">Requirements</label>
          {form.cadre ? (
            <MultiSelectPicker
              options={requirementOptions}
              value={form.requirements}
              onChange={(val) => setForm((prev) => ({ ...prev, requirements: val }))}
              placeholder={
                reqLoading
                  ? 'Loading requirements…'
                  : requirementOptions.length
                    ? 'Select requirements…'
                    : `No active ${form.cadre} requirements yet`
              }
            />
          ) : (
            <div className="form-readonly">
              <span className="form-hint">Choose a cadre first</span>
            </div>
          )}
          <span className="form-hint">
            Active requirements of the {form.cadre || 'chosen'} cadre. Vacancies can add extra ones.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}

export default JobPositionMutate;
