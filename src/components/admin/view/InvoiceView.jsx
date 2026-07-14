import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSystemSettings } from '../../../hooks/useSettings';
import { formatDate, formatNaira } from '../../../utils/helpers';
import { BASE_URL } from '../../../api/api';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import '../../ui/Invoice/invoice.css';

/* ─── tiny helpers (copied from Invoice.jsx) ─────────────────────────────── */
function MetaBox({ label, value, accent, chip, chipColor }) {
  return (
    <div className={`meta-box${accent ? ' meta-box--accent' : ''}`}>
      <span className="meta-box__label">{label}</span>
      {chip ? (
        <span className="chip" style={{ background: chipColor }}>
          {value}
        </span>
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
      <span
        className={`info-row__value${bold ? ' info-row__value--bold' : ''}`}
      >
        {value || '—'}
      </span>
    </div>
  );
}

function toWords(n) {
  if (!n || n === 0) return 'Zero';
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  function h(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 ? '-' + ones[num % 10] : '') +
        ' '
      );
    return ones[Math.floor(num / 100)] + ' Hundred ' + h(num % 100);
  }
  let r = '';
  if (n >= 1_000_000) {
    r += h(Math.floor(n / 1_000_000)) + 'Million ';
    n %= 1_000_000;
  }
  if (n >= 1_000) {
    r += h(Math.floor(n / 1_000)) + 'Thousand ';
    n %= 1_000;
  }
  r += h(n);
  return r.trim();
}

/* ─── Adapt applicant row → Invoice shape ────────────────────────────────── */
/**
 * The NewApplicants API response looks like:
 *   { id, fname, lname, mname, email, phone, gender, department, application_no,
 *     transactions: [{ id, amount, paystatus, payref, transdate, fee_id, invoice_id, pgateway }],
 *     country, state, ... }
 *
 * Invoice.jsx expects raw to have: student, fee, session, amount, paystatus,
 *   payref, transdate, invoice_id, pgateway.
 *
 * We build that from the applicant row.
 */
function adaptApplicant(row) {
  const tx = row?.transactions?.[0] ?? {};
  return {
    // top-level invoice fields
    invoice_id: tx.invoice_id ?? null,
    amount: tx.amount ?? '0',
    paystatus: tx.paystatus ?? '—',
    payref: tx.payref ?? tx.gresponse ?? null,
    pgateway: tx.pgateway ?? null,
    transdate: tx.transdate ?? null,
    createdate: row.joindate ?? null,

    // student sub-object — what PrintableInvoice reads
    student: {
      fname: row.fname,
      mname: row.mname,
      lname: row.lname,
      email: row.email,
      phone: row.phone,
      gender: row.gender,
      regno: row.regno ?? row.application_no,
      department: row.department,
      level: row.level,
      status: row.status,
      studentstatus: row.studentstatus,
    },

    // fee sub-object (we only know fee_id from tx; show what we have)
    fee: {
      name: `Application Fee`,
      feetype: row.mode?.name ?? 'UTME',
      itemcode: tx.fee_id ? `FEE-${tx.fee_id}` : null,
      remitaitemcode: null,
    },

    // session (if present on tx)
    session: tx.session ?? null,
  };
}

