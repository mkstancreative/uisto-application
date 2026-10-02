import { Network } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import JobSubCadreMutate from '../../../components/admin/Mutate/JobSubCadreMutate';
import JobSubCadreTable from '../../../components/admin/Tables/JobSubCadreTable';
import ReadOnlyChip from '../../../components/admin/common/ReadOnlyChip';
import TableError from '../../../components/admin/common/TableError';
import { useDebouncedValue } from '../../../components/admin/common/useDebouncedValue';
import AddButton from '../../../components/ui/AddButton/AddButton';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import { errorMessage } from '../../../api/api';
import { useAuth } from '../../../hooks/useAuth';
import { useModal } from '../../../hooks/useModal';
import {
  useDeleteSubcadre,
  useSubcadres,
  useToggleSubcadre,
} from '../../../hooks/useConfig';
import { canWrite } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import '../../../components/admin/common/adminCommon.css';

function ManageSubcadres() {
  const { user } = useAuth();
  const editable = canWrite(user);
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const search = useDebouncedValue(params.search);
  const query = useMemo(() => ({ ...params, search: search.trim() }), [params, search]);

  const { data: response, isLoading, isError, error, refetch } = useSubcadres(query);
  const subcadres = response?.data ?? [];
  const meta = toTableMeta(response, { page: params.page, limit: params.limit });

  const { mutate: toggleSubcadre } = useToggleSubcadre();
  const { mutate: deleteSubcadre, isPending: deleting } = useDeleteSubcadre();

  const handleAdd = () => openModal(<JobSubCadreMutate closeModal={closeModal} />);
  const handleEdit = (row) => openModal(<JobSubCadreMutate data={row} closeModal={closeModal} />);

  const handleToggle = (row) => {
    setTogglingId(row._id);
    toggleSubcadre(row._id, {
      onSuccess: (res) =>
        toast.success(res?.message || `"${row.name}" ${row.isActive ? 'deactivated' : 'activated'}.`),
      onError: (err) => toast.error(errorMessage(err, 'Could not change the subcadre status.')),
      onSettled: () => setTogglingId(null),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteSubcadre(deleteTarget._id, {
      onSuccess: (res) => {
        toast.success(res?.message || 'Subcadre deleted.');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not delete the subcadre.'));
        setDeleteTarget(null);
      },
    });
  };

  const count = meta?.count ?? subcadres.length;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon">
              <Network size={20} />
            </div>
            <div>
              <h2 className="page-title">Subcadres</h2>
              <p className="page-sub">
                {isLoading
                  ? 'Loading…'
                  : `${count} subcadre${count === 1 ? '' : 's'} grouping Non-Academic positions`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {editable ? <AddButton text="Add Subcadre" onClick={handleAdd} /> : <ReadOnlyChip />}
          </div>
        </div>

        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={(val) => setParams((p) => ({ ...p, search: val, page: 1 }))}
            onClear={() => setParams((p) => ({ ...p, search: '', page: 1 }))}
            placeholder="Search by subcadre name…"
          />
        </div>

        <div className="table-wrapper">
          {isError ? (
            <TableError message={errorMessage(error, 'Could not load subcadres.')} onRetry={refetch} />
          ) : (
            <JobSubCadreTable
              data={subcadres}
              loading={isLoading}
              canEdit={editable}
              togglingId={togglingId}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggle={handleToggle}
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
        title="Delete subcadre?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. Non-Academic positions that use it will lose their subcadre — move them to another subcadre first, or deactivate this one instead.`
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

export default ManageSubcadres;
