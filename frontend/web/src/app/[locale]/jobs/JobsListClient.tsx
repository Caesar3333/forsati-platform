// © 2026 Forsati. All rights reserved.
// Jobs List Client Component

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn, formatCurrency, debounce } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  getJobs,
  type Job,
  type JobType,
  type JobsListParams,
} from "@/lib/opportunities";

interface JobsListClientProps {
  locale: "ar" | "en";
  initialFilters?: Partial<JobsListParams>;
}

const translations = {
  ar: {
    title: "فرص العمل",
    searchPlaceholder: "ابحث عن وظيفة، شركة، أو مهارة...",
    filters: "تصفية",
    clearFilters: "مسح الكل",
    results: "{count} نتيجة",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّب تغيير معايير البحث",
    loading: "جاري التحميل...",
    apply: "قدّم",
    save: "حفظ",
    postedAgo: "قبل {time}",
    applicants: "{count} متقدم",
    salary: "الراتب",
    negotiable: "قابل للتفاوض",
    perMonth: "/شهر",
    new: "جديد",
    featured: "مميز",
    urgent: "عاجل",
    filterLabels: {
      type: "نوع العمل",
      location: "الموقع",
      category: "التصنيف",
      experience: "الخبرة",
      salary: "الراتب",
    },
    jobTypes: {
      "full-time": "دوام كامل",
      "part-time": "دوام جزئي",
      contract: "عقد",
      internship: "تدريب",
      remote: "عن بُعد",
      hybrid: "هجين",
    },
    locations: ["عمّان", "إربد", "العقبة", "الزرقاء"],
    categories: ["تكنولوجيا", "صحة", "تعليم", "إدارة", "مبيعات", "تسويق"],
    prev: "السابق",
    next: "التالي",
    page: "صفحة {current} من {total}",
  },
  en: {
    title: "Job Opportunities",
    searchPlaceholder: "Search for a job, company, or skill...",
    filters: "Filters",
    clearFilters: "Clear All",
    results: "{count} results",
    noResults: "No Results Found",
    noResultsDesc: "Try changing your search criteria",
    loading: "Loading...",
    apply: "Apply",
    save: "Save",
    postedAgo: "{time} ago",
    applicants: "{count} applicants",
    salary: "Salary",
    negotiable: "Negotiable",
    perMonth: "/month",
    new: "New",
    featured: "Featured",
    urgent: "Urgent",
    filterLabels: {
      type: "Job Type",
      location: "Location",
      category: "Category",
      experience: "Experience",
      salary: "Salary",
    },
    jobTypes: {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      internship: "Internship",
      remote: "Remote",
      hybrid: "Hybrid",
    },
    locations: ["Amman", "Irbid", "Aqaba", "Zarqa"],
    categories: [
      "Technology",
      "Healthcare",
      "Education",
      "Administration",
      "Sales",
      "Marketing",
    ],
    prev: "Previous",
    next: "Next",
    page: "Page {current} of {total}",
  },
};

