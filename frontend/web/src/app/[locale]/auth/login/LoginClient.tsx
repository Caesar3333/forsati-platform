"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// TODO: Integrate with Keycloak for SSO
// TODO: Add social login providers (Google, LinkedIn)

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginClientProps {
  locale: "ar" | "en";
  callbackUrl?: string;
  error?: string;
}

export function LoginClient({ locale, callbackUrl, error }: LoginClientProps) {
  const t = useTranslations("auth.login");
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl || `/${locale}/me/dashboard`,
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, {
      callbackUrl: callbackUrl || `/${locale}/me/dashboard`,
    });
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {t(`errors.${error}`, { defaultValue: t("errors.default") })}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
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
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={t("emailPlaceholder")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {t("errors.invalidEmail")}
                </p>
              )}
            </div>

            {/* Password Field */}
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
                autoComplete="current-password"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={t("passwordPlaceholder")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {t("errors.invalidPassword")}
                </p>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm text-emerald-600 hover:text-emerald-500"
            >
              {t("forgotPassword")}
            </Link>
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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600
                     rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("keycloak")}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600
                     rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            SSO
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          {t("noAccount")}{" "}
          <Link
            href={`/${locale}/auth/register`}
            className="text-emerald-600 hover:text-emerald-500 font-medium"
          >
            {t("register")}
          </Link>
        </p>
      </div>
    </main>
  );
}
