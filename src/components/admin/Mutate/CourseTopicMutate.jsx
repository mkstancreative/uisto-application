import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateCourseTopic,
  useUpdateCourseTopic,
} from '../../../hooks/useCourses';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function CourseTopicMutate({ data, courseId, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [form, setForm] = useState({
    title: data?.title ?? '',
    contents: data?.contents ?? '',
    files: data?.files ?? '',
  });

  const { mutate: createTopic, isPending: creating } = useCreateCourseTopic();
  const { mutate: updateTopic, isPending: updating } = useUpdateCourseTopic();
  const isPending = creating || updating;

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();

    const subjectId = courseId ?? data?.subject_id;

    const payload = {
      subject_id: subjectId,
      title: form.title,
      contents: form.contents,
      files: form.files,
      ...(isEdit && { id: data.id }),
    };

    if (isEdit) {
      updateTopic(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Topic updated successfully');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to update topic');
        },
      });
    } else {
      createTopic(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Topic created successfully');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to create topic');
        },
      });
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Edit Topic' : 'Add Topic'}
      subtitle="Create or update a topic for this course."
      icon={<BookOpen size={16} />}
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="topic-form"
            className="modal-submit"
            disabled={isPending || !form.title.trim()}
          >
            {isPending ? <Spinner /> : isEdit ? 'Update Topic' : 'Add Topic'}
          </button>
        </>
      }
    >
      <form id="topic-form" className="form-grid" onSubmit={onSubmit}>
        {/* Title */}
        <div className="form-group col-1">
          <label className="modal-label">
            Topic Title <span className="req">*</span>
          </label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Introduction to Variables"
            value={form.title}
            onChange={set('title')}
            required
            autoFocus
          />
        </div>

        {/* Content */}
        <div className="form-group col-1">
          <label className="modal-label">Content</label>
          <textarea
            className="modal-input topic-textarea"
            placeholder="Enter the topic content, notes, or embed links here…"
            value={form.contents}
            onChange={set('contents')}
            rows={8}
          />
          <span className="modal-hint">
            You can paste HTML content including embedded YouTube videos here.
          </span>
        </div>

        {/* Files / Link */}
        <div className="form-group col-1">
          <label className="modal-label">File URL or Attachment Link</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. https://example.com/file.pdf"
            value={form.files}
            onChange={set('files')}
          />
          <span className="modal-hint">
            Optional — paste a URL to a file or resource.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}

export default CourseTopicMutate;
