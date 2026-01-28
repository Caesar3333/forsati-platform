// © 2026 Forsati. All rights reserved.
// Job Detail Client Component

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Briefcase,
  Users,
  Eye,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useCopyJobLink } from "@/hooks/useClipboard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { CVScanModal } from "@/components/cv-scan/CVScanModal";
import {
  type Job,
  saveJob,
  unsaveJob,
  isJobSaved,
  getApplicationLink,
} from "@/lib/opportunities";

interface JobDetailClientProps {
  job: Job;
  locale: "ar" | "en";
}

const translations = {
  ar: {
    apply: "قدّم الآن",
    quickApply: "تقديم سريع",
    loginToApply: "سجّل الدخول للتقديم",
    save: "حفظ",
    saved: "محفوظ",
    share: "مشاركة",
    copyLink: "نسخ الرابط",
    description: "وصف الوظيفة",
    requirements: "المتطلبات",
    responsibilities: "المسؤوليات",
    benefits: "المزايا",
    aboutCompany: "عن الشركة",
    similarJobs: "وظائف مشابهة",
    salary: "الراتب",
    negotiable: "قابل للتفاوض",
    confidential: "سري",
    perMonth: "/شهر",
    applicants: "{count} متقدم",
    views: "{count} مشاهدة",
    postedAt: "نُشرت {date}",
    deadline: "آخر موعد للتقديم",
    type: "نوع العمل",
    experience: "مستوى الخبرة",
    location: "الموقع",
    skills: "المهارات المطلوبة",
    applyNow: "قدّم الآن",
    applyViaCV: "قدّم باستخدام سيرتك",
    uploadCV: "ارفع سيرتك الذاتية",
    backToJobs: "العودة لقائمة الوظائف",
    expired: "انتهت فترة التقديم",
    remote: "عن بُعد",
    hybrid: "هجين",
    onsite: "من الموقع",
    new: "جديد",
    featured: "مميز",
    urgent: "عاجل",
    experienceLevels: {
      entry: "حديث التخرج",
      junior: "مبتدئ (1-2 سنة)",
      mid: "متوسط (3-5 سنوات)",
      senior: "خبير (5+ سنوات)",
      lead: "قيادي",
      executive: "تنفيذي",
    },
    jobTypes: {
      "full-time": "دوام كامل",
      "part-time": "دوام جزئي",
      contract: "عقد",
      internship: "تدريب",
      remote: "عن بُعد",
      hybrid: "هجين",
    },
  },
  en: {
    apply: "Apply Now",
    quickApply: "Quick Apply",
    loginToApply: "Login to Apply",
    save: "Save",
    saved: "Saved",
    share: "Share",
    copyLink: "Copy Link",
    description: "Job Description",
    requirements: "Requirements",
    responsibilities: "Responsibilities",
    benefits: "Benefits",
    aboutCompany: "About the Company",
    similarJobs: "Similar Jobs",
    salary: "Salary",
    negotiable: "Negotiable",
    confidential: "Confidential",
    perMonth: "/month",
    applicants: "{count} applicants",
    views: "{count} views",
    postedAt: "Posted {date}",
    deadline: "Application Deadline",
    type: "Job Type",
    experience: "Experience Level",
    location: "Location",
    skills: "Required Skills",
    applyNow: "Apply Now",
    applyViaCV: "Apply with your CV",
    uploadCV: "Upload your CV",
    backToJobs: "Back to Jobs",
    expired: "Application period ended",
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
    new: "New",
    featured: "Featured",
    urgent: "Urgent",
    experienceLevels: {
      entry: "Entry Level",
      junior: "Junior (1-2 years)",
      mid: "Mid-level (3-5 years)",
      senior: "Senior (5+ years)",
      lead: "Lead",
      executive: "Executive",
    },
    jobTypes: {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      internship: "Internship",
      remote: "Remote",
      hybrid: "Hybrid",
    },
  },
};

