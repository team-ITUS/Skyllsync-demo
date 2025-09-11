import React from 'react'
import { CNavGroup, CNavItem } from '@coreui/react'

// Sidebar menu for admin
// Each item.icon is a React element; using .jsx extension ensures JSX transpiles properly.

const imgIcon = (src, style={}) => (
  <img style={{ height: '35px', width: '35px', marginLeft: '-10px', ...style }} src={src} className="nav-icon" />
);

const admin = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: imgIcon('nav_dashboard.svg'),
  },
  {
    component: CNavItem,
    name: 'Batch',
    to: '/all-batch',
    icon: imgIcon('nav_batch.svg'),
  },
  {
    component: CNavItem,
    name: 'Courses',
    to: '/course-details',
    icon: imgIcon('nav_course.svg', { height: '29px' }),
  },
  {
    component: CNavItem,
    name: 'Students',
    to: '/registered-students',
    icon: imgIcon('nav_student.svg'),
  },
  {
    component: CNavItem,
    name: 'Branch/Institute',
    to: '/all-branches',
    icon: imgIcon('nav_branch.svg'),
  },
  {
    component: CNavItem,
    name: 'Certificate Templates',
    to: '/certificate-template',
    icon: imgIcon('certificate_w.svg'),
  },
  {
    component: CNavItem,
    name: 'License Templates',
    to: '/license-template',
    icon: imgIcon('idcard_w.svg', { height: '30px', marginLeft: '-7px' }),
  },
  {
    component: CNavItem,
    name: 'Examiner',
    to: '/accessor-details',
    icon: imgIcon('nav_examiner.svg'),
  },
  {
    component: CNavItem,
    name: 'Trainer',
    to: '/trainer-details',
    icon: imgIcon('nav_trainer.svg'),
  },
  {
    component: CNavItem,
    name: 'Assign Task',
    to: '/task-details',
    icon: imgIcon('nav_task.svg'),
  },
  {
    component: CNavGroup,
    name: 'Settings',
    icon: imgIcon('nav_setting.svg'),
    items: [
      { component: CNavItem, name: 'Profile Settings', to: '/admin-profile' },
      { component: CNavItem, name: 'App Setting', to: '/app-setting' },
  { component: CNavItem, name: 'Sheets', to: '/sheets' },
    ],
  },
];

export default admin;
