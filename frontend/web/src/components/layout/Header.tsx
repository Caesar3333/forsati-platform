// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  GraduationCap,
  Heart,
  BookOpen,
  Globe,
  User,
  FileText,
  LogIn,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";

interface HeaderProps {
  locale: "ar" | "en";
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: "candidate" | "recruiter" | "org_admin" | "admin";
  } | null;
  market?: string;
}

// Navigation structure
const navigation = {
  ar: {
    home: "الرئيسية",
    jobs: "فرص عمل",
    volunteering: "فرص تطوع",
    scholarships: "منح دراسية",
    courses: "دورات تدريبية",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    scanCV: "افحص سيرتك",
    postJob: "انشر فرصة",
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
  },
  en: {
    home: "Home",
    jobs: "Jobs",
    volunteering: "Volunteering",
    scholarships: "Scholarships",
    courses: "Courses",
    login: "Login",
    register: "Register",
    scanCV: "Scan CV",
    postJob: "Post Job",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
  },
};

// Mega menu for Jobs
const jobsMegaMenu = {
  ar: {
    byType: {
      title: "حسب نوع العمل",
      items: [
        { label: "دوام كامل", href: "/jobs?type=full-time" },
        { label: "دوام جزئي", href: "/jobs?type=part-time" },
        { label: "عقد", href: "/jobs?type=contract" },
        { label: "تدريب", href: "/jobs?type=internship" },
        { label: "عن بُعد", href: "/jobs?type=remote" },
        { label: "هجين", href: "/jobs?type=hybrid" },
      ],
    },
    byCategory: {
      title: "حسب التصنيف",
      items: [
        { label: "تكنولوجيا المعلومات", href: "/jobs?category=tech" },
        { label: "الصحة", href: "/jobs?category=health" },
        { label: "التعليم", href: "/jobs?category=education" },
        { label: "الإدارة", href: "/jobs?category=admin" },
        { label: "المبيعات", href: "/jobs?category=sales" },
        { label: "التسويق", href: "/jobs?category=marketing" },
      ],
    },
    byLocation: {
      title: "حسب الموقع",
      items: [
        { label: "عمّان", href: "/jobs?location=amman" },
        { label: "إربد", href: "/jobs?location=irbid" },
        { label: "العقبة", href: "/jobs?location=aqaba" },
        { label: "الزرقاء", href: "/jobs?location=zarqa" },
      ],
    },
  },
  en: {
    byType: {
      title: "By Type",
      items: [
        { label: "Full-time", href: "/jobs?type=full-time" },
        { label: "Part-time", href: "/jobs?type=part-time" },
        { label: "Contract", href: "/jobs?type=contract" },
        { label: "Internship", href: "/jobs?type=internship" },
        { label: "Remote", href: "/jobs?type=remote" },
        { label: "Hybrid", href: "/jobs?type=hybrid" },
      ],
    },
    byCategory: {
      title: "By Category",
      items: [
        { label: "Technology", href: "/jobs?category=tech" },
        { label: "Healthcare", href: "/jobs?category=health" },
        { label: "Education", href: "/jobs?category=education" },
        { label: "Administration", href: "/jobs?category=admin" },
        { label: "Sales", href: "/jobs?category=sales" },
        { label: "Marketing", href: "/jobs?category=marketing" },
      ],
    },
    byLocation: {
      title: "By Location",
      items: [
        { label: "Amman", href: "/jobs?location=amman" },
        { label: "Irbid", href: "/jobs?location=irbid" },
        { label: "Aqaba", href: "/jobs?location=aqaba" },
        { label: "Zarqa", href: "/jobs?location=zarqa" },
      ],
    },
  },
};

