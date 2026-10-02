import { UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import StaffTable from '../../../components/admin/Tables/StaffTable';
import StaffMutate from '../../../components/admin/Mutate/StaffMutate';
import StaffPasswordReset from '../../../components/admin/Mutate/StaffPasswordReset';
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
import { useDeleteStaffUser, useStaffUsers, useUpdateStaffUser } from '../../../hooks/useStaff';
import { canManageStaff, roleLabel, STAFF_ROLES } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import '../../../components/admin/common/adminCommon.css';

const INITIAL_PARAMS = { page: 1, limit: 10, search: '', role: '', isActive: '' };
const userId = (u) => u?.id ?? u?._id;

function ManageStaff() {
  const { user } = useAuth();
  const manage = canManageStaff(user);
  const { openModal, closeModal } = useModal();

  const [params, setParams] = useState(INITIAL_PARAMS);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const search = useDebouncedValue(params.search);
  const query = useMemo(() => ({ ...params, search: search.trim() }), [params, search]);

  const { data: response, isLoading, isError, error, refetch } = useStaffUsers(query);
  const users = response?.data ?? [];
  const meta = toTableMeta(response, { page: params.page, limit: params.limit });

  const { mutate: updateUser, isPending: toggling } = useUpdateStaffUser();
  const { mutate: deleteUser, isPending: deleting } = useDeleteStaffUser();

  const update = (patch) => setParams((p) => ({ ...p, ...patch, page: 1 }));

  const handleAdd = () => openModal(<StaffMutate closeModal={closeModal} />);
  const handleEdit = (row) =>
    openModal(<StaffMutate data={row} currentUserId={userId(user)} closeModal={closeModal} />);
  const handleReset = (row) => openModal(<StaffPasswordReset user={row} closeModal={closeModal} />);

  const confirmToggle = () => {
    if (!toggleTarget) return;
    const activate = !toggleTarget.isActive;
    updateUser(
      { id: userId(toggleTarget), isActive: activate },
      {
        onSuccess: () => {
          toast.success(`${toggleTarget.name} ${activate ? 'activated' : 'deactivated'}.`);
          setToggleTarget(null);
        },
        onError: (err) => {
          toast.error(errorMessage(err, 'Could not change the account status.'));
          setToggleTarget(null);
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser(userId(deleteTarget), {
      onSuccess: (res) => {
        toast.success(res?.message || 'User deleted.');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not delete the user.'));
        setDeleteTarget(null);
      },
    });
  };

  const count = meta?.count ?? users.length;
  const activating = toggleTarget && !toggleTarget.isActive;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon">
              <UserCog size={20} />
            </div>
            <div>
              <h2 className="page-title">Staff Users</h2>
              <p className="page-sub">
                {isLoading ? 'Loading…' : `${count} staff account${count === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {manage ? <AddButton text="Add Staff User" onClick={handleAdd} /> : <ReadOnlyChip />}
          </div>
        </div>

        <div className="filter-wrapper">
          <SearchInput
            value={params.search}
            onChange={(val) => update({ search: val })}
            onClear={() => update({ search: '' })}
            placeholder="Search by name or email…"
          />
        </div>

        <div className="filter-selects-block wrap-mobile">
          <SelectFilter
            label="Role"
            value={params.role}
            onChange={(val) => update({ role: val })}
            options={[
              { value: '', label: 'All roles' },
              ...STAFF_ROLES.map((r) => ({ value: r, label: roleLabel(r) })),
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
            <TableError message={errorMessage(error, 'Could not load staff accounts.')} onRetry={refetch} />
          ) : (
            <StaffTable
              data={users}
              loading={isLoading}
              currentUserId={userId(user)}
              onEdit={handleEdit}
              onResetPassword={handleReset}
              onToggleActive={setToggleTarget}
              onDelete={setDeleteTarget}
              meta={meta}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
              onLimitChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(toggleTarget)}
        variant={activating ? 'success' : 'danger'}
        title={activating ? 'Activate account?' : 'Deactivate account?'}
        message={
          toggleTarget
            ? activating
              ? `${toggleTarget.name} will be able to sign in again with their current password.`
              : `${toggleTarget.name} will be signed out of every device immediately and won't be able to sign in until the account is reactivated. Their records and history are kept.`
            : ''
        }
        confirmText={activating ? 'Activate' : 'Deactivate'}
        cancelText="Cancel"
        isPending={toggling}
        onConfirm={confirmToggle}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete account permanently?"
        message={
          deleteTarget
            ? `${deleteTarget.name} (${deleteTarget.email}) will be deleted and this cannot be undone. To keep the audit trail of what they did, deactivate the account instead.`
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

export default ManageStaff;
