import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BURSAR_NAV } from '../config/bursarNavConfigs';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/rolePaths';

const LOGOSUB = import.meta.env.VITE_LOGOSUB || 'LMS Portal';

function BursarLayout() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      navItems={BURSAR_NAV}
      logoIcon="/logo.png"
      logoTitle="Finance Portal"
      logoSub={LOGOSUB}
      userName={user?.name || 'Bursar User'}
      userRole={user?.role ?? 'Bursar'}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.firstname, user?.lastname)}
    />
  );
}

export default BursarLayout;
