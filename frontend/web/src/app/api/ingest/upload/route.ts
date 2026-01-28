// © 2026 Forsati. All rights reserved.
/**
 * Ingest Upload API Route (Proxy to Ingestor Service)
 * POST /api/ingest/upload - رفع سيرة ذاتية
 */

import { NextRequest, NextResponse } from "next/server";

// Environment variable for Ingestor service URL
const INGESTOR_URL = process.env.INGESTOR_API_URL || "http://localhost:8000";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const consentToAI = formData.get("consentToAI") === "true";
    const redactPII = formData.get("redactPII") === "true";
    const mode = (formData.get("mode") as string) || "parse";
    const context = (formData.get("context") as string) || "";

    if (!file) {
      return NextResponse.json(
        {
          error: "validation_error",
          message_en: "No file provided",
          message_ar: "لم يتم توفير ملف",
        },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "invalid_file_type",
          message_en: "Invalid file type. Allowed: PDF, DOC, DOCX, TXT",
          message_ar: "نوع الملف غير صالح. المسموح: PDF, DOC, DOCX, TXT",
        },
        { status: 400 },
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "file_too_large",
          message_en: "File size exceeds 10MB limit",
          message_ar: "حجم الملف يتجاوز الحد المسموح 10 ميجابايت",
        },
        { status: 400 },
      );
    }

    // Prepare form data for Ingestor service
    const ingestorFormData = new FormData();
    ingestorFormData.append("file", file);

    // Get auth token if available
    const authHeader = request.headers.get("authorization");

    // Forward to Ingestor service
    const response = await fetch(`${INGESTOR_URL}/api/ingest/upload`, {
      method: "POST",
      body: ingestorFormData,
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "ingestor_error",
          message_en: errorData.message_en || "Failed to process file",
          message_ar: errorData.message_ar || "فشل في معالجة الملف",
          details: errorData,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Log consent for audit (in production, store in database)
    if (consentToAI) {
      console.log(`[AUDIT] AI consent granted for job ${data.job_id}`, {
        timestamp: new Date().toISOString(),
        redactPII,
        mode,
        filename: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      message_en: "File uploaded successfully",
      message_ar: "تم رفع الملف بنجاح",
      job_id: data.job_id,
      data: data.data,
      consent: {
        ai_analysis: consentToAI,
        redact_pii: redactPII,
      },
    });
  } catch (error) {
    console.error("Ingest Upload Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to upload file",
        message_ar: "فشل في رفع الملف",
      },
      { status: 500 },
    );
  }
}
