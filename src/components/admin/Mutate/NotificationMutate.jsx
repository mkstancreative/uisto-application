import React, { useState } from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import {
  useCreateNotification,
  useUpdateNotification,
} from '../../../hooks/useNotification';
import { toast } from 'react-toastify';

function NotificationMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [form, setForm] = useState({
    title: data?.title ?? '',
    message: data?.message ?? '',
    status: data?.status ?? 'Active',
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const { mutate: create, isPending: creating } = useCreateNotification();
  const { mutate: update, isPending: updating } = useUpdateNotification();
  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = isEdit ? { ...form, id: data.id } : form;
    const mutate = isEdit ? update : create;

    mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? 'Notice updated' : 'Notice created');
        closeModal();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message ?? 'Operation failed'),
    });
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Edit Notice' : 'Add Notice'}
      subtitle="Compose a notice that will be visible to users."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="notice-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Publish Notice'
            )}
          </button>
        </>
      }
    >
      <form id="notice-form" className="form-grid" onSubmit={onSubmit}>
        {/* Title */}
        <div className="form-group col-2">
          <label className="modal-label">
            Title <span className="req">*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. Resumption Notice"
            value={form.title}
            onChange={set('title')}
            required
          />
        </div>

        {/* Status */}
        <div className="form-group col-2">
          <label className="modal-label">
            Status <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            value={form.status}
            onChange={set('status')}
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Message */}
        <div className="form-group col-1">
          <label className="modal-label">
            Message / Body <span className="req">*</span>
          </label>
          <textarea
            className="modal-input"
            rows={5}
            placeholder="Type the body of the notice here..."
            value={form.message}
            onChange={set('message')}
            required
            style={{ minHeight: 130, resize: 'vertical' }}
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default NotificationMutate;
