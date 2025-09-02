import React from 'react';
import { CNavItem } from '@coreui/react';

const icon = (src, style={}) => (
  <img style={{ height: '35px', marginLeft: '-10px', ...style }} src={src} className="nav-icon" />
);

const accessor = [
  { component: CNavItem, name: 'Dashboard', to: '/dashboard', icon: icon('nav_dashboard.svg') },
  { component: CNavItem, name: 'Batch', to: '/all-batch', icon: icon('nav_batch.svg') },
  { component: CNavItem, name: 'Courses', to: '/course-details', icon: icon('nav_course.svg', { height: '29px' }) },
  { component: CNavItem, name: 'Profile Setting', to: '/profile', icon: icon('nav_setting.svg') },
];

export default accessor;
