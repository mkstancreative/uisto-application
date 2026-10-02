import { roleLabel } from '../../../utils/roles';
import './adminCommon.css';

const ROLE_TONE = {
  hrm: 'tag-accent',
  registrar: 'tag-blue',
  hoc: 'tag-amber',
  viewer: 'tag-slate',
};

/** Coloured staff-role badge. */
function RoleTag({ role }) {
  return <span className={`tag ${ROLE_TONE[role] ?? 'tag-slate'}`}>{roleLabel(role)}</span>;
}

export default RoleTag;
