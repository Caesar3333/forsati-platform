"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// TODO: Integrate with Keycloak for registration
// TODO: Add email verification flow
// TODO: Add terms acceptance tracking

const registerSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number",
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterClientProps {
  locale: "ar" | "en";
  callbackUrl?: string;
  defaultType: "jobseeker" | "employer";
}

export function RegisterClient({
  locale,
  callbackUrl,
  defaultType,
}: RegisterClientProps) {
  const t = useTranslations("auth.register");
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"jobseeker" | "employer">(
    defaultType,
  );
  const isRTL = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          accountType,
          locale,
        }),
      });

      if (response.ok) {
        // Auto-login after registration
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          callbackUrl: callbackUrl || `/${locale}/me/dashboard`,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => setAccountType("jobseeker")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              accountType === "jobseeker"
                ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("typeJobseeker")}
          </button>
          <button
            type="button"
            onClick={() => setAccountType("employer")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              accountType === "employer"
                ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("typeEmployer")}
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fullName")}
              </label>
              <input
                {...register("fullName")}
                type="text"
                id="fullName"
                autoComplete="name"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={t("fullNamePlaceholder")}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {t("errors.invalidName")}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("email")}
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                autoComplete="email"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={t("emailPlaceholder")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {t("errors.invalidEmail")}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("password")}
              </label>
              <input
                {...register("password")}
                type="password"
                id="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={t("passwordPlaceholder")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {t("errors.weakPassword")}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("confirmPassword")}
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={t("confirmPasswordPlaceholder")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {t("errors.passwordMismatch")}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                {...register("acceptTerms")}
                type="checkbox"
                id="acceptTerms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                {t("acceptTerms")}{" "}
                <Link
                  href={`/${locale}/terms`}
                  className="text-emerald-600 hover:underline"
                >
                  {t("termsLink")}
                </Link>{" "}
                {t("and")}{" "}
                <Link
                  href={`/${locale}/privacy`}
                  className="text-emerald-600 hover:underline"
                >
                  {t("privacyLink")}
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500">
                {t("errors.mustAcceptTerms")}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
                     text-white bg-emerald-600 hover:bg-emerald-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-medium transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            ) : (
              t("submit")
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          {t("haveAccount")}{" "}
          <Link
            href={`/${locale}/auth/login`}
            className="text-emerald-600 hover:text-emerald-500 font-medium"
          >
            {t("login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
