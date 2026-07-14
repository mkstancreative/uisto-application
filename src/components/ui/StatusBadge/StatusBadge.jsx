import { GoDotFill } from "react-icons/go";
import "./statusbage.css";

const statusMap = {
  // Student / applicant
  active: "active",
  inactive: "inactive",
  graduated: "graduated",
  suspended: "suspended",
  withdrawn: "withdrawn",
  applied: "applied",
  admitted: "admitted",

  // Admins / Lecturers
  enabled: "enabled",
  disabled: "disabled",


  // Attendance
  present: "present",
  absent: "absent",
  late: "late",

  // Fees / payments
  paid: "paid",
  success: "success",
  unpaid: "unpaid",
  pending: "pending",
  initialized: "initialized",
  overdue: "overdue",
  completed: "completed",
  failed: "failed",

  // Enrollment
  enrolled: "enrolled",
  rejected: "rejected",

  awaiting: "awaiting",


  open: "open",
  closed: "closed",
  ended: "ended",

  // Academic
  passed: "passed",
  "in-progress": "in-progress",
};
function StatusBadge({ status, category, type }) {
  const value = status || category || type;

  const getStatusClass = (statusText) => {
    if (!statusText) return "status-badge";

    const text = String(statusText).toLowerCase();

    return statusMap[text] || "status-badge";
  };

  return (
    <span className={`status-badge ${getStatusClass(value)}`}>
      <GoDotFill className="status-dot" />
      <span>{String(value)}</span>
    </span>
  );
}

export default StatusBadge;