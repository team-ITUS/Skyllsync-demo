import React from 'react';
import { CNavItem, CNavGroup } from '@coreui/react';

const icon = (src, style={}) => (
  <img style={{ height: '35px', marginLeft: '-10px', ...style }} src={src} className="nav-icon" />
);

const trainer = [
  { component: CNavItem, name: 'Dashboard', to: '/dashboard', icon: icon('nav_dashboard.svg') },
  { component: CNavGroup, name: 'Courses', to: '/course-details', icon: icon('nav_course.svg', { height: '29px' }) },
  { component: CNavGroup, name: 'Batch', to: '/all-batch', icon: icon('nav_batch.svg') },
  { component: CNavItem, name: 'My Task', to: '/mytask', icon: icon('nav_task.svg') },
  { component: CNavItem, name: 'Profile Setting', to: '/trainer-profile', icon: icon('nav_setting.svg') },
];

export default trainer;
