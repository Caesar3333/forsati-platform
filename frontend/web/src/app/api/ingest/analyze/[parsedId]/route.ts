// © 2026 Forsati. All rights reserved.
/**
 * AI Analysis API Route (Proxy to Ingestor Service)
 * POST /api/ingest/analyze/[parsedId] - تحليل بالذكاء الاصطناعي
 *
 * IMPORTANT: This endpoint requires explicit user consent before processing.
 * يتطلب هذا المسار موافقة صريحة من المستخدم قبل المعالجة.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Environment variable for Ingestor service URL
const INGESTOR_URL = process.env.INGESTOR_API_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ parsedId: string }> },
) {
  try {
    // Check authentication - AI analysis is protected
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message_en: "Authentication required for AI analysis",
          message_ar: "يجب تسجيل الدخول لتحليل الذكاء الاصطناعي",
        },
        { status: 401 },
      );
    }

    const { parsedId } = await params;

    if (!parsedId) {
      return NextResponse.json(
        {
          error: "validation_error",
          message_en: "Parsed resume ID is required",
          message_ar: "معرف السيرة الذاتية المحللة مطلوب",
        },
        { status: 400 },
      );
    }

    // Parse request body for consent verification
    let body: { consent?: boolean; redactPII?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable, consent might be in headers
    }

    // Check for consent header or body
    const consentHeader = request.headers.get("X-AI-Consent");
    const hasConsent = body.consent === true || consentHeader === "granted";

    if (!hasConsent) {
      return NextResponse.json(
        {
          error: "consent_required",
          message_en:
            "Explicit consent is required for AI analysis. Please check the consent checkbox.",
          message_ar:
            "الموافقة الصريحة مطلوبة لتحليل الذكاء الاصطناعي. يرجى تحديد مربع الموافقة.",
        },
        { status: 403 },
      );
    }

    // Log consent for audit trail (in production, store in database)
    console.log(`[AUDIT] AI Analysis consent verified`, {
      timestamp: new Date().toISOString(),
      user: session.user?.email,
      parsedId,
      redactPII: body.redactPII || false,
    });

    // Get auth token
    const authHeader = request.headers.get("authorization");

    // Forward to Ingestor service
    const response = await fetch(
      `${INGESTOR_URL}/api/ingest/analyze/${parsedId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          redact_pii: body.redactPII || false,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "not_found",
            message_en: `Resume record ${parsedId} not found`,
            message_ar: `سجل السيرة الذاتية ${parsedId} غير موجود`,
          },
          { status: 404 },
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "analysis_error",
          message_en: errorData.message_en || "AI analysis failed",
          message_ar: errorData.message_ar || "فشل تحليل الذكاء الاصطناعي",
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message_en: "AI analysis completed successfully",
      message_ar: "اكتمل تحليل الذكاء الاصطناعي بنجاح",
      analysis_id: data.parsed_id,
      score: data.score,
      analysis: data.analysis,
      recommendations: data.recommendations,
      keywords: data.keywords || [],
      analyzed_at: data.analyzed_at,
      consent_recorded: true,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to perform AI analysis",
        message_ar: "فشل في إجراء تحليل الذكاء الاصطناعي",
      },
      { status: 500 },
    );
  }
}
