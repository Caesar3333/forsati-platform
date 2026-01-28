// © 2026 Forsati. All rights reserved.
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't prefix the default locale
  localePrefix: "as-needed",

  // Detect locale from Accept-Language header
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - Static files (images, etc.)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
