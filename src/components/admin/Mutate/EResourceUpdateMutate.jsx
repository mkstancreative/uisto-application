import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CustomModal from '../../ui/CustomModal/CustomModal';
import { useUpdateEResource } from '../../../hooks/useLibrary';

function EResourceUpdateMutate({ data, closeModal }) {
  const [formData, setFormData] = useState({
    id: data?.id ?? '',
    title: data?.title ?? '',
    author: data?.author ?? '',
    isbn: data?.isbn ?? '',
    pubdate: data?.pubdate ?? '',
    filenameurl: data?.filenameurl ?? '',
  });

  const { mutate: updateResource, isPending } = useUpdateEResource();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');

    updateResource(formData, {
      onSuccess: (res) => {
        toast.success(res?.message ?? 'Resource updated successfully');
        closeModal();
      },
      onError: (err) => {
        toast.error(err?.message ?? 'Failed to update resource');
        closeModal();
      },
    });
  };

  return (
    <CustomModal
      isOpen
      title="Edit Resource"
      subtitle={`Editing ${data?.title || 'resource'}`}
      onClose={closeModal}
      size="medium"
      footer={
        <>
          <button className="modal-cancel" type="button" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="modal-submit"
            type="submit"
            form="edit-resource-form"
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form
        id="edit-resource-form"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div className="modal-field" style={{ margin: 0 }}>
          <label className="modal-label">
            Title <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className="modal-input"
            name="title"
            value={formData.title}
            readOnly
            onChange={handleChange}
            required
          />
        </div>
        <div className="modal-field" style={{ margin: 0 }}>
          <label className="modal-label">Author</label>
          <input
            className="modal-input"
            name="author"
            value={formData.author}
            onChange={handleChange}
          />
        </div>
        <div className="modal-field" style={{ margin: 0 }}>
          <label className="modal-label">ISBN</label>
          <input
            className="modal-input"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
          />
        </div>
        <div className="modal-field" style={{ margin: 0 }}>
          <label className="modal-label">Publication Date</label>
          <input
            className="modal-input"
            type="date"
            name="pubdate"
            value={formData.pubdate}
            onChange={handleChange}
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default EResourceUpdateMutate;
