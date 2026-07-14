import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatDate, formatNaira } from '../../../utils/helpers';
import { BASE_URL } from '../../../api/api';
import { useSystemSettings } from '../../../hooks/useSettings';
import './invoice.css';

function normalise(raw) {
    const status = (raw.paystatus ?? '').toLowerCase();
    const isPaid = status === 'paid' || status === 'completed' || status === 'initialized' || status === 'success';
    const isReceipt = Boolean(raw.transdate || raw.payref || raw.pgateway);

    return {
        docType: isReceipt ? 'RECEIPT' : 'INVOICE',
        docNumber: raw.invoiceid
            ?? (raw.invoice_id ? `#${raw.invoice_id}` : null)
            ?? `#${raw.id}`,
        issueDate: raw.createdate ?? raw.transdate ?? null,
        paymentDate: raw.payday ?? (isReceipt ? raw.transdate : null),
        paystatus: raw.paystatus,
        statusLabel: raw.paystatus ?? '—',
        isPaid,
        amount: raw.amount,
        session: raw.session,
        student: raw.student ?? {},
        fee: raw.fee ?? {},
        // receipt-specific
        payref: raw.payref ?? raw.gresponse ?? null,
        pgateway: raw.pgateway ?? null,
    };
}

// ─── Printable document ───────────────────────────────────────────────────────
const PrintableInvoice = React.forwardRef(({ raw, school }, ref) => {
    const doc = normalise(raw);
    const { docType, docNumber, issueDate, paymentDate, statusLabel, isPaid,
        amount, session, student, fee, payref, pgateway } = doc;

    const fullName = [student.fname, student.mname, student.lname].filter(Boolean).join(' ') || '—';

    const logoSrc = school?.logo ? `${BASE_URL}/img/${school.logo}` : null;
    const schoolName = school?.name ?? 'University';
    const initials = schoolName
        .split(' ')
        .filter((w) => /^[A-Z]/i.test(w))
        .map((w) => w[0].toUpperCase())
        .join('')
        .slice(0, 4);

    const statusColor = isPaid ? '#16a34a' : '#dc2626';

    return (
        <div ref={ref} className="invoice-page">
            {/* Watermark */}
            <div className="watermark">{statusLabel.toUpperCase()}</div>

            {/* ── Header ── */}
            <div className="invoice-header">
                <div className="logo-block">
                    {logoSrc
                        ? <img src={logoSrc} alt="logo" className="logo-img" />
                        : <div className="monogram">{initials}</div>}
                </div>
                <div className="school-info">
                    <h1 className="school-name">{schoolName}</h1>
                    {school?.address && <p className="school-meta">{school.address}</p>}
                    {(school?.email || school?.phone) && (
                        <p className="school-meta">
                            {school?.email}&nbsp;|&nbsp;{school?.phone}
                        </p>
                    )}
                    {school?.website && <p className="school-meta">{school.website}</p>}
                </div>
                <div className="invoice-badge">
                    <span className={`invoice-label invoice-label--${docType.toLowerCase()}`}>
                        {docType}
                    </span>
                </div>
            </div>

            <div className="divider-top" />

            {/* ── Meta row ── */}
            <div className="meta-row">
                <MetaBox
                    label={docType === 'RECEIPT' ? 'Receipt Ref' : 'Invoice No.'}
                    value={docNumber}
                    accent
                />
                <MetaBox label="Session" value={session?.name} />
                <MetaBox label="Issue Date" value={formatDate(issueDate)} />
                <MetaBox label={docType === 'RECEIPT' ? 'Payment Date' : 'Due / Pay Date'}
                    value={paymentDate ? formatDate(paymentDate) : '—'} />
                {pgateway && <MetaBox label="Gateway" value={pgateway} />}
                <MetaBox
                    label="Status"
                    value={statusLabel}
                    chip
                    chipColor={statusColor}
                />
            </div>

            {/* ── Body: Student + Fee/Payment ── */}
            <div className="body-grid">
                {/* Bill To */}
                <div className="card">
                    <h3 className="card__title">BILLED TO</h3>
                    <p className="card__name">{fullName}</p>
                    <Row label="Reg. No." value={student.regno} />
                    <Row label="Level" value={student.level?.name} />
                    <Row label="Department" value={student.department?.name} />
                    <Row label="Gender" value={student.gender} />
                    <Row label="Status" value={student.status ?? student.studentstatus} />
                    <Row label="Email" value={student.email} />
                    <Row label="Phone" value={student.phone} />
                </div>

                {/* Right column */}
                <div className="right-col">
                    <div className="card">
                        <h3 className="card__title">
                            {docType === 'RECEIPT' ? 'PAYMENT DETAILS' : 'FEE DETAILS'}
                        </h3>
                        <Row label="Fee Name" value={fee.name} bold />
                        <Row label="Fee Type" value={fee.feetype} />
                        <Row label="Item Code" value={fee.itemcode} />
                        <Row label="Remita Item Code" value={fee.remitaitemcode} />
                        {/* Receipt-only fields */}
                        {payref && <Row label="Payment Ref" value={payref} />}
                        {pgateway && <Row label="Gateway" value={pgateway} />}
                    </div>

                    {/* Amount box */}
                    <div className={`amount-box${isPaid ? ' amount-box--paid' : ''}`}>
                        <p className="amount-box__label">
                            {docType === 'RECEIPT' ? 'AMOUNT PAID' : 'TOTAL AMOUNT DUE'}
                        </p>
                        <p className="amount-box__value">{formatNaira(amount)}</p>
                        <p className="amount-box__words">
                            {toWords(Number(amount))} Naira Only
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Line-items table ── */}
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th className="col-no">#</th>
                        <th className="col-desc">Description</th>
                        <th className="col-session">Session</th>
                        <th className="col-amount">Amount (₦)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="t-row">
                        <td>1</td>
                        <td className="col-desc">{fee.name ?? '—'}</td>
                        <td>{session?.name ?? '—'}</td>
                        <td className="col-amount">{formatNaira(amount)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3} className="tfoot-label">TOTAL</td>
                        <td className="tfoot-amount">{formatNaira(amount)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* ── Footer ── */}
            <div className="invoice-footer">
                <div className="footer-note">
                    {docType === 'RECEIPT' ? (
                        <>
                            <strong>Payment Confirmed.</strong> This is an official receipt for the payment
                            made via {pgateway ?? 'the payment gateway'}.
                            Please retain this receipt for your records.
                            For enquiries, contact the Bursary Department.
                        </>
                    ) : (
                        <>
                            <strong>Payment Instructions:</strong> Pay via Remita using the item
                            code above. This invoice is computer-generated and valid without a
                            signature. For enquiries, contact the Bursary Department.
                        </>
                    )}
                </div>
                <div className="footer-right">
                    {school?.website && <p className="footer-website">{school.website}</p>}
                    <p className="footer-generated">
                        Generated: {new Date().toLocaleString('en-GB')}
                    </p>
                </div>
            </div>
        </div>
    );
});

