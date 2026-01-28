// © 2026 Forsati. All rights reserved.
/**
 * Quick Apply API Route
 * POST /api/applications/quick - تقديم سريع (محمي)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

interface QuickApplyRequest {
  opportunity_id: string;
  resume_id?: string; // Parsed resume ID from ingestor
  cover_letter?: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

interface Application {
  id: string;
  opportunity_id: string;
  user_id: string;
  user_email: string;
  resume_id?: string;
  cover_letter?: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
}

// In-memory storage for development
const applications: Application[] = [];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message_en: 'You must be logged in to apply',
          message_ar: 'يجب تسجيل الدخول للتقديم',
        },
        { status: 401 }
      );
    }
    
    const body: QuickApplyRequest = await request.json();
    
    // Validate required fields
    if (!body.opportunity_id) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message_en: 'Opportunity ID is required',
          message_ar: 'معرف الوظيفة مطلوب',
        },
        { status: 400 }
      );
    }
    
    // Check if user already applied
    const existingApplication = applications.find(
      (app) =>
        app.opportunity_id === body.opportunity_id &&
        app.user_email === session.user?.email
    );
    
    if (existingApplication) {
      return NextResponse.json(
        {
          error: 'already_applied',
          message_en: 'You have already applied for this position',
          message_ar: 'لقد تقدمت لهذه الوظيفة مسبقاً',
          application_id: existingApplication.id,
        },
        { status: 409 }
      );
    }
    
    // Create new application
    const application: Application = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      opportunity_id: body.opportunity_id,
      user_id: session.user.email, // In production, use actual user ID
      user_email: session.user.email,
      resume_id: body.resume_id,
      cover_letter: body.cover_letter,
      phone: body.phone,
      linkedin_url: body.linkedin_url,
      portfolio_url: body.portfolio_url,
      status: 'submitted',
      applied_at: new Date().toISOString(),
    };
    
    // Save application (in production, save to database)
    applications.push(application);
    
    // TODO: In production:
    // 1. Save to database (Strapi/PostgreSQL)
    // 2. Send notification email to employer
    // 3. Send confirmation email to applicant
    // 4. Update opportunity applications count
    
    return NextResponse.json(
      {
        success: true,
        message_en: 'Application submitted successfully',
        message_ar: 'تم تقديم طلبك بنجاح',
        data: {
          application_id: application.id,
          status: application.status,
          applied_at: application.applied_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Quick Apply Error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message_en: 'Failed to submit application',
        message_ar: 'فشل في تقديم الطلب',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message_en: 'You must be logged in',
          message_ar: 'يجب تسجيل الدخول',
        },
        { status: 401 }
      );
    }
    
    // Get user's applications
    const userApplications = applications.filter(
      (app) => app.user_email === session.user?.email
    );
    
    return NextResponse.json({
      data: userApplications,
      meta: {
        total: userApplications.length,
      },
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message_en: 'Failed to fetch applications',
        message_ar: 'فشل في جلب الطلبات',
      },
      { status: 500 }
    );
  }
}
