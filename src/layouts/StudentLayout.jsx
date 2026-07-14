import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { STUDENT_NAV } from '../config/studentNavConfigs';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/rolePaths';

const LOGOSUB = import.meta.env.VITE_LOGOSUB || 'LMS Portal';

function StudentLayout() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      navItems={STUDENT_NAV}
      logoIcon="/logo.png"
      logoTitle="Student Portal"
      logoSub={LOGOSUB}
      userName={user?.name || 'Student User'}
      userRole={user?.role ?? 'Student'}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.firstname, user?.lastname)}
    />
  );
}

export default StudentLayout;
