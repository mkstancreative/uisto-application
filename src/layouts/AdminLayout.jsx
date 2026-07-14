import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ADMIN_NAV } from '../config/adminNavConfigs';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/rolePaths';
import './style.css';

const LOGOSUB = import.meta.env.VITE_LOGOSUB || 'LMS Portal';

function AdminLayout() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      navItems={ADMIN_NAV}
      logoIcon="/logo.png"
      logoTitle="LMS Portal"
      logoSub={LOGOSUB}
      userName={user?.name || 'Admin User'}
      userRole={user?.role ?? 'Administrator'}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.firstname, user?.lastname)}
    />
  );
}

export default AdminLayout;
