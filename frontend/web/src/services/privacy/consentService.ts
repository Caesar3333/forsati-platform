/**
 * Privacy & Consent Management Service
 * خدمة إدارة الخصوصية والموافقة
 *
 * Handles user consent tracking, privacy settings, and data protection
 */

import { z } from "zod";

// ============================================
// Types
// ============================================

export type ConsentPurpose =
  | "ai_processing" // معالجة الذكاء الاصطناعي
  | "share_with_employer" // المشاركة مع صاحب العمل
  | "share_phone" // مشاركة رقم الهاتف
  | "share_profile" // مشاركة الملف الشخصي
  | "email_notifications" // إشعارات البريد
  | "marketing" // التسويق
  | "analytics" // التحليلات
  | "third_party"; // طرف ثالث

export type ProfileVisibility = "public" | "connections" | "private";

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  source: string; // e.g., 'cv_scan_modal', 'settings_page'
  applicationId?: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedReason?: string;
}

export interface PrivacySettings {
  userId: string;
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showSkills: boolean;
  allowSearchEngineIndexing: boolean;
  allowRecruitersToContact: boolean;
  dataRetentionDays: number;
  updatedAt: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: "pending" | "processing" | "completed" | "failed";
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestedAt: string;
  reason?: string;
  status: "pending" | "processing" | "completed" | "failed";
  completedAt?: string;
  dataDeleted: string[];
}

// ============================================
// Validation Schemas
// ============================================

export const ConsentRecordSchema = z.object({
  userId: z.string().min(1),
  purpose: z.enum([
    "ai_processing",
    "share_with_employer",
    "share_phone",
    "share_profile",
    "email_notifications",
    "marketing",
    "analytics",
    "third_party",
  ]),
  granted: z.boolean(),
  source: z.string().min(1),
  applicationId: z.string().optional(),
});

export const PrivacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "connections", "private"]),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showLocation: z.boolean(),
  showExperience: z.boolean(),
  showEducation: z.boolean(),
  showSkills: z.boolean(),
  allowSearchEngineIndexing: z.boolean(),
  allowRecruitersToContact: z.boolean(),
  dataRetentionDays: z.number().min(30).max(3650),
});

// ============================================
// Consent Service
// ============================================

export class ConsentService {
  private apiUrl: string;
  private apiToken: string;

  constructor(apiUrl: string, apiToken: string) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  /**
   * Record user consent
   */
  async recordConsent(
    userId: string,
    purpose: ConsentPurpose,
    granted: boolean,
    context: {
      source: string;
      applicationId?: string;
      ipAddress: string;
      userAgent: string;
    },
  ): Promise<ConsentRecord> {
    const record: Partial<ConsentRecord> = {
      userId,
      purpose,
      granted,
      timestamp: new Date().toISOString(),
      source: context.source,
      applicationId: context.applicationId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    const response = await fetch(`${this.apiUrl}/api/consent-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({ data: record }),
    });

    if (!response.ok) {
      throw new Error("Failed to record consent");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Check if user has given consent for a purpose
   */
  async hasConsent(userId: string, purpose: ConsentPurpose): Promise<boolean> {
    const response = await fetch(
      `${this.apiUrl}/api/consent-logs?filters[userId][$eq]=${userId}&filters[purpose][$eq]=${purpose}&sort=timestamp:desc&pagination[limit]=1`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    const latestConsent = result.data?.[0];

    if (!latestConsent) {
      return false;
    }

    // Check if consent was revoked
    if (latestConsent.attributes?.revokedAt) {
      return false;
    }

    // Check if consent has expired
    if (latestConsent.attributes?.expiresAt) {
      const expiresAt = new Date(latestConsent.attributes.expiresAt);
      if (expiresAt < new Date()) {
        return false;
      }
    }

    return latestConsent.attributes?.granted === true;
  }

  /**
   * Revoke user consent
   */
  async revokeConsent(
    userId: string,
    purpose: ConsentPurpose,
    reason?: string,
  ): Promise<void> {
    // Find the latest consent record
    const response = await fetch(
      `${this.apiUrl}/api/consent-logs?filters[userId][$eq]=${userId}&filters[purpose][$eq]=${purpose}&sort=timestamp:desc&pagination[limit]=1`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to find consent record");
    }

    const result = await response.json();
    const consentId = result.data?.[0]?.id;

    if (consentId) {
      await fetch(`${this.apiUrl}/api/consent-logs/${consentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          data: {
            revokedAt: new Date().toISOString(),
            revokedReason: reason,
          },
        }),
      });
    }
  }

  /**
   * Get all consent records for a user
   */
  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    const response = await fetch(
      `${this.apiUrl}/api/consent-logs?filters[userId][$eq]=${userId}&sort=timestamp:desc`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return (
      result.data?.map((item: any) => ({
        id: item.id,
        ...item.attributes,
      })) || []
    );
  }
}

