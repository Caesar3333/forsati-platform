'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

// TODO: Integrate with Strapi for user data
// TODO: Add real-time notifications
// TODO: Add CV completion progress

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface DashboardClientProps {
  locale: 'ar' | 'en';
  user: DashboardUser;
}

export function DashboardClient({ locale, user }: DashboardClientProps) {
  const t = useTranslations('dashboard');
  const isRTL = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'profile'>('overview');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('welcome', { name: user.name.split(' ')[0] })}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </header>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={t('stats.applications')}
            value="0"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            label={t('stats.interviews')}
            value="0"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label={t('stats.savedJobs')}
            value="0"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
            color="purple"
          />
          <StatCard
            label={t('stats.profileViews')}
            value="0"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="orange"
          />
        </section>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV Upload Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('cvSection.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {t('cvSection.description')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
                  {t('cvSection.incomplete')}
                </span>
              </div>
              <div className="mt-4">
                <Link
                  href={`/${locale}/me/cv`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {t('cvSection.uploadButton')}
                </Link>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('recentApplications.title')}
              </h2>
              <EmptyState
                icon={
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                message={t('recentApplications.empty')}
                actionLabel={t('recentApplications.browseJobs')}
                actionHref={`/${locale}/jobs`}
              />
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('recommendedJobs.title')}
              </h2>
              <EmptyState
                icon={
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                message={t('recommendedJobs.empty')}
                actionLabel={t('recommendedJobs.completeProfile')}
                actionHref={`/${locale}/me/profile`}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {user.email}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('profile.completion')}</span>
                  <span className="font-medium text-emerald-600">30%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-[30%] bg-emerald-500 rounded-full" />
                </div>
              </div>
              <Link
                href={`/${locale}/me/profile`}
                className="mt-4 block w-full py-2 px-4 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                {t('profile.editButton')}
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t('quickLinks.title')}
              </h3>
              <nav className="space-y-2">
                <QuickLink href={`/${locale}/jobs`} icon="💼" label={t('quickLinks.jobs')} />
                <QuickLink href={`/${locale}/courses`} icon="📚" label={t('quickLinks.courses')} />
                <QuickLink href={`/${locale}/volunteering`} icon="🤝" label={t('quickLinks.volunteering')} />
                <QuickLink href={`/${locale}/scholarships`} icon="🎓" label={t('quickLinks.scholarships')} />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  }[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

function EmptyState({ icon, message, actionLabel, actionHref }: { icon: React.ReactNode; message: string; actionLabel: string; actionHref: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
      >
        {actionLabel}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </Link>
  );
}