/* ─── Printable invoice page (self-contained, no CustomModal) ────────────── */
const PrintableApplicantInvoice = React.forwardRef(({ row, school }, ref) => {
  const adapted = adaptApplicant(row);

  const status = (adapted.paystatus ?? '').toLowerCase();
  const isPaid = ['paid', 'completed', 'success'].includes(status);
  const isReceipt = Boolean(adapted.transdate || adapted.payref);
  const docType = isReceipt ? 'RECEIPT' : 'INVOICE';
  const docNumber = adapted.invoice_id
    ? `#${adapted.invoice_id}`
    : `#${row.id}`;
  const statusColor = isPaid
    ? '#16a34a'
    : status === 'initialized'
      ? '#f59e0b'
      : '#dc2626';

  const { student, fee, session } = adapted;
  const fullName =
    [student.fname, student.mname, student.lname].filter(Boolean).join(' ') ||
    '—';
  const amount = Number(adapted.amount ?? 0);

  const logoSrc = school?.logo ? `${BASE_URL}/img/${school.logo}` : null;
  const schoolName = school?.name ?? 'University';
  const initials = schoolName
    .split(' ')
    .filter((w) => /^[A-Z]/i.test(w))
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 4);

  return (
    <div ref={ref} className="invoice-page">
      {/* Watermark */}
      <div className="watermark">{adapted.paystatus?.toUpperCase()}</div>

      {/* ── Header ── */}
      <div className="invoice-header">
        <div className="logo-block">
          {logoSrc ? (
            <img src={logoSrc} alt="logo" className="logo-img" />
          ) : (
            <div className="monogram">{initials}</div>
          )}
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
          <span
            className={`invoice-label invoice-label--${docType.toLowerCase()}`}
          >
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
        <MetaBox label="App. No." value={row.application_no} />
        <MetaBox label="Issue Date" value={formatDate(adapted.createdate)} />
        <MetaBox
          label={docType === 'RECEIPT' ? 'Payment Date' : 'Due / Pay Date'}
          value={adapted.transdate ? formatDate(adapted.transdate) : '—'}
        />
        {adapted.pgateway && (
          <MetaBox label="Gateway" value={adapted.pgateway} />
        )}
        <MetaBox
          label="Status"
          value={adapted.paystatus}
          chip
          chipColor={statusColor}
        />
      </div>

      {/* ── Body ── */}
      <div className="body-grid">
        {/* Bill To */}
        <div className="card">
          <h3 className="card__title">BILLED TO</h3>
          <p className="card__name">{fullName}</p>
          <Row label="App. No." value={row.application_no} />
          <Row label="Department" value={student.department?.name} />
          <Row label="Gender" value={student.gender} />
          <Row label="JAMB Score" value={row.jamb} />
          <Row label="JAMB Reg." value={row.jambregno} />
          <Row label="State" value={row.state?.name} />
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
            {adapted.payref && (
              <Row label="Payment Ref" value={adapted.payref} />
            )}
            {adapted.pgateway && (
              <Row label="Gateway" value={adapted.pgateway} />
            )}
          </div>

          {/* Amount box */}
          <div className={`amount-box${isPaid ? ' amount-box--paid' : ''}`}>
            <p className="amount-box__label">
              {docType === 'RECEIPT' ? 'AMOUNT PAID' : 'TOTAL AMOUNT DUE'}
            </p>
            <p className="amount-box__value">{formatNaira(amount)}</p>
            <p className="amount-box__words">{toWords(amount)} Naira Only</p>
          </div>
        </div>
      </div>

      {/* ── Line-items table ── */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="col-no">#</th>
            <th className="col-desc">Description</th>
            <th className="col-session">Session / Mode</th>
            <th className="col-amount">Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="t-row">
            <td>1</td>
            <td className="col-desc">{fee.name}</td>
            <td>{session?.name ?? row.mode?.name ?? '—'}</td>
            <td className="col-amount">{formatNaira(amount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="tfoot-label">
              TOTAL
            </td>
            <td className="tfoot-amount">{formatNaira(amount)}</td>
          </tr>
        </tfoot>
      </table>

      {/* ── Footer ── */}
      <div className="invoice-footer">
        <div className="footer-note">
          {docType === 'RECEIPT' ? (
            <>
              <strong>Payment Confirmed.</strong> This is an official receipt
              for the payment made via{' '}
              {adapted.pgateway ?? 'the payment gateway'}. Please retain this
              receipt for your records. For enquiries, contact the Bursary
              Department.
            </>
          ) : (
            <>
              <strong>Payment Instructions:</strong> Pay via Remita using the
              item code above. This invoice is computer-generated and valid
              without a signature. For enquiries, contact the Bursary
              Department.
            </>
          )}
        </div>
        <div className="footer-right">
          {school?.website && (
            <p className="footer-website">{school.website}</p>
          )}
          <p className="footer-generated">
            Generated: {new Date().toLocaleString('en-GB')}
          </p>
        </div>
      </div>
    </div>
  );
});

/* ─── Modal shell ─────────────────────────────────────────────────────────── */
function InvoiceView({ data, onClose }) {
  const { data: settingsRes } = useSystemSettings(1);
  const school = settingsRes?.data ?? settingsRes ?? null;

  const printRef = useRef();
  const tx = data?.transactions?.[0] ?? {};
  const isReceipt = Boolean(tx.transdate || tx.payref);
  const docLabel = isReceipt ? 'Receipt' : 'Invoice';
  const docNumber = tx.invoice_id ? `#${tx.invoice_id}` : `#${data?.id}`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${docLabel}-${docNumber}`,
  });

  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Modal header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{docLabel} Preview</h2>
            <p className="modal-subtitle">
              {docNumber}&nbsp;·&nbsp;
              {data.fname} {data.lname}
              {data.application_no ? ` — ${data.application_no}` : ''}
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn-print" onClick={handlePrint}>
              🖨️ Print / Download PDF
            </button>
            {onClose && (
              <button className="btn-close" onClick={onClose}>
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Scrollable preview */}
        <div className="preview-scroll">
          <PrintableApplicantInvoice
            ref={printRef}
            row={data}
            school={school}
          />
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