// ─── Helper components ────────────────────────────────────────────────────────
function MetaBox({ label, value, accent, chip, chipColor }) {
    return (
        <div className={`meta-box${accent ? ' meta-box--accent' : ''}`}>
            <span className="meta-box__label">{label}</span>
            {chip ? (
                <span className="chip" style={{ background: chipColor }}>{value}</span>
            ) : (
                <span className="meta-box__value">{value || '—'}</span>
            )}
        </div>
    );
}

function Row({ label, value, bold }) {
    return (
        <div className="info-row">
            <span className="info-row__label">{label}</span>
            <span className={`info-row__value${bold ? ' info-row__value--bold' : ''}`}>
                {value || '—'}
            </span>
        </div>
    );
}

// ─── Number → words (up to millions) ─────────────────────────────────────────
function toWords(n) {
    if (!n || n === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function h(num) {
        if (num === 0) return '';
        if (num < 20) return ones[num] + ' ';
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '') + ' ';
        return ones[Math.floor(num / 100)] + ' Hundred ' + h(num % 100);
    }
    let r = '';
    if (n >= 1_000_000) { r += h(Math.floor(n / 1_000_000)) + 'Million '; n %= 1_000_000; }
    if (n >= 1_000) { r += h(Math.floor(n / 1_000)) + 'Thousand '; n %= 1_000; }
    r += h(n);
    return r.trim();
}

// ─── Wrapper (modal shell) ────────────────────────────────────────────────────
function Invoice({ data, closeModal }) {
    const { data: settingsRes } = useSystemSettings(1);
    const school = settingsRes?.data ?? settingsRes ?? null;

    const printRef = useRef();
    const doc = normalise(data);
    const docLabel = doc.docType === 'RECEIPT' ? 'Receipt' : 'Invoice';

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${docLabel}-${doc.docNumber}`,
    });

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Modal header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{docLabel} Preview</h2>
                        <p className="modal-subtitle">
                            {doc.docNumber}&nbsp;·&nbsp;
                            {data.student?.fname} {data.student?.lname}
                        </p>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-print" onClick={handlePrint}>
                            🖨️ Print / Download PDF
                        </button>
                        {closeModal && (
                            <button className="btn-close" onClick={closeModal}>
                                ✕ Close
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable preview */}
                <div className="preview-scroll">
                    <PrintableInvoice ref={printRef} raw={data} school={school} />
                </div>
            </div>
        </div>
    );
}

export default Invoice;