import React, { useState, useMemo } from 'react';
import { Download, Users } from 'lucide-react';
import { useGetAllShortListedCandidates } from '../../../hooks/useJobs';
import { useJobs } from '../../../hooks/useJobs';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import ShortlistedCandidatesTable from '../../../components/admin/Tables/ShortlistedCandidatesTable';
import AddButton from '../../../components/ui/AddButton/AddButton';
import { getAllShortListedCandidates } from '../../../api/services/Jobs';
import { exportShortlistedCandidatesToCsv } from '../../../utils/exportApplicants';

const AI_RECOMMENDATION_OPTIONS = [
  { value: '', label: 'All Recommendations' },
  { value: 'Strongly Recommended', label: 'Strongly Recommended' },
  { value: 'Recommended', label: 'Recommended' },
  { value: 'Marginally Recommended', label: 'Marginally Recommended' },
  { value: 'Not Recommended', label: 'Not Recommended' },
];

const INITIAL_PARAMS = {
  page: 1,
  limit: 20,
  search: '',
  jobId: '',
  aiRecommendation: '',
  startDate: '',
  endDate: '',
};

function ShortlistedCandidates() {
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [exporting, setExporting] = useState(false);

  /* ── Jobs list for jobId filter ── */
  const { data: jobsRes } = useJobs({ count: 1000 });
  const jobs = jobsRes?.data ?? [];

  /* ── Main data ── */
  const { data: response, isLoading } = useGetAllShortListedCandidates(params);

  const flattenedCandidates = useMemo(() => {
    if (!response?.data) return [];
    return response.data.flatMap((shortlist) =>
      shortlist.shortlistedCandidates.map((c) => {
        const pi = c.applicationId?.personalInfo ?? {};

        return {
          id: c._id,
          // display fields (used by table)
          name: `${pi.firstName ?? ''} ${pi.lastName ?? ''}`.trim(),
          email: pi.email,
          overallScore: c.overallScore,
          recommendation: c.aiRecommendation,
          appliedAt: shortlist.generationDate,
          jobId: shortlist.jobId?._id,
        };
      }),
    );
  }, [response]);

  /* ── Pagination metadata ── */
  const totalRecords = response?.totalRecords ?? 0;
  const currentPage = response?.pagination?.page ?? params.page;
  const totalPages = response?.pagination?.totalPages ?? 1;
  const meta = {
    page: currentPage,
    pages: totalPages,
    count: totalRecords,
    limit: params.limit,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };

  /* ── Export CSV: fetch all matching records (up to 5 000) ── */
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const exportFilters = {
        ...(params.search && { search: params.search }),
        ...(params.jobId && { jobId: params.jobId }),
        ...(params.aiRecommendation && {
          aiRecommendation: params.aiRecommendation,
        }),
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
        limit: 5000,
        page: 1,
      };
      const res = await getAllShortListedCandidates(exportFilters);
      const rows = (res?.data ?? []).flatMap((shortlist) =>
        shortlist.shortlistedCandidates.map((c) => {
          const pi = c.applicationId?.personalInfo ?? {};
          const ai = c.applicationId?.aiScore ?? {};
          return {
            appId: c.applicationId?.applicationId ?? '',
            firstName: pi.firstName ?? '',
            middleName: pi.middleName ?? '',
            lastName: pi.lastName ?? '',
            email: pi.email ?? '',
            phone: pi.phone ?? '',
            gender: pi.gender ?? '',
            dateOfBirth: pi.dateOfBirth ?? '',
            maritalStatus: pi.maritalStatus ?? '',
            nin: pi.nin ?? '',
            overallScore: c.overallScore,
            recommendation: c.aiRecommendation,
            shortlistStatus: ai.shortlistStatus ?? '',
            shortlistReason: c.shortlistReason ?? '',
            qualificationScore: ai.qualificationScore ?? '',
            experienceScore: ai.experienceScore ?? '',
            publicationScore: ai.publicationScore ?? '',
            professionalScore: ai.professionalScore ?? '',
            missingRequirements: ai.missingRequirements ?? [],
            generationDate: shortlist.generationDate ?? '',
            jobId: shortlist.jobId?._id ?? '',
          };
        }),
      );
      if (rows.length) {
        exportShortlistedCandidatesToCsv(rows);
      } else {
        alert('No candidates found to export.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  /* ── Filter helpers ── */
  const setParam = (key, value) =>
    setParams((p) => ({ ...p, [key]: value, page: 1 }));

  const hasActiveFilters =
    params.search ||
    params.jobId ||
    params.aiRecommendation ||
    params.startDate ||
    params.endDate;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Users size={20} />
          </div>
          <div>
            <h2 className="page-title">Shortlisted Candidates</h2>
            <p className="page-sub">
              {isLoading
                ? 'Loading…'
                : `${totalRecords} record${totalRecords !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton
            text={exporting ? 'Exporting…' : 'Export CSV'}
            icon={<Download size={16} />}
            onClick={handleExport}
            disabled={exporting || isLoading}
          />
        </div>
      </div>

      {/* Search */}
      <div className="filter-wrapper">
        <SearchInput
          value={params.search}
          onChange={(val) =>
            setParam('search', typeof val === 'string' ? val : val.target.value)
          }
          placeholder="Search candidates by name, email…"
        />
      </div>

      {/* Filters */}
      <div className="filter-selects-block">
        {/* Job filter */}
        <SelectFilter
          label="Job Posting"
          value={params.jobId}
          onChange={(val) => setParam('jobId', val)}
          options={[
            { value: '', label: 'All Jobs' },
            ...jobs.map((j) => ({
              value: j._id,
              label: `${j.position?.title ?? 'Untitled'} (${j.position?.cadre ?? ''})`,
            })),
          ]}
        />

        {/* AI Recommendation filter */}
        <SelectFilter
          label="AI Recommendation"
          value={params.aiRecommendation}
          onChange={(val) => setParam('aiRecommendation', val)}
          options={AI_RECOMMENDATION_OPTIONS}
        />

        {/* Date range */}
        <div className="filter-container">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            className="filter-select"
            value={params.startDate}
            onChange={(e) => setParam('startDate', e.target.value)}
          />
        </div>

        <div className="filter-container">
          <label className="filter-label">End Date</label>
          <input
            type="date"
            className="filter-select"
            value={params.endDate}
            onChange={(e) => setParam('endDate', e.target.value)}
          />
        </div>

        <ResetButton onClick={() => setParams(INITIAL_PARAMS)} />
      </div>

      {/* Active filter indicator */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            color: 'var(--text-color-light)',
          }}
        >
          <Users size={13} />
          Showing filtered results
          {meta?.count != null && (
            <strong style={{ color: 'var(--text-color)' }}>
              ({meta.count} record{meta.count !== 1 ? 's' : ''})
            </strong>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <ShortlistedCandidatesTable
          data={flattenedCandidates}
          loading={isLoading}
          meta={meta}
          onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          onLimitChange={(limit) =>
            setParams((p) => ({ ...p, limit, page: 1 }))
          }
        />
      </div>
    </div>
  );
}

export default ShortlistedCandidates;
