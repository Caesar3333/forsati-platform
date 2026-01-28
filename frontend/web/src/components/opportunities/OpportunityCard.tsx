"use client";

import Link from "next/link";
import Image from "next/image";

interface Opportunity {
  id: string;
  title: string;
  organization: {
    name: string;
    logo?: string;
  };
  location?: string;
  deadline?: string;
  tags?: string[];
  isFeatured?: boolean;
  // For courses
  provider?: string;
  duration?: string;
  isFree?: boolean;
  // For scholarships
  amount?: string;
  level?: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  type: "volunteering" | "scholarship" | "course";
  locale: "ar" | "en";
}

export default function OpportunityCard({
  opportunity,
  type,
  locale,
}: OpportunityCardProps) {
  const isRTL = locale === "ar";

  const typeColors = {
    volunteering: "border-orange-200 dark:border-orange-800",
    scholarship: "border-purple-200 dark:border-purple-800",
    course: "border-blue-200 dark:border-blue-800",
  };

  const typeIcons = {
    volunteering: "🤝",
    scholarship: "🎓",
    course: "📚",
  };

  const getHref = () => {
    switch (type) {
      case "volunteering":
        return `/${locale}/volunteering/${opportunity.id}`;
      case "scholarship":
        return `/${locale}/scholarships/${opportunity.id}`;
      case "course":
        return `/${locale}/courses/${opportunity.id}`;
    }
  };

  return (
    <article
      className={`bg-white dark:bg-gray-800 rounded-xl border ${typeColors[type]} hover:shadow-lg transition-all duration-200 overflow-hidden`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Organization Logo */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
            {opportunity.organization.logo ? (
              <Image
                src={opportunity.organization.logo}
                alt={opportunity.organization.name}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <span className="text-2xl">{typeIcons[type]}</span>
            )}
          </div>

          {/* Title & Org */}
          <div className="flex-1 min-w-0">
            <Link href={getHref()} className="group">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                {opportunity.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {opportunity.organization.name}
            </p>
          </div>

          {/* Featured Badge */}
          {opportunity.isFeatured && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full shrink-0">
              ⭐
            </span>
          )}
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          {opportunity.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {opportunity.location}
            </div>
          )}

          {/* Course specific */}
          {type === "course" && opportunity.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {opportunity.duration}
            </div>
          )}

          {/* Scholarship specific */}
          {type === "scholarship" && opportunity.amount && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {opportunity.amount}
            </div>
          )}

          {opportunity.deadline && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date(opportunity.deadline).toLocaleDateString(
                locale === "ar" ? "ar-JO" : "en-JO",
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {opportunity.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {opportunity.tags.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{opportunity.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        {type === "course" && (
          <span
            className={`text-sm font-medium ${opportunity.isFree ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}
          >
            {opportunity.isFree
              ? locale === "ar"
                ? "مجاني"
                : "Free"
              : locale === "ar"
                ? "مدفوع"
                : "Paid"}
          </span>
        )}
        {type === "scholarship" && opportunity.level && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {opportunity.level}
          </span>
        )}
        {type === "volunteering" && (
          <span className="text-sm text-orange-600 dark:text-orange-400">
            {locale === "ar" ? "تطوع" : "Volunteer"}
          </span>
        )}

        <Link
          href={getHref()}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1"
        >
          {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          <svg
            className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
