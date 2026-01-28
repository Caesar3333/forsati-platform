'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'month' | 'year' | 'hour';
  };
  postedAt: string;
  deadline?: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

interface JobCardProps {
  job: Job;
  locale: 'ar' | 'en';
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

export default function JobCard({ job, locale, onSave, isSaved = false }: JobCardProps) {
  const t = useTranslations('jobs.card');
  const isRTL = locale === 'ar';

  const typeLabels: Record<Job['type'], string> = {
    'full-time': t('types.fullTime'),
    'part-time': t('types.partTime'),
    'contract': t('types.contract'),
    'remote': t('types.remote'),
    'internship': t('types.internship'),
  };

  const typeColors: Record<Job['type'], string> = {
    'full-time': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'part-time': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'contract': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'remote': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'internship': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    
    const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    });

    if (salary.min && salary.max) {
      return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    }
    if (salary.min) return `${formatter.format(salary.min)}+`;
    if (salary.max) return t('salaryUpTo', { amount: formatter.format(salary.max) });
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('postedToday');
    if (diffDays === 1) return t('postedYesterday');
    if (diffDays < 7) return t('postedDaysAgo', { days: diffDays });
    if (diffDays < 30) return t('postedWeeksAgo', { weeks: Math.floor(diffDays / 7) });
    return date.toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO', { month: 'short', day: 'numeric' });
  };

  return (
    <article
      className={`relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 ${
        job.isFeatured ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900' : ''
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Badges */}
      <div className="absolute top-4 end-4 flex gap-2">
        {job.isFeatured && (
          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
            {t('featured')}
          </span>
        )}
        {job.isNew && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
            {t('new')}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
          {job.company.logo ? (
            <Image
              src={job.company.logo}
              alt={job.company.name}
              width={56}
              height={56}
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-gray-400">
              {job.company.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/${locale}/jobs/${job.id}`} className="group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {job.title}
            </h3>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5 line-clamp-1">
            {job.company.name}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        {/* Location */}
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>

        {/* Job Type */}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[job.type]}`}>
          {typeLabels[job.type]}
        </span>

        {/* Salary */}
        {formatSalary(job.salary) && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatSalary(job.salary)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(job.postedAt)}
        </span>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={() => onSave?.(job.id)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label={isSaved ? t('unsave') : t('save')}
          >
            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Apply Button */}
          <Link
            href={`/${locale}/jobs/${job.id}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('apply')}
          </Link>
        </div>
      </div>
    </article>
  );
}
