"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
  href: string;
  label: string;
  hasDropdown?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "ar" | "en";
  navLinks: NavLink[];
  isAuthenticated: boolean;
}

export default function MobileMenu({
  isOpen,
  onClose,
  locale,
  navLinks,
  isAuthenticated,
}: MobileMenuProps) {
  const t = useTranslations("header");
  const menuRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable =
        menuRef.current.querySelector<HTMLElement>("button, a");
      firstFocusable?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-xl lg:hidden`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {t("mobileMenu.title")}
              </span>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                aria-label={t("mobileMenu.close")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                    >
                      <span className="font-medium">{link.label}</span>
                      {link.hasDropdown && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                          />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Section */}
            {!isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={onClose}
                    className="block w-full py-3 px-4 text-center text-emerald-600 border border-emerald-600 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    onClick={onClose}
                    className="block w-full py-3 px-4 text-center text-white bg-emerald-600 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    {t("auth.register")}
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
