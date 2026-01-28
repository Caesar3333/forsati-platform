// © 2026 Forsati. All rights reserved.
// Volunteering Opportunities Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VolunteeringListClient } from "./VolunteeringListClient";

interface VolunteeringPageProps {
  params: {
    locale: "ar" | "en";
  };
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    location?: string;
  };
}

export async function generateMetadata({
  params,
}: VolunteeringPageProps): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "volunteering",
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
  };
}

export default function VolunteeringPage({
  params,
  searchParams,
}: VolunteeringPageProps) {
  return (
    <VolunteeringListClient
      locale={params.locale}
      initialFilters={{
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        search: searchParams.search,
        category: searchParams.category,
        location: searchParams.location,
      }}
    />
  );
}
