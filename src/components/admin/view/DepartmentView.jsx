import React, { useMemo } from "react";
import { useDepartmentById } from "../../../hooks/useDepartments";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { formatNaira } from "../../../utils/helpers";
import { BookOpen, Banknote, GraduationCap, Building2, Tag, Hash } from "lucide-react";
import "./DepartmentView.css";

function DepartmentView({ data, closeModal }) {
    const { data: detailResponse, isLoading } = useDepartmentById({ id: data?.id });

    const rawDetail = detailResponse?.data ?? null;
    const detail = useMemo(() => {
        if (!rawDetail) return null;
        if (Array.isArray(rawDetail)) return rawDetail[0] ?? null;
        return rawDetail;
    }, [rawDetail]);

    return (
        <CustomModal
            isOpen={Boolean(data?.id)}
            onClose={closeModal}
            title="Department Details"
            subtitle={detail ? `${detail.faculty?.name ?? ""}` : "Loading…"}
            size="wide"
            footer={
                <button type="button" className="modal-cancel" onClick={closeModal}>
                    Close
                </button>
            }
        >
            {isLoading ? (
                <div className="dept-view-loading">
                    <Spinner />
                </div>
            ) : !detail ? (
                <p className="dept-view-empty">Unable to load department details.</p>
            ) : (
                <div className="dept-view">

                    {/* ── Hero banner ── */}
                    <div className="dept-view-hero">
                        <div className="dept-view-hero-icon">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h3 className="dept-view-name">{detail.name}</h3>
                            <span className="dept-view-faculty">{detail.faculty?.name}</span>
                        </div>
                    </div>

                    {/* ── Meta chips ── */}
                    <div className="dept-view-chips">
                        <span className="dept-chip">
                            <Tag size={12} />
                            Code: <b>{detail.deptcode ?? "—"}</b>
                        </span>
                        <span className="dept-chip">
                            <Hash size={12} />
                            Max Units: <b>{detail.maxunit ?? "—"}</b>
                        </span>
                        <span className="dept-chip">
                            <BookOpen size={12} />
                            CDL: <b>{detail.iscdl ?? "—"}</b>
                        </span>
                        <span className="dept-chip">
                            <GraduationCap size={12} />
                            Programmes:{" "}
                            <b>
                                {detail.programmes?.length
                                    ? detail.programmes.map((p) => p.name).join(", ")
                                    : "None"}
                            </b>
                        </span>
                    </div>

                    {/* ── Subjects ── */}
                    <div className="dept-view-section">
                        <h4 className="dept-view-section-title">
                            <BookOpen size={14} /> Assigned Courses ({detail.subjects?.length ?? 0})
                        </h4>
                        {detail.subjects?.length ? (
                            <div className="dept-view-table-wrap">
                                <table className="dept-view-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Course</th>
                                            <th>Code</th>
                                            <th>Level</th>
                                            <th>Semester</th>
                                            <th>Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.subjects.map((s, i) => (
                                            <tr key={s.id}>
                                                <td>{i + 1}</td>
                                                <td>{s.name}</td>
                                                <td><code>{s.subjectcode}</code></td>
                                                <td>{s.level?.name ?? "—"}</td>
                                                <td>{s.semester?.name ?? "—"}</td>
                                                <td>{s.creditload}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="dept-view-empty-row">No Courses assigned yet.</p>
                        )}
                    </div>

                    {/* ── Fees ── */}
                    <div className="dept-view-section">
                        <h4 className="dept-view-section-title">
                            <Banknote size={14} /> Assigned Fees ({detail.fees?.length ?? 0})
                        </h4>
                        {detail.fees?.length ? (
                            <div className="dept-view-table-wrap">
                                <table className="dept-view-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Fee Name</th>
                                            <th>Amount</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.fees.map((f, i) => (
                                            <tr key={f.id}>
                                                <td>{i + 1}</td>
                                                <td>{f.name}</td>
                                                <td className="dept-view-amount">{formatNaira(f.amount)}</td>
                                                <td>
                                                    <span className={`dept-fee-type ${f.feetype}`}>
                                                        {f.feetype}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`dept-fee-status ${f.status === 1 ? "active" : "inactive"}`}>
                                                        {f.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="dept-view-empty-row">No fees assigned yet.</p>
                        )}
                    </div>

                </div>
            )}
        </CustomModal>
    );
}

export default DepartmentView;