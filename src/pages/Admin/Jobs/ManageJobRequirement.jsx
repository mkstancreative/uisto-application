import { CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import JobRequirementMutate from '../../../components/admin/Mutate/JobRequirementMutate';
import JobRequirementTable from '../../../components/admin/Tables/JobRequirementTable';
import AddButton from '../../../components/ui/AddButton/AddButton';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import { useModal } from '../../../hooks/useModal';
import {
  useDeleteRequirement,
  useRequirements,
  useToggleRequirementStatus,
} from '../../../hooks/useJobs';

function ManageJobRequirement() {
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data: responseData, isLoading } = useRequirements(params);
  const requirements = responseData?.data || [];

  const meta = {
    page: responseData?.page || params.page,
    pages: Math.ceil((responseData?.total || 0) / params.limit) || 1,
    count: responseData?.total || 0,
    limit: params.limit,
    hasPrev: (responseData?.page || params.page) > 1,
    hasNext:
      (responseData?.page || params.page) <
      (Math.ceil((responseData?.total || 0) / params.limit) || 1),
  };

  const handleSearch = (val) => {
    setParams((p) => ({
      ...p,
      search: typeof val === 'string' ? val : val.target.value,
      page: 1,
    }));
  };

  const { mutate: toggleRequirementStatus } = useToggleRequirementStatus();

  const handleAdd = () => {
    openModal(<JobRequirementMutate closeModal={closeModal} />);
  };

  const handleEdit = (requirement) => {
    openModal(
      <JobRequirementMutate data={requirement} closeModal={closeModal} />,
    );
  };

  const handleToggle = (requirement) => {
    const id = requirement._id || requirement.id;
    toggleRequirementStatus(
      { id },
      {
        onSuccess: () =>
          toast.success(
            `${requirement.name} has been ${requirement.isActive ? 'deactivated' : 'activated'}!`,
          ),
        onError: (err) =>
          toast.error(err?.message || 'Failed to toggle status'),
      },
    );
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { mutate: deleteRequirement, isPending: deleteLoading } =
    useDeleteRequirement();

  const handleDelete = (requirement) => {
    setDeleteTarget(requirement); // store full object
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const id = deleteTarget._id || deleteTarget.id;

    deleteRequirement(
      { id },
      {
        onSuccess: () => {
          toast.success('Job Requirement deleted successfully.');
          setDeleteTarget(null);
          closeModal();
        },
        onError: (err) =>
          toast.error(err?.message || 'Failed to delete requirement'),
      },
    );
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <CheckSquare size={20} />
            </div>
            <div>
              <h2 className="page-title">Manage Job Requirements</h2>
              <p className="page-sub">
                {isLoading
                  ? 'Loading…'
                  : `${meta.count || requirements.length} job requirement${(meta.count || requirements.length) !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="Add New Requirement" onClick={handleAdd} />
          </div>
        </div>

        {/* Search */}
        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={handleSearch}
            placeholder="Search by requirement name…"
          />
        </div>

        <div className="filter-selects-block">
          <ResetButton
            onClick={() => setParams({ page: 1, limit: 10, search: '' })}
          />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <JobRequirementTable
            data={requirements}
            loading={isLoading}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
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
        title="Delete Requirement"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name || 'this requirement'}"?`
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

export default ManageJobRequirement;
