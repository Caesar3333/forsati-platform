// © 2026 Forsati. All rights reserved.
/**
 * Ingest Status API Route (Proxy to Ingestor Service)
 * GET /api/ingest/status/[jobId] - حالة المعالجة
 */

import { NextRequest, NextResponse } from 'next/server';

// Environment variable for Ingestor service URL
const INGESTOR_URL = process.env.INGESTOR_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message_en: 'Job ID is required',
          message_ar: 'معرف المهمة مطلوب',
        },
        { status: 400 }
      );
    }

    // Forward to Ingestor service
    const response = await fetch(`${INGESTOR_URL}/api/ingest/status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: 'not_found',
            message_en: `Job ${jobId} not found`,
            message_ar: `المهمة ${jobId} غير موجودة`,
          },
          { status: 404 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'ingestor_error',
          message_en: errorData.message_en || 'Failed to get status',
          message_ar: errorData.message_ar || 'فشل في الحصول على الحالة',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      job_id: data.job_id,
      status: data.status,
      progress: data.progress,
      result: data.result,
      error: data.error,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.error('Ingest Status Error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message_en: 'Failed to get job status',
        message_ar: 'فشل في الحصول على حالة المهمة',
      },
      { status: 500 }
    );
  }
}
