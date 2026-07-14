import {
  BarChart3,
  Bell,
  BookOpen,
  DollarSign,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  ListCheck,
  Settings,
  Stethoscope,
  User2,
  UserCheck,
  Users,
} from 'lucide-react';

export const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: <LayoutDashboard size={18} />,
        path: '/admin',
      },
    ],
  },
  

  {
    section: 'Administration',
    items: [

      {
        label: 'Manage Jobs',
        icon: <UserCheck size={18} />,
        children: [
          { label: 'Job Requirements', path: '/admin/manage-requirements' },
          { label: 'Job Sub Cadre', path: '/admin/manage-job-subcadre' },
          { label: 'Job Positions', path: '/admin/manage-positions' },
          { label: 'Manage Jobs', path: '/admin/manage-jobs' },
          { label: 'Job Applicants', path: '/admin/manage-job-applicants' },
          // { label: 'Shortlist Per Job', path: '/admin/shortlist-management' },
          // {
          //   label: 'Shortlisted Candidates',
          //   path: '/admin/shortlisted-candidates',
          // },
        ],
      },
      // {
      //   label: 'Settings',
      //   icon: <Settings size={18} />,
      //   children: [
      //     { label: 'My Profile', path: '/admin/my-profile' },
      //     { label: 'Change Password', path: '/admin/change-password' },
      //     { label: 'Activity Logs', path: '/admin/activity-logs' },
      //     { label: 'System Settings', path: '/admin/system-settings' },
      //   ],
      // },
    ],
  },

  // {
  //   section: 'Notifications',
  //   items: [
  //     {
  //       label: 'Notifications',
  //       icon: <Bell size={18} />,
  //       path: '/admin/notifications',
  //     },
  //   ],
  // },
];
