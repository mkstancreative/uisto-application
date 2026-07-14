import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CustomModal from '../../ui/CustomModal/CustomModal';
import { useCreateMetaData } from '../../../hooks/useLibrary';

function ResourseMetaMutate({ closeModal }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const { mutate: upload, isPending } = useCreateMetaData();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => f.name));
  };

  const handleRemove = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0)
      return toast.error('Please select at least one file.');

    const form = new FormData();
    files.forEach((f) => form.append('filenameurls[]', f));

    upload(form, {
      onSuccess: (data) => {
        toast.success(data?.message ?? 'Resource uploaded successfully.');
        closeModal();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message ?? 'Upload failed.'),
    });
  };

  return (
    <CustomModal
      isOpen
      title="Upload Resource Metadata"
      subtitle="Add title, author, ISBN and publication date for E-resources"
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
            form="meta-form"
            disabled={isPending}
          >
            {isPending
              ? 'Saving…'
              : `Save ${files.length} Book${files.length > 1 ? 's' : ''}`}
          </button>
        </>
      }
    >
      <form id="meta-form" onSubmit={handleSubmit}>
        {/* File picker */}
        <div className="modal-field">
          <label className="modal-label">
            Files <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="file"
            className="modal-input"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
          />
          <p className="modal-hint">PDF supported only.</p>
        </div>

        {/* Preview list */}
        {previews.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {previews.map((name, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: 'var(--surface-2, rgba(0,0,0,.04))',
                  border: '1px solid var(--border, rgba(0,0,0,.07))',
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📄 {name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: 14,
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </CustomModal>
  );
}

export default ResourseMetaMutate;
