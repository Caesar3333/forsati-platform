// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CVScanModal } from "@/components/cv-scan/CVScanModal";

interface CVScanHeroProps {
  locale: "ar" | "en";
}

const translations = {
  ar: {
    badge: "منصة التوظيف الذكية #1 في الأردن",
    title: "ابحث عن فرصتك المثالية",
    titleHighlight: "بالذكاء الاصطناعي",
    subtitle:
      "حمّل سيرتك الذاتية واحصل على تحليل فوري، اقتراحات للتحسين، ومطابقة ذكية مع آلاف الفرص",
    dropzone: "اسحب سيرتك الذاتية هنا أو",
    browse: "تصفح الملفات",
    formats: "PDF, DOC, DOCX حتى 10MB",
    orSearch: "أو ابحث عن وظائف مباشرة",
    searchPlaceholder: "ابحث عن وظيفة، شركة، أو مهارة...",
    searchBtn: "ابحث",
    stats: {
      jobs: "فرصة عمل",
      companies: "شركة",
      candidates: "باحث عن عمل",
      placements: "توظيف ناجح",
    },
    features: [
      { icon: Sparkles, text: "تحليل ذكي بالـ AI" },
      { icon: TrendingUp, text: "اقتراحات للتحسين" },
      { icon: CheckCircle, text: "مطابقة فورية" },
    ],
    trustedBy: "موثوق من أكثر من 500 شركة",
  },
  en: {
    badge: "#1 Smart Employment Platform in Jordan",
    title: "Find Your Perfect Opportunity",
    titleHighlight: "with AI",
    subtitle:
      "Upload your CV and get instant analysis, improvement suggestions, and smart matching with thousands of opportunities",
    dropzone: "Drag your CV here or",
    browse: "Browse Files",
    formats: "PDF, DOC, DOCX up to 10MB",
    orSearch: "Or search jobs directly",
    searchPlaceholder: "Search for a job, company, or skill...",
    searchBtn: "Search",
    stats: {
      jobs: "Job Opportunities",
      companies: "Companies",
      candidates: "Job Seekers",
      placements: "Successful Placements",
    },
    features: [
      { icon: Sparkles, text: "AI-Powered Analysis" },
      { icon: TrendingUp, text: "Improvement Tips" },
      { icon: CheckCircle, text: "Instant Matching" },
    ],
    trustedBy: "Trusted by 500+ companies",
  },
};

const stats = [
  { value: "25,000+", key: "jobs", icon: Briefcase },
  { value: "2,500+", key: "companies", icon: Building2 },
  { value: "150,000+", key: "candidates", icon: Users },
  { value: "50,000+", key: "placements", icon: Star },
];

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export function CVScanHero({ locale }: CVScanHeroProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const t = translations[locale];
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setModalOpen(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(11 116 255 / 0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />

      <div className="container relative mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left/Right Content (based on RTL) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("space-y-6", isRTL && "lg:order-2")}
          >
            {/* Badge */}
            <Badge variant="primary" size="lg" icon={<Star className="h-3 w-3" />}>
              {t.badge}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {t.title}
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                {t.titleHighlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted max-w-xl">{t.subtitle}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-4">
              {t.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <feature.icon className="h-4 w-4 text-primary-500" />
                  {feature.text}
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="pt-4">
              <p className="text-sm text-muted mb-3">{t.orSearch}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Navigate to search results
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted",
                      isRTL ? "right-3" : "left-3"
                    )}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={cn(
                      "w-full h-12 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500",
                      isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                    )}
                  />
                </div>
                <Button variant="primary" size="lg" type="submit">
                  {t.searchBtn}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* CV Upload Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(isRTL && "lg:order-1")}
          >
            <div className="relative">
              {/* Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-primary-500 bg-primary-50"
                      : "border-border hover:border-primary-300 hover:bg-primary-50/50"
                  )}
                >
                  <input {...getInputProps()} />

                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ y: isDragActive ? -10 : 0 }}
                      className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center"
                    >
                      {isDragActive ? (
                        <Sparkles className="h-10 w-10 text-primary-600 animate-pulse" />
                      ) : (
                        <Upload className="h-10 w-10 text-primary-600" />
                      )}
                    </motion.div>

                    <div>
                      <p className="text-base font-medium text-foreground">
                        {t.dropzone}{" "}
                        <span className="text-primary-500 hover:underline">
                          {t.browse}
                        </span>
                      </p>
                      <p className="text-sm text-muted mt-1">{t.formats}</p>
                    </div>
                  </div>
                </div>

                {/* Or Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted">{t.orSearch}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Quick CTA */}
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  rightIcon={<Arrow className="h-4 w-4" />}
                  onClick={() => setModalOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  {isRTL ? "افحص سيرتك بالذكاء الاصطناعي" : "AI-Powered CV Scan"}
                </Button>
              </div>

              {/* Floating Badge */}
              <div
                className={cn(
                  "absolute -bottom-4 bg-white rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2",
                  isRTL ? "-left-4" : "-right-4"
                )}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-600"
                    >
                      {i === 1 ? "أ" : i === 2 ? "ب" : "ج"}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted">{t.trustedBy}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 pt-16 border-t border-border"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted mt-1">
                  {t.stats[stat.key as keyof typeof t.stats]}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CV Scan Modal */}
      <CVScanModal
        locale={locale}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(data) => {
          console.log("CV submitted:", data);
          setModalOpen(false);
        }}
      />
    </section>
  );
}

export default CVScanHero;
