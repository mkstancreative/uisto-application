import React from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import { PORTAL_ROLE_IDS } from '../../utils/rolePaths'
import AdminLayout from '../../layouts/AdminLayout'
import DashBoardAdmin from '../../pages/Admin/DashBoardAdmin'
import ManageJobs from '../../pages/Admin/Jobs/ManageJobs'
import ManageJobApplicants from '../../pages/Admin/Jobs/ManageJobApplicants'
import ShortlistManagement from '../../pages/Admin/Jobs/ShortlistManagement'
import ManageJobRequirement from '../../pages/Admin/Jobs/ManageJobRequirement'
import ManageJobPositions from '../../pages/Admin/Jobs/ManageJobPositions'
import ManageJobSubCadre from '../../pages/Admin/Jobs/ManageJobSubCadre'
import ShortlistedCandidates from '../../pages/Admin/Jobs/ShortlistedCandidates'


export default function AdminRoutes() {
    return (
        <>
            <Route element={<ProtectedRoute allowedRoleIds={PORTAL_ROLE_IDS.admin} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashBoardAdmin />} />
                    {/* Jobs */}
                    <Route path="manage-jobs" element={<ManageJobs />} />
                    <Route path="manage-requirements" element={<ManageJobRequirement />} />
                    <Route path="manage-positions" element={<ManageJobPositions />} />
                    <Route path="manage-job-applicants" element={<ManageJobApplicants />} />
                    <Route path="shortlist-management" element={<ShortlistManagement />} />
                    <Route path="manage-job-subcadre" element={<ManageJobSubCadre/>} />
                    <Route path="shortlisted-candidates" element={<ShortlistedCandidates/>} />

                    
            
                </Route>
            </Route>
        </>
    )
}