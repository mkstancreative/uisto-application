import React, { useState } from 'react';
import {
  ListChecks,
  Download,
  Star,
  Award,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../../components/ui/Spinner/Spinner';
import ShortlistedCandidatesTable from '../../../components/admin/Tables/ShortlistedCandidatesTable';
import {
  useJobs,
  useGenerateShortListCandidates,
  useGetShortListResultPerJob,
  useGetShortListedCandidatesPerJob,
  useExportShortListedCandidatesPerJob,
} from '../../../hooks/useJobs';

function ShortlistManagement() {
  /* ── Job selector + form state ── */
  const { data: jobsRes } = useJobs({ count: 1000 });
  const jobs = jobsRes?.data ?? [];

  const [selectedJobId, setSelectedJobId] = useState('');
  const [minScore, setMinScore] = useState(1);

  /* ── Candidates table params ── */
  const [candidateParams] = useState({ page: 1, limit: 10 });

  /* ── Queries ── */
  const {
    data: shortlistRes,
    isLoading: shortlistLoading,
    refetch: refetchShortlist,
  } = useGetShortListResultPerJob(selectedJobId);

  const shortlistRecord = shortlistRes?.data?.[0] ?? null; // first entry in array
  const criteria = shortlistRecord?.criteriaUsed ?? {};

  const { data: candidatesRes, isLoading: candidatesLoading } =
    useGetShortListedCandidatesPerJob(selectedJobId, candidateParams);

  const candidateList = candidatesRes?.data ?? [];
  const candidateCount = candidatesRes?.count ?? 0;

  /* ── Mutations ── */
  const { mutate: generateShortlist, isPending: isGenerating } =
    useGenerateShortListCandidates();
  const { mutate: exportFile, isPending: isExporting } =
    useExportShortListedCandidatesPerJob();

  /* ── Generate ── */
  const handleGenerate = () => {
    if (!selectedJobId) {
      toast.warning('Please select a job first.');
      return;
    }

    generateShortlist(
      { jobId: selectedJobId, minScore: Number(minScore) },
      {
        onSuccess: () => {
          toast.success('Shortlist generated successfully.');
          refetchShortlist();
        },
        onError: (err) =>
          toast.error(err?.data?.message || 'Failed to generate shortlist.'),
      },
    );
  };

  /* ── Export ── */
  const handleExport = () => {
    if (!selectedJobId) {
      toast.warning('Please select a job first.');
      return;
    }

    exportFile(
      { id: selectedJobId, params: candidateParams },
      {
        onSuccess: (blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `shortlisted-candidates-${selectedJobId}.xlsx`,
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          toast.success('Export downloaded.');
        },
        onError: (err) => toast.error(err?.message || 'Export failed.'),
      },
    );
  };

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ListChecks size={20} />
          </div>
          <div>
            <h2 className="page-title">Shortlist Per Job</h2>
            <p className="page-sub">
              Generate & review AI-assisted shortlists for job vacancies
            </p>
          </div>
        </div>
      </div>

      {/* ── Generate Shortlist Card ── */}
      <div className="lv-card" style={{ marginBottom: 24 }}>
        <div className="lv-card-head">
          <Star size={14} /> Generate Shortlist
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'flex-end',
          }}
        >
          {/* Job selector */}
          <div style={{ flex: '1 1 260px' }}>
            <label className="modal-label">Select Job Posting</label>
            <select
              className="modal-input"
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
              }}
            >
              <option value="">— Choose a job —</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.position?.title} ({j.position?.cadre})
                </option>
              ))}
            </select>
          </div>

          {/* Min Score */}
          <div style={{ flex: '0 0 180px' }}>
            <label className="modal-label">Minimum Score (0 – 100)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="modal-input"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="modal-submit"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedJobId}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isGenerating ? <Spinner /> : <ListChecks size={15} />}
              {isGenerating ? 'Generating…' : 'Generate Shortlist'}
            </button>

            <button
              className="modal-cancel"
              onClick={handleExport}
              disabled={isExporting || !selectedJobId}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isExporting ? <Spinner /> : <Download size={15} />}
              {isExporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Shortlist Result Summary ── */}
      {shortlistLoading && selectedJobId && (
        <div className="lv-loader">
          <div className="spinner" />
          <p>Loading shortlist…</p>
        </div>
      )}

      {!shortlistLoading && shortlistRecord && (
        <>
          {/* Criteria card */}
          <div className="lv-card" style={{ marginBottom: 16 }}>
            <div className="lv-card-head">
              <Award size={14} /> Shortlist Criteria Used
            </div>
            <div className="lv-rows">
              <div className="lv-row">
                <span className="lv-row-label">Min. Overall Score</span>
                <span className="lv-row-value">
                  {criteria.minOverallScore ?? '—'}
                </span>
              </div>
            </div>

            {criteria.requiredQualifications?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Required Qualifications
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                  }}
                >
                  {criteria.requiredQualifications.map((q, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 13,
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle2 size={12} color="#10b981" /> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <StatCard
              icon={<Users size={22} />}
              label="Shortlisted Candidates"
              value={shortlistRecord.shortlistedCandidates?.length ?? 0}
              color="#3b82f6"
            />
            <StatCard
              icon={<Award size={22} />}
              label="Candidates in Table"
              value={candidateCount}
              color="#10b981"
            />
          </div>
        </>
      )}

      {/* ── Candidates Table ── */}
      {selectedJobId && (
        <div className="table-wrapper">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              Shortlisted Candidates
            </h3>
          </div>
          <ShortlistedCandidatesTable
            data={candidateList}
            loading={candidatesLoading}
            meta={null /* client-side pagination for now */}
          />
        </div>
      )}

      {/* Empty state – no job selected */}
      {!selectedJobId && (
        <div className="lv-loader" style={{ marginTop: 40 }}>
          <span style={{ fontSize: 36 }}>📋</span>
          <p>Select a job above to view or generate a shortlist.</p>
        </div>
      )}
    </div>
  );
}

/* ── Stat card helper ── */
function StatCard({ icon, label, value, color }) {
  return (
    <div
      className="lv-card"
      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}18`,
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: 'var(--text-color-light)',
          }}
        >
          {label}
        </p>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{value}</h3>
      </div>
    </div>
  );
}

export default ShortlistManagement;
