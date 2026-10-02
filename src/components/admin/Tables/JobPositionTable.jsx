import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import "../common/adminCommon.css";

/**
 * Positions list, ordered by displayOrder.
 * With `canEdit`, rows can be dragged; `onReorder(dragged, target)` should return a
 * promise and reject on failure so the optimistic order is rolled back.
 */
function JobPositionTable({
  data = [],
  loading,
  canEdit = false,
  subcadreName = () => "",
  onEdit,
  onDelete,
  onReorder,
  meta,
  onPageChange,
  onLimitChange,
}) {
  /* The optimistic order is tied to the `data` array it was made from, so
     a refetch (new array) discards it without syncing state in an effect. */
  const [optimistic, setOptimistic] = useState(null);
  const rows = optimistic && optimistic.source === data ? optimistic.rows : data;

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const resetDrag = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      resetDrag();
      return;
    }

    const dragged = rows[draggedIndex];
    const target = rows[index];
    const next = [...rows];
    next.splice(draggedIndex, 1);
    next.splice(index, 0, dragged);

    setOptimistic({ source: data, rows: next });
    resetDrag();

    Promise.resolve(onReorder?.(dragged, target)).catch(() => setOptimistic(null));
  };

  const rowProps = (row, index) => {
    if (!canEdit) return {};
    return {
      draggable: true,
      onDragStart: (e) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
      },
      onDragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (draggedIndex !== null && draggedIndex !== index && dragOverIndex !== index) {
          setDragOverIndex(index);
        }
      },
      onDragLeave: () => setDragOverIndex(null),
      onDrop: (e) => handleDrop(e, index),
      onDragEnd: resetDrag,
      style: {
        cursor: "grab",
        opacity: draggedIndex === index ? 0.35 : 1,
        backgroundColor:
          dragOverIndex === index ? "rgba(var(--accent-rgb), 0.08)" : undefined,
        borderTop:
          dragOverIndex === index && draggedIndex > index
            ? "2px solid var(--accent-ink)"
            : undefined,
        borderBottom:
          dragOverIndex === index && draggedIndex < index
            ? "2px solid var(--accent-ink)"
            : undefined,
        transition: "background-color 0.2s, opacity 0.2s",
      },
    };
  };

  const columns = [
    {
      header: "Order",
      render: (row) => (
        <div className="drag-cell">
          {canEdit && <GripVertical size={16} className="drag-grip" aria-hidden />}
          <span>{row.displayOrder ?? "—"}</span>
        </div>
      ),
    },
    {
      header: "Title",
      render: (row) => <span className="cell-main">{row.title}</span>,
    },
    {
      header: "Cadre",
      render: (row) => row.cadre || "—",
    },
    {
      header: "Department / Subcadre",
      render: (row) => {
        if (row.cadre === "Academic" || row.department) {
          return row.department || <span className="cell-muted">—</span>;
        }
        return subcadreName(row.subcadre) || <span className="cell-muted">—</span>;
      },
    },
    {
      header: "Experience",
      render: (row) =>
        row.requiredYearsExperience
          ? `${row.requiredYearsExperience} yr${row.requiredYearsExperience === 1 ? "" : "s"}`
          : <span className="cell-muted">None</span>,
    },
    {
      header: "Requirements",
      render: (row) => {
        const n = Array.isArray(row.requirements) ? row.requirements.length : 0;
        return <span className={`tag ${n ? "tag-accent" : "tag-slate"}`}>{n}</span>;
      },
    },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive === false ? "Inactive" : "Active"} />
      ),
    },
    ...(canEdit
      ? [
          {
            header: "Actions",
            render: (row) => (
              <ActionDropdown
                actions={[
                  {
                    label: "Edit Position",
                    icon: <Pencil size={13} />,
                    onClick: () => onEdit?.(row),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 size={13} />,
                    onClick: () => onDelete?.(row),
                    danger: true,
                  },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <GeneralTable
      columns={columns}
      data={rows}
      loading={loading}
      meta={meta}
      rowProps={rowProps}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}

export default JobPositionTable;
