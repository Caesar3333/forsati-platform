// © 2026 Forsati. All rights reserved.
// Test Utilities

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/hooks/useToast";

// Default session for tests
const defaultSession = {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    image: null,
  },
};

interface WrapperProps {
  children: React.ReactNode;
  session?: typeof defaultSession | null;
  locale?: "ar" | "en";
}

// Custom render function with providers
function AllProviders({ children, session = null, locale = "en" }: WrapperProps) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
          {children}
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: typeof defaultSession | null;
  locale?: "ar" | "en";
}

function customRender(
  ui: React.ReactElement,
  { session, locale, ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders session={session} locale={locale}>
        {children}
      </AllProviders>
    ),
    ...options,
  });
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const createMockJob = (overrides = {}) => ({
  id: "job-1",
  title: "Software Engineer",
  slug: "software-engineer",
  description: "A great job opportunity",
  type: "full-time" as const,
  experienceLevel: "mid" as const,
  postedAt: new Date().toISOString(),
  isActive: true,
  isFeatured: false,
  isUrgent: false,
  applicantsCount: 10,
  viewsCount: 100,
  location: {
    city: "Amman",
    country: "Jordan",
    remote: false,
  },
  company: {
    id: "company-1",
    name: "Tech Corp",
    slug: "tech-corp",
    logo: null,
    verified: true,
    industry: "Technology",
    website: "https://techcorp.com",
    description: "A tech company",
  },
  salary: {
    min: 1000,
    max: 2000,
    currency: "JOD" as const,
    negotiable: false,
    confidential: false,
  },
  skills: ["JavaScript", "React", "TypeScript"],
  requirements: ["3+ years experience", "Bachelor's degree"],
  responsibilities: ["Build features", "Code review"],
  benefits: ["Health insurance", "Remote work"],
  categories: ["Technology", "Software"],
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: "user-1",
  name: "John Doe",
  nameAr: "جون دو",
  email: "john@example.com",
  phone: "+962791234567",
  role: "candidate" as const,
  locale: "en" as const,
  ...overrides,
});

export const createMockResume = (overrides = {}) => ({
  id: "resume-1",
  fileName: "resume.pdf",
  fileSize: 1024 * 500,
  mimeType: "application/pdf",
  uploadedAt: new Date().toISOString(),
  parsed: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+962791234567",
    skills: ["JavaScript", "React"],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        startDate: "2020-01",
        endDate: "2023-06",
        description: "Built web apps",
      },
    ],
    education: [
      {
        degree: "Bachelor's",
        field: "Computer Science",
        institution: "University",
        year: 2020,
      },
    ],
  },
  ...overrides,
});
