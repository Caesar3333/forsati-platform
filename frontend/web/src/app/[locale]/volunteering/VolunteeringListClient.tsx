'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityFilters from '@/components/opportunities/OpportunityFilters';
import Pagination from '@/components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';

// TODO: Integrate with Strapi API for volunteering opportunities
// TODO: Add Typesense search integration

interface VolunteeringFilters {
  page: number;
  search?: string;
  category?: string;
  location?: string;
}

interface VolunteeringListClientProps {
  locale: 'ar' | 'en';
  initialFilters: VolunteeringFilters;
}

export function VolunteeringListClient({ locale, initialFilters }: VolunteeringListClientProps) {
  const t = useTranslations('volunteering');
  const [filters, setFilters] = useState<VolunteeringFilters>(initialFilters);

  // TODO: Replace with actual API call
  const { data, isLoading, error } = useQuery({
    queryKey: ['volunteering', filters],
    queryFn: async () => {
      // Placeholder - replace with actual API
      return {
        opportunities: [],
        total: 0,
        page: filters.page,
        pageSize: 10,
      };
    },
  });

  const handleFilterChange = useCallback((newFilters: Partial<VolunteeringFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return (
    <main className="container mx-auto px-4 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Search & Filters */}
      <section className="mb-8">
        <OpportunityFilters
          type="volunteering"
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </section>

      {/* Results */}
      <section>
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{t('errors.loadFailed')}</p>
          </div>
        ) : data?.opportunities.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data?.opportunities.map((opportunity: any) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  type="volunteering"
                  locale={locale}
                />
              ))}
            </div>
            {data && data.total > data.pageSize && (
              <div className="mt-8">
                <Pagination
                  currentPage={data.page}
                  totalPages={Math.ceil(data.total / data.pageSize)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-64" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
