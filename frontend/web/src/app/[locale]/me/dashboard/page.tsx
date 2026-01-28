// © 2026 Forsati. All rights reserved.
// User Dashboard Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DashboardClient } from "./DashboardClient";
import { authOptions } from "@/lib/auth";

interface DashboardPageProps {
  params: {
    locale: "ar" | "en";
  };
}

export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard",
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // Protect this route - redirect to login if not authenticated
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(
      `/${params.locale}/auth/login?callbackUrl=/${params.locale}/me/dashboard`,
    );
  }

  return (
    <DashboardClient
      locale={params.locale}
      user={{
        id: session.user?.id || "",
        name: session.user?.name || "",
        email: session.user?.email || "",
        image: session.user?.image || undefined,
      }}
    />
  );
}
