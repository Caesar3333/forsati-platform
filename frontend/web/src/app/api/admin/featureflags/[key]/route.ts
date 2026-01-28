/**
 * Forsati Platform - Admin Feature Flag by Key API
 * مسار API لعلم ميزة محدد
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateFlagSchema = z.object({
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  activeForRoles: z.array(z.string()).optional(),
  activeForMarkets: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  name: z.string().optional(),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
});

// ============================================
// GET /api/admin/featureflags/[key]
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const { key } = await params;
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    const response = await fetch(
      `${strapiUrl}/api/feature-flags?filters[key][$eq]=${key}&populate=*`,
      { headers: { Authorization: authHeader } },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch feature flag");
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: "Feature flag not found", errorAr: "علم الميزة غير موجود" },
        { status: 404 },
      );
    }

    const flag = data.data[0];
    return NextResponse.json({
      id: flag.id,
      ...flag.attributes,
    });
  } catch (error) {
    console.error("Get feature flag error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch feature flag",
        errorAr: "فشل في جلب علم الميزة",
      },
      { status: 500 },
    );
  }
}

// ============================================
// PATCH /api/admin/featureflags/[key]
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const { key } = await params;
    const body = await request.json();
    const validation = UpdateFlagSchema.safeParse(body);

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

    // Find the flag by key
    const findResponse = await fetch(
      `${strapiUrl}/api/feature-flags?filters[key][$eq]=${key}`,
      { headers: { Authorization: authHeader } },
    );

    const findData = await findResponse.json();

    if (!findData.data || findData.data.length === 0) {
      return NextResponse.json(
        { error: "Feature flag not found", errorAr: "علم الميزة غير موجود" },
        { status: 404 },
      );
    }

    const flagId = findData.data[0].id;

    // Update the flag
    const response = await fetch(`${strapiUrl}/api/feature-flags/${flagId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ data: validation.data }),
    });

    if (!response.ok) {
      throw new Error("Failed to update feature flag");
    }

    const data = await response.json();
    return NextResponse.json({
      id: data.data.id,
      ...data.data.attributes,
    });
  } catch (error) {
    console.error("Update feature flag error:", error);
    return NextResponse.json(
      {
        error: "Failed to update feature flag",
        errorAr: "فشل في تحديث علم الميزة",
      },
      { status: 500 },
    );
  }
}

// ============================================
// DELETE /api/admin/featureflags/[key]
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const { key } = await params;
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    // Find the flag by key
    const findResponse = await fetch(
      `${strapiUrl}/api/feature-flags?filters[key][$eq]=${key}`,
      { headers: { Authorization: authHeader } },
    );

    const findData = await findResponse.json();

    if (!findData.data || findData.data.length === 0) {
      return NextResponse.json(
        { error: "Feature flag not found", errorAr: "علم الميزة غير موجود" },
        { status: 404 },
      );
    }

    const flagId = findData.data[0].id;

    // Delete the flag
    const response = await fetch(`${strapiUrl}/api/feature-flags/${flagId}`, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      throw new Error("Failed to delete feature flag");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete feature flag error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete feature flag",
        errorAr: "فشل في حذف علم الميزة",
      },
      { status: 500 },
    );
  }
}
