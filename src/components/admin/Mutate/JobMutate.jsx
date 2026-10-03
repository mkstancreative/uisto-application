import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AlertCircle, Info } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import MultiSelectPicker from "../../ui/MultiSelectPicker/MultiSelectPicker";
import { useCreateJob, useJob, useUpdateJob } from "../../../hooks/useJobs";
import {
  CADRES,
  useAllPositions,
  useAllRequirements,
  useAllSubcadres,
} from "../../../hooks/useConfig";
import { errorMessage } from "../../../api/api";
import { deadlineToInput, endOfDayIso, toDateInput } from "../common/dates";
import { makeSubcadreName, refId } from "../common/refs";
import "../common/adminCommon.css";

const normalise = (s) => String(s ?? "").trim().toLowerCase();

/** Today's date as the earliest pickable deadline. */
const todayInput = () => toDateInput(new Date());

const deadlineInPast = (dateInput) => {
  const iso = endOfDayIso(dateInput);
  return iso ? new Date(iso).getTime() <= Date.now() : false;
};

/* Create: pick a position. Edit: description, deadline and extra requirements only. */
function JobMutate({ data, closeModal }) {
  const id = data?._id || data?.id;
  if (id) return <JobEdit id={id} closeModal={closeModal} />;
  return <JobCreate closeModal={closeModal} />;
}

