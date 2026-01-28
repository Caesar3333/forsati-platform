// © 2026 Forsati. All rights reserved.
/**
 * Opportunities API Route
 * GET /api/opportunities - قائمة الوظائف
 */

import { NextRequest, NextResponse } from "next/server";

// Types
interface Opportunity {
  id: string;
  title: string;
  title_ar?: string;
  company: string;
  company_ar?: string;
  location: string;
  location_ar?: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salary_min?: number;
  salary_max?: number;
  currency: string;
  description: string;
  description_ar?: string;
  requirements: string[];
  skills: string[];
  posted_at: string;
  expires_at?: string;
  is_featured: boolean;
  applications_count: number;
  views_count: number;
  status: "active" | "closed" | "draft";
}

interface OpportunitiesResponse {
  data: Opportunity[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

// Mock data for development
const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    title_ar: "مهندس برمجيات أول",
    company: "Aramex",
    company_ar: "أرامكس",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 1500,
    salary_max: 2500,
    currency: "JOD",
    description:
      "We are looking for a Senior Software Engineer to join our team...",
    description_ar: "نبحث عن مهندس برمجيات أول للانضمام إلى فريقنا...",
    requirements: ["5+ years experience", "Node.js", "React", "TypeScript"],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
    posted_at: "2026-01-20T10:00:00Z",
    expires_at: "2026-02-20T10:00:00Z",
    is_featured: true,
    applications_count: 45,
    views_count: 320,
    status: "active",
  },
  {
    id: "2",
    title: "Marketing Manager",
    title_ar: "مدير تسويق",
    company: "Zain Jordan",
    company_ar: "زين الأردن",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 1200,
    salary_max: 1800,
    currency: "JOD",
    description: "Lead our marketing team and develop strategies...",
    description_ar: "قيادة فريق التسويق وتطوير الاستراتيجيات...",
    requirements: [
      "3+ years experience",
      "Marketing degree",
      "Digital marketing",
    ],
    skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics"],
    posted_at: "2026-01-22T14:00:00Z",
    is_featured: true,
    applications_count: 28,
    views_count: 180,
    status: "active",
  },
  {
    id: "3",
    title: "Data Analyst",
    title_ar: "محلل بيانات",
    company: "Jordan Ahli Bank",
    company_ar: "البنك الأهلي الأردني",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 900,
    salary_max: 1400,
    currency: "JOD",
    description: "Analyze banking data and create reports...",
    description_ar: "تحليل بيانات البنك وإنشاء التقارير...",
    requirements: ["2+ years experience", "SQL", "Python", "Power BI"],
    skills: ["SQL", "Python", "Power BI", "Excel", "Statistics"],
    posted_at: "2026-01-25T09:00:00Z",
    is_featured: false,
    applications_count: 15,
    views_count: 95,
    status: "active",
  },
  {
    id: "4",
    title: "UI/UX Designer",
    title_ar: "مصمم واجهات المستخدم",
    company: "Mawdoo3",
    company_ar: "موضوع",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 800,
    salary_max: 1300,
    currency: "JOD",
    description: "Design user interfaces for our products...",
    description_ar: "تصميم واجهات المستخدم لمنتجاتنا...",
    requirements: [
      "3+ years experience",
      "Figma",
      "Adobe XD",
      "Portfolio required",
    ],
    skills: ["Figma", "Adobe XD", "UI Design", "UX Research", "Prototyping"],
    posted_at: "2026-01-26T11:00:00Z",
    is_featured: false,
    applications_count: 22,
    views_count: 145,
    status: "active",
  },
  {
    id: "5",
    title: "HR Specialist",
    title_ar: "أخصائي موارد بشرية",
    company: "Orange Jordan",
    company_ar: "أورانج الأردن",
    location: "Amman, Jordan",
    location_ar: "عمّان، الأردن",
    type: "full-time",
    salary_min: 700,
    salary_max: 1000,
    currency: "JOD",
    description: "Handle recruitment and employee relations...",
    description_ar: "إدارة التوظيف وعلاقات الموظفين...",
    requirements: ["2+ years experience", "HR certification preferred"],
    skills: ["Recruitment", "Employee Relations", "HRIS", "Labor Law"],
    posted_at: "2026-01-27T08:00:00Z",
    is_featured: false,
    applications_count: 35,
    views_count: 200,
    status: "active",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const location = searchParams.get("location") || "";
    const featured = searchParams.get("featured") === "true";
    const skills = searchParams.get("skills")?.split(",").filter(Boolean) || [];
    const salaryMin = parseInt(searchParams.get("salaryMin") || "0", 10);
    const salaryMax = parseInt(searchParams.get("salaryMax") || "999999", 10);

    // Filter opportunities
    let filtered = [...mockOpportunities];

    // Search filter (title, company, description)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchLower) ||
          opp.title_ar?.includes(search) ||
          opp.company.toLowerCase().includes(searchLower) ||
          opp.company_ar?.includes(search) ||
          opp.description.toLowerCase().includes(searchLower),
      );
    }

    // Type filter
    if (type) {
      filtered = filtered.filter((opp) => opp.type === type);
    }

    // Location filter
    if (location) {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.location.toLowerCase().includes(locationLower) ||
          opp.location_ar?.includes(location),
      );
    }

    // Featured filter
    if (featured) {
      filtered = filtered.filter((opp) => opp.is_featured);
    }

    // Skills filter
    if (skills.length > 0) {
      filtered = filtered.filter((opp) =>
        skills.some((skill) =>
          opp.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
        ),
      );
    }

    // Salary filter
    if (salaryMin > 0 || salaryMax < 999999) {
      filtered = filtered.filter(
        (opp) =>
          (opp.salary_min || 0) >= salaryMin &&
          (opp.salary_max || 999999) <= salaryMax,
      );
    }

    // Sort by featured first, then by posted date
    filtered.sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return a.is_featured ? -1 : 1;
      }
      return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
    });

    // Paginate
    const total = filtered.length;
    const pageCount = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    const response: OpportunitiesResponse = {
      data: paginatedData,
      meta: {
        total,
        page,
        pageSize,
        pageCount,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Opportunities API Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to fetch opportunities",
        message_ar: "فشل في جلب الوظائف",
      },
      { status: 500 },
    );
  }
}
