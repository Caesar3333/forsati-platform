/**
 * Apply Flow Types & Interfaces
 * أنواع وواجهات سير التقديم
 */

// ============================================
// Apply Method Types
// ============================================

export type ApplyMethod = 'quick' | 'external' | 'email' | 'whatsapp';

// ============================================
// Quick Apply
// ============================================

export interface QuickApplyRequest {
  jobId: string;
  resumeId: string;
  coverLetterId?: string;
  answers?: Record<string, string>;
  consentToProcess: boolean;
}

export interface QuickApplyResponse {
  applicationId: string;
  status: 'submitted' | 'pending_review' | 'under_review';
  appliedAt: string;
  jobTitle: string;
  companyName: string;
}

// ============================================
// External Apply
// ============================================

export interface ExternalApplyRequest {
  jobId: string;
}

export interface ExternalApplyResponse {
  externalUrl: string;
  companyName: string;
  jobTitle: string;
  trackingId?: string;
}

// ============================================
// Email Forward Apply
// ============================================

export interface EmailForwardRequest {
  jobId: string;
  resumeId: string;
  coverLetterId?: string;
  consentToShare: boolean;
  includePhone: boolean;
  includeProfileLink: boolean;
  customMessage?: string;
}

export interface EmailForwardResponse {
  applicationId: string;
  emailSentTo: string; // masked
  sentAt: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
}

// ============================================
// WhatsApp Apply
// ============================================

export interface WhatsAppApplyRequest {
  jobId: string;
  includeProfileLink: boolean;
}

export interface WhatsAppApplyResponse {
  whatsappUrl: string;
  prefilledMessage: string;
  fallbackMessage: string;
  phoneNumber: string; // masked
}

// ============================================
// Application Record
// ============================================

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  resumeId: string;
  coverLetterId?: string;
  
  // Apply method info
  applyMethod: ApplyMethod;
  externalUrl?: string;
  emailSentTo?: string;
  whatsappNumber?: string;
  
  // Status tracking
  status: ApplicationStatus;
  statusHistory: Array<{
    status: ApplicationStatus;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  
  // Screening
  screeningAnswers?: Record<string, string>;
  
  // Consent
  consentToShare: boolean;
  consentToProcess: boolean;
  consentTimestamp: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  viewedByEmployer: boolean;
  viewedAt?: string;
}

// ============================================
// Consent Record
// ============================================

export interface ConsentRecord {
  id: string;
  userId: string;
  applicationId: string;
  purpose: 'share_with_employer' | 'process_application' | 'share_phone' | 'share_profile';
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  expiresAt?: string;
  revokedAt?: string;
}

// ============================================
// Email Template Data
// ============================================

export interface EmailTemplateData {
  // Job info
  jobTitle: string;
  companyName: string;
  recruiterName?: string;
  recruiterEmail: string;
  
  // Applicant info
  applicantFullName: string;
  applicantHeadline: string;
  applicantLocation: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantYearsExperience: number;
  applicantKeySkills: string[];
  
  // Links
  profileLink: string;
  privacyPolicyUrl: string;
  unsubscribeUrl: string;
  
  // Branding
  forsatiLogoUrl: string;
  forsatiStampUrl: string;
  
  // Custom content
  customMessage?: string;
  
  // Attachments
  resumeAttachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
  coverLetterAttachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
}

// ============================================
// WhatsApp Message Template
// ============================================

export interface WhatsAppMessageData {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  profileLink?: string;
  customMessage?: string;
}

export function generateWhatsAppMessage(data: WhatsAppMessageData): string {
  const lines = [
    `السلام عليكم 👋`,
    ``,
    `أنا ${data.applicantName}، أرغب بالتقديم على وظيفة "${data.jobTitle}" المعلنة لديكم.`,
    ``,
  ];
  
  if (data.profileLink) {
    lines.push(`📋 ملفي الشخصي: ${data.profileLink}`);
    lines.push(``);
  }
  
  if (data.customMessage) {
    lines.push(data.customMessage);
    lines.push(``);
  }
  
  lines.push(`شكراً لوقتكم 🙏`);
  lines.push(`---`);
  lines.push(`تم الإرسال عبر منصة فرصتي`);
  
  return lines.join('\n');
}

export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove any non-digit characters except +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
