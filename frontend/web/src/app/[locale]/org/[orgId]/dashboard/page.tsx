// © 2026 Forsati. All rights reserved.
// Organization Dashboard Page

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { OrgDashboardClient } from "./OrgDashboardClient";
import { authOptions } from "@/lib/auth";

interface OrgDashboardPageProps {
  params: {
    locale: "ar" | "en";
    orgId: string;
  };
}

export async function generateMetadata({
  params,
}: OrgDashboardPageProps): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "orgDashboard",
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function OrgDashboardPage({
  params,
}: OrgDashboardPageProps) {
  // Protect this route
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(
      `/${params.locale}/auth/login?callbackUrl=/${params.locale}/org/${params.orgId}/dashboard`,
    );
  }

  // TODO: Verify user has access to this organization
  // TODO: Fetch organization data from Strapi
  const organization = {
    id: params.orgId,
    name: "Sample Organization",
    logo: null,
  };

  if (!organization) {
    notFound();
  }

  return (
    <OrgDashboardClient
      locale={params.locale}
      organization={organization}
      user={{
        id: session.user?.id || "",
        name: session.user?.name || "",
        email: session.user?.email || "",
      }}
    />
  );
}
