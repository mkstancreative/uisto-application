import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { LECTURER_NAV } from '../config/lecturerNavConfigs';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/rolePaths';

const LOGOSUB = import.meta.env.VITE_LOGOSUB || 'LMS Portal';

function LecturerLayout() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      navItems={LECTURER_NAV}
      logoIcon="/logo.png"
      logoTitle="Academic Portal"
      logoSub={LOGOSUB}
      userName={user?.name || 'Lecturer User'}
      userRole={user?.role ?? 'Lecturer'}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.firstname, user?.lastname)}
    />
  );
}

export default LecturerLayout;
