import React, { useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getAdminNav } from '../config/adminNavConfigs';
import { APP_NAME, APP_TAGLINE } from '../components/public/brand';
import { useAuth } from '../hooks/useAuth';
import { getInitials, roleLabel } from '../utils/roles';
import './style.css';

function AdminLayout() {
  const { user } = useAuth();
  const navItems = useMemo(() => getAdminNav(user), [user]);

  return (
    <DashboardLayout
      navItems={navItems}
      logoIcon="/logo.png"
      logoTitle={`${APP_NAME} Careers`}
      logoSub={APP_TAGLINE}
      userName={user?.name || 'Staff'}
      userRole={roleLabel(user?.role)}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.name)}
    />
  );
}

export default AdminLayout;
