'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

// TODO: Integrate with Strapi for organization data
// TODO: Add job posting management
// TODO: Add applicant tracking

interface Organization {
  id: string;
  name: string;
  logo: string | null;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
}

interface OrgDashboardClientProps {
  locale: 'ar' | 'en';
  organization: Organization;
  user: OrgUser;
}

export function OrgDashboardClient({ locale, organization, user }: OrgDashboardClientProps) {
  const t = useTranslations('orgDashboard');
  const isRTL = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applicants' | 'settings'>('overview');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
              {organization.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {organization.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={`/${locale}/org/${organization.id}/jobs/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('actions.postJob')}
            </Link>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {(['overview', 'jobs', 'applicants', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </nav>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={t('stats.activeJobs')}
            value="0"
            trend="+0%"
            trendUp={true}
          />
          <StatCard
            label={t('stats.totalApplications')}
            value="0"
            trend="+0%"
            trendUp={true}
          />
          <StatCard
            label={t('stats.shortlisted')}
            value="0"
            trend="+0%"
            trendUp={true}
          />
          <StatCard
            label={t('stats.hiredThisMonth')}
            value="0"
            trend="+0%"
            trendUp={true}
          />
        </section>

        {/* Main Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('recentApplications.title')}
              </h2>
              <EmptyState
                message={t('recentApplications.empty')}
                actionLabel={t('recentApplications.postFirstJob')}
                actionHref={`/${locale}/org/${organization.id}/jobs/new`}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('quickActions.title')}
              </h2>
              <div className="space-y-3">
                <QuickActionButton
                  icon="📝"
                  label={t('quickActions.postJob')}
                  href={`/${locale}/org/${organization.id}/jobs/new`}
                />
                <QuickActionButton
                  icon="👥"
                  label={t('quickActions.viewApplicants')}
                  href={`/${locale}/org/${organization.id}/applicants`}
                />
                <QuickActionButton
                  icon="📊"
                  label={t('quickActions.analytics')}
                  href={`/${locale}/org/${organization.id}/analytics`}
                />
                <QuickActionButton
                  icon="⚙️"
                  label={t('quickActions.settings')}
                  href={`/${locale}/org/${organization.id}/settings`}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('jobs.title')}
              </h2>
              <Link
                href={`/${locale}/org/${organization.id}/jobs/new`}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                {t('jobs.postNew')}
              </Link>
            </div>
            <EmptyState
              message={t('jobs.empty')}
              actionLabel={t('jobs.postFirstJob')}
              actionHref={`/${locale}/org/${organization.id}/jobs/new`}
            />
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('applicants.title')}
            </h2>
            <EmptyState
              message={t('applicants.empty')}
              actionLabel={t('applicants.postJob')}
              actionHref={`/${locale}/org/${organization.id}/jobs/new`}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('settings.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('settings.description')}
            </p>
            {/* TODO: Add organization settings form */}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, trend, trendUp }: { label: string; value: string; trend: string; trendUp: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-sm ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message, actionLabel, actionHref }: { message: string; actionLabel: string; actionHref: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function QuickActionButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
    </Link>
  );
}
