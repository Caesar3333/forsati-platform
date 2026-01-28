import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  type WhatsAppApplyRequest,
  type WhatsAppApplyResponse,
  type WhatsAppMessageData,
} from "@/services/apply/types";

/**
 * POST /api/applications/whatsapp
 * الحصول على رابط WhatsApp للتقديم
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "يجب تسجيل الدخول للتقديم" },
        { status: 401 },
      );
    }

    const body: WhatsAppApplyRequest = await request.json();

    // Validate required fields
    if (!body.jobId) {
      return NextResponse.json(
        { error: "Bad Request", message: "معرّف الوظيفة مطلوب" },
        { status: 400 },
      );
    }

    // Fetch job details
    const jobResponse = await fetch(
      `${process.env.STRAPI_URL}/api/opportunities/${body.jobId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      },
    );

    if (!jobResponse.ok) {
      return NextResponse.json(
        { error: "Job Not Found", message: "الوظيفة غير موجودة" },
        { status: 404 },
      );
    }

    const job = await jobResponse.json();
    const jobData = job.data?.attributes || job.data;

    // Verify job has WhatsApp apply method
    if (!jobData.apply_whatsapp) {
      return NextResponse.json(
        {
          error: "Invalid Apply Method",
          message: "هذه الوظيفة لا تدعم التقديم عبر واتساب",
        },
        { status: 400 },
      );
    }

    // Fetch user profile
    const profileResponse = await fetch(
      `${process.env.STRAPI_URL}/api/profiles?filters[userId][$eq]=${session.user.id}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      },
    );

    const profileData = await profileResponse.json();
    const profile = profileData.data?.[0]?.attributes || profileData.data?.[0];

    // Generate profile link if requested
    let profileLink: string | undefined;
    if (body.includeProfileLink) {
      const token = generateProfileToken(session.user.id, body.jobId);
      profileLink = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${session.user.id}?token=${token}`;
    }

    // Prepare message data
    const messageData: WhatsAppMessageData = {
      applicantName: profile?.full_name || session.user.name || "مرشح",
      jobTitle: jobData.title,
      companyName: jobData.company?.name || jobData.company_name || "الشركة",
      profileLink,
    };

    // Generate message
    const prefilledMessage = generateWhatsAppMessage(messageData);
    const whatsappUrl = generateWhatsAppUrl(
      jobData.apply_whatsapp,
      prefilledMessage,
    );

    // Log application attempt (for analytics)
    await logApplicationAttempt({
      jobId: body.jobId,
      applicantId: session.user.id,
      method: "whatsapp",
      timestamp: new Date().toISOString(),
    });

    // Mask phone number
    const maskedPhone = maskPhoneNumber(jobData.apply_whatsapp);

    const response: WhatsAppApplyResponse = {
      whatsappUrl,
      prefilledMessage,
      fallbackMessage: prefilledMessage, // Same message for copy
      phoneNumber: maskedPhone,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("WhatsApp apply error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "حدث خطأ أثناء التقديم" },
      { status: 500 },
    );
  }
}

/**
 * Generate time-limited profile viewing token
 */
function generateProfileToken(userId: string, jobId: string): string {
  const payload = {
    userId,
    jobId,
    purpose: "whatsapp_apply",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Mask phone number for privacy
 */
function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.length < 8) return "***";

  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-2);
  return `${prefix}****${suffix}`;
}

/**
 * Log application attempt for analytics
 */
async function logApplicationAttempt(data: {
  jobId: string;
  applicantId: string;
  method: string;
  timestamp: string;
}) {
  try {
    await fetch(`${process.env.STRAPI_URL}/api/application-attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    // Non-critical, log but don't fail
    console.warn("Failed to log application attempt:", error);
  }
}
