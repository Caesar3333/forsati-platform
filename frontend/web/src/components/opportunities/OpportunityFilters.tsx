'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface OpportunityFiltersProps {
  type: 'jobs' | 'volunteering' | 'scholarships' | 'courses';
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
}

export default function OpportunityFilters({ type, filters, onFilterChange }: OpportunityFiltersProps) {
  const t = useTranslations('filters');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFilterChange({ search: value });
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      location: '',
      type: '',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   placeholder-gray-400 dark:placeholder-gray-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filter Toggle (Mobile) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 w-full flex items-center justify-between p-2 text-gray-600 dark:text-gray-400 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t('filters')}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Options */}
      <div className={`mt-4 space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('location')}
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">{t('allLocations')}</option>
            <option value="amman">{t('locations.amman')}</option>
            <option value="irbid">{t('locations.irbid')}</option>
            <option value="zarqa">{t('locations.zarqa')}</option>
            <option value="aqaba">{t('locations.aqaba')}</option>
            <option value="remote">{t('locations.remote')}</option>
          </select>
        </div>

        {/* Type-specific filters */}
        {type === 'jobs' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('jobType')}
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">{t('allTypes')}</option>
              <option value="full-time">{t('types.fullTime')}</option>
              <option value="part-time">{t('types.partTime')}</option>
              <option value="contract">{t('types.contract')}</option>
              <option value="remote">{t('types.remote')}</option>
              <option value="internship">{t('types.internship')}</option>
            </select>
          </div>
        )}

        {type === 'scholarships' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('level')}
              </label>
              <select
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('allLevels')}</option>
                <option value="bachelor">{t('levels.bachelor')}</option>
                <option value="master">{t('levels.master')}</option>
                <option value="phd">{t('levels.phd')}</option>
                <option value="diploma">{t('levels.diploma')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('country')}
              </label>
              <select
                value={filters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('allCountries')}</option>
                <option value="jordan">{t('countries.jordan')}</option>
                <option value="usa">{t('countries.usa')}</option>
                <option value="uk">{t('countries.uk')}</option>
                <option value="germany">{t('countries.germany')}</option>
                <option value="canada">{t('countries.canada')}</option>
              </select>
            </div>
          </>
        )}

        {type === 'courses' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('provider')}
              </label>
              <select
                value={filters.provider || ''}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('allProviders')}</option>
                <option value="coursera">Coursera</option>
                <option value="udemy">Udemy</option>
                <option value="edx">edX</option>
                <option value="local">{t('providers.local')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={filters.isFree || false}
                onChange={(e) => handleFilterChange('isFree', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isFree" className="text-sm text-gray-700 dark:text-gray-300">
                {t('freeOnly')}
              </label>
            </div>
          </>
        )}

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          {t('clearFilters')}
        </button>
      </div>
    </div>
  );
}
