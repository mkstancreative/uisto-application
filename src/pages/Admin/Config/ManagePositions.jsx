import { Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import JobPositionMutate from '../../../components/admin/Mutate/JobPositionMutate';
import JobPositionTable from '../../../components/admin/Tables/JobPositionTable';
import ReadOnlyChip from '../../../components/admin/common/ReadOnlyChip';
import TableError from '../../../components/admin/common/TableError';
import { useDebouncedValue } from '../../../components/admin/common/useDebouncedValue';
import { departmentsFrom, makeSubcadreName, refId } from '../../../components/admin/common/refs';
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
  useAllPositions,
  useAllSubcadres,
  useDeletePosition,
  usePositions,
  useReorderPosition,
} from '../../../hooks/useConfig';
import { canWrite } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import '../../../components/admin/common/adminCommon.css';

const INITIAL_PARAMS = { page: 1, limit: 10, search: '', cadre: '', department: '', subcadre: '' };

function ManagePositions() {
  const { user } = useAuth();
  const editable = canWrite(user);
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState(INITIAL_PARAMS);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const search = useDebouncedValue(params.search);
  const query = useMemo(() => ({ ...params, search: search.trim() }), [params, search]);

  const { data: response, isLoading, isError, error, refetch } = usePositions(query);
  const positions = response?.data ?? [];
  const meta = toTableMeta(response, { page: params.page, limit: params.limit });

  const { data: allPosRes } = useAllPositions();
  const { data: subRes } = useAllSubcadres();
  const departments = useMemo(() => departmentsFrom(allPosRes?.data ?? []), [allPosRes]);
  const subcadres = useMemo(() => subRes?.data ?? [], [subRes]);
  const subcadreName = useMemo(() => makeSubcadreName(subcadres), [subcadres]);

  const { mutate: deletePosition, isPending: deleting } = useDeletePosition();
  const { mutateAsync: reorderPosition } = useReorderPosition();

  const update = (patch) => setParams((p) => ({ ...p, ...patch, page: 1 }));

  const handleAdd = () => openModal(<JobPositionMutate closeModal={closeModal} />);
  const handleEdit = (row) => openModal(<JobPositionMutate data={row} closeModal={closeModal} />);

  const handleReorder = (dragged, target) => {
    const newOrder = target?.displayOrder;
    if (newOrder === undefined || newOrder === null) {
      toast.error('Could not work out the new position order.');
      return Promise.reject(new Error('missing displayOrder'));
    }
    return reorderPosition({ id: refId(dragged), newOrder })
      .then((res) => toast.success(res?.message || `"${dragged.title}" moved to position ${newOrder}.`))
      .catch((err) => {
        toast.error(errorMessage(err, 'Could not reorder the position.'));
        throw err;
      });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePosition(refId(deleteTarget), {
      onSuccess: (res) => {
        toast.success(res?.message || 'Position deleted.');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not delete the position.'));
        setDeleteTarget(null);
      },
    });
  };

  const count = meta?.count ?? positions.length;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="page-title">Positions</h2>
              <p className="page-sub">
                {isLoading
                  ? 'Loading…'
                  : `${count} position${count === 1 ? '' : 's'}${
                      editable ? ' · drag rows to change the careers-page order' : ''
                    }`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {editable ? <AddButton text="Add Position" onClick={handleAdd} /> : <ReadOnlyChip />}
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
            onChange={(val) => update({ cadre: val, department: '', subcadre: '' })}
            options={[
              { value: '', label: 'All cadres' },
              ...CADRES.map((c) => ({ value: c, label: c })),
            ]}
          />

          {params.cadre !== 'Non-Academic' && (
            <SelectFilter
              label="Department"
              value={params.department}
              onChange={(val) => update({ department: val })}
              options={[
                { value: '', label: 'All departments' },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
            />
          )}

          {params.cadre !== 'Academic' && (
            <SelectFilter
              label="Subcadre"
              value={params.subcadre}
              onChange={(val) => update({ subcadre: val })}
              options={[
                { value: '', label: 'All subcadres' },
                ...subcadres.map((s) => ({ value: refId(s), label: s.name })),
              ]}
            />
          )}

          <ResetButton onClick={() => setParams(INITIAL_PARAMS)} />
        </div>

        <div className="table-wrapper">
          {isError ? (
            <TableError message={errorMessage(error, 'Could not load positions.')} onRetry={refetch} />
          ) : (
            <JobPositionTable
              data={positions}
              loading={isLoading}
              canEdit={editable}
              subcadreName={subcadreName}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onReorder={handleReorder}
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
        title="Delete position?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently deleted. If a vacancy for this position is still active, close that vacancy first — deleting the position may fail or leave the vacancy without a position.`
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

export default ManagePositions;
