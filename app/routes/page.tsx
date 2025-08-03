'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { RouteOptimizer } from '@/components/routes/RouteOptimizer';
import { VisitPlanner } from '@/components/routes/VisitPlanner';
import { TodaysRoute } from '@/components/routes/TodaysRoute';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoutesPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header />
      <main className="pb-20 pt-4">
        <div className="px-4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('routes.title')}
          </h1>
          
          <TodaysRoute />
          <VisitPlanner />
          <RouteOptimizer />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}