import React from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { User, Activity, Clock, Shield, Loader2 } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';
import './UserLogsView.css';
import { useUserLogs } from '../../../hooks/useSettings';

function InfoRow({ label, value }) {
  return (
    <div className="logs-view-info-row">
      <span className="logs-view-info-label">{label}</span>
      <span className="logs-view-info-value">{value ?? '—'}</span>
    </div>
  );
}

function UserLogsView({ data: row, closeModal }) {
  /* ── Identify the user_id to query ─────────────────────────────────── */
  const userId = row?.user_id ?? row?.user?.id ?? row?.id ?? null;

  /* ── Fetch this admin's activity logs via POST /admins/apiViewActivityLogs */
  const { data: logsResponse, isLoading, isError } = useUserLogs(userId);
  if (!row) return null;

  /* ── Resolve fields — prefer fetched data, fall back to raw row ─────── */
  const fetched = logsResponse?.data ?? null;
  const admin = fetched ?? row;
  const user = admin?.user ?? row?.user ?? {};
  const logs = user?.logs ?? fetched?.logs ?? [];

  const fullName =
    [admin?.surname ?? row?.surname, admin?.lastname ?? row?.lastname]
      .filter(Boolean)
      .join(' ') || '—';

  const initials =
    `${(admin?.surname ?? row?.surname ?? ' ')[0]}${(admin?.lastname ?? row?.lastname ?? ' ')[0]}`.toUpperCase();

  return (
    <CustomModal
      isOpen
      title="User Activity Logs"
      subtitle={`${fullName} — ${
        isLoading
          ? 'Loading…'
          : `${logs.length} log entr${logs.length === 1 ? 'y' : 'ies'}`
      }`}
      size="wide"
      onClose={closeModal}
      footer={
        <button className="modal-cancel" onClick={closeModal}>
          Close
        </button>
      }
    >
      <div className="logs-view">
        {/* ── Hero strip ── */}
        <div className="logs-view-hero">
          <div className="logs-view-avatar">{initials}</div>
          <div style={{ flex: 1 }}>
            <h3 className="logs-view-hero-name">{fullName}</h3>
            <p className="logs-view-hero-meta">
              {user?.username ?? row?.user?.username ?? '—'}
              &nbsp;·&nbsp;
              {admin?.profile ?? row?.profile ?? 'Admin'}
            </p>
          </div>
          <StatusBadge
            status={user?.userstatus ?? admin?.status ?? row?.status ?? '—'}
          />
        </div>

        {/* ── Two-column info ── */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
        >
          {/* Admin details */}
          <div>
            <div className="logs-view-section-title">
              <User size={12} /> Admin Details
            </div>
            <InfoRow label="Full Name" value={fullName} />
            <InfoRow label="Phone" value={admin?.phone ?? row?.phone} />
            <InfoRow label="Address" value={admin?.address ?? row?.address} />
            <InfoRow label="Profile" value={admin?.profile ?? row?.profile} />
            <InfoRow
              label="Department"
              value={admin?.department?.name ?? row?.department?.name}
            />
          </div>

          {/* Account details */}
          <div>
            <div className="logs-view-section-title">
              <Shield size={12} /> Account Details
            </div>
            <InfoRow
              label="Username"
              value={user?.username ?? row?.user?.username}
            />
            <InfoRow
              label="Status"
              value={user?.userstatus ?? row?.user?.userstatus}
            />
            <InfoRow label="Gender" value={user?.gender ?? row?.user?.gender} />
            <InfoRow label="Phone" value={user?.phone ?? row?.user?.phone} />
            <InfoRow
              label="Account Created"
              value={formatDate(user?.created_date ?? row?.user?.created_date)}
            />
          </div>
        </div>

        {/* ── Activity log timeline ── */}
        <div>
          <div className="logs-view-section-title">
            <Activity size={12} /> Activity Logs
            {!isLoading && (
              <span style={{ marginLeft: 4, fontWeight: 400 }}>
                ({logs.length})
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '24px 0',
                color: 'var(--text-muted,#64748b)',
                fontSize: 13,
              }}
            >
              <Loader2
                size={18}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              Fetching activity logs…
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <p
              className="logs-view-empty"
              style={{ color: 'var(--danger,#e74c3c)' }}
            >
              ⚠ Failed to load activity logs. Please try again.
            </p>
          )}

          {/* Empty */}
          {!isLoading && !isError && logs.length === 0 && (
            <p className="logs-view-empty">
              No activity logs found for this user.
            </p>
          )}

          {/* Log entries */}
          {!isLoading && !isError && logs.length > 0 && (
            <div className="logs-view-list">
              {logs.map((log, i) => (
                <div key={log.id ?? i} className="logs-view-item">
                  <div className={`logs-view-item-dot ${log.type ?? ''}`} />
                  <div className="logs-view-item-body">
                    <div className="logs-view-item-title">
                      {log.title ?? log.action ?? 'Activity'}
                    </div>
                    {log.description && log.description !== log.title && (
                      <div className="logs-view-item-desc">
                        {log.description}
                      </div>
                    )}
                    {log.ip && (
                      <div className="logs-view-item-desc">IP: {log.ip}</div>
                    )}
                  </div>
                  <div className="logs-view-item-right">
                    <div className="logs-view-item-time">
                      <Clock
                        size={10}
                        style={{ display: 'inline', marginRight: 3 }}
                      />
                      {formatDate(log.timestamp ?? log.created_at)}
                    </div>
                    {log.type && (
                      <div className={`logs-view-type-badge ${log.type}`}>
                        {log.type}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spinner keyframe for Loader2 */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </CustomModal>
  );
}

export default UserLogsView;
