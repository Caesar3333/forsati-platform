/**
 * Forsati Platform - Admin Feature Flags API Routes
 * مسارات API لإدارة أعلام الميزات
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
// GET /api/admin/featureflags - Get all flags (admin)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    const response = await fetch(
      `${strapiUrl}/api/feature-flags?pagination[limit]=100&populate=*`,
      { headers: { Authorization: authHeader } },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch feature flags");
    }

    const data = await response.json();

    const flags = data.data.map((flag: any) => ({
      id: flag.id,
      ...flag.attributes,
    }));

    return NextResponse.json(flags);
  } catch (error) {
    console.error("Feature flags admin error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch feature flags",
        errorAr: "فشل في جلب أعلام الميزات",
      },
      { status: 500 },
    );
  }
}

// ============================================
// POST /api/admin/featureflags - Create flag
// ============================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = CreateFlagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          errorAr: "طلب غير صالح",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    // Check if flag key already exists
    const existingResponse = await fetch(
      `${strapiUrl}/api/feature-flags?filters[key][$eq]=${validation.data.key}`,
      { headers: { Authorization: authHeader } },
    );

    const existingData = await existingResponse.json();
    if (existingData.data && existingData.data.length > 0) {
      return NextResponse.json(
        {
          error: "Flag key already exists",
          errorAr: "مفتاح العلم موجود مسبقاً",
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${strapiUrl}/api/feature-flags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ data: validation.data }),
    });

    if (!response.ok) {
      throw new Error("Failed to create feature flag");
    }

    const data = await response.json();
    return NextResponse.json(
      {
        id: data.data.id,
        ...data.data.attributes,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create flag error:", error);
    return NextResponse.json(
      {
        error: "Failed to create feature flag",
        errorAr: "فشل في إنشاء علم الميزة",
      },
      { status: 500 },
    );
  }
}
