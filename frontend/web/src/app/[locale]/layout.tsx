// © 2026 Forsati. All rights reserved.
import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, isValidLocale, type Locale } from "@/i18n/config";
import "@/styles/globals.css";

// Arabic font
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

// English font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const isArabic = locale === "ar";

  return {
    title: {
      template: isArabic ? "%s | فرصتي" : "%s | Forsati",
      default: isArabic
        ? "فرصتي - منصة التوظيف الذكية"
        : "Forsati - Smart Employment Platform",
    },
    description: isArabic
      ? "منصة التوظيف الذكية الأولى في الأردن. اعثر على فرصتك المثالية باستخدام الذكاء الاصطناعي."
      : "Jordan's first AI-powered employment platform. Find your perfect opportunity with artificial intelligence.",
    keywords: isArabic
      ? [
          "وظائف",
          "توظيف",
          "فرص عمل",
          "الأردن",
          "سيرة ذاتية",
          "تدريب",
          "منح",
          "تطوع",
        ]
      : [
          "jobs",
          "employment",
          "career",
          "Jordan",
          "CV",
          "internship",
          "scholarships",
          "volunteering",
        ],
    authors: [{ name: "Forsati Team" }],
    creator: "Forsati",
    publisher: "Forsati",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: isArabic ? "ar_JO" : "en_US",
      alternateLocale: isArabic ? "en_US" : "ar_JO",
      url: "https://forsati.jo",
      siteName: isArabic ? "فرصتي" : "Forsati",
      title: isArabic
        ? "فرصتي - منصة التوظيف الذكية"
        : "Forsati - Smart Employment Platform",
      description: isArabic
        ? "منصة التوظيف الذكية الأولى في الأردن"
        : "Jordan's first AI-powered employment platform",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: isArabic ? "فرصتي" : "Forsati",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isArabic
        ? "فرصتي - منصة التوظيف الذكية"
        : "Forsati - Smart Employment Platform",
      description: isArabic
        ? "منصة التوظيف الذكية الأولى في الأردن"
        : "Jordan's first AI-powered employment platform",
      images: ["/og-image.png"],
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
    },
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#0B74FF" },
      { media: "(prefers-color-scheme: dark)", color: "#0B74FF" },
    ],
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = params;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  const isRTL = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${cairo.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen bg-background text-foreground antialiased ${
          isRTL ? "font-arabic" : "font-sans"
        }`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
