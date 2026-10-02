import "./App.css";
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ModalProvider } from "./context/ModalProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FullPageLoader from "./components/ui/FullPageLoader/FullPageLoader";
import NotFoundPage from "./pages/NotFoundPage";
import Landing from "./pages/Landing/Landing";

/* ── Public careers site ── */
const Vacancies = lazy(() => import("./pages/Public/Careers/Vacancies"));
const VacancyDetail = lazy(() => import("./pages/Public/Careers/VacancyDetail"));
const ApplyPage = lazy(() => import("./pages/Public/Apply/ApplyPage"));
const TrackApplication = lazy(() => import("./pages/Public/Track/TrackApplication"));
const RefereeForm = lazy(() => import("./pages/Public/Referee/RefereeForm"));
const OriginData = lazy(() => import("./pages/Public/Origin/OriginData"));
const ResetPassword = lazy(() => import("./pages/Public/ResetPassword/ResetPassword"));

/* ── Staff portal ── */
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const ChangePasswordRequired = lazy(() => import("./pages/Account/ChangePasswordRequired"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard/Dashboard"));
const ManageApplications = lazy(() => import("./pages/Admin/Applications/ManageApplications"));
const ShortlistManagement = lazy(() => import("./pages/Admin/Shortlist/ShortlistManagement"));
const ShortlistHistory = lazy(() => import("./pages/Admin/Shortlist/ShortlistHistory"));
const ManageJobs = lazy(() => import("./pages/Admin/Jobs/ManageJobs"));
const ManagePositions = lazy(() => import("./pages/Admin/Config/ManagePositions"));
const ManageRequirements = lazy(() => import("./pages/Admin/Config/ManageRequirements"));
const ManageSubcadres = lazy(() => import("./pages/Admin/Config/ManageSubcadres"));
const ManageStaff = lazy(() => import("./pages/Admin/Staff/ManageStaff"));
const Profile = lazy(() => import("./pages/Account/Profile"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/careers" element={<Vacancies />} />
              <Route path="/careers/:jobId" element={<VacancyDetail />} />
              <Route path="/careers/:jobId/apply" element={<ApplyPage />} />
              <Route path="/track" element={<TrackApplication />} />
              <Route path="/referee/:token" element={<RefereeForm />} />
              <Route path="/origin-data/:token" element={<OriginData />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* First sign-in: the only staff route open until the password is changed */}
              <Route element={<ProtectedRoute allowPasswordChange />}>
                <Route path="/change-password" element={<ChangePasswordRequired />} />
              </Route>

              {/* Staff portal — any staff role */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="applications" element={<ManageApplications />} />
                  <Route path="shortlist" element={<ShortlistManagement />} />
                  <Route path="shortlist-history" element={<ShortlistHistory />} />
                  <Route path="jobs" element={<ManageJobs />} />
                  <Route path="positions" element={<ManagePositions />} />
                  <Route path="requirements" element={<ManageRequirements />} />
                  <Route path="subcadres" element={<ManageSubcadres />} />
                  <Route path="profile" element={<Profile />} />

                  {/* HR manager only */}
                  <Route element={<ProtectedRoute roles={["hrm"]} />}>
                    <Route path="staff" element={<ManageStaff />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
