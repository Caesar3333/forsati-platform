// © 2026 Forsati. All rights reserved.
// Register Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterClient } from "./RegisterClient";

interface RegisterPageProps {
  params: {
    locale: "ar" | "en";
  };
  searchParams: {
    callbackUrl?: string;
    type?: "jobseeker" | "employer";
  };
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "auth" });

  return {
    title: t("register.meta.title"),
    description: t("register.meta.description"),
  };
}

export default function RegisterPage({ params, searchParams }: RegisterPageProps) {
  return (
    <RegisterClient
      locale={params.locale}
      callbackUrl={searchParams.callbackUrl}
      defaultType={searchParams.type || "jobseeker"}
    />
  );
}
