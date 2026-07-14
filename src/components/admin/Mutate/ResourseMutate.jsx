import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CustomModal from '../../ui/CustomModal/CustomModal';
import {
  useCreateEResource,
  useUpdateEResource,
} from '../../../hooks/useLibrary';
import { useDepartments } from '../../../hooks/useDepartments';

function ResourseMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [departmentId, setDepartmentId] = useState(data?.department_id ?? '');
  const [files, setFiles] = useState([]);
  const [_, setPreviews] = useState([]);

  const { data: deptRes } = useDepartments();
  const departments = deptRes?.data ?? deptRes ?? [];

  const { mutate: upload, isPending: isCreating } = useCreateEResource();
  const { mutate: updateResource, isPending: isUpdating } =
    useUpdateEResource();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    id: data?.id ?? '',
    title: data?.title ?? '',
    author: data?.author ?? '',
    isbn: data?.isbn ?? '',
    pubdate: data?.pubdate ?? '',
    filenameurl: data?.filenameurl ?? '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => f.name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!departmentId) return toast.error('Please select a department.');

    if (isEdit) {
      const payload = {
        id: formData.id,
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        pubdate: formData.pubdate,
        department_id: departmentId,
      };

      if (files.length > 0) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => form.append(k, v));
        files.forEach((f) => form.append('filenameurls[]', f));

        return updateResource(form, {
          onSuccess: (res) => {
            toast.success(res?.message ?? 'Resource updated successfully.');
            closeModal();
          },
          onError: (err) => {
            toast.error(err?.message ?? 'Update failed.');
          },
        });
      }

      return updateResource(payload, {
        onSuccess: (res) => {
          toast.success(res?.message ?? 'Resource updated successfully.');
          closeModal();
        },
        onError: (err) => {
          toast.error(err?.message ?? 'Update failed.');
          closeModal();
        },
      });
    }

    // CREATE — department + files required
    if (files.length === 0)
      return toast.error('Please select at least one file.');

    const form = new FormData();
    form.append('department_id', departmentId);
    files.forEach((f) => form.append('filenameurls[]', f));

    upload(form, {
      onSuccess: (res) => {
        toast.success(res?.message ?? 'Resource uploaded successfully.');
        closeModal();
      },
      onError: (err) => {
        toast.error(err?.message ?? 'Upload failed.');
        closeModal();
      },
    });
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Edit E-Resource' : 'Upload E-Resource'}
      subtitle={
        isEdit
          ? 'Update the resource details below'
          : 'Upload one or more resource files to a department'
      }
      onClose={closeModal}
      size="wide"
      footer={
        <>
          <button className="modal-cancel" type="button" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="modal-submit"
            type="submit"
            form="resource-form"
            disabled={isPending}
          >
            {isPending
              ? isEdit
                ? 'Saving…'
                : 'Uploading…'
              : isEdit
                ? 'Save Changes'
                : 'Upload'}
          </button>
        </>
      }
    >
      <form
        id="resource-form"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Department */}
        <div className="modal-field">
          <label className="modal-label">
            Department <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            className="modal-input"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            <option value="">— Select Department —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        {isEdit && (
          <>
            <div className="modal-field" style={{ margin: 0 }}>
              <label className="modal-label">Title</label>
              <input
                className="modal-input"
                name="title"
                value={formData.title}
                readOnly
                style={{ cursor: 'not-allowed', opacity: 0.6 }}
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
          </>
        )}

        {/* File picker — create only */}
        {!isEdit && (
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
        )}
      </form>
    </CustomModal>
  );
}

export default ResourseMutate;
