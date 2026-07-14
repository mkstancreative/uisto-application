import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { DollarSign, Layers, Building2, CheckCircle } from "lucide-react";
import { formatNaira } from "../../../utils/helpers";
import "./FeeView.css";

function InfoRow({ label, value }) {
    return (
        <div className="fee-view-info-row">
            <span className="fee-view-info-label">{label}</span>
            <span className="fee-view-info-value">{value ?? "—"}</span>
        </div>
    );
}

function FeeView({ data, closeModal }) {
    if (!data) return null;

    const levels = data.levels ?? [];
    const departments = data.departments ?? [];

    return (
        <CustomModal
            isOpen
            title="Fee Details"
            subtitle={`${data.name ?? "Fee"} — ${formatNaira(data.amount)}`}
            size="wide"
            onClose={closeModal}
            footer={<button className="modal-cancel" onClick={closeModal}>Close</button>}
        >
            <div className="fee-view">
                {/* ── Hero strip ── */}
                <div className="fee-view-hero">
                    <div className="fee-view-hero-icon">
                        <DollarSign size={24} color="#fff" />
                    </div>
                    <div className="fee-view-hero-info">
                        <h3 className="fee-view-hero-name">{data.name}</h3>
                        <p className="fee-view-hero-meta">
                            Item Code: <strong>{data.itemcode ?? "—"}</strong>
                            &nbsp;·&nbsp;
                            Remita Code: <strong>{data.remitaitemcode ?? "—"}</strong>
                        </p>
                    </div>
                    <div className="fee-view-hero-right">
                        <span className="fee-view-amount">{formatNaira(data.amount)}</span>
                        <StatusBadge status={data.status === 1 ? "Active" : "Inactive"} />
                    </div>
                </div>

                {/* ── Two column body ── */}
                <div className="fee-view-grid">
                    {/* Left: fee info + levels */}
                    <div>
                        <div className="fee-view-section-title">Fee Information</div>
                        <InfoRow label="Fee Name" value={data.name} />
                        <InfoRow label="Amount" value={formatNaira(data.amount)} />
                        <InfoRow label="Fee Type" value={data.feetype} />
                        <InfoRow label="Item Code" value={data.itemcode} />
                        <InfoRow label="Remita Code" value={data.remitaitemcode} />
                        <InfoRow label="Start Date" value={data.startdate ?? "Not set"} />
                        <InfoRow label="End Date" value={data.enddate ?? "Not set"} />

                        {/* Levels */}
                        <div className="fee-view-levels">
                            <div className="fee-view-section-title">Applied Levels</div>
                            {levels.length === 0 ? (
                                <p className="fee-view-empty">No levels assigned.</p>
                            ) : (
                                <div className="fee-view-chips">
                                    {levels.map((l) => (
                                        <span key={l.id} className="fee-view-level-chip">
                                            <Layers size={11} />
                                            {l.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: departments */}
                    <div>
                        <div className="fee-view-section-title">
                            Applied Departments ({departments.length})
                        </div>
                        {departments.length === 0 ? (
                            <p className="fee-view-empty">No departments assigned.</p>
                        ) : (
                            <div className="fee-view-dept-list">
                                {departments.map((d) => (
                                    <div key={d.id} className="fee-view-dept-item">
                                        <Building2 size={13} color="#64748b" style={{ flexShrink: 0 }} />
                                        <div className="fee-view-dept-item-info">
                                            <div className="fee-view-dept-name">{d.name.trim()}</div>
                                            <div className="fee-view-dept-code">Code: {d.deptcode ?? "—"}</div>
                                        </div>
                                        <CheckCircle size={13} color="#22c55e" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomModal>
    );
}

export default FeeView;