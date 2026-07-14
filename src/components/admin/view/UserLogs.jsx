import React, { useEffect, useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/helpers";


function UserLogs({ data, closeModal }) {

    const admin = data?.data ?? {};
    const user = admin?.user ?? {};
    const logs = user?.logs ?? [];


    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, [data]);


    const typeColor = (type) => {
        const t = (type ?? "").toLowerCase();
        if (t === "edit" || t === "update") return "pending";
        if (t === "delete") return "unpaid";
        if (t === "create" || t === "add") return "active";
        if (t === "login") return "enrolled";
        return "in-progress";
    };

    if (loading) {
        return (
            <div className="logs-loader">
                <div className="spinner" />
                <p>Loading activity logs...</p>
            </div>
        );
    }
    return (
        <CustomModal
            isOpen
            title="Activity Logs"
            subtitle={`${[admin.surname, admin.lastname].filter(Boolean).join(" ") || user.fname || "Admin"} — ${user.username ?? ""}`}
            size="wide"
            onClose={closeModal}
            footer={
                <button type="button" className="modal-cancel" onClick={closeModal}>
                    Close
                </button>
            }
        >
            {/* Admin summary strip */}
            <div className="logs-admin-strip">
                <div className="logs-admin-field">
                    <span className="logs-field-label">Status</span>
                    <span>{user.userstatus ?? admin.status}</span>
                </div>
                <div className="logs-admin-field">
                    <span className="logs-field-label">Gender</span>
                    <span>{admin.gender ?? "—"}</span>
                </div>
                <div className="logs-admin-field">
                    <span className="logs-field-label">Phone</span>
                    <span>{admin.phone ?? user.phone ?? "—"}</span>
                </div>
                <div className="logs-admin-field">
                    <span className="logs-field-label">Profile</span>
                    <span>{admin.profile ?? "—"}</span>
                </div>
            </div>

            {/* Logs list */}
            {logs.length === 0 ? (
                <div className="logs-empty">
                    <span style={{ fontSize: 28 }}>📋</span>
                    <p>No activity logs found for this user.</p>
                </div>
            ) : (
                <div className="logs-list">
                    {logs.map((log) => (
                        <div key={log.id} className="log-entry">
                            <div className="log-entry-left">
                                <StatusBadge status={typeColor(log.type)} />
                                <div className="log-entry-content">
                                    <span className="log-title">{log.title}</span>
                                    <span className="log-desc">{log.description}</span>
                                    <span className="log-meta">
                                        IP: {log.ip ?? "—"} &nbsp;·&nbsp;
                                        {formatDate(log.timestamp ?? "—")}
                                    </span>
                                </div>
                            </div>
                            <span className="log-type-badge">{log.type}</span>
                        </div>
                    ))}
                </div>
            )}
        </CustomModal>
    );
}

export default UserLogs;