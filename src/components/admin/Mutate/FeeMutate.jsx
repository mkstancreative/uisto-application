import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDepartments } from '../../../hooks/useDepartments';
import { useAddFee, useEditFee } from '../../../hooks/useFees';
import { useLevels } from '../../../hooks/useLevels';
import CustomModal from '../../ui/CustomModal/CustomModal';
import MultiSelectPicker from '../../ui/MultiSelectPicker/MultiSelectPicker';
import Spinner from '../../ui/Spinner/Spinner';

function FeeMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [form, setForm] = useState({
    name: data.name ?? '',
    amount: data.amount ?? '',
    itemcode: data.itemcode ?? '',
    feetype: data.feetype ?? 'enrolled',
    department_ids: data.departments?.map((d) => d.id) ?? [],
    level_ids: data.levels?.map((l) => l.id) ?? [],
  });

  /* Lookup data */
  const { data: levelRes } = useLevels();
  const { data: deptRes } = useDepartments();

  const levels = levelRes?.data || [];
  const departments = deptRes?.data || [];

  const { mutate: addFee, isPending: adding } = useAddFee();
  const { mutate: editFee, isPending: editing } = useEditFee();

  const isPending = adding || editing;

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setIds = (key) => (ids) => setForm((prev) => ({ ...prev, [key]: ids }));

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      amount: form.amount,
      itemcode: form.itemcode,
      feetype: form.feetype,
      departments: { _ids: form.department_ids },
      levels: { _ids: form.level_ids },
    };

    const options = {
      onSuccess: (data) => {
        toast.success(data?.message || 'Fee saved successfully');
        closeModal();
      },
      onError: (error) => {
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Something went wrong';

        toast.error(msg);
      },
    };

    if (isEdit) {
      editFee({ ...payload, id: data.id }, options);
    } else {
      addFee(payload, options);
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Edit Fee' : 'Add Fee'}
      subtitle="Configure school fee structure"
      onClose={closeModal}
      size="wide"
      footer={
        <>
          <button className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="modal-submit"
            onClick={onSubmit}
            disabled={isPending || !form.name.trim() || !form.amount}
          >
            {isPending ? <Spinner /> : isEdit ? 'Update Fee' : 'Add Fee'}
          </button>
        </>
      }
    >
      <form id="fee-form" className="form-grid" onSubmit={onSubmit}>
        {/* Fee Name */}
        <div className="form-group col-2">
          <label className="modal-label">Fee Name</label>
          <input
            className="modal-input"
            placeholder="e.g. Tuition Fee, Acceptance Fee"
            value={form.name}
            onChange={set('name')}
            required
            autoFocus
          />
        </div>

        {/* Amount */}
        <div className="form-group col-2">
          <label className="modal-label">Amount (₦)</label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 150000"
            value={form.amount}
            onChange={set('amount')}
            min={0}
            required
          />
        </div>

        {/* Item Code */}
        <div className="form-group col-2">
          <label className="modal-label">Item Code</label>
          <input
            className="modal-input"
            placeholder="e.g. 10001001"
            value={form.itemcode}
            onChange={set('itemcode')}
          />
        </div>

        {/* Fee Type */}
        <div className="form-group col-2">
          <label className="modal-label">Fee Type</label>
          <select
            className="modal-input"
            value={form.feetype}
            onChange={set('feetype')}
          >
            <option value="enrolled">Enrolled</option>
          </select>
        </div>

        {/* Departments — tag picker */}
        <div className="form-group col-6">
          <label className="modal-label">Departments</label>
          <MultiSelectPicker
            options={departments}
            value={form.department_ids}
            onChange={setIds('department_ids')}
            placeholder="Select departments..."
          />
        </div>

        {/* Levels — tag picker */}
        <div className="form-group col-6">
          <label className="modal-label">Levels</label>
          <MultiSelectPicker
            options={levels}
            value={form.level_ids}
            onChange={setIds('level_ids')}
            placeholder="Select levels..."
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default FeeMutate;
