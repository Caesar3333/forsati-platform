"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
import Pagination from "@/components/ui/Pagination";
import { useQuery } from "@tanstack/react-query";

// TODO: Integrate with Strapi API for courses
// TODO: Add filtering by provider, level, price

interface CourseFilters {
  page: number;
  search?: string;
  category?: string;
  provider?: string;
  level?: string;
  isFree?: boolean;
}

interface CoursesListClientProps {
  locale: "ar" | "en";
  initialFilters: CourseFilters;
}

export function CoursesListClient({
  locale,
  initialFilters,
}: CoursesListClientProps) {
  const t = useTranslations("courses");
  const [filters, setFilters] = useState<CourseFilters>(initialFilters);

  // TODO: Replace with actual API call
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      // Placeholder - replace with actual API
      return {
        courses: [],
        total: 0,
        page: filters.page,
        pageSize: 12,
      };
    },
  });

  const handleFilterChange = useCallback(
    (newFilters: Partial<CourseFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return (
    <main
      className="container mx-auto px-4 py-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Search & Filters */}
      <section className="mb-8">
        <OpportunityFilters
          type="courses"
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </section>

      {/* Results */}
      <section>
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{t("errors.loadFailed")}</p>
          </div>
        ) : data?.courses.length === 0 ? (
          <EmptyState message={t("empty")} />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.courses.map((course: any) => (
                <OpportunityCard
                  key={course.id}
                  opportunity={course}
                  type="course"
                  locale={locale}
                />
              ))}
            </div>
            {data && data.total > data.pageSize && (
              <div className="mt-8">
                <Pagination
                  currentPage={data.page}
                  totalPages={Math.ceil(data.total / data.pageSize)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-72"
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
