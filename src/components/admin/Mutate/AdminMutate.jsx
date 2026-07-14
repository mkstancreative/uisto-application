import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../api/api';
import { useCreateAdmin, useUpdateAdmin } from '../../../hooks/useAdmin';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

const MAIN_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function AdminMutate({ data = {}, closeModal }) {
  const isEdit = Boolean(data?.id);

  /* ── Form state ────────────────────────────────────── */
  const [form, setForm] = useState({
    username: data.user?.username,
    surname: data.surname ?? data.fname,
    lastname: data.lastname ?? data.lname ?? '',
    gender: data.gender ?? '',
    address: data.address || '',
    phone: data.phone ?? '',
    profile: data.profile ?? '',
    department_id: String(data.department_id ?? ''),
  });

  /* ── File state ────────────────────────────────────── */
  const [files, setFiles] = useState({
    passporturl: null, // File object or null
  });

  /* ── Passport / Camera ─────────────────────────────── */
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  // Resolve whichever key the API returns the passport filename under
  const resolvePassportUrl = (d) => {
    const filename =
      d?.passporturl ??
      d?.passport_url ??
      d?.passport ??
      d?.photo ??
      d?.image ??
      null;
    return filename ? `${BASE_URL}/img/${filename}` : null;
  };

  const [passportPreview, setPassportPreview] = useState(() =>
    resolvePassportUrl(data),
  );

  const startCamera = async () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCapturing(true);
      setTimeout(() => {
        videoRef.current
          ?.play()
          .catch((err) => console.error('play() failed:', err));
      }, 60);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera. Check browser permissions.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/png');

    // Stop the camera stream
    video.srcObject?.getTracks().forEach((t) => t.stop());
    video.srcObject = null;

    // Convert data URL → File so it can be sent as multipart
    canvas.toBlob((blob) => {
      const file = new File([blob], 'passport.png', { type: 'image/png' });
      setFiles((prev) => ({ ...prev, passporturl: file }));
    }, 'image/png');

    setPassportPreview(dataUrl);
    setCapturing(false);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCapturing(false);
  };

  /* ── Mutations ─────────────────────────────────────── */
  const { mutate: createAdmin, isPending: creating } = useCreateAdmin();
  const { mutate: updateAdmin, isPending: updating } = useUpdateAdmin();
  const isPending = creating || updating;

  /* ── Helpers ───────────────────────────────────────── */
  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Submit ────────────────────────────────────────── */
  const onSubmit = (e) => {
    e.preventDefault();

    // Build multipart FormData so the passport image is uploaded properly
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        formData.append(k, v);
      }
    });
    if (files.passporturl) {
      formData.append('passporturl', files.passporturl);
    }
    if (isEdit) {
      formData.append('id', data.id);
    }

    const fn = isEdit ? updateAdmin : createAdmin;
    fn(formData, {
      onSuccess: () => {
        toast.success(isEdit ? 'Admin updated!' : 'Admin created!');
        closeModal?.();
      },
      onError: (err) => {
        const msg = err?.message ?? 'Something went wrong.';
        toast.error(msg);
        closeModal?.();
      },
    });
  };

  /* ── Render ────────────────────────────────────────── */
  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Update Admin' : 'Add New Admin'}
      subtitle="Manage admin account details."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={closeModal}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="admin-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : isEdit ? 'Update Admin' : 'Create Admin'}
          </button>
        </>
      }
    >
      <form id="admin-form" className="form-grid" onSubmit={onSubmit}>
        {/* ── Passport Photo ──────────────────────────── */}
        {!isEdit && (
          <div className="form-group col-1" style={{ alignItems: 'center' }}>
            <label className="modal-label">Passport Photo</label>
            <div className="passport-capture-box">
              {/* Live camera feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  display: capturing ? 'block' : 'none',
                  width: 200,
                  borderRadius: 8,
                  border: '2px solid var(--border)',
                  background: '#000',
                }}
              />

              {capturing && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    className="modal-submit"
                    onClick={capturePhoto}
                  >
                    📸 Capture Photo
                  </button>
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={stopCamera}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}

              {/* Empty state – no preview, camera not open */}
              {!capturing && !passportPreview && (
                <div className="passport-placeholder">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={startCamera}
                  >
                    📷 Open Camera
                  </button>
                  <span
                    style={{
                      margin: '0 8px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    or
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) {
                        setFiles((prev) => ({
                          ...prev,
                          passporturl: f,
                        }));
                        setPassportPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </div>
              )}

              {/* Preview – photo captured or uploaded */}
              {passportPreview && !capturing && (
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                  }}
                >
                  <img
                    src={passportPreview}
                    alt="Passport"
                    style={{
                      width: 130,
                      height: 130,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid var(--accent-gold, #f59e0b)',
                    }}
                  />
                  <button
                    type="button"
                    title="Remove photo"
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'var(--danger, #e74c3c)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      cursor: 'pointer',
                      fontSize: 13,
                      lineHeight: '22px',
                      textAlign: 'center',
                    }}
                    onClick={() => {
                      setPassportPreview(null);
                      setFiles((prev) => ({
                        ...prev,
                        passporturl: null,
                      }));
                    }}
                  >
                    ✕
                  </button>

                  {/* Re-take / replace buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginTop: 6,
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className="modal-cancel"
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      onClick={startCamera}
                    >
                      📷 Retake
                    </button>
                    <label
                      className="modal-cancel"
                      style={{
                        fontSize: 12,
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      🖼 Replace
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f) {
                            setFiles((prev) => ({
                              ...prev,
                              passporturl: f,
                            }));
                            setPassportPreview(URL.createObjectURL(f));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Hidden canvas used for snapshot */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {/* ── Email / Username ─────────────────────────── */}
        <div className="form-group col-2">
          <label className="modal-label">Email *</label>
          <input
            type="email"
            className="modal-input"
            placeholder="e.g. john@school.edu"
            value={form.username}
            onChange={set('username')}
            required
          />
        </div>

        {/* ── Surname ──────────────────────────────────── */}
        <div className="form-group col-2">
          <label className="modal-label">Surname *</label>
          <input
            type="text"
            className="modal-input"
            placeholder="Surname"
            value={form.surname}
            onChange={set('surname')}
            required
          />
        </div>

        {/* ── Last name ────────────────────────────────── */}
        <div className="form-group col-2">
          <label className="modal-label">Last Name *</label>
          <input
            type="text"
            className="modal-input"
            placeholder="Last name"
            value={form.lastname}
            onChange={set('lastname')}
            required
          />
        </div>

        {/* ── Gender ───────────────────────────────────── */}
        <div className="form-group col-2">
          <label className="modal-label">Gender *</label>
          <select
            className="modal-input"
            value={form.gender}
            onChange={set('gender')}
            required
          >
            <option value="">— Select Gender —</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* ── Phone ────────────────────────────────────── */}
        <div className="form-group col-2">
          <label className="modal-label">Phone *</label>
          <input
            type="tel"
            className="modal-input"
            placeholder="e.g. 09035323903"
            value={form.phone}
            onChange={set('phone')}
            required
          />
        </div>

        {/* ── Address ──────────────────────────────────── */}
        <div className="form-group col-2">
          <label className="modal-label">Address</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. 10 Wilfred Okereke street…"
            value={form.address}
            onChange={set('address')}
          />
        </div>

        {/* ── Profile / Role ───────────────────────────── */}
        <div className="form-group col-1">
          <label className="modal-label">Role / Profile</label>
          <input
            type="text"
            className="modal-input"
            readOnly
            placeholder="e.g. admin, registrar…"
            value={form.profile}
            onChange={set('profile')}
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default AdminMutate;
