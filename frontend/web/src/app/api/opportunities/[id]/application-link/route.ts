// © 2026 Forsati. All rights reserved.
/**
 * Application Link API Route
 * GET /api/opportunities/[id]/application-link - رابط التقديم (محمي)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Mock opportunity apply URLs
const opportunityApplyUrls: Record<
  string,
  { url: string; type: "internal" | "external" }
> = {
  "1": { url: "https://aramex.com/careers/apply/1", type: "external" },
  "2": { url: "/apply/2", type: "internal" },
  "3": { url: "/apply/3", type: "internal" },
  "4": { url: "https://careers.mawdoo3.com/apply/4", type: "external" },
  "5": { url: "/apply/5", type: "internal" },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message_en: "You must be logged in to apply",
          message_ar: "يجب تسجيل الدخول للتقديم",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const applyData = opportunityApplyUrls[id];

    if (!applyData) {
      return NextResponse.json(
        {
          error: "not_found",
          message_en: "Application link not found",
          message_ar: "رابط التقديم غير موجود",
        },
        { status: 404 },
      );
    }

    // Generate a time-limited token for external applications (prevents hotlinking)
    const token = Buffer.from(
      JSON.stringify({
        opportunityId: id,
        userId: session.user?.email,
        timestamp: Date.now(),
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      }),
    ).toString("base64");

    return NextResponse.json({
      data: {
        url: applyData.url,
        type: applyData.type,
        token: applyData.type === "external" ? token : undefined,
        expires_in: 1800, // seconds
      },
    });
  } catch (error) {
    console.error("Application Link Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to get application link",
        message_ar: "فشل في الحصول على رابط التقديم",
      },
      { status: 500 },
    );
  }
}
