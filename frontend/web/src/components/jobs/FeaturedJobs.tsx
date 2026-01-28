// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Clock,
  Briefcase,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface FeaturedJobsProps {
  locale: "ar" | "en";
}

const translations = {
  ar: {
    title: "أحدث الفرص المتاحة",
    subtitle: "اكتشف آلاف الفرص من أفضل الشركات في الأردن",
    viewAll: "عرض جميع الفرص",
    apply: "قدّم الآن",
    save: "حفظ",
    postedAgo: "قبل {time}",
    applicants: "{count} متقدم",
    salary: "الراتب",
    negotiable: "قابل للتفاوض",
    perMonth: "/شهر",
    new: "جديد",
    featured: "مميز",
    urgent: "عاجل",
  },
  en: {
    title: "Latest Opportunities",
    subtitle:
      "Discover thousands of opportunities from top companies in Jordan",
    viewAll: "View All Jobs",
    apply: "Apply Now",
    save: "Save",
    postedAgo: "{time} ago",
    applicants: "{count} applicants",
    salary: "Salary",
    negotiable: "Negotiable",
    perMonth: "/month",
    new: "New",
    featured: "Featured",
    urgent: "Urgent",
  },
};

// Mock job data
const mockJobs = [
  {
    id: "1",
    title: {
      ar: "مطور واجهات أمامية",
      en: "Frontend Developer",
    },
    company: {
      name: "TechCorp Jordan",
      logo: null,
    },
    location: {
      ar: "عمّان",
      en: "Amman",
    },
    type: {
      ar: "دوام كامل",
      en: "Full-time",
    },
    salary: {
      min: 800,
      max: 1200,
      currency: "JOD",
      negotiable: false,
    },
    postedAt: "2d",
    applicants: 45,
    tags: ["React", "TypeScript", "Tailwind"],
    isNew: true,
    isFeatured: true,
    isUrgent: false,
  },
  {
    id: "2",
    title: {
      ar: "محلل بيانات",
      en: "Data Analyst",
    },
    company: {
      name: "DataVision",
      logo: null,
    },
    location: {
      ar: "إربد",
      en: "Irbid",
    },
    type: {
      ar: "عن بُعد",
      en: "Remote",
    },
    salary: {
      min: 600,
      max: 900,
      currency: "JOD",
      negotiable: true,
    },
    postedAt: "1d",
    applicants: 23,
    tags: ["Python", "SQL", "Tableau"],
    isNew: true,
    isFeatured: false,
    isUrgent: false,
  },
  {
    id: "3",
    title: {
      ar: "مدير تسويق رقمي",
      en: "Digital Marketing Manager",
    },
    company: {
      name: "GrowthHub",
      logo: null,
    },
    location: {
      ar: "عمّان",
      en: "Amman",
    },
    type: {
      ar: "دوام كامل",
      en: "Full-time",
    },
    salary: {
      min: 1000,
      max: 1500,
      currency: "JOD",
      negotiable: false,
    },
    postedAt: "3d",
    applicants: 67,
    tags: ["SEO", "SEM", "Social Media"],
    isNew: false,
    isFeatured: true,
    isUrgent: true,
  },
  {
    id: "4",
    title: {
      ar: "مهندس برمجيات",
      en: "Software Engineer",
    },
    company: {
      name: "InnovateTech",
      logo: null,
    },
    location: {
      ar: "الزرقاء",
      en: "Zarqa",
    },
    type: {
      ar: "هجين",
      en: "Hybrid",
    },
    salary: {
      min: 900,
      max: 1400,
      currency: "JOD",
      negotiable: false,
    },
    postedAt: "5h",
    applicants: 12,
    tags: ["Node.js", "AWS", "Docker"],
    isNew: true,
    isFeatured: false,
    isUrgent: false,
  },
  {
    id: "5",
    title: {
      ar: "مصمم UI/UX",
      en: "UI/UX Designer",
    },
    company: {
      name: "DesignStudio",
      logo: null,
    },
    location: {
      ar: "عمّان",
      en: "Amman",
    },
    type: {
      ar: "دوام جزئي",
      en: "Part-time",
    },
    salary: {
      min: 500,
      max: 800,
      currency: "JOD",
      negotiable: true,
    },
    postedAt: "1w",
    applicants: 89,
    tags: ["Figma", "Adobe XD", "Prototyping"],
    isNew: false,
    isFeatured: false,
    isUrgent: false,
  },
  {
    id: "6",
    title: {
      ar: "محاسب",
      en: "Accountant",
    },
    company: {
      name: "FinanceFirst",
      logo: null,
    },
    location: {
      ar: "العقبة",
      en: "Aqaba",
    },
    type: {
      ar: "دوام كامل",
      en: "Full-time",
    },
    salary: {
      min: 450,
      max: 650,
      currency: "JOD",
      negotiable: false,
    },
    postedAt: "4d",
    applicants: 34,
    tags: ["Excel", "SAP", "QuickBooks"],
    isNew: false,
    isFeatured: false,
    isUrgent: true,
  },
];

export function FeaturedJobs({ locale }: FeaturedJobsProps) {
  const t = translations[locale];
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const visibleJobs = 3;
  const maxIndex = mockJobs.length - visibleJobs;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-16 lg:py-24 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t.title}
            </h2>
            <p className="text-muted mt-2">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={cn(
                  "p-2 rounded-lg border border-border hover:bg-neutral-100 transition-colors",
                  currentIndex === 0 && "opacity-50 cursor-not-allowed",
                )}
                aria-label="Previous"
              >
                {isRTL ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className={cn(
                  "p-2 rounded-lg border border-border hover:bg-neutral-100 transition-colors",
                  currentIndex >= maxIndex && "opacity-50 cursor-not-allowed",
                )}
                aria-label="Next"
              >
                {isRTL ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>
            <Button variant="outline" asChild>
              <Link href="/jobs" className="flex items-center gap-2">
                {t.viewAll}
                <Arrow className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockJobs
            .slice(currentIndex, currentIndex + visibleJobs)
            .map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        {/* Company Logo */}
                        <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {job.title[locale]}
                          </h3>
                          <p className="text-sm text-muted truncate">
                            {job.company.name}
                          </p>
                        </div>
                      </div>
                      <button
                        className="p-2 text-muted hover:text-primary-500 transition-colors shrink-0"
                        aria-label={t.save}
                      >
                        <Bookmark className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.isNew && (
                        <Badge variant="success" size="sm">
                          {t.new}
                        </Badge>
                      )}
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

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {job.location[locale]}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        {job.type[locale]}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Clock className="h-4 w-4 shrink-0" />
                        {t.postedAgo.replace("{time}", job.postedAt)}
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-muted mb-1">{t.salary}</p>
                      <p className="font-semibold text-foreground">
                        {job.salary.negotiable ? (
                          t.negotiable
                        ) : (
                          <>
                            {formatCurrency(
                              job.salary.min,
                              job.salary.currency,
                              locale,
                            )}{" "}
                            -{" "}
                            {formatCurrency(
                              job.salary.max,
                              job.salary.currency,
                              locale,
                            )}
                            <span className="text-sm font-normal text-muted">
                              {t.perMonth}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="text-xs text-muted">
                        {t.applicants.replace(
                          "{count}",
                          String(job.applicants),
                        )}
                      </p>
                      <Button variant="primary" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>{t.apply}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {Array.from({ length: mockJobs.length - visibleJobs + 1 }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-6 bg-primary-500"
                    : "w-2 bg-neutral-300",
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedJobs;
