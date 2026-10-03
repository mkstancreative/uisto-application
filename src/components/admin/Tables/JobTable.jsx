import { Eye, Pencil } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import Toggler from "../../ui/Toggler/Toggler";
import { formatDeadline, formatOnlyDate } from "../../../utils/helpers";
import { daysUntil, deadlineLabel } from "../common/dates";
import "../common/adminCommon.css";

/**
 * Vacancies list.
 * `subcadreName(value)` resolves a populated subcadre, an id or null to a name.
 */
function JobTable({
  data = [],
  loading = false,
  canEdit = false,
  onView,
  onEdit,
  onToggle,
  togglingId,
  subcadreName = () => "",
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => {
        const start = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
        return start + i + 1;
      },
    },
    {
      header: "Position",
      render: (row) => (
        <div style={{ maxWidth: 260 }}>
          <span className="cell-main">{row.position?.title ?? "Untitled position"}</span>
        </div>
      ),
    },
    {
      header: "Cadre",
      render: (row) => row.position?.cadre ?? "—",
    },
    {
      header: "Department / Subcadre",
      render: (row) => {
        const dept = row.position?.department;
        const sub = subcadreName(row.position?.subcadre);
        if (dept) return dept;
        if (sub) return sub;
        return <span className="cell-muted">—</span>;
      },
    },
    {
      header: "Deadline",
      render: (row) => {
        if (!row.applicationDeadline) return "—";
        const days = daysUntil(row.applicationDeadline);
        const tone = days < 0 ? "tag-red" : days <= 3 ? "tag-amber" : "tag-slate";
        return (
          <div className="cell-nowrap">
            <span>{formatDeadline(row.applicationDeadline)}</span>
            <span className="cell-sub">
              <span className={`tag ${tone}`}>{deadlineLabel(row.applicationDeadline)}</span>
            </span>
          </div>
        );
      },
    },
    {
      header: "Published",
      render: (row) => (
        <span className="cell-nowrap">
          {row.publishedDate ? formatOnlyDate(row.publishedDate) : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.isOpen ? "Open" : "Closed"} />,
    },
    {
      header: "Active",
      render: (row) =>
        canEdit ? (
          <Toggler
            checked={Boolean(row.isActive)}
            onChange={() => onToggle?.(row)}
            disabled={togglingId === row._id}
          />
        ) : (
          <StatusBadge status={row.isActive ? "Active" : "Inactive"} />
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View",
              icon: <Eye size={13} />,
              onClick: () => onView?.(row),
            },
            ...(canEdit
              ? [
                  {
                    label: "Edit",
                    icon: <Pencil size={13} />,
                    onClick: () => onEdit?.(row),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}

export default JobTable;
