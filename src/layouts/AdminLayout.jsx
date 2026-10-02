import React, { useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getAdminNav } from '../config/adminNavConfigs';
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
      logoTitle="UISTO Careers"
      logoSub="Recruitment Portal"
      userName={user?.name || 'Staff'}
      userRole={roleLabel(user?.role)}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.name)}
    />
  );
}

export default AdminLayout;
