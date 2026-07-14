import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { REGISTRAR_NAV } from '../config/registrarNavConfigs';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/rolePaths';

const LOGOSUB = import.meta.env.VITE_LOGOSUB || 'LMS Portal';

function RegistrarLayout() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      navItems={REGISTRAR_NAV}
      logoIcon="/logo.png"
      logoTitle="Registrar Portal"
      logoSub={LOGOSUB}
      userName={user?.name || 'Registrar User'}
      userRole={user?.role ?? 'Registrar'}
      userEmail={user?.email ?? ''}
      userInitials={getInitials(user?.firstname, user?.lastname)}
    />
  );
}

export default RegistrarLayout;