/* ════════════════════════ CREATE ════════════════════════ */
function JobCreate({ closeModal }) {
  const { data: posRes, isLoading: posLoading, isError: posError } = useAllPositions();
  const { data: reqRes, isLoading: reqLoading } = useAllRequirements();
  const { data: subRes } = useAllSubcadres();
  const { mutate: create, isPending } = useCreateJob();

  const [form, setForm] = useState({
    position: "",
    description: "",
    deadline: "",
    extraRequirements: [],
  });
  const [formError, setFormError] = useState("");

  const positions = useMemo(
    () => (posRes?.data ?? []).filter((p) => p.isActive !== false),
    [posRes],
  );
  const requirements = useMemo(() => reqRes?.data ?? [], [reqRes]);
  const subcadreName = useMemo(() => makeSubcadreName(subRes?.data ?? []), [subRes]);
  const reqById = useMemo(
    () => new Map(requirements.map((r) => [refId(r), r])),
    [requirements],
  );

  const position = positions.find((p) => refId(p) === form.position);
  const ownIds = new Set((position?.requirements ?? []).map(refId));
  const ownNames = (position?.requirements ?? []).map(
    (r) =>
      (typeof r === "object" && r?.name) ||
      reqById.get(refId(r))?.name ||
      "Unknown requirement",
  );

  const extraOptions = position
    ? requirements
        .filter(
          (r) =>
            r.cadre === position.cadre &&
            r.isActive !== false &&
            !ownIds.has(refId(r)),
        )
        .map((r) => ({ id: refId(r), name: r.name }))
    : [];

  const groups = CADRES.map((cadre) => ({
    cadre,
    items: positions.filter((p) => p.cadre === cadre),
  })).filter((g) => g.items.length);

  const positionLabel = (p) => {
    const where = p.department || subcadreName(p.subcadre);
    return where ? `${p.title} — ${where}` : p.title;
  };

  const onPositionChange = (e) => {
    setFormError("");
    // Extra requirements are cadre-specific, so start over for a new position
    setForm((f) => ({ ...f, position: e.target.value, extraRequirements: [] }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.position || !form.description.trim()) {
      setFormError("Choose a position and write a description.");
      return;
    }
    if (form.deadline && deadlineInPast(form.deadline)) {
      setFormError("The application deadline must be in the future.");
      return;
    }

    create(
      {
        position: form.position,
        description: form.description.trim(),
        extraRequirements: form.extraRequirements,
        applicationDeadline: endOfDayIso(form.deadline),
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Vacancy published.");
          closeModal();
        },
        onError: (err) => {
          let msg = errorMessage(err, "Could not create the vacancy.");
          if (err?.status === 409) {
            msg = `${msg.replace(/\.$/, "")}. Close or edit the existing vacancy for this position instead.`;
          }
          setFormError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen
      title="Open a Vacancy"
      subtitle="Publish an existing position on the careers site."
      size="medium"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="job-form"
            className="modal-submit"
            disabled={isPending || !form.position || !form.description.trim()}
          >
            {isPending ? <Spinner text="Publishing" /> : "Publish Vacancy"}
          </button>
        </>
      }
    >
      <form id="job-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="job-position">
            Position <span className="req">*</span>
          </label>
          <select
            id="job-position"
            className="modal-input"
            value={form.position}
            onChange={onPositionChange}
            disabled={posLoading}
            required
          >
            <option value="">
              {posLoading
                ? "Loading positions…"
                : posError
                  ? "Could not load positions"
                  : positions.length
                    ? "— Select a position —"
                    : "No active positions — create one first"}
            </option>
            {groups.map((g) => (
              <optgroup key={g.cadre} label={g.cadre}>
                {g.items.map((p) => (
                  <option key={refId(p)} value={refId(p)}>
                    {positionLabel(p)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="form-hint">
            Only one active vacancy is allowed per position.
          </span>
        </div>

        {position && (
          <div className="form-group col-12">
            <span className="modal-label">Position requirements</span>
            <div className="form-chip-box">
              {reqLoading ? (
                <span className="form-hint">Loading…</span>
              ) : ownNames.length ? (
                ownNames.map((n, i) => (
                  <span key={`${n}-${i}`} className="form-chip">
                    {n}
                  </span>
                ))
              ) : (
                <span className="form-hint">This position has no requirements of its own.</span>
              )}
            </div>
            <span className="form-hint">
              Set on the position ({position.cadre}
              {position.requiredYearsExperience
                ? `, ${position.requiredYearsExperience}+ years' experience`
                : ""}
              ). Edit the position to change them.
            </span>
          </div>
        )}

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="job-description">
            Description <span className="req">*</span>
          </label>
          <textarea
            id="job-description"
            className="modal-input"
            rows={5}
            placeholder="Describe the role and responsibilities…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            style={{ resize: "vertical", minHeight: 110, padding: "10px 14px", height: "auto" }}
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="job-deadline">
            Application deadline
          </label>
          <input
            id="job-deadline"
            type="date"
            className="modal-input"
            min={todayInput()}
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          />
          <span className="form-hint">
            Applications close at the end of this day. Leave empty to close 14 days from today.
          </span>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Extra requirements</label>
          {position ? (
            <MultiSelectPicker
              options={extraOptions}
              value={form.extraRequirements}
              onChange={(val) => setForm((f) => ({ ...f, extraRequirements: val }))}
              placeholder={
                extraOptions.length
                  ? "Add requirements for this vacancy only…"
                  : `No other active ${position.cadre} requirements`
              }
            />
          ) : (
            <div className="form-readonly">
              <span className="form-hint">Choose a position first</span>
            </div>
          )}
          <span className="form-hint">
            Active {position?.cadre ?? ""} requirements not already on the position.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}

/* ════════════════════════ EDIT ════════════════════════ */
function JobEdit({ id, closeModal }) {
  const { data: jobRes, isLoading, isError, error, refetch } = useJob(id);
  const { data: reqRes, isLoading: reqLoading } = useAllRequirements();
  const job = jobRes?.data;

  if (isLoading || reqLoading || isError || !job) {
    return (
      <CustomModal
        isOpen
        title="Edit Vacancy"
        size="medium"
        onClose={closeModal}
        footer={
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Close
          </button>
        }
      >
        <div className="lv-loader" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
          {isError ? (
            <>
              <AlertCircle size={26} color="#ef4444" />
              <p>{errorMessage(error, "Could not load this vacancy.")}</p>
              <button type="button" className="modal-cancel" onClick={() => refetch()}>
                Try again
              </button>
            </>
          ) : isLoading || reqLoading ? (
            <Spinner color="currentColor" text="Loading vacancy" />
          ) : (
            <p>Vacancy not found.</p>
          )}
        </div>
      </CustomModal>
    );
  }

  return (
    <JobEditForm
      key={job._id}
      job={job}
      requirements={reqRes?.data ?? []}
      closeModal={closeModal}
    />
  );
}

/** GET /jobs/:id returns extra requirements as names — map them back to ids. */
const matchRequirementIds = (entries = [], requirements = [], cadre) => {
  const ids = [];
  const unmatched = [];
  entries.forEach((entry) => {
    if (entry && typeof entry === "object") {
      const rid = refId(entry);
      if (rid) {
        ids.push(rid);
        return;
      }
    }
    const asString = String(entry ?? "");
    const byId = requirements.find((r) => refId(r) === asString);
    if (byId) {
      ids.push(refId(byId));
      return;
    }
    const name = normalise(typeof entry === "object" ? entry?.name : entry);
    const sameName = requirements.filter((r) => normalise(r.name) === name);
    const match = sameName.find((r) => r.cadre === cadre) ?? sameName[0];
    if (match) ids.push(refId(match));
    else unmatched.push(typeof entry === "object" ? entry?.name : asString);
  });
  return { ids: [...new Set(ids)], unmatched: unmatched.filter(Boolean) };
};

function JobEditForm({ job, requirements, closeModal }) {
  const { mutate: update, isPending } = useUpdateJob();
  const { data: subRes } = useAllSubcadres();
  const subcadreName = useMemo(() => makeSubcadreName(subRes?.data ?? []), [subRes]);

  const cadre = job.position?.cadre;
  const initialDeadline = job.applicationDeadline ? deadlineToInput(job.applicationDeadline) : "";
  const matched = useMemo(
    () => matchRequirementIds(job.extraRequirements ?? [], requirements, cadre),
    [job.extraRequirements, requirements, cadre],
  );

  const [form, setForm] = useState(() => ({
    description: job.description ?? "",
    deadline: initialDeadline,
    extraRequirements: matched.ids,
  }));
  const [formError, setFormError] = useState("");

  const ownNames = (job.position?.requirements ?? []).map((r) =>
    typeof r === "object" ? r?.name : r,
  );
  const ownNameSet = new Set(ownNames.map(normalise));
  const selected = new Set(form.extraRequirements.map(String));

  const extraOptions = requirements
    .filter(
      (r) =>
        selected.has(refId(r)) ||
        ((!cadre || r.cadre === cadre) &&
          r.isActive !== false &&
          !ownNameSet.has(normalise(r.name))),
    )
    .map((r) => ({
      id: refId(r),
      name: r.isActive === false ? `${r.name} (inactive)` : r.name,
    }));

  const where = job.position?.department || subcadreName(job.position?.subcadre);

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.description.trim()) {
      setFormError("The description cannot be empty.");
      return;
    }
    const deadlineChanged = form.deadline && form.deadline !== initialDeadline;
    if (deadlineChanged && deadlineInPast(form.deadline)) {
      setFormError("The application deadline must be in the future.");
      return;
    }

    update(
      {
        id: job._id,
        description: form.description.trim(),
        extraRequirements: form.extraRequirements,
        // Only send the deadline when it changed, so an expired vacancy can still be edited
        applicationDeadline: deadlineChanged ? endOfDayIso(form.deadline) : undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Vacancy updated.");
          closeModal();
        },
        onError: (err) => {
          const msg = errorMessage(err, "Could not update the vacancy.");
          setFormError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen
      title="Edit Vacancy"
      subtitle="The position cannot be changed — close this vacancy and open a new one instead."
      size="medium"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="job-edit-form"
            className="modal-submit"
            disabled={isPending || !form.description.trim()}
          >
            {isPending ? <Spinner text="Saving" /> : "Save Changes"}
          </button>
        </>
      }
    >
      <form id="job-edit-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-12">
          <span className="modal-label">Position</span>
          <div className="form-readonly">
            {job.position?.title ?? "Untitled position"}
            <span className="cell-sub">
              {[cadre, where].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <div className="form-group col-12">
          <span className="modal-label">Position requirements</span>
          <div className="form-chip-box">
            {ownNames.length ? (
              ownNames.map((n, i) => (
                <span key={`${n}-${i}`} className="form-chip">
                  {n}
                </span>
              ))
            ) : (
              <span className="form-hint">This position has no requirements of its own.</span>
            )}
          </div>
        </div>

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="job-edit-description">
            Description <span className="req">*</span>
          </label>
          <textarea
            id="job-edit-description"
            className="modal-input"
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            style={{ resize: "vertical", minHeight: 110, padding: "10px 14px", height: "auto" }}
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="job-edit-deadline">
            Application deadline
          </label>
          <input
            id="job-edit-deadline"
            type="date"
            className="modal-input"
            min={todayInput()}
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          />
          <span className="form-hint">
            Applications close at the end of this day. A new deadline must be in the future.
          </span>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Extra requirements</label>
          <MultiSelectPicker
            options={extraOptions}
            value={form.extraRequirements}
            onChange={(val) => setForm((f) => ({ ...f, extraRequirements: val }))}
            placeholder="Add requirements for this vacancy only…"
          />
          <span className="form-hint">
            Active {cadre ?? ""} requirements not already on the position.
          </span>
        </div>

        {matched.unmatched.length > 0 && (
          <div className="form-alert warn">
            <Info size={15} />
            <span>
              Could not match {matched.unmatched.length === 1 ? "this extra requirement" : "these extra requirements"} to a
              current requirement: <strong>{matched.unmatched.join(", ")}</strong>. It will be dropped if you save.
            </span>
          </div>
        )}
      </form>
    </CustomModal>
  );
}

export default JobMutate;
