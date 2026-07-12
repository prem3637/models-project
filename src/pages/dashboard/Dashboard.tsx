import React from 'react';
import { useGetDashboardDataQuery } from '../../redux/services/dashboard';
import Skeleton from '../../components/ui/Skeleton';
import OverviewCards from './components/OverviewCards';
import RegistrationTrend from './components/RegistrationTrend';
import LocationDistribution from './components/LocationDistribution';
import GenderDistribution from './components/GenderDistribution';
import RecentModels from './components/RecentModels';
import { ModelTypeBreakdown } from './components/TalentBreakdown';


export const Dashboard: React.FC = () => {
  const { data: statsRes, isLoading } = useGetDashboardDataQuery();
  const stats = statsRes?.data;

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-2.5 w-2/3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 max-w-7xl mx-auto">
      {/* Overview Cards Row */}
      <OverviewCards stats={stats} />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RegistrationTrend stats={stats} />
          <LocationDistribution stats={stats} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <GenderDistribution stats={stats} />
          <RecentModels stats={stats} />
          <ModelTypeBreakdown stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
