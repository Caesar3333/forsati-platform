// © 2026 Forsati. All rights reserved.
/**
 * Resume Records API Route (Proxy to Ingestor Service)
 * GET /api/resume-records/[id] - السيرة المحللة
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Environment variable for Ingestor service URL
const INGESTOR_URL = process.env.INGESTOR_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication - resume records are protected
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message_en: "Authentication required to access resume records",
          message_ar: "يجب تسجيل الدخول للوصول إلى سجلات السيرة الذاتية",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "validation_error",
          message_en: "Record ID is required",
          message_ar: "معرف السجل مطلوب",
        },
        { status: 400 },
      );
    }

    // Get auth token
    const authHeader = request.headers.get("authorization");

    // Forward to Ingestor service
    const response = await fetch(`${INGESTOR_URL}/api/resume-records/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "not_found",
            message_en: `Resume record ${id} not found`,
            message_ar: `سجل السيرة الذاتية ${id} غير موجود`,
          },
          { status: 404 },
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "ingestor_error",
          message_en: errorData.message_en || "Failed to get record",
          message_ar: errorData.message_ar || "فشل في الحصول على السجل",
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      data: data,
      metadata: {
        retrieved_at: new Date().toISOString(),
        user: session.user?.email,
      },
    });
  } catch (error) {
    console.error("Resume Record Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to get resume record",
        message_ar: "فشل في الحصول على سجل السيرة الذاتية",
      },
      { status: 500 },
    );
  }
}