export function JobsListClient({
  locale,
  initialFilters = {},
}: JobsListClientProps) {
  const router = useRouter();
  const _searchParams = useSearchParams();
  const t = translations[locale];
  const isRTL = locale === "ar";
  const { trackSearch } = useAnalytics();

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [meta, setMeta] = React.useState({
    page: 1,
    pageSize: 12,
    pageCount: 1,
    total: 0,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  // Filters state
  const [filters, setFilters] = React.useState<JobsListParams>({
    page: initialFilters.page || 1,
    pageSize: 12,
    search: initialFilters.search || "",
    type: initialFilters.type,
    location: initialFilters.location,
    category: initialFilters.category,
  });

  // Fetch jobs when filters change
  React.useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const result = await getJobs(filters);
        setJobs(result.data);
        setMeta(result.meta);

        if (filters.search) {
          trackSearch({
            query: filters.search,
            filters: filters as unknown as Record<string, unknown>,
            resultsCount: result.meta.total,
          });
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [filters, trackSearch]);

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.type) params.set("type", filters.type as string);
    if (filters.location) params.set("location", filters.location);
    if (filters.category) params.set("category", filters.category);
    if (filters.page && filters.page > 1)
      params.set("page", String(filters.page));

    const url = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/${locale}/jobs${url}`, { scroll: false });
  }, [filters, router, locale]);

  // Debounced search
  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
      }, 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (
    key: keyof JobsListParams,
    value: string | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? undefined : value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 12,
      search: "",
    });
  };

  const hasActiveFilters =
    filters.search || filters.type || filters.location || filters.category;

  return (
    <>
      <Header locale={locale} />

      <main className="min-h-screen bg-neutral-50" dir={isRTL ? "rtl" : "ltr"}>
        {/* Search Header */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t.title}
            </h1>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted",
                    isRTL ? "right-3" : "left-3",
                  )}
                />
                <input
                  type="text"
                  defaultValue={filters.search}
                  onChange={handleSearchChange}
                  placeholder={t.searchPlaceholder}
                  className={cn(
                    "w-full h-12 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                  )}
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t.filters}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside
              className={cn(
                "w-full md:w-64 shrink-0 space-y-6",
                showFilters ? "block" : "hidden md:block",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">{t.filters}</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-500 hover:underline"
                  >
                    {t.clearFilters}
                  </button>
                )}
              </div>

              {/* Job Type Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  {t.filterLabels.type}
                </h3>
                <div className="space-y-2">
                  {(Object.keys(t.jobTypes) as JobType[]).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.type === type}
                        onChange={() => handleFilterChange("type", type)}
                        className="rounded border-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-foreground">
                        {t.jobTypes[type]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  {t.filterLabels.location}
                </h3>
                <div className="space-y-2">
                  {t.locations.map((loc) => (
                    <label
                      key={loc}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.location === loc}
                        onChange={() => handleFilterChange("location", loc)}
                        className="rounded border-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-foreground">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  {t.filterLabels.category}
                </h3>
                <div className="space-y-2">
                  {t.categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.category === cat}
                        onChange={() => handleFilterChange("category", cat)}
                        className="rounded border-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-foreground">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Jobs List */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted">
                  {t.results.replace("{count}", String(meta.total))}
                </p>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {filters.type && (
                      <Badge
                        variant="primary"
                        size="sm"
                        removable
                        onRemove={() => handleFilterChange("type", undefined)}
                      >
                        {t.jobTypes[filters.type as JobType]}
                      </Badge>
                    )}
                    {filters.location && (
                      <Badge
                        variant="primary"
                        size="sm"
                        removable
                        onRemove={() =>
                          handleFilterChange("location", undefined)
                        }
                      >
                        {filters.location}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-5">
                        <div className="flex gap-3">
                          <div className="h-12 w-12 rounded-lg bg-neutral-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-neutral-200 rounded w-3/4" />
                            <div className="h-3 bg-neutral-200 rounded w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t.noResults}
                  </h3>
                  <p className="text-muted">{t.noResultsDesc}</p>
                </div>
              ) : (
                /* Jobs Grid */
                <div className="grid md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <Link key={job.id} href={`/${locale}/jobs/${job.id}`}>
                      <Card variant="interactive" className="h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                              <Building2 className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex gap-2 mb-1">
                                {job.isFeatured && (
                                  <Badge variant="primary" size="sm">
                                    {t.featured}
                                  </Badge>
                                )}
                                {job.isUrgent && (
                                  <Badge variant="danger" size="sm">
                                    {t.urgent}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground truncate">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted truncate">
                                {job.company.name}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm text-muted mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0" />
                              {job.location.city}
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 shrink-0" />
                              {t.jobTypes[job.type as JobType]}
                            </div>
                          </div>

                          {job.salary && !job.salary.confidential && (
                            <div className="pt-3 border-t border-border">
                              <p className="text-sm font-medium text-primary-600">
                                {job.salary.negotiable
                                  ? t.negotiable
                                  : `${formatCurrency(job.salary.min, job.salary.currency, locale)} - ${formatCurrency(job.salary.max, job.salary.currency, locale)}`}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta.pageCount > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                    }
                  >
                    {isRTL ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                    {t.prev}
                  </Button>

                  <span className="text-sm text-muted">
                    {t.page
                      .replace("{current}", String(meta.page))
                      .replace("{total}", String(meta.pageCount))}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.pageCount}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                    }
                  >
                    {t.next}
                    {isRTL ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}

export default JobsListClient;
