import React from 'react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import { Pencil, Trash2, Download } from 'lucide-react';
import { BASE_URL } from '../../../api/api';

function ELibraryTable({
  data = [],
  loading = false,
  meta,
  onEdit,
  onPageChange,
  onLimitChange,

  onDelete,
  isDeleting,
}) {
  const columns = [
    {
      header: 'S/N',
      render: (_, i) => i + 1,
    },

    {
      header: 'Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {row.title || '—'}
          </div>

          {row.author?.trim() && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted,#94a3b8)',
              }}
            >
              by {row.author}
            </div>
          )}
        </div>
      ),
    },

    {
      header: 'Department',
      render: (row) => row.department?.name ?? '—',
    },

    {
      header: 'Pub. Date',
      render: (row) => (row.pubdate?.trim() ? row.pubdate : '—'),
    },

    // {
    //   header: "Views",
    //   render: (row) => (
    //     <span style={{ fontWeight: 600 }}>
    //       {row.viewcount ?? 0}
    //     </span>
    //   ),
    // },

    // {
    //   header: "File",
    //   render: (row) =>
    //     row.filenameurl ? (
    //       <button
    //         title="Download file"
    //         disabled={isDownloading}
    //         onClick={() =>
    //           onDownload?.(Number(row.id), {
    //             onSuccess: (res) => {
    //               if (!res?.success) return;

    //               const a = document.createElement("a");
    //               a.href = `${BASE_URL}${res.url}`; // ✅ use API url
    //               a.download = res.filename;        // ✅ use API filename
    //               document.body.appendChild(a);
    //               a.click();
    //               document.body.removeChild(a);
    //             },
    //           })
    //         }
    //         style={{
    //           display: "inline-flex",
    //           alignItems: "center",
    //           gap: 4,
    //           fontSize: 12,
    //           fontWeight: 600,
    //           color: isDownloading ? "#a5b4fc" : "#6366f1",
    //           textDecoration: "none",
    //           background: "rgba(99, 102, 241, 0.1)",
    //           padding: "4px 10px",
    //           borderRadius: 6,
    //           border: "none",
    //           cursor: isDownloading ? "not-allowed" : "pointer",
    //           transition: "background 0.15s",
    //         }}
    //         onMouseEnter={(e) => {
    //           if (!isDownloading)
    //             e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
    //         }}
    //         onMouseLeave={(e) => {
    //           e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
    //         }}
    //       >
    //         <Download size={13} />
    //         {isDownloading ? "Downloading…" : "Download"}
    //       </button>
    //     ) : (
    //       "—"
    //     ),
    // },

    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: <Pencil size={13} />,
              onClick: () => onEdit?.(row),
            },
            {
              label: 'Delete',
              icon: <Trash2 size={13} />,
              danger: true,
              disabled: isDeleting,
              onClick: () => onDelete?.(row),
            },
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

export default ELibraryTable;
