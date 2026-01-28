// © 2026 Forsati. All rights reserved.
// Scholarships Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScholarshipsListClient } from "./ScholarshipsListClient";

interface ScholarshipsPageProps {
  params: {
    locale: "ar" | "en";
  };
  searchParams: {
    page?: string;
    search?: string;
    level?: string;
    country?: string;
    field?: string;
  };
}

export async function generateMetadata({ params }: ScholarshipsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "scholarships" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
  };
}

export default function ScholarshipsPage({ params, searchParams }: ScholarshipsPageProps) {
  return (
    <ScholarshipsListClient
      locale={params.locale}
      initialFilters={{
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        search: searchParams.search,
        level: searchParams.level,
        country: searchParams.country,
        field: searchParams.field,
      }}
    />
  );
}
