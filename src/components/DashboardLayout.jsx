import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import Onboarding from './Onboarding';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#0A0A0B]">
      <div className="dashboard-nav">
        <DashboardSidebar />
      </div>
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
      <Onboarding />
    </div>
  );
};

export default DashboardLayout; 