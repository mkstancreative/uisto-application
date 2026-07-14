import { Layers } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import JobPositionMutate from "../../../components/admin/Mutate/JobPositionMutate";
import JobPositionTable from "../../../components/admin/Tables/JobPositionTable";
import AddButton from "../../../components/ui/AddButton/AddButton";
import ConfirmModal from "../../../components/ui/ConfirmModal/ConfirmModal";
import ResetButton from "../../../components/ui/ResetButton/ResetButton";
import SearchInput from "../../../components/ui/SearchInput/SearchInput";
import SelectFilter from "../../../components/ui/SelectFilters/SelectFilters";
import { useModal } from "../../../hooks/useModal";
import {
  useDeletePosition,
  usePositions,
  useReorderPosition,
  useSubCadres,
} from "../../../hooks/useJobs";

function ManageJobPositions() {
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    subcadre: "",
    cadre: "Academic",
  });

  // Strip empty strings so they don't pollute the query string
  const cleanParams = useMemo(() => {
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== ""),
    );
  }, [params]);

  const { data: responseData, isLoading } = usePositions(cleanParams);
  const rawData = responseData?.data || [];

  // Fetch all subcadres upfront (high limit) so the dropdown is always fully populated
  const { data: subcadresRes } = useSubCadres({ limit: 1000 });
  const allSubCadres = useMemo(
    () => subcadresRes?.data ?? [],
    [subcadresRes?.data],
  );

  // Only show subcadres that match the currently selected cadre
  const filteredSubCadres = useMemo(
    () => allSubCadres.filter((s) => !params.cadre || s.cadre === params.cadre),
    [allSubCadres, params.cadre],
  );

  const pagination = responseData?.pagination || {};

  const meta = {
    page: pagination?.page || params.page,
    pages: pagination?.totalPages || 1,
    count: pagination?.total || 0,
    limit: params.limit,
    hasPrev: pagination?.hasPrev || false,
    hasNext:
      (responseData?.page || params.page) <
      (Math.ceil((responseData?.total || 0) / params.limit) || 1),
  };

  const handleSearch = (val) => {
    setParams((p) => ({
      ...p,
      search: typeof val === "string" ? val : val.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleAdd = () => {
    openModal(<JobPositionMutate closeModal={closeModal} />);
  };

  const handleEdit = (position) => {
    openModal(<JobPositionMutate data={position} closeModal={closeModal} />);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { mutate: deletePosition, isPending: deleteLoading } =
    useDeletePosition();

  const handleDelete = (position) => {
    setDeleteTarget(position);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const id = deleteTarget._id || deleteTarget.id;

    deletePosition(
      { id },
      {
        onSuccess: () => {
          toast.success("Job Position deleted successfully.");
          setDeleteTarget(null);
          closeModal();
        },
        onError: (err) =>
          toast.error(err?.message || "Failed to delete position"),
      },
    );
  };

  const { mutate: reorderPosition } = useReorderPosition();

  const handleReorder = (draggedItem, localDropIndex) => {
    const id = draggedItem._id || draggedItem.id;

    const absoluteIndex =
      ((meta.page || 1) - 1) * (meta.limit || 10) + localDropIndex;
    const newOrder = absoluteIndex + 1;

    reorderPosition(
      {
        id,
        newOrder,
        order: newOrder,
        position: newOrder,
      },
      {
        onSuccess: () => toast.success("Positions reordered successfully."),
        onError: (err) =>
          toast.error(err?.message || "Failed to reorder position"),
      },
    );
  };

  const handleCadreChange = (val) => {
    setParams((p) => ({ ...p, cadre: val, subcadre: "", page: 1 }));
  };

  const handleSubCadreChange = (val) => {
    setParams((p) => ({ ...p, subcadre: val, page: 1 }));
  };

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="page-title">Manage Job Positions</h2>
              <p className="page-sub">
                {isLoading
                  ? "Loading…"
                  : `${meta.count || rawData.length} job position${(meta.count || rawData.length) !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="Add New Position" onClick={handleAdd} />
          </div>
        </div>

        {/* Search */}
        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={handleSearch}
            placeholder="Search by position title…"
          />
        </div>

        <div className="filter-selects-block">
          {/* Cadre */}
          <SelectFilter
            label="Cadre"
            value={params.cadre}
            onChange={handleCadreChange}
            options={[
              { value: "Academic", label: "Academic" },
              { value: "Non-Academic", label: "Non-Academic" },
            ]}
          />
          {/* Sub Cadre */}
          {params.cadre === "Non-Academic" && (
            <SelectFilter
              label="Sub Cadre"
              value={params.subcadre}
              onChange={handleSubCadreChange}
              options={filteredSubCadres.map((sc) => ({
                value: sc._id,
                label: sc.name,
              }))}
            />
          )}
          <ResetButton
            onClick={() =>
              setParams({
                page: 1,
                limit: 10,
                search: "",
                subcadre: "",
                cadre: "Academic",
              })
            }
          />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <JobPositionTable
            data={rawData}
            subcadres={allSubCadres}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            meta={meta}
            onPageChange={handlePageChange}
            onLimitChange={(limit) =>
              setParams((p) => ({ ...p, limit, page: 1 }))
            }
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete Position"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title || "this position"}"?`
            : ""
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isPending={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default ManageJobPositions;
