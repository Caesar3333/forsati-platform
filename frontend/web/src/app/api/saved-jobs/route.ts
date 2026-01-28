// © 2026 Forsati. All rights reserved.
/**
 * Saved Jobs API Route
 * GET/POST/DELETE /api/saved-jobs - الوظائف المحفوظة (محمي)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

interface SavedJob {
  id: string;
  user_email: string;
  opportunity_id: string;
  saved_at: string;
  notes?: string;
}

// In-memory storage for development
const savedJobs: SavedJob[] = [];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message_en: "You must be logged in",
          message_ar: "يجب تسجيل الدخول",
        },
        { status: 401 },
      );
    }

    // Get user's saved jobs
    const userSavedJobs = savedJobs.filter(
      (job) => job.user_email === session.user?.email,
    );

    return NextResponse.json({
      data: userSavedJobs,
      meta: {
        total: userSavedJobs.length,
      },
    });
  } catch (error) {
    console.error("Get Saved Jobs Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to fetch saved jobs",
        message_ar: "فشل في جلب الوظائف المحفوظة",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message_en: "You must be logged in",
          message_ar: "يجب تسجيل الدخول",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { opportunity_id, notes } = body;

    if (!opportunity_id) {
      return NextResponse.json(
        {
          error: "validation_error",
          message_en: "Opportunity ID is required",
          message_ar: "معرف الوظيفة مطلوب",
        },
        { status: 400 },
      );
    }

    // Check if already saved
    const existingSaved = savedJobs.find(
      (job) =>
        job.opportunity_id === opportunity_id &&
        job.user_email === session.user?.email,
    );

    if (existingSaved) {
      return NextResponse.json(
        {
          error: "already_saved",
          message_en: "This job is already saved",
          message_ar: "هذه الوظيفة محفوظة مسبقاً",
        },
        { status: 409 },
      );
    }

    // Save the job
    const savedJob: SavedJob = {
      id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_email: session.user.email,
      opportunity_id,
      saved_at: new Date().toISOString(),
      notes,
    };

    savedJobs.push(savedJob);

    return NextResponse.json(
      {
        success: true,
        message_en: "Job saved successfully",
        message_ar: "تم حفظ الوظيفة بنجاح",
        data: savedJob,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Save Job Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to save job",
        message_ar: "فشل في حفظ الوظيفة",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message_en: "You must be logged in",
          message_ar: "يجب تسجيل الدخول",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get("opportunity_id");

    if (!opportunityId) {
      return NextResponse.json(
        {
          error: "validation_error",
          message_en: "Opportunity ID is required",
          message_ar: "معرف الوظيفة مطلوب",
        },
        { status: 400 },
      );
    }

    // Find and remove the saved job
    const index = savedJobs.findIndex(
      (job) =>
        job.opportunity_id === opportunityId &&
        job.user_email === session.user?.email,
    );

    if (index === -1) {
      return NextResponse.json(
        {
          error: "not_found",
          message_en: "Saved job not found",
          message_ar: "الوظيفة المحفوظة غير موجودة",
        },
        { status: 404 },
      );
    }

    savedJobs.splice(index, 1);

    return NextResponse.json({
      success: true,
      message_en: "Job removed from saved list",
      message_ar: "تمت إزالة الوظيفة من القائمة المحفوظة",
    });
  } catch (error) {
    console.error("Delete Saved Job Error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message_en: "Failed to remove saved job",
        message_ar: "فشل في إزالة الوظيفة المحفوظة",
      },
      { status: 500 },
    );
  }
}
