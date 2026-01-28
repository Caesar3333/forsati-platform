// © 2026 Forsati. All rights reserved.
// Job Detail Page

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/opportunities";
import { JobDetailClient } from "./JobDetailClient";

interface JobPageProps {
  params: {
    locale: "ar" | "en";
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  try {
    const job = await getJob(params.id);
    const isArabic = params.locale === "ar";

    return {
      title: job.title,
      description: job.description.slice(0, 160),
      openGraph: {
        type: "article",
        title: job.ogMeta?.title || job.title,
        description: job.ogMeta?.description || job.description.slice(0, 160),
        images: job.ogMeta?.image ? [job.ogMeta.image] : [],
        url: job.canonical,
        siteName: isArabic ? "فرصتي" : "Forsati",
      },
      twitter: {
        card: "summary_large_image",
        title: job.ogMeta?.title || job.title,
        description: job.ogMeta?.description || job.description.slice(0, 160),
        images: job.ogMeta?.image ? [job.ogMeta.image] : [],
      },
      alternates: {
        canonical: job.canonical,
      },
      other: {
        // JSON-LD for JobPosting schema will be added in the component
      },
    };
  } catch {
    return {
      title: isArabic ? "فرصة عمل" : "Job Opportunity",
    };
  }

  // Helper for Arabic check in catch block
  var isArabic = params.locale === "ar";
}

export default async function JobPage({ params }: JobPageProps) {
  let job;

  try {
    job = await getJob(params.id);
  } catch (error) {
    notFound();
  }

  if (!job || !job.isActive) {
    notFound();
  }

  return <JobDetailClient job={job} locale={params.locale} />;
}
