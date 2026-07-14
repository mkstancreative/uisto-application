import { Layers } from 'lucide-react';
import React, { useState } from 'react';
import AddButton from '../../../components/ui/AddButton/AddButton';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import { useModal } from '../../../hooks/useModal';
import {
  useSubCadres,
  useDeleteSubCadre,
  useToggleSubCadreStatus,
} from '../../../hooks/useJobs';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import JobCadreMutate from '../../../components/admin/Mutate/JobSubCadreMutate';
import JobSubCadreTable from '../../../components/admin/Tables/JobSubCadreTable';
import JobSubCadreMutate from '../../../components/admin/Mutate/JobSubCadreMutate';

function ManageJobSubCadre() {
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    isActive: true,
  });

  const { data: responseData, isLoading } = useSubCadres(params);
  const rawData = responseData?.data || [];

  const pagination = responseData?.pagination || {};

  const meta = {
    page: pagination?.page || params.page,
    pages: pagination?.totalPages || 1,
    count: pagination?.total || 0,
    limit: params.limit,
    hasPrev: pagination?.hasPrev || false,
    hasNext: pagination?.hasNext || false,
  };

  const handleSearch = (val) => {
    setParams((p) => ({
      ...p,
      search: typeof val === 'string' ? val : val.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleAdd = () => {
    openModal(<JobSubCadreMutate closeModal={closeModal} />);
  };

  const handleEdit = (cadre) => {
    openModal(<JobSubCadreMutate data={cadre} closeModal={closeModal} />);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { mutate: deleteCadre, isPending: deleteLoading } = useDeleteSubCadre();

  const handleDelete = (cadre) => {
    setDeleteTarget(cadre);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const id = deleteTarget._id || deleteTarget.id;

    deleteCadre(
      { id },
      {
        onSuccess: () => {
          toast.success('Job Cadre deleted successfully.');
          setDeleteTarget(null);
          closeModal();
        },
        onError: (err) => toast.error(err?.message || 'Failed to delete cadre'),
      },
    );
  };

  const { mutate: toggleStatus } = useToggleSubCadreStatus();

  const handleToggleStatus = (cadre) => {
    const id = cadre._id || cadre.id;

    toggleStatus(
      { id },
      {
        onSuccess: () => {
          toast.success(`Cadre status toggled successfully.`);
        },
        onError: (err) =>
          toast.error(err?.message || 'Failed to update status'),
      },
    );
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
              <h2 className="page-title">Manage Job Sub Cadres</h2>
              <p className="page-sub">
                {isLoading
                  ? 'Loading…'
                  : `${meta.count || rawData.length} job cadre${(meta.count || rawData.length) !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="Add New Cadre" onClick={handleAdd} />
          </div>
        </div>

        {/* Search */}
        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={handleSearch}
            placeholder="Search by cadre title…"
          />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <JobSubCadreTable
            data={rawData}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
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
        title="Delete Cadre"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name || 'this cadre'}"?`
            : ''
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

export default ManageJobSubCadre;
