import { Briefcase } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import JobMutate from '../../../components/admin/Mutate/JobMutate';
import JobTable from '../../../components/admin/Tables/JobTable';
import JobView from '../../../components/admin/view/JobView';
import ReadOnlyChip from '../../../components/admin/common/ReadOnlyChip';
import TableError from '../../../components/admin/common/TableError';
import { useDebouncedValue } from '../../../components/admin/common/useDebouncedValue';
import { departmentsFrom, makeSubcadreName } from '../../../components/admin/common/refs';
import AddButton from '../../../components/ui/AddButton/AddButton';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import { errorMessage } from '../../../api/api';
import { useAuth } from '../../../hooks/useAuth';
import { useModal } from '../../../hooks/useModal';
import { jobTitle, useJobs, useToggleJob } from '../../../hooks/useJobs';
import { CADRES, useAllPositions, useAllSubcadres } from '../../../hooks/useConfig';
import { canWrite } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import '../../../components/admin/common/adminCommon.css';

const INITIAL_PARAMS = { page: 1, limit: 10, search: '', cadre: '', department: '' };

function ManageJobs() {
  const { user } = useAuth();
  const editable = canWrite(user);
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState(INITIAL_PARAMS);
  const [pendingToggle, setPendingToggle] = useState(null);

  const search = useDebouncedValue(params.search);
  const department = useDebouncedValue(params.department);
  const query = useMemo(
    () => ({ ...params, search: search.trim(), department: department.trim() }),
    [params, search, department],
  );

  const { data: response, isLoading, isError, error, refetch } = useJobs(query);
  const jobs = response?.data ?? [];
  const meta = toTableMeta(response, { page: params.page, limit: params.limit });

  const { data: posRes } = useAllPositions();
  const { data: subRes } = useAllSubcadres();
  const departments = useMemo(() => departmentsFrom(posRes?.data ?? []), [posRes]);
  const subcadreName = useMemo(() => makeSubcadreName(subRes?.data ?? []), [subRes]);

  const { mutate: toggleJob, isPending: toggling } = useToggleJob();

  const update = (patch) => setParams((p) => ({ ...p, ...patch, page: 1 }));

  const handleAdd = () => openModal(<JobMutate closeModal={closeModal} />);
  const handleEdit = (row) => openModal(<JobMutate data={row} closeModal={closeModal} />);
  const handleView = (row) => openModal(<JobView id={row._id} closeModal={closeModal} />);

  const confirmToggle = () => {
    if (!pendingToggle) return;
    const closing = pendingToggle.isActive;
    toggleJob(pendingToggle._id, {
      onSuccess: (res) => {
        toast.success(res?.message || (closing ? 'Vacancy closed.' : 'Vacancy reopened.'));
        setPendingToggle(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not change the vacancy status.'));
        setPendingToggle(null);
      },
    });
  };

  const count = meta?.count ?? jobs.length;
  const closing = pendingToggle?.isActive;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="page-title">Vacancies</h2>
              <p className="page-sub">
                {isLoading ? 'Loading…' : `${count} vacanc${count === 1 ? 'y' : 'ies'}, open and closed`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {editable ? (
              <AddButton text="Open Vacancy" onClick={handleAdd} />
            ) : (
              <ReadOnlyChip />
            )}
          </div>
        </div>

        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={(val) => update({ search: val })}
            onClear={() => update({ search: '' })}
            placeholder="Search by position title…"
          />
        </div>

        <div className="filter-selects-block wrap-mobile">
          <SelectFilter
            label="Cadre"
            value={params.cadre}
            onChange={(val) => update({ cadre: val })}
            options={[
              { value: '', label: 'All cadres' },
              ...CADRES.map((c) => ({ value: c, label: c })),
            ]}
          />

          <div className="filter-container">
            <label className="filter-label" htmlFor="jobs-dept-filter">
              Department
            </label>
            <div className="select-wrapper">
              <input
                id="jobs-dept-filter"
                className="filter-select filter-text"
                list="jobs-dept-options"
                placeholder="Any department"
                value={params.department}
                onChange={(e) => update({ department: e.target.value })}
              />
              <datalist id="jobs-dept-options">
                {departments.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <ResetButton onClick={() => setParams(INITIAL_PARAMS)} />
        </div>

        <div className="table-wrapper">
          {isError ? (
            <TableError message={errorMessage(error, 'Could not load vacancies.')} onRetry={refetch} />
          ) : (
            <JobTable
              data={jobs}
              loading={isLoading}
              canEdit={editable}
              onView={handleView}
              onEdit={handleEdit}
              onToggle={(row) => setPendingToggle(row)}
              togglingId={toggling ? pendingToggle?._id : null}
              subcadreName={subcadreName}
              meta={meta}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
              onLimitChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingToggle)}
        variant={closing ? 'danger' : 'success'}
        title={closing ? 'Close vacancy?' : 'Reopen vacancy?'}
        message={
          pendingToggle
            ? closing
              ? `"${jobTitle(pendingToggle)}" will stop accepting applications and disappear from the careers site. Existing applications are kept.`
              : `"${jobTitle(pendingToggle)}" will accept applications again until its deadline${
                  pendingToggle.applicationDeadline && new Date(pendingToggle.applicationDeadline) < new Date()
                    ? ' — but that deadline has passed, so edit it first or it will stay closed to applicants'
                    : ''
                }.`
            : ''
        }
        confirmText={closing ? 'Close' : 'Reopen'}
        cancelText="Cancel"
        isPending={toggling}
        onConfirm={confirmToggle}
        onCancel={() => setPendingToggle(null)}
      />
    </>
  );
}

export default ManageJobs;
