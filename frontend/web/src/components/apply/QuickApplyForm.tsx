"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

// TODO: Integrate with backend API for quick apply
// TODO: Add resume selection from parsed CVs
// TODO: Add cover letter generation

const quickApplySchema = z.object({
  resumeId: z.string().min(1, "Resume is required"),
  coverLetter: z.string().optional(),
  phone: z.string().min(8, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  additionalInfo: z.string().optional(),
  consentToProcess: z
    .boolean()
    .refine((val) => val === true, "Consent is required"),
});

type QuickApplyFormData = z.infer<typeof quickApplySchema>;

interface QuickApplyFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  locale: "ar" | "en";
  onSuccess?: () => void;
  onCancel?: () => void;
  userResumes?: Array<{
    id: string;
    name: string;
    uploadedAt: string;
  }>;
  userEmail?: string;
  userPhone?: string;
}

export default function QuickApplyForm({
  jobId,
  jobTitle,
  companyName,
  locale,
  onSuccess,
  onCancel,
  userResumes = [],
  userEmail = "",
  userPhone = "",
}: QuickApplyFormProps) {
  const t = useTranslations("apply");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isRTL = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<QuickApplyFormData>({
    resolver: zodResolver(quickApplySchema),
    defaultValues: {
      email: userEmail,
      phone: userPhone,
      consentToProcess: false,
    },
  });

  const selectedResumeId = watch("resumeId");

  const onSubmit = async (data: QuickApplyFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/applications/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("errors.submitFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("quickApply.title")}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t("quickApply.subtitle", { job: jobTitle, company: companyName })}
        </p>
      </div>

      {/* Resume Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("quickApply.selectResume")} *
        </label>
        {userResumes.length > 0 ? (
          <div className="space-y-2">
            {userResumes.map((resume) => (
              <label
                key={resume.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedResumeId === resume.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <input
                  {...register("resumeId")}
                  type="radio"
                  value={resume.id}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {resume.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(resume.uploadedAt).toLocaleDateString(
                      locale === "ar" ? "ar-JO" : "en-JO",
                    )}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {t("quickApply.noResumes")}
            </p>
            <a
              href={`/${locale}/me/cv`}
              className="mt-2 inline-block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t("quickApply.uploadResume")}
            </a>
          </div>
        )}
        {errors.resumeId && (
          <p className="mt-1 text-sm text-red-500">
            {t("errors.resumeRequired")}
          </p>
        )}
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t("quickApply.email")} *
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={t("quickApply.emailPlaceholder")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {t("errors.invalidEmail")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t("quickApply.phone")} *
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={t("quickApply.phonePlaceholder")}
            dir="ltr"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">
              {t("errors.invalidPhone")}
            </p>
          )}
        </div>
      </div>

      {/* Cover Letter (Optional) */}
      <div>
        <label
          htmlFor="coverLetter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("quickApply.coverLetter")} ({t("optional")})
        </label>
        <textarea
          {...register("coverLetter")}
          id="coverLetter"
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          placeholder={t("quickApply.coverLetterPlaceholder")}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t("quickApply.coverLetterHint")}
        </p>
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3">
        <input
          {...register("consentToProcess")}
          type="checkbox"
          id="consent"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label
          htmlFor="consent"
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {t("quickApply.consent")}
        </label>
      </div>
      {errors.consentToProcess && (
        <p className="text-sm text-red-500">{t("errors.consentRequired")}</p>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {submitError}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          {t("quickApply.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || userResumes.length === 0}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("quickApply.submitting")}
            </>
          ) : (
            t("quickApply.submit")
          )}
        </button>
      </div>
    </form>
  );
}
