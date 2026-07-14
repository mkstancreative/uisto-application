import React, { useState } from 'react'
import { Briefcase, Users, CheckCircle, FileText, Activity, Download } from 'lucide-react'
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters'
import SearchInput from '../../../components/ui/SearchInput/SearchInput'
import ResetButton from '../../../components/ui/ResetButton/ResetButton'
import { useJobApplicants, useJobApplicantStats } from '../../../hooks/useJobs'
import { getJobApplicants } from '../../../api/services/Jobs'
import JobApplicantTable from '../../../components/admin/Tables/JobApplicantTable'
import { useModal } from '../../../hooks/useModal'
import JobApplicantStatusMutate from '../../../components/admin/Mutate/JobApplicantStatusMutate'
import JobApplicantView from '../../../components/admin/view/JobApplicantView'
import { exportToCsv } from '../../../utils/exportApplicants'
import AddButton from '../../../components/ui/AddButton/AddButton'


function ManageJobApplicants() {
    const { openModal, closeModal } = useModal();

    const [params, setParams] = useState({
        shortlistStatus: "",
        status: "",
        search: "",
        page: 1,
        limit: 10,
    });

    const [exporting, setExporting] = useState(false);

    /* ── Data Queries ── */
    const { data: statsRes, isLoading: statsLoading } = useJobApplicantStats();
    const stats = statsRes?.data || { totalApplications: 0, shortlistingStats: {}, averageScore: 0 };

    const { data: applicantsRes, isLoading: applicantsLoading } = useJobApplicants(params);
    const applicants = applicantsRes?.data || [];
    const pagination = applicantsRes?.pagination || null;

    const meta = pagination
        ? {
            page: pagination.page,
            pages: pagination.pages,
            count: pagination.total,
            limit: params.limit,
            hasPrev: pagination.page > 1,
            hasNext: pagination.page < pagination.pages,
        }
        : null;

    /* ── Handlers ── */
    const handleView = (row) => openModal(<JobApplicantView id={row._id} closeModal={closeModal} />);
    const handleUpdateStatus = (row) => openModal(<JobApplicantStatusMutate applicant={row} closeModal={closeModal} />);

    /* ── Export: direct API call, completely independent of the table ── */
    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const exportFilters = {
                ...(params.shortlistStatus && { shortlistStatus: params.shortlistStatus }),
                ...(params.status && { status: params.status }),
                ...(params.search && { search: params.search }),
                limit: 5000,
                page: 1,
            };
            const res = await getJobApplicants(exportFilters);
            const rows = res?.data ?? [];
            if (rows.length) {
                exportToCsv(rows);
            } else {
                alert("No applicants found to export.");
            }
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <div className="page-icon orange">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="page-title">Manage Job Applicants</h2>
                        <p className="page-sub">
                            Manage your job applicants and their submissions
                        </p>
                    </div>
                </div>

                {/* Export Button */}
                <div className="page-header-right">
                    <AddButton
                        text='Export CSV'
                        onClick={handleExport}
                        disabled={exporting || applicantsLoading}
                        icon={<Download size={15} />}
                    />
                </div>
            </div>

            {/* Dashboard Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: 'var(--text-color-light)', margin: 0 }}>Total Applications</p>
                            <h3 style={{ margin: 0, fontSize: '24px' }}>{statsLoading ? "…" : (stats.totalApplications || 0)}</h3>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: 'var(--text-color-light)', margin: 0 }}>Auto Shortlisted</p>
                            <h3 style={{ margin: 0, fontSize: '24px' }}>{statsLoading ? "…" : (stats.shortlistingStats?.autoShortlisted || 0)}</h3>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: 'var(--text-color-light)', margin: 0 }}>Shortlisting Rate</p>
                            <h3 style={{ margin: 0, fontSize: '24px' }}>{statsLoading ? "…" : (stats.shortlistingStats?.shortlistingRate || "0.00")}%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="filter-wrapper">
                <SearchInput
                    value={params.search}
                    onChange={(val) =>
                        setParams((p) => ({
                            ...p,
                            search: typeof val === "string" ? val : val?.target?.value ?? "",
                            page: 1,
                        }))
                    }
                    placeholder="Search by name, email, or job title…"
                />
            </div>

            {/* Filters — SelectFilter calls onChange(value) not onChange(event) */}
            <div className="filter-selects-block">
                <SelectFilter
                    label="AI Status"
                    value={params.shortlistStatus}
                    onChange={(val) => setParams((p) => ({ ...p, shortlistStatus: val, page: 1 }))}
                    options={[
                        { value: "", label: "All AI Status" },
                        { value: "Pending", label: "Pending" },
                        { value: "Auto-Shortlisted", label: "Auto-Shortlisted" },
                        { value: "Rejected", label: "Rejected" },
                        { value: "Manual Review", label: "Manual Review" },
                    ]}
                />
                <SelectFilter
                    label="App. Status"
                    value={params.status}
                    onChange={(val) => setParams((p) => ({ ...p, status: val, page: 1 }))}
                    options={[
                        { value: "", label: "All Status" },
                        { value: "Submitted", label: "Submitted" },
                        { value: "Under Review", label: "Under Review" },
                        { value: "Shortlisted", label: "Shortlisted" },
                        { value: "Interviewed", label: "Interviewed" },
                        { value: "Offered", label: "Offered" },
                    ]}
                />
                <ResetButton
                    onClick={() =>
                        setParams({ search: "", status: "", shortlistStatus: "", page: 1, limit: 10 })
                    }
                />
            </div>

            {/* Applied filters indicator */}
            {(params.shortlistStatus || params.status || params.search) && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: "var(--text-color-light)" }}>
                    <Briefcase size={13} />
                    Showing filtered results
                    {meta?.count != null && <strong style={{ color: "var(--text-color)" }}> ({meta.count} applicant{meta.count !== 1 ? "s" : ""})</strong>}
                </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
                <JobApplicantTable
                    data={applicants}
                    loading={applicantsLoading}
                    onView={handleView}
                    onUpdateStatus={handleUpdateStatus}
                    meta={meta}
                    onPageChange={(page) => setParams((p) => ({ ...p, page }))}
                    onLimitChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
                />
            </div>
        </div>
    )
}

export default ManageJobApplicants