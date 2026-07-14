import { Briefcase } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import JobMutate from '../../../components/admin/Mutate/JobMutate';
import JobTable from '../../../components/admin/Tables/JobTable';
import JobView from '../../../components/admin/view/JobView';
import AddButton from '../../../components/ui/AddButton/AddButton';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import { useModal } from '../../../hooks/useModal';
import { useChangeJobStatus, useJobs } from '../../../hooks/useJobs';

const INITIAL_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  cadre: '',
  active: true,
};

function ManageJobs() {
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState(INITIAL_PARAMS);

  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  /* ── Mutation ── */
  const { mutate: changeJobStatus, isPending: isChangingStatus } =
    useChangeJobStatus();

  /* ── Data ── */
  const { data: response, isLoading } = useJobs(params);
  const jobs = useMemo(() => response?.data ?? [], [response]);

  const totalRecords = response?.total ?? response?.pagination?.total ?? 0;
  const currentPage =
    response?.page ?? response?.pagination?.page ?? params.page;
  const totalPages = Math.ceil(totalRecords / params.limit) || 1;
  const meta = {
    page: currentPage,
    pages: totalPages,
    count: totalRecords,
    limit: params.limit,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };

  /* ── Handlers ── */
  const handleAdd = () =>
    openModal(<JobMutate data={{}} closeModal={closeModal} />);

  const handleEdit = (row) =>
    openModal(<JobMutate data={row} closeModal={closeModal} />);

  const handleView = (row) =>
    openModal(<JobView id={row._id} closeModal={closeModal} />);

  const handleToggleJobStatus = (row, checked) => {
    setPendingStatusChange({ job: row, newStatus: checked });
  };

  const confirmChangeStatus = () => {
    if (!pendingStatusChange) return;
    const { job, newStatus } = pendingStatusChange;

    changeJobStatus(
      { id: job._id, isOpen: newStatus },
      {
        onSuccess: () => {
          toast.success('Job status changed successfully.');
          setPendingStatusChange(null);
        },
        onError: (err) => {
          toast.error(err?.message || 'Could not change job status.');
          setPendingStatusChange(null);
        },
      },
    );
  };

  // SelectFilter passes the value string directly — no e.target.value needed
  const handleCadreChange = (val) => {
    setParams((p) => ({ ...p, cadre: val, page: 1 }));
  };

  const handleActiveChange = (val) => {
    setParams((p) => ({ ...p, active: val, page: 1 }));
  };

  /* ── Render ── */
  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="page-title">Manage Jobs</h2>
              <p className="page-sub">
                {isLoading
                  ? 'Loading…'
                  : `${meta?.count ?? jobs.length} job posting${
                      (meta?.count ?? jobs.length) !== 1 ? 's' : ''
                    }`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="Add New Job" onClick={handleAdd} />
          </div>
        </div>

        {/* Search */}
        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={(val) =>
              setParams((p) => ({
                ...p,
                search: typeof val === 'string' ? val : val.target.value,
                page: 1,
              }))
            }
            placeholder="Search by title, rank, or cadre…"
          />
        </div>

        {/* Filters */}
        <div className="filter-selects-block">
          {/* Cadre */}
          <SelectFilter
            label="Cadre"
            value={params.cadre}
            onChange={handleCadreChange}
            options={[
              { value: 'Academic', label: 'Academic' },
              { value: 'Non-Academic', label: 'Non-Academic' },
            ]}
          />

          {/* Status */}
          <SelectFilter
            label="Status"
            value={params.active}
            onChange={handleActiveChange}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />

          <ResetButton onClick={() => setParams(INITIAL_PARAMS)} />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <JobTable
            data={jobs}
            loading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onToggleJobStatus={handleToggleJobStatus}
            changingId={pendingStatusChange?.job?._id}
            meta={meta}
            onPageChange={(page) => setParams((p) => ({ ...p, page }))}
            onLimitChange={(limit) =>
              setParams((p) => ({ ...p, limit, page: 1 }))
            }
          />
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(pendingStatusChange)}
        variant="success"
        title="Change Job Status"
        message={
          pendingStatusChange
            ? `Are you sure you want to change the status of "${
                pendingStatusChange.job.position?.title ?? 'this job'
              }"?`
            : ''
        }
        confirmText="Yes, Change"
        cancelText="Cancel"
        isPending={isChangingStatus}
        onConfirm={confirmChangeStatus}
        onCancel={() => setPendingStatusChange(null)}
      />
    </>
  );
}

export default ManageJobs;