export function Header({ locale, user, market = "jo" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();
  const t = navigation[locale];
  const megaMenu = jobsMegaMenu[locale];
  const isRTL = locale === "ar";

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60",
        isRTL && "font-arabic"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-lg">
              ف
            </div>
            <span className="hidden font-bold text-xl text-foreground sm:block">
              {isRTL ? "فرصتي" : "Forsati"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu.Root className="hidden lg:flex">
            <NavigationMenu.List className="flex items-center gap-1">
              {/* Home */}
              <NavigationMenu.Item>
                <Link
                  href="/"
                  className={cn(
                    "px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors",
                    pathname === "/" && "text-primary-500"
                  )}
                >
                  {t.home}
                </Link>
              </NavigationMenu.Item>

              {/* Jobs - Mega Menu */}
              <NavigationMenu.Item>
                <NavigationMenu.Trigger className="group flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
                  <Briefcase className="h-4 w-4" />
                  {t.jobs}
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="absolute top-full left-0 w-full">
                  <div className="container mx-auto px-4">
                    <div className="mt-2 grid grid-cols-3 gap-6 rounded-lg border border-border bg-surface p-6 shadow-lg">
                      {/* By Type */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                          {megaMenu.byType.title}
                        </h3>
                        <ul className="space-y-2">
                          {megaMenu.byType.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="block text-sm text-muted hover:text-primary-500 transition-colors"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* By Category */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                          {megaMenu.byCategory.title}
                        </h3>
                        <ul className="space-y-2">
                          {megaMenu.byCategory.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="block text-sm text-muted hover:text-primary-500 transition-colors"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* By Location */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                          {megaMenu.byLocation.title}
                        </h3>
                        <ul className="space-y-2">
                          {megaMenu.byLocation.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="block text-sm text-muted hover:text-primary-500 transition-colors"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {/* CTA */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <Link
                            href="/jobs"
                            className="text-sm font-medium text-primary-500 hover:text-primary-600"
                          >
                            {isRTL ? "عرض جميع الفرص ←" : "View all jobs →"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {/* Volunteering */}
              <NavigationMenu.Item>
                <Link
                  href="/volunteering"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors",
                    pathname.startsWith("/volunteering") && "text-primary-500"
                  )}
                >
                  <Heart className="h-4 w-4" />
                  {t.volunteering}
                </Link>
              </NavigationMenu.Item>

              {/* Scholarships */}
              <NavigationMenu.Item>
                <Link
                  href="/scholarships"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors",
                    pathname.startsWith("/scholarships") && "text-primary-500"
                  )}
                >
                  <GraduationCap className="h-4 w-4" />
                  {t.scholarships}
                </Link>
              </NavigationMenu.Item>

              {/* Courses */}
              <NavigationMenu.Item>
                <Link
                  href="/courses"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors",
                    pathname.startsWith("/courses") && "text-primary-500"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  {t.courses}
                </Link>
              </NavigationMenu.Item>
            </NavigationMenu.List>
          </NavigationMenu.Root>

          {/* Search */}
          <div className="hidden flex-1 max-w-md lg:block">
            <SearchBar
              locale={locale}
              onSearch={(query) => console.log("Search:", query)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 text-muted hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language / Market Switcher */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 text-sm text-muted hover:text-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {locale.toUpperCase()}
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-32 rounded-md border border-border bg-surface p-1 shadow-lg animate-fade-in"
                  sideOffset={5}
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href={`/ar${pathname}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-neutral-100 cursor-pointer"
                    >
                      🇯🇴 العربية
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      href={`/en${pathname}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-neutral-100 cursor-pointer"
                    >
                      🇬🇧 English
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              {t.scanCV}
            </Button>

            {/* User Menu / Auth */}
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-48 rounded-md border border-border bg-surface p-1 shadow-lg animate-fade-in"
                    sideOffset={5}
                    align="end"
                  >
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-neutral-100 cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t.dashboard}
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-neutral-100 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        {t.profile}
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-neutral-100 cursor-pointer"
                      >
                        <Settings className="h-4 w-4" />
                        {t.settings}
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 h-px bg-border" />
                    <DropdownMenu.Item asChild>
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-500 rounded hover:bg-danger-50 cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  {t.login}
                </Link>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/register">{t.register}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-muted hover:text-foreground"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden pb-4 overflow-hidden"
            >
              <SearchBar
                locale={locale}
                onSearch={(query) => console.log("Search:", query)}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden border-t border-border bg-surface"
          >
            <nav className="container mx-auto px-4 py-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="block py-2 text-foreground font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.home}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className="flex items-center gap-2 py-2 text-foreground font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    {t.jobs}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/volunteering"
                    className="flex items-center gap-2 py-2 text-foreground font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    {t.volunteering}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/scholarships"
                    className="flex items-center gap-2 py-2 text-foreground font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <GraduationCap className="h-5 w-5" />
                    {t.scholarships}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses"
                    className="flex items-center gap-2 py-2 text-foreground font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-5 w-5" />
                    {t.courses}
                  </Link>
                </li>
              </ul>

              {/* Mobile CTA */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <Button variant="primary" className="w-full">
                  <FileText className="h-5 w-5 mr-2" />
                  {t.scanCV}
                </Button>
                {!user && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">{t.login}</Link>
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
