import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatNaira, formatDate } from "../../../utils/helpers";
import {
    Receipt,
    User,
    CreditCard,
    BookOpen,
    CalendarDays,
    Hash,
    Landmark,
    BadgeCheck,
    Phone,
    Mail,
} from "lucide-react";
import "./TransactionView.css";

function TransactionView({ data, closeModal }) {
    if (!data) return null;

    const student = data.student ?? {};
    const fee = data.fee ?? {};
    const session = data.session ?? {};

    const studentName = [student.fname, student.mname, student.lname]
        .filter(Boolean)
        .join(" ") || "—";

    return (
        <CustomModal
            isOpen
            title="Transaction Receipt"
            subtitle={`Invoice #${data.invoice_id ?? data.invoiceid ?? "—"}`}
            icon={<Receipt size={16} />}
            size="wide"
            onClose={closeModal}
            footer={
                <button type="button" className="modal-cancel" onClick={closeModal}>
                    Close
                </button>
            }
        >
            <div className="tv-wrapper">

                {/* ── Status Banner ── */}
                <div className={`tv-banner tv-banner--${(data.paystatus ?? "").toLowerCase()}`}>
                    <div className="tv-banner-left">
                        <BadgeCheck size={28} strokeWidth={1.5} />
                        <div>
                            <span className="tv-banner-label">Payment Status</span>
                            <span className="tv-banner-amount">{formatNaira(data.amount)}</span>
                        </div>
                    </div>
                    <StatusBadge status={data.paystatus} />
                </div>

                {/* ── Grid ── */}
                <div className="tv-grid">

                    {/* Payment Details */}
                    <div className="tv-card">
                        <div className="tv-card-head">
                            <CreditCard size={14} /> Payment Details
                        </div>
                        <div className="tv-rows">
                            <TvRow label="Invoice ID" value={data.invoice_id ?? data.invoiceid} />
                            <TvRow label="Pay Reference" value={data.payref} />
                            <TvRow label="Gateway Response" value={data.gresponse} mono />
                            <TvRow label="Payment Gateway" value={data.pgateway} />
                            <TvRow label="Transaction Date" value={formatDate(data.transdate)} />
                        </div>
                    </div>

                    {/* Fee Info */}
                    <div className="tv-card">
                        <div className="tv-card-head">
                            <BookOpen size={14} /> Fee Information
                        </div>
                        <div className="tv-rows">
                            <TvRow label="Fee Name" value={fee.name} />
                            <TvRow label="Fee Amount" value={fee.amount != null ? formatNaira(fee.amount) : undefined} />
                            <TvRow label="Fee Type" value={fee.feetype} />
                            <TvRow label="Session" value={session.name} />
                            <TvRow label="Item Code" value={fee.itemcode} mono />
                        </div>
                    </div>

                </div>

                {/* ── Student Details ── */}
                <div className="tv-card tv-card--full">
                    <div className="tv-card-head">
                        <User size={14} /> Student Details
                    </div>
                    <div className="tv-student-grid">
                        <TvRow label="Full Name" value={studentName} />
                        <TvRow label="Reg Number" value={student.regno} />
                        <TvRow label="Application No." value={student.application_no} />
                        <TvRow label="Level" value={student.level?.name} />
                        <TvRow label="Status" value={student.status} />
                        <TvRow label="Gender" value={student.gender} />
                        <TvRow
                            label="Email"
                            value={student.email}
                            icon={<Mail size={11} />}
                        />
                        <TvRow
                            label="Phone"
                            value={student.phone}
                            icon={<Phone size={11} />}
                        />
                    </div>
                </div>

                {/* ── Payment IDs ── */}
                <div className="tv-card tv-card--full">
                    <div className="tv-card-head">
                        <Hash size={14} /> Reference IDs
                    </div>
                    <div className="tv-student-grid">
                        <TvRow label="Transaction ID" value={data.id} />
                        <TvRow label="Student ID" value={data.student_id} />
                        <TvRow label="Session ID" value={data.session_id} />
                        <TvRow label="Fee ID" value={data.fee_id} />
                        <TvRow label="Payment Log ID" value={data.paymentlogid ?? "N/A"} />
                    </div>
                </div>

            </div>
        </CustomModal>
    );
}

function TvRow({ label, value, mono, icon }) {
    return (
        <div className="tv-row">
            <span className="tv-row-label">{label}</span>
            <span className={`tv-row-value ${mono ? "tv-mono" : ""}`}>
                {icon && <span className="tv-row-icon">{icon}</span>}
                {value != null && value !== "" ? value : "—"}
            </span>
        </div>
    );
}

export default TransactionView;