import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { Bell, Calendar, User } from "lucide-react";
import { formatDate } from "../../../utils/helpers";

function NotificationView({ data, onClose }) {
    if (!data) return null;

    return (
        <CustomModal
            isOpen
            title="Notice Details"
            subtitle={data.title}
            size="wide"
            onClose={onClose}
            footer={
                <button className="modal-cancel" onClick={onClose}>
                    Close
                </button>
            }
        >
            {/* Status + metadata strip */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                padding: "12px 16px",
                background: "rgba(0,0,0,0.03)",
                borderRadius: 10,
                marginBottom: 20,
                border: "1px solid rgba(0,0,0,0.06)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <Bell size={14} style={{ color: "#94a3b8" }} />
                    <span style={{ color: "#64748b" }}>Status:</span>
                    <StatusBadge status={data.status} />
                </div>
                {(data.created_at || data.createdate) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                        <Calendar size={14} style={{ color: "#94a3b8" }} />
                        <span>{formatDate(data.created_at ?? data.createdate)}</span>
                    </div>
                )}
                {data.user_name && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                        <User size={14} style={{ color: "#94a3b8" }} />
                        <span>{data.user_name}</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0a1120",
                marginBottom: 12,
                lineHeight: 1.3,
            }}>
                {data.title}
            </h3>

            {/* Message body */}
            <p style={{
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                padding: "14px 16px",
                background: "rgba(0,0,0,0.02)",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.05)",
            }}>
                {data.message ?? "No message body."}
            </p>
        </CustomModal>
    );
}

export default NotificationView;