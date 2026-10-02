import { CheckSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import JobRequirementMutate from '../../../components/admin/Mutate/JobRequirementMutate';
import JobRequirementTable from '../../../components/admin/Tables/JobRequirementTable';
import ReadOnlyChip from '../../../components/admin/common/ReadOnlyChip';
import TableError from '../../../components/admin/common/TableError';
import { useDebouncedValue } from '../../../components/admin/common/useDebouncedValue';
import AddButton from '../../../components/ui/AddButton/AddButton';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import { errorMessage } from '../../../api/api';
import { useAuth } from '../../../hooks/useAuth';
import { useModal } from '../../../hooks/useModal';
import {
  CADRES,
  useDeleteRequirement,
  useRequirements,
  useToggleRequirement,
} from '../../../hooks/useConfig';
import { canWrite } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import '../../../components/admin/common/adminCommon.css';

const INITIAL_PARAMS = { page: 1, limit: 10, search: '', cadre: '', isActive: '' };

function ManageRequirements() {
  const { user } = useAuth();
  const editable = canWrite(user);
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState(INITIAL_PARAMS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const search = useDebouncedValue(params.search);
  const query = useMemo(() => ({ ...params, search: search.trim() }), [params, search]);

  const { data: response, isLoading, isError, error, refetch } = useRequirements(query);
  const requirements = response?.data ?? [];
  const meta = toTableMeta(response, { page: params.page, limit: params.limit });

  const { mutate: toggleRequirement } = useToggleRequirement();
  const { mutate: deleteRequirement, isPending: deleting } = useDeleteRequirement();

  const update = (patch) => setParams((p) => ({ ...p, ...patch, page: 1 }));

  const handleAdd = () => openModal(<JobRequirementMutate closeModal={closeModal} />);
  const handleEdit = (row) => openModal(<JobRequirementMutate data={row} closeModal={closeModal} />);

  const handleToggle = (row) => {
    setTogglingId(row._id);
    toggleRequirement(row._id, {
      onSuccess: (res) =>
        toast.success(
          res?.message || `"${row.name}" ${row.isActive ? 'deactivated' : 'activated'}.`,
        ),
      onError: (err) => toast.error(errorMessage(err, 'Could not change the requirement status.')),
      onSettled: () => setTogglingId(null),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRequirement(deleteTarget._id, {
      onSuccess: (res) => {
        toast.success(res?.message || 'Requirement deleted.');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not delete the requirement.'));
        setDeleteTarget(null);
      },
    });
  };

  const count = meta?.count ?? requirements.length;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon">
              <CheckSquare size={20} />
            </div>
            <div>
              <h2 className="page-title">Requirements</h2>
              <p className="page-sub">
                {isLoading
                  ? 'Loading…'
                  : `${count} requirement${count === 1 ? '' : 's'} · inactive ones can't be attached to new vacancies`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {editable ? <AddButton text="Add Requirement" onClick={handleAdd} /> : <ReadOnlyChip />}
          </div>
        </div>

        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={(val) => update({ search: val })}
            onClear={() => update({ search: '' })}
            placeholder="Search by requirement name…"
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
          <SelectFilter
            label="Status"
            value={params.isActive}
            onChange={(val) => update({ isActive: val })}
            options={[
              { value: '', label: 'Active and inactive' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
          <ResetButton onClick={() => setParams(INITIAL_PARAMS)} />
        </div>

        <div className="table-wrapper">
          {isError ? (
            <TableError message={errorMessage(error, 'Could not load requirements.')} onRetry={refetch} />
          ) : (
            <JobRequirementTable
              data={requirements}
              loading={isLoading}
              canEdit={editable}
              togglingId={togglingId}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              meta={meta}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
              onLimitChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete requirement?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. If positions still use it, deactivate it instead — they keep it, but it can't be attached to new vacancies.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        isPending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default ManageRequirements;
