import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";

function JobPositionTable({
  data,
  subcadres = [],
  loading,
  onEdit,
  onDelete,
  onReorder,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const [localData, setLocalData] = useState(data || []);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Sync localData whenever the parent's filtered data changes
  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Only valid data formats
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newData = [...localData];
    const draggedItem = newData[draggedIndex];

    newData.splice(draggedIndex, 1);
    newData.splice(index, 0, draggedItem);

    setLocalData(newData);

    if (onReorder) {
      onReorder(draggedItem, index, newData);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const rowProps = (row, index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, index),
    onDragOver: (e) => handleDragOver(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index),
    onDragEnd: handleDragEnd,
    style: {
      cursor: "grab",
      opacity: draggedIndex === index ? 0.3 : 1,
      backgroundColor:
        dragOverIndex === index ? "rgba(87, 0, 163, 0.05)" : undefined,
      borderTop:
        dragOverIndex === index && draggedIndex > index
          ? "2px solid #5700A3"
          : undefined,
      borderBottom:
        dragOverIndex === index && draggedIndex < index
          ? "2px solid #5700A3"
          : undefined,
      transition: "background-color 0.2s, border 0.2s, opacity 0.2s",
    },
  });

  const columns = [
    {
      header: "S/N",
      render: (_, index) => {
        const start = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <GripVertical size={16} color="#aaa" style={{ cursor: "grab" }} />
            <span>{start + index + 1}</span>
          </div>
        );
      },
    },
    {
      header: "Title",
      render: (row) => <span className="fw-500">{row.title}</span>,
    },
    {
      header: "Cadre",
      render: (row) => row.cadre || "—",
    },
    {
      header: "Sub-Cadre",
      render: (row) => {
        const subcadreId =
          row.subcadre?._id || row.subcadre?.id || row.subcadre;
        if (!subcadreId) return "—";
        const match = subcadres.find(
          (s) => String(s._id || s.id) === String(subcadreId),
        );
        return match ? match.name : row.subcadre?.name || subcadreId;
      },
    },
    {
      header: "Department",
      render: (row) => {
        if (!row.department) return "—";
        if (Array.isArray(row.department)) return row.department.join(", ");
        return row.department?.name || row.department || "—";
      },
    },
    {
      header: "Requirements",
      render: (row) => {
        if (!row.requirements || !Array.isArray(row.requirements)) return "—";
        return `${row.requirements.length} Requirement(s)`;
      },
    },
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
  ];

  return (
    <GeneralTable
      columns={columns}
      data={localData}
      loading={loading}
      meta={meta}
      rowProps={rowProps}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}

export default JobPositionTable;
