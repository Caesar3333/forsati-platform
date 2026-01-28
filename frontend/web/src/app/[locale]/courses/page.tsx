// © 2026 Forsati. All rights reserved.
// Courses & Training Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoursesListClient } from "./CoursesListClient";

interface CoursesPageProps {
  params: {
    locale: "ar" | "en";
  };
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    provider?: string;
    level?: string;
    isFree?: string;
  };
}

export async function generateMetadata({ params }: CoursesPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "courses" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
  };
}

export default function CoursesPage({ params, searchParams }: CoursesPageProps) {
  return (
    <CoursesListClient
      locale={params.locale}
      initialFilters={{
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        search: searchParams.search,
        category: searchParams.category,
        provider: searchParams.provider,
        level: searchParams.level,
        isFree: searchParams.isFree === 'true',
      }}
    />
  );
}
