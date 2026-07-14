import React from 'react';
import {
  CalendarDays,
  GraduationCap,
  Building2,
  Layers,
  BookOpen,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTimeTableById } from '../../../hooks/useTimeTable';
import CustomModal from '../../ui/CustomModal/CustomModal';

/* ─── tiny helpers ─── */
const Row = ({ icon, label, value }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}
  >
    <span style={{ color: '#6366f1', marginTop: 1, flexShrink: 0 }}>
      {icon}
    </span>
    <span
      style={{
        minWidth: 120,
        color: 'var(--text-muted,#94a3b8)',
        fontSize: 13,
      }}
    >
      {label}
    </span>
    <span
      style={{
        flex: 1,
        color: 'var(--text-primary,#f1f5f9)',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {value ?? '—'}
    </span>
  </div>
);

const Pill = ({ label, color = '#6366f1', bg = 'rgba(99,102,241,0.12)' }) => (
  <span
    style={{
      background: bg,
      color,
      borderRadius: 6,
      padding: '3px 12px',
      fontSize: 12,
      fontWeight: 700,
      display: 'inline-block',
    }}
  >
    {label}
  </span>
);

function TimeTableView({ row, onClose }) {
  const { data: res, isLoading, isError } = useTimeTableById(row?.id);

  /* API shape: { success, message: { ...timetable } } */
  const tt = res?.message ?? res?.data ?? null;

  const renderBody = () => {
    if (isLoading) {
      return (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            color: 'var(--text-muted,#94a3b8)',
          }}
        >
          <Loader2
            size={30}
            color="#6366f1"
            style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }}
          />
          <p style={{ fontSize: 14, margin: 0 }}>Loading timetable…</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    if (isError || !tt) {
      return (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <AlertCircle
            size={36}
            color="#ef4444"
            style={{ opacity: 0.5, marginBottom: 10 }}
          />
          <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>
            Failed to load timetable details.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Summary tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.12)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 20,
          }}
        >
          {[
            {
              label: 'Session',
              value: tt.session?.name ?? '—',
              icon: <CalendarDays size={13} />,
            },
            {
              label: 'Semester',
              value: tt.semester?.name ?? '—',
              icon: <Clock size={13} />,
            },
            {
              label: 'Level',
              value: tt.level?.name ?? '—',
              icon: <GraduationCap size={13} />,
            },
            {
              label: 'Department',
              value: tt.department?.name ?? '—',
              icon: <Building2 size={13} />,
            },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                {icon} {label}
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Detail rows */}
        <div>
          <Row
            icon={<BookOpen size={14} />}
            label="Department"
            value={`${tt.department?.name ?? '—'} (${tt.department?.deptcode ?? '—'})`}
          />
          <Row
            icon={<Layers size={14} />}
            label="Level"
            value={tt.level?.name}
          />
          <Row
            icon={<Clock size={14} />}
            label="Semester"
            value={tt.semester?.name}
          />
          <Row
            icon={<CalendarDays size={14} />}
            label="Session"
            value={tt.session?.name}
          />
          {/* <Row icon={<GraduationCap size={14} />}  label="School Dept."   value={tt.department?.faculty_id ? `School ID: ${tt.department.faculty_id}` : "—"} /> */}
          <Row
            icon={<BookOpen size={14} />}
            label="Max Units"
            value={tt.department?.maxunit ?? '—'}
          />

          {/* Date added */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0',
            }}
          >
            <span style={{ color: '#6366f1', flexShrink: 0 }}>
              <Clock size={14} />
            </span>
            <span style={{ minWidth: 120, color: '#94a3b8', fontSize: 13 }}>
              Date Added
            </span>
            <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>
              {tt.dateadded ? new Date(tt.dateadded).toLocaleString() : '—'}
            </span>
          </div>
        </div>
      </>
    );
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Timetable Details"
      subtitle={
        tt
          ? `${tt.department?.name ?? '—'} · ${tt.level?.name ?? '—'} · ${tt.session?.name ?? '—'}`
          : 'Loading…'
      }
      size="default"
      icon={<CalendarDays size={16} color="#6366f1" />}
    >
      {renderBody()}
    </CustomModal>
  );
}

export default TimeTableView;
