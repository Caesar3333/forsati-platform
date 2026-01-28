'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface LanguageSwitcherProps {
  locale: 'ar' | 'en';
}

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const t = useTranslations('header.language');
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'ar', label: 'العربية', flag: '🇯🇴' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find((l) => l.code === locale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    // Replace current locale in pathname with new locale
    const segments = pathname.split('/');
    if (segments[1] === 'ar' || segments[1] === 'en') {
      segments[1] = newLocale;
    }
    const newPathname = segments.join('/');
    router.push(newPathname);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={t('switchLanguage')}
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.label}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[140px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
          sideOffset={5}
          align="end"
        >
          {languages.map((language) => (
            <DropdownMenu.Item
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer outline-none transition-colors ${
                locale === language.code
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.label}</span>
              {locale === language.code && (
                <svg className="w-4 h-4 ms-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
