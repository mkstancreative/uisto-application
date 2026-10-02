import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, History, Loader2, Send, UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSubmitApplication } from '../../../hooks/useCareers';
import { errorMessage } from '../../../api/api';
import { titleCaseIfCaps } from '../shared/utils';
import {
  buildPayload,
  clearDraft,
  emptyFiles,
  emptyForm,
  getIn,
  loadDraft,
  newDegree,
  ninToPersonal,
  saveDraft,
  setIn,
  STEP_INDEX,
  STEPS,
  validateStep,
} from './applyForm';
import { Stepper } from './FormBits';
import StepPersonal from './StepPersonal';
import StepQualifications from './StepQualifications';
import StepExperience from './StepExperience';
import StepReferees from './StepReferees';
import StepDocuments from './StepDocuments';
import StepReview from './StepReview';
import ApplySuccess from './ApplySuccess';

const REVIEW = STEP_INDEX.review;
const DOCS = STEP_INDEX.documents;

function ApplyWizard({ jobId, vacancy }) {
  /* Restore an unsent draft once, on mount. Files can't be stored, so a
     draft never resumes past the documents step. */
  const [boot] = useState(() => loadDraft(jobId, vacancy));
  const [form, setForm] = useState(() => boot?.form ?? emptyForm(vacancy));
  const [step, setStep] = useState(() => Math.min(Math.max(boot?.step ?? 0, 0), DOCS));
  const [maxStep, setMaxStep] = useState(() => Math.min(Math.max(boot?.step ?? 0, 0), DOCS));
  const [draftNotice, setDraftNotice] = useState(Boolean(boot));
  const [dirty, setDirty] = useState(false);
  const [files, setFiles] = useState(emptyFiles);
  const [errors, setErrors] = useState({});
  const [declaration, setDeclaration] = useState(false);
  const [fromReview, setFromReview] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const topRef = useRef(null);
  const submit = useSubmitApplication();
  const submitting = submit.isPending;

  /* Persist the draft shortly after each edit */
  useEffect(() => {
    if (!dirty || result) return undefined;
    const t = setTimeout(() => saveDraft(jobId, form, step), 400);
    return () => clearTimeout(t);
  }, [dirty, result, form, step, jobId]);

  /* Warn before leaving mid-upload */
  useEffect(() => {
    if (!submitting) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [submitting]);

  const scrollToTop = () => {
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const focusFirstError = () => {
    requestAnimationFrame(() => {
      const el = topRef.current?.querySelector('[aria-invalid="true"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
    });
  };

  const clearError = (path) =>
    setErrors((e) => {
      if (!(path in e)) return e;
      const next = { ...e };
      delete next[path];
      return next;
    });

  const setField = (path, value) => {
    setForm((f) => setIn(f, path, value));
    setDirty(true);
    clearError(path);
    if (path === 'personal.email') {
      /* referee "same as applicant" errors depend on this */
      setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith('referees.'))));
    }
  };

  const bind = (path) => ({
    path,
    value: getIn(form, path) ?? '',
    error: errors[path],
    onChange: (v) => setField(path, v),
  });

  const goTo = (i) => {
    setStep(i);
    setMaxStep((m) => Math.max(m, i));
    setErrors({});
    setSubmitError(null);
    scrollToTop();
  };

  const validateCurrent = () => {
    const errs = validateStep(STEPS[step].id, form, files, { declaration });
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError();
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateCurrent()) return;
    if (fromReview) {
      setFromReview(false);
      goTo(REVIEW);
    } else {
      goTo(Math.min(step + 1, REVIEW));
    }
  };

  const back = () => {
    setFromReview(false);
    goTo(Math.max(step - 1, 0));
  };

  const selectStep = (i) => {
    if (i > step && !validateCurrent()) return;
    setFromReview(false);
    goTo(i);
  };

  const editFromReview = (i) => {
    setFromReview(true);
    goTo(i);
  };

  const onNinPrefill = (data) => {
    const updates = ninToPersonal(data, titleCaseIfCaps);
    const keys = Object.keys(updates);
    if (!keys.length) return 0;
    setForm((f) => ({ ...f, personal: { ...f.personal, ...updates } }));
    setDirty(true);
    setErrors((e) =>
      Object.fromEntries(
        Object.entries(e).filter(([k]) => !(k.startsWith('personal.') && keys.includes(k.slice(9)))),
      ),
    );
    return keys.length;
  };

  const addDegree = () => {
    setForm((f) => ({ ...f, degrees: [...f.degrees, newDegree()] }));
    setDirty(true);
    clearError('degrees');
  };

  const removeDegree = (index) => {
    setForm((f) => ({ ...f, degrees: f.degrees.filter((_, i) => i !== index) }));
    setDirty(true);
    /* Row indexes shift, so per-row errors no longer line up */
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith('degrees.'))));
  };

  const setFile = (key, file) => {
    setFiles((f) => ({ ...f, [key]: file }));
    clearError(`files.${key}`);
  };

  const setFileError = (key, message) => {
    if (message) setErrors((e) => ({ ...e, [`files.${key}`]: message }));
    else clearError(`files.${key}`);
  };

  const startOver = () => {
    clearDraft(jobId);
    setForm(emptyForm(vacancy));
    setFiles(emptyFiles());
    setStep(0);
    setMaxStep(0);
    setErrors({});
    setDeclaration(false);
    setFromReview(false);
    setDirty(false);
    setDraftNotice(false);
    setSubmitError(null);
    setResetKey((k) => k + 1);
    scrollToTop();
  };

  const handleSubmit = () => {
    if (submitting) return;
    for (let i = 0; i < STEPS.length; i += 1) {
      const errs = validateStep(STEPS[i].id, form, files, { declaration });
      if (Object.keys(errs).length) {
        if (i !== step) {
          setStep(i);
          setFromReview(i !== REVIEW);
          toast.error(`Please complete "${STEPS[i].label}" before submitting.`);
        }
        setErrors(errs);
        focusFirstError();
        return;
      }
    }

    setSubmitError(null);
    setProgress(0);
    submit.mutate(
      {
        payload: buildPayload(jobId, form, files),
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.min(100, Math.round((e.loaded * 100) / e.total)));
        },
      },
      {
        onSuccess: (res) => {
          clearDraft(jobId);
          setResult({
            applicationId: res?.data?.applicationId ?? res?.applicationId ?? '',
            message: res?.message,
            email: form.personal.email.trim(),
          });
          toast.success('Application submitted successfully');
          scrollToTop();
        },
        onError: (err) => {
          setProgress(null);
          const message = errorMessage(err, 'We could not submit your application. Please try again.');
          setSubmitError({ status: err?.status, message });
          toast.error(message);
        },
      },
    );
  };

  if (result) {
    return (
      <div ref={topRef} className="ap-shell ap-shell--done">
        <ApplySuccess {...result} jobTitle={vacancy?.title} />
      </div>
    );
  }

  const stepId = STEPS[step].id;
  const isReview = step === REVIEW;
  const common = { form, bind, setField, errors };

  return (
    <div ref={topRef} className="ap-shell">
      <Stepper steps={STEPS} current={step} maxStep={maxStep} onSelect={selectStep} />

      {draftNotice && (
        <div className="lp-form-alert info ap-draft" role="status">
          <History size={16} />
          <span>
            Draft restored — we kept what you entered last time on this device (attachments need to be
            added again).
          </span>
          <span className="ap-draft-actions">
            <button type="button" className="lp-link-btn" onClick={startOver}>
              Start over
            </button>
            <button type="button" className="lp-link-btn" onClick={() => setDraftNotice(false)}>
              Dismiss
            </button>
          </span>
        </div>
      )}

      <form
        key={resetKey}
        className="ap-form pub-panel"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isReview) handleSubmit();
          else next();
        }}
      >
        {stepId === 'personal' && <StepPersonal {...common} onNinPrefill={onNinPrefill} />}
        {stepId === 'qualifications' && (
          <StepQualifications {...common} onAddDegree={addDegree} onRemoveDegree={removeDegree} />
        )}
        {stepId === 'experience' && <StepExperience {...common} />}
        {stepId === 'referees' && <StepReferees {...common} />}
        {stepId === 'documents' && (
          <StepDocuments
            files={files}
            errors={errors}
            onFile={setFile}
            onFileError={setFileError}
            disabled={submitting}
          />
        )}
        {isReview && (
          <StepReview
            form={form}
            files={files}
            onEdit={editFromReview}
            declaration={declaration}
            onDeclaration={(v) => {
              setDeclaration(v);
              clearError('declaration');
            }}
            error={errors.declaration}
            disabled={submitting}
          />
        )}

        {isReview && submitError && (
          <div className="lp-form-alert ap-submit-error" role="alert">
            <AlertCircle size={16} />
            <span>
              {submitError.status === 409 ? (
                <>
                  <strong>You have already applied in this recruitment cycle.</strong>{' '}
                  {submitError.message.replace(/\.$/, '')}.{' '}
                  <Link to="/track">Track your existing application</Link>.
                </>
              ) : submitError.status === 404 ? (
                <>
                  {submitError.message.replace(/\.$/, '')}. This vacancy may have been closed —{' '}
                  <Link to="/careers">see open vacancies</Link>.
                </>
              ) : (
                submitError.message
              )}
            </span>
          </div>
        )}

        {submitting && (
          <div className="ap-progress" role="status" aria-live="polite">
            <div className="ap-progress-head">
              <UploadCloud size={16} />
              <span>
                {progress === null || progress < 100
                  ? `Uploading your application… ${progress ?? 0}%`
                  : 'Upload complete — finalising your application…'}
              </span>
            </div>
            <div
              className="ap-progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress ?? 0}
            >
              <span style={{ width: `${progress ?? 0}%` }} />
            </div>
          </div>
        )}

        <div className="ap-nav">
          {step > 0 ? (
            <button type="button" className="pub-btn-ghost" onClick={back} disabled={submitting}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <Link to={`/careers/${jobId}`} className="pub-btn-ghost">
              <ArrowLeft size={16} /> Vacancy details
            </Link>
          )}

          {isReview ? (
            <button type="submit" className="lp-btn lp-btn-lime lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="lp-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send size={16} /> Submit application
                </>
              )}
            </button>
          ) : (
            <button type="submit" className="lp-btn lp-btn-teal lg">
              {fromReview ? 'Back to review' : `Next: ${STEPS[step + 1].short}`} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ApplyWizard;
