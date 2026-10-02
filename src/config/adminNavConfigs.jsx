import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Settings2,
  UserCog,
  UserRound,
} from 'lucide-react';

/*
  `roles` limits an item to those staff roles; omit it for everyone.
  Use getAdminNav(user) rather than this list directly.
*/
const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [{ label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' }],
  },
  {
    section: 'Recruitment',
    items: [
      { label: 'Applications', icon: <ClipboardList size={18} />, path: '/admin/applications' },
      {
        label: 'AI Shortlisting',
        icon: <ListChecks size={18} />,
        children: [
          { label: 'Shortlist by Job', path: '/admin/shortlist' },
          { label: 'Shortlist History', path: '/admin/shortlist-history' },
        ],
      },
      { label: 'Vacancies', icon: <Briefcase size={18} />, path: '/admin/jobs' },
    ],
  },
  {
    section: 'Configuration',
    items: [
      {
        label: 'Job Setup',
        icon: <Settings2 size={18} />,
        children: [
          { label: 'Positions', path: '/admin/positions' },
          { label: 'Requirements', path: '/admin/requirements' },
          { label: 'Subcadres', path: '/admin/subcadres' },
        ],
      },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'Staff Users', icon: <UserCog size={18} />, path: '/admin/staff', roles: ['hrm'] },
      { label: 'My Account', icon: <UserRound size={18} />, path: '/admin/profile' },
    ],
  },
];

export const getAdminNav = (user) =>
  ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(user?.role)),
  })).filter((section) => section.items.length > 0);
