// © 2026 Forsati. All rights reserved.
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { CVScanHero } from "@/components/cv-scan/CVScanHero";
import { FeaturedJobs } from "@/components/jobs/FeaturedJobs";
import { Footer } from "@/components/layout/Footer";

interface HomePageProps {
  params: { locale: "ar" | "en" };
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      <Header locale={locale} />
      <main>
        {/* Hero Section with CV Scan */}
        <CVScanHero locale={locale} />

        {/* Featured Jobs Section */}
        <FeaturedJobs locale={locale} />

        {/* TODO: Add more sections */}
        {/* - How it Works */}
        {/* - Top Companies */}
        {/* - Testimonials */}
        {/* - Newsletter */}
      </main>
      <Footer locale={locale} />
    </>
  );
}
