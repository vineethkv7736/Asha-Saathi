'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { ChildrenGrid } from '@/components/children/ChildrenGrid';
import { AddChildButton } from '@/components/children/AddChildButton';
import { SearchAndFilter } from '@/components/common/SearchAndFilter';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChildrenPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('all');

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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('children.title')}
            </h1>
            <AddChildButton />
          </div>
          
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={filterAge}
            onFilterChange={setFilterAge}
            filterOptions={[
              { value: 'all', label: t('common.all') },
              { value: '0-6m', label: t('age.0to6months') },
              { value: '6-12m', label: t('age.6to12months') },
              { value: '1-2y', label: t('age.1to2years') },
              { value: '2-5y', label: t('age.2to5years') },
            ]}
          />
          
          <ChildrenGrid searchTerm={searchTerm} filterAge={filterAge} />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}