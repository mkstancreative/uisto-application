import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCreateLecturer, useUpdateLecturer } from "../../../hooks/useAdmin";
import { useDepartments } from "../../../hooks/useDepartments";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";

import { useCourses } from "../../../hooks/useCourses";
import { useCountries, useStates } from "../../../hooks/useSettings";
import MultiSelectPicker from "../../ui/MultiSelectPicker/MultiSelectPicker";
import { useLevels } from "@/hooks/useLevels";

function LecturerMutate({ data = {}, closeModal }) {
  const isEdit = Boolean(data?.id);
  let subjectIds = Array.isArray(data?.subjects)
    ? data.subjects.map((s) => String(s?.id ?? s))
    : [];

  const deptId = String(
    data?.department?._id ||
      data?.department?.id ||
      data?.department_id ||
      data?.department ||
      "",
  );
  const [form, setForm] = useState({
    firstname: data?.firstname ?? "",
    lastname: data?.lastname ?? "",
    middlename: data?.middlename ?? "",
    username: data?.user?.username ?? "",
    gender: data?.gender ?? "",
    phone: data?.phone ?? "",
    department_id: deptId,
    qualification: data?.qualification ?? "",
    country_id: String(data?.country?.id || data?.country_id || ""),
    state_id: String(data?.state?.id || data?.state_id || ""),
    address: data?.address ?? "",
    profile: data?.profile ?? "Lecturer",
    subjects: subjectIds,
    level_id: String(data?.level?.id || data?.level_id || ""),
    isadviser: data?.isadviser ?? "",
  });

  const { data: countriesRes } = useCountries();
  const { data: statesRes } = useStates();

  const countriesList = countriesRes?.data ?? [];
  const allStates = statesRes?.data ?? [];

  // Resolve the selected country's name so we can filter states client-side
  const selectedCountryName = countriesList.find(
    (c) => String(c.id) === String(form.country_id),
  )?.name;

  // Filter states to only those belonging to the selected country
  const statesList = selectedCountryName
    ? allStates.filter((s) => s.country === selectedCountryName)
    : allStates;

  const isLoadingCountries = !countriesRes;
  const isLoadingStates = form.country_id && !statesRes;

  const { data: deptRes } = useDepartments({limit: 1000});
  const departments = deptRes?.data ?? [];

  const { data: levelRes } = useLevels();
  const levels = useMemo(() => levelRes?.data ?? [], [levelRes]);

  const { data: courseRes } = useCourses();
  const courses = useMemo(() => courseRes?.data ?? [], [courseRes]);

  const { mutate: createLecturer, isPending: creating } = useCreateLecturer();
  const { mutate: updateLecturer, isPending: updating } = useUpdateLecturer();
  const isPending = creating || updating;

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      if (k !== "subjects" && v !== null && v !== undefined && v !== "") {
        fd.append(k, v);
      }
    });

    if (form.subjects?.length) {
      form.subjects.forEach((id) => {
        fd.append("subjects[_ids][]", String(id));
      });
    }

    const fn = isEdit ? updateLecturer : createLecturer;
    if (isEdit) fd.append("id", data.id);

    fn(fd, {
      onSuccess: () => {
        toast.success(
          isEdit ? "Lecturer updated!" : "Lecturer created successfully!",
        );
        closeModal?.();
      },
      onError: (err) => {
        toast.error(err?.message ?? "Something went wrong.");
        closeModal?.();
      },
    });
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? "Update Lecturer" : "Add New Lecturer"}
      subtitle="Provide the lecturer's details to create their account."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="lecturer-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              "Update Lecturer"
            ) : (
              "Create Lecturer"
            )}
          </button>
        </>
      }
    >
      <form id="lecturer-form" className="form-grid" onSubmit={onSubmit}>
        {/* ── Personal ───────────── */}
        <div className="section-title-divider col-1">Personal Information</div>

        <div className="form-group col-2">
          <label className="modal-label">First Name *</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Aniegboka"
            value={form.firstname}
            onChange={set("firstname")}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Last Name *</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Chukwudi"
            value={form.lastname}
            onChange={set("lastname")}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Middle Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Odogwu"
            value={form.middlename}
            onChange={set("middlename")}
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Gender *</label>
          <select
            className="modal-input"
            value={form.gender}
            onChange={set("gender")}
            required
          >
            <option value="">— Select Gender —</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* ── Account / Contact ───── */}
        <div className="section-title-divider col-1">Account & Contact</div>

        <div className="form-group col-2">
          <label className="modal-label">Email (Login){!isEdit && " *"}</label>
          <input
            type="email"
            className="modal-input"
            placeholder="e.g. uachukwudi@gmail.com"
            value={form.username}
            onChange={set("username")}
            required={!isEdit}
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Phone *</label>
          <input
            type="tel"
            className="modal-input"
            placeholder="e.g. 08060407160"
            value={form.phone}
            onChange={set("phone")}
            required
          />
        </div>

        {/* ── Academic ────────────── */}
        <div className="section-title-divider col-1">Academic Details</div>

        <div className="form-group col-2">
          <label className="modal-label">Department *</label>
          <select
            className="modal-input"
            value={form.department_id}
            onChange={set("department_id")}
            required
          >
            <option value="">— Select Department —</option>
            {departments.map((d) => {
              const idVal = String(d.id ?? d._id);
              return (
                <option key={idVal} value={idVal}>
                  {d.name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Qualification</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. MSc, PhD, BSc"
            value={form.qualification}
            onChange={set("qualification")}
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Levels</label>
          <select
            className="modal-input"
            value={form.level_id}
            onChange={set("level_id")}
          >
            <option value="">— Select Level —</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Courses</label>
          <MultiSelectPicker
            options={courses}
            value={form.subjects}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                subjects: selected.map(String),
              }))
            }
          />
        </div>

        {/* ── Location ────────────── */}
        <div className="section-title-divider col-1">Location</div>

        <div className="form-group col-2">
          <label className="modal-label">Country</label>
          <select
            className="modal-input"
            value={form.country_id}
            disabled={isLoadingCountries}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                country_id: e.target.value,
                state_id: "", // reset state when country changes
              }));
            }}
          >
            <option value="" disabled hidden>
              — Select Country —
            </option>
            {countriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">State</label>

          <select
            className="modal-input"
            value={form.state_id}
            onChange={set("state_id")}
            disabled={isLoadingStates || !form.country_id}
          >
            <option value="" disabled hidden>
              — Select State —
            </option>
            {statesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-1">
          <label className="modal-label">Address</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. ROAD 2, HOUSE 42, HEARTLAND COURT…"
            value={form.address}
            onChange={set("address")}
          />
        </div>

        <div className="form-group col-1">
          <label className="modal-label">Is Adviser</label>
          <select
            className="modal-input"
            value={form.isadviser}
            onChange={set("isadviser")}
            required
          >
            <option value="">— Select Adviser —</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </form>
    </CustomModal>
  );
}

export default LecturerMutate;
