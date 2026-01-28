// © 2026 Forsati. All rights reserved.
// Jobs List Page

import { Metadata } from "next";
import { JobsListClient } from "./JobsListClient";

interface JobsPageProps {
  params: {
    locale: "ar" | "en";
  };
  searchParams: {
    page?: string;
    search?: string;
    type?: string;
    location?: string;
    category?: string;
  };
}

export async function generateMetadata({
  params,
}: JobsPageProps): Promise<Metadata> {
  const isArabic = params.locale === "ar";

  return {
    title: isArabic ? "فرص العمل" : "Job Opportunities",
    description: isArabic
      ? "تصفح آلاف فرص العمل في الأردن. فرص دوام كامل، جزئي، عن بُعد، تدريب والمزيد."
      : "Browse thousands of job opportunities in Jordan. Full-time, part-time, remote, internships and more.",
    openGraph: {
      title: isArabic ? "فرص العمل | فرصتي" : "Job Opportunities | Forsati",
      description: isArabic
        ? "اكتشف فرص العمل المناسبة لك"
        : "Discover job opportunities that fit you",
    },
  };
}

export default function JobsPage({ params, searchParams }: JobsPageProps) {
  return (
    <JobsListClient
      locale={params.locale}
      initialFilters={{
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        search: searchParams.search,
        type: searchParams.type as any,
        location: searchParams.location,
        category: searchParams.category,
      }}
    />
  );
}
