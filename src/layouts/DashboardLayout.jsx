// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../design-system/layout/AppShell';

export const DashboardLayout = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default DashboardLayout;