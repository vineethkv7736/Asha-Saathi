'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TodaysTasks } from '@/components/dashboard/TodaysTasks';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
      <Header />
      
      <main className="pb-20 pt-6">
        <div className="px-4 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.email?.split('@')[0]}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Here's what's happening with your healthcare community today.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            </div>
            <DashboardStats />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <QuickActions />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Tasks */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <TodaysTasks />
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <RecentAlerts />
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}