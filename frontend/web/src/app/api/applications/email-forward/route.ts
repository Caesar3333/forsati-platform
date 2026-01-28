import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { 
  EmailForwardRequest, 
  EmailForwardResponse,
  ConsentRecord 
} from '@/services/apply/types';

/**
 * POST /api/applications/email-forward
 * تقديم الطلب عبر إعادة توجيه البريد الإلكتروني
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'يجب تسجيل الدخول للتقديم' },
        { status: 401 }
      );
    }

    const body: EmailForwardRequest = await request.json();

    // Validate required fields
    if (!body.jobId || !body.resumeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'معرّف الوظيفة والسيرة الذاتية مطلوبان' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify consent
    if (!body.consentToShare) {
      return NextResponse.json(
        { 
          error: 'Consent Required', 
          message: 'يجب الموافقة على مشاركة بياناتك مع صاحب العمل' 
        },
        { status: 400 }
      );
    }

    // Fetch job details
    const jobResponse = await fetch(
      `${process.env.STRAPI_URL}/api/opportunities/${body.jobId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!jobResponse.ok) {
      return NextResponse.json(
        { error: 'Job Not Found', message: 'الوظيفة غير موجودة' },
        { status: 404 }
      );
    }

    const job = await jobResponse.json();
    const jobData = job.data?.attributes || job.data;

    // Verify job has email apply method
    if (!jobData.apply_email) {
      return NextResponse.json(
        { error: 'Invalid Apply Method', message: 'هذه الوظيفة لا تدعم التقديم عبر البريد' },
        { status: 400 }
      );
    }

    // Fetch user profile
    const profileResponse = await fetch(
      `${process.env.STRAPI_URL}/api/profiles?filters[userId][$eq]=${session.user.id}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    const profileData = await profileResponse.json();
    const profile = profileData.data?.[0]?.attributes || profileData.data?.[0];

    // Fetch resume
    const resumeResponse = await fetch(
      `${process.env.STRAPI_URL}/api/resume-records/${body.resumeId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!resumeResponse.ok) {
      return NextResponse.json(
        { error: 'Resume Not Found', message: 'السيرة الذاتية غير موجودة' },
        { status: 404 }
      );
    }

    const resumeData = await resumeResponse.json();
    const resume = resumeData.data?.attributes || resumeData.data;

    // Log consent
    const consentRecord: Partial<ConsentRecord> = {
      userId: session.user.id,
      purpose: 'share_with_employer',
      granted: true,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Create application record
    const applicationPayload = {
      data: {
        jobId: body.jobId,
        applicantId: session.user.id,
        resumeId: body.resumeId,
        coverLetterId: body.coverLetterId,
        applyMethod: 'email',
        emailSentTo: jobData.apply_email,
        status: 'submitted',
        consentToShare: true,
        consentToProcess: true,
        consentTimestamp: new Date().toISOString(),
        statusHistory: [
          {
            status: 'submitted',
            timestamp: new Date().toISOString(),
            note: 'Application submitted via email forward',
          },
        ],
      },
    };

    const applicationResponse = await fetch(
      `${process.env.STRAPI_URL}/api/applications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify(applicationPayload),
      }
    );

    const application = await applicationResponse.json();
    const applicationId = application.data?.id || application.id;

    // Store consent record
    await fetch(`${process.env.STRAPI_URL}/api/consent-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          ...consentRecord,
          applicationId,
        },
      }),
    });

    // Queue email job (Celery worker will process)
    const emailJobPayload = {
      applicationId,
      jobId: body.jobId,
      applicantId: session.user.id,
      resumeId: body.resumeId,
      coverLetterId: body.coverLetterId,
      recruiterEmail: jobData.apply_email,
      includePhone: body.includePhone,
      includeProfileLink: body.includeProfileLink,
      customMessage: body.customMessage,
      // Template data
      templateData: {
        jobTitle: jobData.title,
        companyName: jobData.company?.name || jobData.company_name,
        applicantFullName: profile?.full_name || session.user.name,
        applicantHeadline: profile?.headline || '',
        applicantLocation: profile?.primary_location || '',
        applicantEmail: profile?.email || session.user.email,
        applicantPhone: body.includePhone ? profile?.phone : undefined,
        applicantYearsExperience: profile?.years_experience || 0,
        applicantKeySkills: (profile?.skills || []).slice(0, 5).map((s: any) => s.name),
        profileLink: body.includeProfileLink 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/profile/${session.user.id}?token=${generateProfileToken(session.user.id, applicationId)}`
          : undefined,
      },
    };

    // Send to Celery via Redis
    await fetch(`${process.env.INGESTOR_URL}/api/queue/email-forward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.INGESTOR_API_KEY!,
      },
      body: JSON.stringify(emailJobPayload),
    });

    // Mask email for response
    const maskedEmail = maskEmail(jobData.apply_email);

    const response: EmailForwardResponse = {
      applicationId,
      emailSentTo: maskedEmail,
      sentAt: new Date().toISOString(),
      status: 'queued',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Email forward error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'حدث خطأ أثناء التقديم' },
      { status: 500 }
    );
  }
}

/**
 * Generate time-limited profile viewing token
 */
function generateProfileToken(userId: string, applicationId: string): string {
  // In production, use proper JWT with expiry
  const payload = {
    userId,
    applicationId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Mask email for privacy
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
}
