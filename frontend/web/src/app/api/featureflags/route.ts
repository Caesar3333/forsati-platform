/**
 * Forsati Platform - Feature Flags API Routes
 * مسارات API لأعلام الميزات
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================
// Schemas
// ============================================

const UpdateFlagSchema = z.object({
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  activeForRoles: z.array(z.string()).optional(),
  activeForMarkets: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
});

const CreateFlagSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z_]+$/),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  enabled: z.boolean().default(false),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  category: z.enum(["core", "ai", "social", "monetization", "experimental"]),
  activeForRoles: z.array(z.string()).optional(),
  activeForMarkets: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
});

// ============================================
// GET /api/featureflags - Get all flags
// ============================================

export async function GET(request: NextRequest) {
  try {
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Public endpoint - no auth required for reading flags
    const queryParams = new URLSearchParams({
      "pagination[limit]": "100",
    });

    if (category) {
      queryParams.append("filters[category][$eq]", category);
    }

    const response = await fetch(
      `${strapiUrl}/api/feature-flags?${queryParams}`,
    );

    if (!response.ok) {
      // Return default flags if Strapi is unavailable
      return NextResponse.json(getDefaultFlags());
    }

    const data = await response.json();

    const flags = data.data.map((flag: any) => ({
      id: flag.id,
      ...flag.attributes,
    }));

    return NextResponse.json(flags);
  } catch (error) {
    console.error("Feature flags error:", error);
    // Return default flags on error
    return NextResponse.json(getDefaultFlags());
  }
}

// ============================================
// Default Flags
// ============================================

function getDefaultFlags() {
  return [
    {
      key: "cv_scan",
      name: "CV Scanner",
      nameAr: "فاحص السيرة الذاتية",
      description: "AI-powered CV analysis and feedback",
      enabled: true,
      rolloutPercentage: 100,
      category: "ai",
    },
    {
      key: "ai_matching",
      name: "AI Job Matching",
      nameAr: "المطابقة الذكية للوظائف",
      description: "Intelligent job-candidate matching",
      enabled: true,
      rolloutPercentage: 100,
      category: "ai",
    },
    {
      key: "quick_apply",
      name: "Quick Apply",
      nameAr: "التقديم السريع",
      description: "One-click job applications",
      enabled: true,
      rolloutPercentage: 100,
      category: "core",
    },
    {
      key: "email_apply",
      name: "Email Apply",
      nameAr: "التقديم بالبريد",
      description: "Apply via email",
      enabled: true,
      rolloutPercentage: 100,
      category: "core",
    },
    {
      key: "whatsapp_apply",
      name: "WhatsApp Apply",
      nameAr: "التقديم بواتساب",
      description: "Apply via WhatsApp",
      enabled: true,
      rolloutPercentage: 100,
      category: "core",
    },
    {
      key: "social_posts",
      name: "Social Posts",
      nameAr: "المنشورات الاجتماعية",
      description: "Social networking features",
      enabled: true,
      rolloutPercentage: 50,
      category: "social",
    },
    {
      key: "portfolio_builder",
      name: "Portfolio Builder",
      nameAr: "بناء المعرض",
      description: "Visual portfolio creation tool",
      enabled: true,
      rolloutPercentage: 100,
      category: "core",
    },
    {
      key: "premium_promotion",
      name: "Premium Promotion",
      nameAr: "الترويج المميز",
      description: "Show premium upgrade prompts",
      enabled: true,
      rolloutPercentage: 100,
      category: "monetization",
    },
    {
      key: "video_interviews",
      name: "Video Interviews",
      nameAr: "المقابلات المرئية",
      description: "In-platform video interviews",
      enabled: false,
      rolloutPercentage: 0,
      category: "experimental",
    },
    {
      key: "cover_letter_gen",
      name: "Cover Letter Generator",
      nameAr: "مولد رسائل التقديم",
      description: "AI-generated cover letters",
      enabled: true,
      rolloutPercentage: 75,
      category: "ai",
    },
    {
      key: "interview_questions",
      name: "Interview Question Generator",
      nameAr: "مولد أسئلة المقابلات",
      description: "AI-generated interview prep",
      enabled: true,
      rolloutPercentage: 100,
      category: "ai",
    },
    {
      key: "loyalty_program",
      name: "Loyalty Program",
      nameAr: "برنامج الولاء",
      description: "Points and rewards system",
      enabled: true,
      rolloutPercentage: 100,
      category: "monetization",
    },
    {
      key: "gift_codes",
      name: "Gift Codes",
      nameAr: "أكواد الهدايا",
      description: "Promotional code system",
      enabled: true,
      rolloutPercentage: 100,
      category: "monetization",
    },
    {
      key: "public_profiles",
      name: "Public Profiles",
      nameAr: "الملفات العامة",
      description: "Shareable public profiles",
      enabled: true,
      rolloutPercentage: 100,
      category: "social",
    },
    {
      key: "advanced_ats",
      name: "Advanced ATS",
      nameAr: "نظام تتبع متقدم",
      description: "Advanced applicant tracking",
      enabled: true,
      rolloutPercentage: 100,
      category: "core",
    },
  ];
}