// ============================================
// Privacy Settings Service
// ============================================

export class PrivacyService {
  private apiUrl: string;
  private apiToken: string;

  constructor(apiUrl: string, apiToken: string) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  /**
   * Get user privacy settings
   */
  async getSettings(userId: string): Promise<PrivacySettings | null> {
    const response = await fetch(
      `${this.apiUrl}/api/privacy-settings?filters[userId][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const settings = result.data?.[0];

    if (!settings) {
      // Return default settings
      return this.getDefaultSettings(userId);
    }

    return {
      userId,
      ...settings.attributes,
    };
  }

  /**
   * Update user privacy settings
   */
  async updateSettings(
    userId: string,
    settings: Partial<PrivacySettings>,
  ): Promise<PrivacySettings> {
    // Validate settings
    const validated = PrivacySettingsSchema.partial().parse(settings);

    // Find existing settings
    const existingResponse = await fetch(
      `${this.apiUrl}/api/privacy-settings?filters[userId][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    const existingResult = await existingResponse.json();
    const existingId = existingResult.data?.[0]?.id;

    const payload = {
      data: {
        userId,
        ...validated,
        updatedAt: new Date().toISOString(),
      },
    };

    let response: Response;

    if (existingId) {
      // Update existing
      response = await fetch(
        `${this.apiUrl}/api/privacy-settings/${existingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: JSON.stringify(payload),
        },
      );
    } else {
      // Create new
      response = await fetch(`${this.apiUrl}/api/privacy-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error("Failed to update privacy settings");
    }

    const result = await response.json();
    return {
      userId,
      ...result.data.attributes,
    };
  }

  /**
   * Get default privacy settings
   */
  getDefaultSettings(userId: string): PrivacySettings {
    return {
      userId,
      profileVisibility: "public",
      showEmail: false, // Off by default for privacy
      showPhone: false,
      showLocation: true,
      showExperience: true,
      showEducation: true,
      showSkills: true,
      allowSearchEngineIndexing: true,
      allowRecruitersToContact: true,
      dataRetentionDays: 365 * 2, // 2 years default
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Apply visibility filter to profile data
   */
  applyVisibilityFilter<T extends Record<string, any>>(
    profile: T,
    settings: PrivacySettings,
    viewerRelation: "self" | "connection" | "public",
  ): Partial<T> {
    // Self can see everything
    if (viewerRelation === "self") {
      return profile;
    }

    // Check profile visibility level
    if (settings.profileVisibility === "private" && viewerRelation !== "self") {
      return { id: profile.id, full_name: profile.full_name } as Partial<T>;
    }

    if (
      settings.profileVisibility === "connections" &&
      viewerRelation === "public"
    ) {
      return {
        id: profile.id,
        full_name: profile.full_name,
        headline: profile.headline,
      } as Partial<T>;
    }

    // Apply field-level visibility
    const filtered: Record<string, any> = { ...profile };

    if (!settings.showEmail) {
      delete filtered.email;
    }

    if (!settings.showPhone) {
      delete filtered.phone;
    }

    if (!settings.showLocation) {
      delete filtered.primary_location;
      delete filtered.preferred_locations;
    }

    if (!settings.showExperience) {
      delete filtered.experiences;
      delete filtered.current_employer;
      delete filtered.current_title;
      delete filtered.years_experience;
    }

    if (!settings.showEducation) {
      delete filtered.education;
    }

    if (!settings.showSkills) {
      delete filtered.skills;
    }

    return filtered as Partial<T>;
  }
}

// ============================================
// Data Export/Deletion Service (GDPR)
// ============================================

export class DataManagementService {
  private apiUrl: string;
  private apiToken: string;

  constructor(apiUrl: string, apiToken: string) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  /**
   * Request data export (GDPR Article 20)
   */
  async requestDataExport(userId: string): Promise<DataExportRequest> {
    const request: Partial<DataExportRequest> = {
      userId,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };

    const response = await fetch(`${this.apiUrl}/api/data-export-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({ data: request }),
    });

    if (!response.ok) {
      throw new Error("Failed to create data export request");
    }

    const result = await response.json();

    // Trigger async export job (would be handled by Celery worker)
    await this.triggerExportJob(result.data.id, userId);

    return {
      id: result.data.id,
      ...result.data.attributes,
    };
  }

  /**
   * Request account deletion (GDPR Article 17)
   */
  async requestAccountDeletion(
    userId: string,
    reason?: string,
  ): Promise<DataDeletionRequest> {
    const request: Partial<DataDeletionRequest> = {
      userId,
      requestedAt: new Date().toISOString(),
      reason,
      status: "pending",
      dataDeleted: [],
    };

    const response = await fetch(`${this.apiUrl}/api/data-deletion-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({ data: request }),
    });

    if (!response.ok) {
      throw new Error("Failed to create deletion request");
    }

    const result = await response.json();

    // Trigger async deletion job (would be handled by Celery worker)
    // This should have a 30-day grace period before actual deletion
    await this.triggerDeletionJob(result.data.id, userId);

    return {
      id: result.data.id,
      ...result.data.attributes,
    };
  }

  /**
   * Get export request status
   */
  async getExportStatus(requestId: string): Promise<DataExportRequest | null> {
    const response = await fetch(
      `${this.apiUrl}/api/data-export-requests/${requestId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return {
      id: result.data.id,
      ...result.data.attributes,
    };
  }

  private async triggerExportJob(
    requestId: string,
    userId: string,
  ): Promise<void> {
    // This would send a message to Celery/Redis queue
    // For now, just log the intent
    console.log(
      `Triggering data export job for request ${requestId}, user ${userId}`,
    );
  }

  private async triggerDeletionJob(
    requestId: string,
    userId: string,
  ): Promise<void> {
    // This would send a message to Celery/Redis queue
    // Deletion should be scheduled with 30-day grace period
    console.log(
      `Triggering data deletion job for request ${requestId}, user ${userId}`,
    );
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Redact PII from text
 */
export function redactPII(text: string): string {
  // Redact emails
  text = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL REDACTED]",
  );

  // Redact phone numbers (various formats)
  text = text.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
    "[PHONE REDACTED]",
  );

  // Redact national IDs (Jordan format: 9 or 10 digits)
  text = text.replace(/\b\d{9,10}\b/g, "[ID REDACTED]");

  // Redact credit card numbers
  text = text.replace(
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    "[CARD REDACTED]",
  );

  return text;
}

/**
 * Mask email for display
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";

  const maskedLocal =
    local.length > 2
      ? local.charAt(0) + "***" + local.charAt(local.length - 1)
      : "***";

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for display
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 6) return "***";

  return cleaned.slice(0, 3) + "****" + cleaned.slice(-2);
}

/**
 * Generate consent text based on purpose
 */
export function getConsentText(
  purpose: ConsentPurpose,
  locale: "en" | "ar" = "en",
): { title: string; description: string } {
  const texts: Record<
    ConsentPurpose,
    {
      en: { title: string; description: string };
      ar: { title: string; description: string };
    }
  > = {
    ai_processing: {
      en: {
        title: "AI Processing Consent",
        description:
          "I consent to the use of AI to analyze my resume and provide job matching recommendations.",
      },
      ar: {
        title: "الموافقة على معالجة الذكاء الاصطناعي",
        description:
          "أوافق على استخدام الذكاء الاصطناعي لتحليل سيرتي الذاتية وتقديم توصيات مطابقة للوظائف.",
      },
    },
    share_with_employer: {
      en: {
        title: "Share with Employer",
        description:
          "I consent to sharing my application data with the employer for this job posting.",
      },
      ar: {
        title: "المشاركة مع صاحب العمل",
        description: "أوافق على مشاركة بيانات طلبي مع صاحب العمل لهذه الوظيفة.",
      },
    },
    share_phone: {
      en: {
        title: "Share Phone Number",
        description: "I consent to sharing my phone number with the employer.",
      },
      ar: {
        title: "مشاركة رقم الهاتف",
        description: "أوافق على مشاركة رقم هاتفي مع صاحب العمل.",
      },
    },
    share_profile: {
      en: {
        title: "Share Profile",
        description: "I consent to sharing a link to my professional profile.",
      },
      ar: {
        title: "مشاركة الملف الشخصي",
        description: "أوافق على مشاركة رابط ملفي الشخصي المهني.",
      },
    },
    email_notifications: {
      en: {
        title: "Email Notifications",
        description:
          "I consent to receiving job alerts and platform notifications via email.",
      },
      ar: {
        title: "إشعارات البريد الإلكتروني",
        description:
          "أوافق على تلقي تنبيهات الوظائف وإشعارات المنصة عبر البريد الإلكتروني.",
      },
    },
    marketing: {
      en: {
        title: "Marketing Communications",
        description:
          "I consent to receiving promotional content and career tips.",
      },
      ar: {
        title: "الاتصالات التسويقية",
        description: "أوافق على تلقي المحتوى الترويجي ونصائح المهنة.",
      },
    },
    analytics: {
      en: {
        title: "Analytics",
        description:
          "I consent to anonymous usage analytics to improve the platform.",
      },
      ar: {
        title: "التحليلات",
        description: "أوافق على التحليلات المجهولة للاستخدام لتحسين المنصة.",
      },
    },
    third_party: {
      en: {
        title: "Third-Party Services",
        description:
          "I consent to sharing data with trusted third-party service providers.",
      },
      ar: {
        title: "خدمات الطرف الثالث",
        description:
          "أوافق على مشاركة البيانات مع مزودي خدمات الطرف الثالث الموثوقين.",
      },
    },
  };

  return texts[purpose][locale];
}