export function JobDetailClient({ job, locale }: JobDetailClientProps) {
  const _router = useRouter();
  const t = translations[locale];
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const { isAuthenticated, loginWithRedirect, user: _user } = useAuth();
  const { success, error: showError } = useToast();
  const { copyJobLink } = useCopyJobLink();
  const { trackJobView, trackApplyStart, track } = useAnalytics();

  const [isSaved, setIsSaved] = React.useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [isLoadingSave, setIsLoadingSave] = React.useState(false);
  const [isLoadingApply, setIsLoadingApply] = React.useState(false);

  // Check if job is saved on mount
  React.useEffect(() => {
    if (isAuthenticated) {
      isJobSaved(job.id).then(setIsSaved);
    }
  }, [job.id, isAuthenticated]);

  // Track job view
  React.useEffect(() => {
    trackJobView({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company.name,
      source: "detail_page",
    });
  }, [job.id, job.title, job.company.name, trackJobView]);

  // Check if application deadline has passed
  const isExpired = job.applicationDeadline
    ? new Date(job.applicationDeadline) < new Date()
    : false;

  const handleSave = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    setIsLoadingSave(true);
    try {
      if (isSaved) {
        await unsaveJob(job.id);
        setIsSaved(false);
        track("job.unsave", { jobId: job.id });
      } else {
        await saveJob(job.id);
        setIsSaved(true);
        track("job.save", { jobId: job.id });
        success(isRTL ? "تم حفظ الوظيفة" : "Job saved");
      }
    } catch (_err) {
      showError(isRTL ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `${job.title} - ${job.company.name}`,
          url: job.canonical || window.location.href,
        });
        track("job.share", { jobId: job.id, method: "native" });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    await copyJobLink({
      id: job.id,
      title: job.title,
      company: job.company.name,
      canonical: job.canonical,
    });
    track("job.copy_link", { jobId: job.id });
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    trackApplyStart({ jobId: job.id, jobTitle: job.title, method: "quick" });

    setIsLoadingApply(true);
    try {
      // Get application link (may require additional checks)
      const { applyUrl } = await getApplicationLink(job.id);

      if (applyUrl.startsWith("http")) {
        // External application
        window.open(applyUrl, "_blank");
      } else {
        // Internal - open CV scan modal for quick apply
        setIsApplyModalOpen(true);
      }
    } catch (err: any) {
      if (err.status === 403) {
        loginWithRedirect();
      } else {
        setIsApplyModalOpen(true); // Fallback to CV upload
      }
    } finally {
      setIsLoadingApply(false);
    }
  };

  // JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    validThrough: job.applicationDeadline,
    employmentType: job.type.toUpperCase().replace("-", "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.company.website,
      logo: job.company.logo,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.city,
        addressCountry: job.location.country,
      },
    },
    baseSalary:
      job.salary && !job.salary.confidential
        ? {
            "@type": "MonetaryAmount",
            currency: job.salary.currency,
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary.min,
              maxValue: job.salary.max,
              unitText: "MONTH",
            },
          }
        : undefined,
    skills: job.skills.join(", "),
    industry: job.categories.join(", "),
  };

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-neutral-50" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
            >
              {isRTL ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
              {t.backToJobs}
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Company Logo */}
                    <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="h-12 w-12 rounded-lg object-contain"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-primary-600" />
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
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
                        {isExpired && (
                          <Badge variant="warning" size="sm">
                            {t.expired}
                          </Badge>
                        )}
                      </div>

                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {job.title}
                      </h1>

                      <Link
                        href={`/companies/${job.company.slug}`}
                        className="text-lg text-primary-500 hover:underline"
                      >
                        {job.company.name}
                        {job.company.verified && (
                          <CheckCircle className="inline h-4 w-4 ml-1 text-success-500" />
                        )}
                      </Link>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location.city}, {job.location.country}
                          {job.location.remote && ` (${t.remote})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {t.jobTypes[job.type as keyof typeof t.jobTypes]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {t.postedAt.replace(
                            "{date}",
                            new Date(job.postedAt).toLocaleDateString(locale),
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        loading={isLoadingSave}
                        aria-label={isSaved ? t.saved : t.save}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary-500" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        aria-label={t.share}
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mt-6 pt-6 border-t border-border text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {t.applicants.replace(
                        "{count}",
                        String(job.applicantsCount),
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {t.views.replace("{count}", String(job.viewsCount))}
                    </span>
                    {job.applicationDeadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t.deadline}:{" "}
                        {new Date(job.applicationDeadline).toLocaleDateString(
                          locale,
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t.requirements}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Responsibilities */}
              {job.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t.responsibilities}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Arrow className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t.benefits}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-success-500 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  {/* Salary */}
                  {job.salary && (
                    <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-muted mb-1">{t.salary}</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {job.salary.confidential ? (
                          t.confidential
                        ) : job.salary.negotiable ? (
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
                  )}

                  {/* Apply Buttons */}
                  {isExpired ? (
                    <div className="p-4 bg-warning-50 rounded-lg text-center">
                      <AlertCircle className="h-8 w-8 text-warning-500 mx-auto mb-2" />
                      <p className="text-warning-700 font-medium">
                        {t.expired}
                      </p>
                    </div>
                  ) : isAuthenticated ? (
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleApply}
                        loading={isLoadingApply}
                      >
                        {t.quickApply}
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setIsApplyModalOpen(true)}
                      >
                        {t.uploadCV}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={loginWithRedirect}
                    >
                      {t.loginToApply}
                    </Button>
                  )}

                  {/* Job Details */}
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted">{t.type}</span>
                      <span className="font-medium">
                        {t.jobTypes[job.type as keyof typeof t.jobTypes]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{t.experience}</span>
                      <span className="font-medium">
                        {
                          t.experienceLevels[
                            job.experienceLevel as keyof typeof t.experienceLevels
                          ]
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{t.location}</span>
                      <span className="font-medium">{job.location.city}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-3">
                        {t.skills}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="default" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.aboutCompany}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="h-10 w-10 rounded object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {job.company.name}
                        {job.company.verified && (
                          <CheckCircle className="inline h-4 w-4 ml-1 text-success-500" />
                        )}
                      </p>
                      <p className="text-sm text-muted">
                        {job.company.industry}
                      </p>
                    </div>
                  </Link>

                  {job.company.description && (
                    <p className="text-sm text-muted line-clamp-3">
                      {job.company.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/companies/${job.company.slug}`}>
                        {isRTL ? "عرض الشركة" : "View Company"}
                      </Link>
                    </Button>
                    {job.company.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CV Scan Modal for Quick Apply */}
      <CVScanModal
        locale={locale}
        open={isApplyModalOpen}
        onOpenChange={setIsApplyModalOpen}
        onSubmit={async (data) => {
          // Handle quick apply with uploaded CV
          track("apply.quick_apply", { jobId: job.id });
          success(
            isRTL
              ? "تم إرسال طلبك بنجاح"
              : "Application submitted successfully",
          );
          setIsApplyModalOpen(false);
        }}
      />
    </>
  );
}

export default JobDetailClient;
