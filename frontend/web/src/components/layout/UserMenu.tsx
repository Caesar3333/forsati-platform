'use client';

import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  locale: 'ar' | 'en';
}

export default function UserMenu({ user, locale }: UserMenuProps) {
  const t = useTranslations('header.userMenu');

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const menuItems = [
    { href: `/${locale}/me/dashboard`, label: t('dashboard'), icon: '🏠' },
    { href: `/${locale}/me/profile`, label: t('profile'), icon: '👤' },
    { href: `/${locale}/me/applications`, label: t('applications'), icon: '📝' },
    { href: `/${locale}/me/saved`, label: t('savedJobs'), icon: '💾' },
    { href: `/${locale}/me/settings`, label: t('settings'), icon: '⚙️' },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label={t('openMenu')}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              {initials}
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50"
          sideOffset={5}
          align="end"
        >
          {/* User Info */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user.name || t('anonymous')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          {menuItems.map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer outline-none transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />

          {/* Sign Out */}
          <DropdownMenu.Item asChild>
            <button
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer outline-none transition-colors"
            >
              <span>🚪</span>
              <span>{t('signOut')}</span>
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
