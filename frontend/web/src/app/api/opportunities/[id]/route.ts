// © 2026 Forsati. All rights reserved.
/**
 * Single Opportunity API Route
 * GET /api/opportunities/[id] - تفاصيل وظيفة
 */

import { NextRequest, NextResponse } from "next/server";

interface Opportunity {
  id: string;
  title: string;
  title_ar?: string;
  company: string;
  company_ar?: string;
  company_logo?: string;
  company_website?: string;
  location: string;
  location_ar?: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salary_min?: number;
  salary_max?: number;
  currency: string;
  description: string;
  description_ar?: string;
  requirements: string[];
  requirements_ar?: string[];
  responsibilities: string[];
  responsibilities_ar?: string[];
  benefits: string[];
  benefits_ar?: string[];
  skills: string[];
  posted_at: string;
  expires_at?: string;
  is_featured: boolean;
  applications_count: number;
  views_count: number;
  status: "active" | "closed" | "draft";
  contact_email?: string;
  apply_url?: string;
}

// Extended mock data with more details
const mockOpportunities: Record<string, Opportunity> = {
  "1": {
    id: "1",
    title: "Senior Software Engineer",
    title_ar: "مهندس برمجيات أول",
    company: "Aramex",
    company_ar: "أرامكس",
    company_logo: "https://logo.clearbit.com/aramex.com",
    company_website: "https://aramex.com",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 1500,
    salary_max: 2500,
    currency: "JOD",
    description:
      "We are looking for a Senior Software Engineer to join our technology team. You will be responsible for designing, developing, and maintaining our logistics platform.",
    description_ar:
      "نبحث عن مهندس برمجيات أول للانضمام إلى فريقنا التقني. ستكون مسؤولاً عن تصميم وتطوير وصيانة منصتنا اللوجستية.",
    requirements: [
      "5+ years of experience in software development",
      "Strong proficiency in Node.js and TypeScript",
      "Experience with React or similar frontend frameworks",
      "Familiarity with microservices architecture",
      "Excellent problem-solving skills",
    ],
    requirements_ar: [
      "5+ سنوات خبرة في تطوير البرمجيات",
      "إتقان قوي في Node.js و TypeScript",
      "خبرة في React أو أطر عمل الواجهة الأمامية المشابهة",
      "معرفة بهندسة الخدمات المصغرة",
      "مهارات ممتازة في حل المشكلات",
    ],
    responsibilities: [
      "Design and implement new features for our logistics platform",
      "Write clean, maintainable, and efficient code",
      "Collaborate with cross-functional teams",
      "Mentor junior developers",
      "Participate in code reviews",
    ],
    responsibilities_ar: [
      "تصميم وتنفيذ ميزات جديدة لمنصتنا اللوجستية",
      "كتابة كود نظيف وقابل للصيانة وفعال",
      "التعاون مع الفرق متعددة الوظائف",
      "توجيه المطورين المبتدئين",
      "المشاركة في مراجعات الكود",
    ],
    benefits: [
      "Competitive salary package",
      "Health insurance for you and family",
      "Annual bonus",
      "Professional development budget",
      "Flexible working hours",
      "Remote work options",
    ],
    benefits_ar: [
      "راتب تنافسي",
      "تأمين صحي لك ولعائلتك",
      "مكافأة سنوية",
      "ميزانية للتطوير المهني",
      "ساعات عمل مرنة",
      "خيارات العمل عن بعد",
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "AWS",
    ],
    posted_at: "2026-01-20T10:00:00Z",
    expires_at: "2026-02-20T10:00:00Z",
    is_featured: true,
    applications_count: 45,
    views_count: 320,
    status: "active",
    contact_email: "careers@aramex.com",
    apply_url: "https://aramex.com/careers/apply/1",
  },
  "2": {
    id: "2",
    title: "Marketing Manager",
    title_ar: "مدير تسويق",
    company: "Zain Jordan",
    company_ar: "زين الأردن",
    company_logo: "https://logo.clearbit.com/zain.com",
    company_website: "https://zain.com",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 1200,
    salary_max: 1800,
    currency: "JOD",
    description:
      "Lead our marketing team and develop comprehensive marketing strategies to enhance our market presence.",
    description_ar:
      "قيادة فريق التسويق وتطوير استراتيجيات تسويقية شاملة لتعزيز حضورنا في السوق.",
    requirements: [
      "5+ years of marketing experience",
      "Proven track record in digital marketing",
      "Strong leadership skills",
      "Marketing degree or equivalent",
    ],
    responsibilities: [
      "Develop and execute marketing strategies",
      "Manage marketing budget",
      "Lead a team of marketing professionals",
      "Analyze market trends and competitor activities",
    ],
    benefits: [
      "Competitive compensation",
      "Career growth opportunities",
      "Health and life insurance",
      "Performance bonuses",
    ],
    skills: [
      "Digital Marketing",
      "SEO",
      "Content Strategy",
      "Analytics",
      "Leadership",
    ],
    posted_at: "2026-01-22T14:00:00Z",
    is_featured: true,
    applications_count: 28,
    views_count: 180,
    status: "active",
    contact_email: "hr@zain.com",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // In production, fetch from Strapi
    const opportunity = mockOpportunities[id];

    if (!opportunity) {
      return NextResponse.json(
        {
          error: "not_found",
          message_en: "Opportunity not found",
          message_ar: "الوظيفة غير موجودة",
        },
        { status: 404 },
      );
    }

    // Increment views count (in production, do this in database)
    opportunity.views_count += 1;

    return NextResponse.json(
      { data: opportunity },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Get Opportunity Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to fetch opportunity",
        message_ar: "فشل في جلب تفاصيل الوظيفة",
      },
      { status: 500 },
    );
  }
}
