// © 2026 Forsati. All rights reserved.
// Login Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginClient } from "./LoginClient";

interface LoginPageProps {
  params: {
    locale: "ar" | "en";
  };
  searchParams: {
    callbackUrl?: string;
    error?: string;
  };
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "auth" });

  return {
    title: t("login.meta.title"),
    description: t("login.meta.description"),
  };
}

export default function LoginPage({ params, searchParams }: LoginPageProps) {
  return (
    <LoginClient
      locale={params.locale}
      callbackUrl={searchParams.callbackUrl}
      error={searchParams.error}
    />
  );
}
