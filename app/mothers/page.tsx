'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { MothersGrid } from '@/components/mothers/MothersGrid';
import { AddMotherButton } from '@/components/mothers/AddMotherButton';
import { SearchAndFilter } from '@/components/common/SearchAndFilter';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MothersPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

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
              {t('mothers.title')}
            </h1>
            <AddMotherButton />
          </div>
          
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={filterRisk}
            onFilterChange={setFilterRisk}
            filterOptions={[
              { value: 'all', label: t('common.all') },
              { value: 'high', label: t('risk.high') },
              { value: 'medium', label: t('risk.medium') },
              { value: 'low', label: t('risk.low') },
            ]}
          />
          
          <MothersGrid searchTerm={searchTerm} filterRisk={filterRisk} />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}