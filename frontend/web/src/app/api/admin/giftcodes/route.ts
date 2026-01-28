/**
 * Forsati Platform - Gift Codes API Routes
 * مسارات API لأكواد الهدايا
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================
// Types
// ============================================

const CreateGiftCodeSchema = z.object({
  code: z.string().optional(),
  type: z.enum([
    "credit",
    "free_post",
    "free_scan",
    "discount",
    "points",
    "premium_trial",
  ]),
  value: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  targetRoles: z.array(z.string()).optional(),
  targetMarkets: z.array(z.string()).optional(),
  campaign: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const RedeemCodeSchema = z.object({
  code: z.string().min(1),
});

// ============================================
// GET /api/admin/giftcodes - List all codes
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const campaign = searchParams.get("campaign");

    // Forward to Strapi
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const queryParams = new URLSearchParams({
      "pagination[page]": page.toString(),
      "pagination[pageSize]": limit.toString(),
      populate: "*",
    });

    if (status)
      queryParams.append(
        "filters[isActive][$eq]",
        status === "active" ? "true" : "false",
      );
    if (type) queryParams.append("filters[type][$eq]", type);
    if (campaign) queryParams.append("filters[campaign][$eq]", campaign);

    const response = await fetch(`${strapiUrl}/api/gift-codes?${queryParams}`, {
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch gift codes");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Gift codes list error:", error);
    return NextResponse.json(
      { error: "Internal server error", errorAr: "خطأ في الخادم" },
      { status: 500 },
    );
  }
}

// ============================================
// POST /api/admin/giftcodes - Create code
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
    const validation = CreateGiftCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          errorAr: "بيانات غير صالحة",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    // Generate code if not provided
    const code = validation.data.code || generateGiftCode();

    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const response = await fetch(`${strapiUrl}/api/gift-codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          ...validation.data,
          code,
          usedCount: 0,
          isActive: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to create gift code");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Gift code creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create gift code",
        errorAr: "فشل في إنشاء كود الهدية",
      },
      { status: 500 },
    );
  }
}

// ============================================
// Helper Functions
// ============================================

function generateGiftCode(prefix = "FORSATI"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix + "-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
