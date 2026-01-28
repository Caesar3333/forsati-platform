/**
 * Forsati Platform - Admin Types & Models
 * أنواع ونماذج لوحة الإدارة
 */

import { z } from "zod";

// ============================================
// User Roles | أدوار المستخدمين
// ============================================

export const UserRoleSchema = z.enum([
  "super_admin", // مشرف عام
  "admin", // مسؤول
  "company", // شركة
  "recruiter", // مسؤول توظيف
  "candidate", // مرشح / باحث عن عمل
  "student", // طالب
  "new_graduate", // خريج جديد
  "freelancer", // مستقل
  "reviewer", // مراجع سيرة
  "trainer", // مدرب
  "coach", // مدرب مهني
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

// ============================================
// Markets | الأسواق
// ============================================

export const MarketSchema = z.enum([
  "jo", // الأردن
  "sa", // السعودية
  "ae", // الإمارات
  "eg", // مصر
  "lb", // لبنان
  "ps", // فلسطين
  "iq", // العراق
  "kw", // الكويت
  "qa", // قطر
  "bh", // البحرين
  "om", // عمان
  "global", // عالمي
]);

export type Market = z.infer<typeof MarketSchema>;

// ============================================
// Gift Code Model | نموذج أكواد الهدايا
// ============================================

export const GiftCodeTypeSchema = z.enum([
  "credit", // رصيد نقدي
  "free_post", // نشر مجاني
  "free_scan", // فحص سيرة مجاني
  "discount", // خصم نسبة مئوية
  "points", // نقاط ولاء
  "premium_trial", // فترة تجريبية مميزة
]);

export type GiftCodeType = z.infer<typeof GiftCodeTypeSchema>;

export const GiftCodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(4).max(20).toUpperCase(),
  type: GiftCodeTypeSchema,
  value: z.number().positive(),
  currency: z.string().default("JOD"),
  maxUses: z.number().int().positive().optional(),
  usedCount: z.number().int().default(0),
  createdBy: z.string().uuid(),
  expiresAt: z.date().optional(),
  targetRoles: z.array(UserRoleSchema).optional(),
  markets: z.array(MarketSchema).optional(),
  active: z.boolean().default(true),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  minOrderValue: z.number().optional(),
  singleUsePerUser: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GiftCode = z.infer<typeof GiftCodeSchema>;

export const GiftCodeRedemptionSchema = z.object({
  id: z.string().uuid(),
  codeId: z.string().uuid(),
  code: z.string(),
  userId: z.string().uuid(),
  type: GiftCodeTypeSchema,
  value: z.number(),
  appliedTo: z.string().optional(), // orderId, subscriptionId, etc.
  redeemedAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type GiftCodeRedemption = z.infer<typeof GiftCodeRedemptionSchema>;

// ============================================
// Loyalty Points Model | نموذج نقاط الولاء
// ============================================

export const PointsReasonSchema = z.enum([
  "signup", // تسجيل جديد
  "profile_complete", // إكمال الملف الشخصي
  "upload_cv", // رفع سيرة ذاتية
  "cv_scan", // فحص سيرة
  "referral_sent", // إرسال دعوة
  "referral_confirmed", // تأكيد دعوة
  "apply_job", // التقديم على وظيفة
  "interview_complete", // إكمال مقابلة
  "review_complete", // إكمال مراجعة
  "course_complete", // إكمال دورة
  "daily_login", // تسجيل دخول يومي
  "share_social", // مشاركة اجتماعية
  "gift_code", // كود هدية
  "admin_adjustment", // تعديل إداري
  "expiry", // انتهاء صلاحية
  "redemption", // استبدال
]);

export type PointsReason = z.infer<typeof PointsReasonSchema>;

export const PointsTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  reason: PointsReasonSchema,
  points: z.number().int(), // positive for credit, negative for debit
  balance: z.number().int(), // balance after transaction
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  referenceId: z.string().optional(), // related entity id
  operatorId: z.string().uuid().optional(), // admin who made adjustment
  expiresAt: z.date().optional(),
  createdAt: z.date(),
});

export type PointsTransaction = z.infer<typeof PointsTransactionSchema>;

export const LoyaltyAccountSchema = z.object({
  userId: z.string().uuid(),
  balance: z.number().int().default(0),
  lifetimeEarned: z.number().int().default(0),
  lifetimeSpent: z.number().int().default(0),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  tierExpiresAt: z.date().optional(),
  transactions: z.array(PointsTransactionSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LoyaltyAccount = z.infer<typeof LoyaltyAccountSchema>;

// Points accrual rules configuration
export const PointsRuleSchema = z.object({
  reason: PointsReasonSchema,
  points: z.number().int(),
  maxPerDay: z.number().int().optional(),
  maxPerMonth: z.number().int().optional(),
  expiryDays: z.number().int().optional(), // days until points expire
  active: z.boolean().default(true),
  targetRoles: z.array(UserRoleSchema).optional(),
});

export type PointsRule = z.infer<typeof PointsRuleSchema>;

// Points redemption rewards
export const PointsRewardSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  nameAr: z.string(),
  description: z.string(),
  descriptionAr: z.string(),
  pointsCost: z.number().int().positive(),
  type: z.enum([
    "discount",
    "free_scan",
    "free_post",
    "priority_listing",
    "premium_days",
  ]),
  value: z.number(),
  stock: z.number().int().optional(), // null = unlimited
  active: z.boolean().default(true),
  targetRoles: z.array(UserRoleSchema).optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
});

export type PointsReward = z.infer<typeof PointsRewardSchema>;

// ============================================
// Feature Flags Model | نموذج أعلام الميزات
// ============================================

export const FeatureFlagSchema = z.object({
  key: z.string(),
  label: z.string(),
  labelAr: z.string(),
  description: z.string(),
  descriptionAr: z.string(),
  enabled: z.boolean().default(false),
  activeForMarkets: z.array(MarketSchema).optional(),
  activeForRoles: z.array(UserRoleSchema).optional(),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  dependencies: z.array(z.string()).optional(), // other feature keys
  category: z.enum([
    "core",
    "ai",
    "social",
    "payment",
    "notification",
    "analytics",
    "experimental",
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

// ============================================
// Quotas Model | نموذج الحصص
// ============================================

export const QuotaResourceSchema = z.enum([
  "cv_scan", // فحص السيرة
  "cover_letter", // رسالة التغطية
  "job_post", // نشر وظيفة
  "featured_post", // وظيفة مميزة
  "candidate_search", // بحث المرشحين
  "interview_gen", // توليد أسئلة المقابلة
  "ai_match", // مطابقة ذكية
  "export_pdf", // تصدير PDF
  "message", // رسائل
  "training_session", // جلسة تدريب
]);

export type QuotaResource = z.infer<typeof QuotaResourceSchema>;

export const QuotaPolicySchema = z.object({
  id: z.string().uuid(),
  role: UserRoleSchema,
  resource: QuotaResourceSchema,
  monthlyAllowance: z.number().int(),
  dailyLimit: z.number().int().optional(),
  carryOver: z.boolean().default(false), // carry unused to next month
  resetDay: z.number().int().min(1).max(28).default(1),
  active: z.boolean().default(true),
});

export type QuotaPolicy = z.infer<typeof QuotaPolicySchema>;

export const UserQuotaSchema = z.object({
  userId: z.string().uuid(),
  resource: QuotaResourceSchema,
  allowance: z.number().int(),
  used: z.number().int().default(0),
  bonus: z.number().int().default(0), // from gift codes or points
  periodStart: z.date(),
  periodEnd: z.date(),
});

export type UserQuota = z.infer<typeof UserQuotaSchema>;

// ============================================
// Audit Log Model | نموذج سجل المراجعة
// ============================================

export const AuditActionSchema = z.enum([
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "view",
  "export",
  "redeem",
  "approve",
  "reject",
  "flag",
  "unflag",
  "suspend",
  "restore",
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  actorRole: UserRoleSchema,
  action: AuditActionSchema,
  resourceType: z.string(), // user, job, application, gift_code, etc.
  resourceId: z.string(),
  changes: z.record(z.unknown()).optional(), // before/after diff
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ============================================
// Platform Settings Model | إعدادات المنصة
// ============================================

export const PlatformSettingsSchema = z.object({
  // General
  defaultMarket: MarketSchema,
  defaultCurrency: z.string().default("JOD"),
  defaultTimezone: z.string().default("Asia/Amman"),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  maintenanceMessageAr: z.string().optional(),

  // Registration
  allowRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
  requirePhoneVerification: z.boolean().default(false),
  allowSocialLogin: z.boolean().default(true),

  // Content Moderation
  moderationEnabled: z.boolean().default(true),
  autoFlagThreshold: z.number().int().default(3),
  requireJobApproval: z.boolean().default(false),
  requireProfileApproval: z.boolean().default(false),

  // AI & Processing
  aiProcessingEnabled: z.boolean().default(true),
  aiConsentRequired: z.boolean().default(true),
  piiRedactionEnabled: z.boolean().default(true),

  // Payments
  paymentsEnabled: z.boolean().default(false),
  paymentTestMode: z.boolean().default(true),

  // Data Retention
  dataRetentionDays: z.number().int().default(365),
  inactiveAccountDays: z.number().int().default(180),

  // Points
  pointsExpiryDays: z.number().int().default(365),
  referralPointsEnabled: z.boolean().default(true),

  updatedAt: z.date(),
  updatedBy: z.string().uuid(),
});

export type PlatformSettings = z.infer<typeof PlatformSettingsSchema>;

// ============================================
// Default Configurations | التكوينات الافتراضية
// ============================================

export const defaultQuotaPolicies: Omit<QuotaPolicy, "id">[] = [
  // Candidates
  {
    role: "candidate",
    resource: "cv_scan",
    monthlyAllowance: 3,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "candidate",
    resource: "cover_letter",
    monthlyAllowance: 1,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "candidate",
    resource: "export_pdf",
    monthlyAllowance: 5,
    carryOver: false,
    active: true,
    resetDay: 1,
  },

  // Students / New Grads
  {
    role: "student",
    resource: "cv_scan",
    monthlyAllowance: 5,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "student",
    resource: "cover_letter",
    monthlyAllowance: 2,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "new_graduate",
    resource: "cv_scan",
    monthlyAllowance: 5,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "new_graduate",
    resource: "cover_letter",
    monthlyAllowance: 2,
    carryOver: false,
    active: true,
    resetDay: 1,
  },

  // Companies
  {
    role: "company",
    resource: "job_post",
    monthlyAllowance: 5,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "company",
    resource: "featured_post",
    monthlyAllowance: 0,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "company",
    resource: "candidate_search",
    monthlyAllowance: 50,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "company",
    resource: "interview_gen",
    monthlyAllowance: 10,
    carryOver: false,
    active: true,
    resetDay: 1,
  },

  // Recruiters
  {
    role: "recruiter",
    resource: "job_post",
    monthlyAllowance: 10,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "recruiter",
    resource: "candidate_search",
    monthlyAllowance: 100,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "recruiter",
    resource: "interview_gen",
    monthlyAllowance: 20,
    carryOver: false,
    active: true,
    resetDay: 1,
  },

  // Trainers / Coaches
  {
    role: "trainer",
    resource: "training_session",
    monthlyAllowance: 5,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
  {
    role: "coach",
    resource: "training_session",
    monthlyAllowance: 5,
    carryOver: false,
    active: true,
    resetDay: 1,
  },
];

export const defaultPointsRules: PointsRule[] = [
  { reason: "signup", points: 100, active: true },
  { reason: "profile_complete", points: 50, active: true },
  { reason: "upload_cv", points: 25, active: true },
  { reason: "cv_scan", points: 10, maxPerDay: 3, active: true },
  { reason: "referral_sent", points: 10, maxPerDay: 5, active: true },
  { reason: "referral_confirmed", points: 50, active: true },
  { reason: "apply_job", points: 5, maxPerDay: 10, active: true },
  { reason: "daily_login", points: 5, maxPerDay: 1, active: true },
  { reason: "share_social", points: 10, maxPerDay: 3, active: true },
  { reason: "course_complete", points: 100, active: true },
  { reason: "review_complete", points: 25, active: true },
];

export const defaultFeatureFlags: Omit<
  FeatureFlag,
  "createdAt" | "updatedAt"
>[] = [
  {
    key: "cv_scan",
    label: "CV Scan",
    labelAr: "فحص السيرة الذاتية",
    description: "AI-powered resume analysis and scoring",
    descriptionAr: "تحليل السيرة الذاتية وتقييمها بالذكاء الاصطناعي",
    enabled: true,
    category: "ai",
    rolloutPercentage: 100,
  },
  {
    key: "ai_matching",
    label: "AI Job Matching",
    labelAr: "المطابقة الذكية",
    description: "Intelligent job-candidate matching",
    descriptionAr: "مطابقة ذكية بين الوظائف والمرشحين",
    enabled: true,
    category: "ai",
    rolloutPercentage: 100,
  },
  {
    key: "quick_apply",
    label: "Quick Apply",
    labelAr: "التقديم السريع",
    description: "One-click job application",
    descriptionAr: "التقديم على الوظائف بضغطة واحدة",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "email_apply",
    label: "Email Apply",
    labelAr: "التقديم عبر البريد",
    description: "Forward applications via email",
    descriptionAr: "إرسال الطلبات عبر البريد الإلكتروني",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "whatsapp_apply",
    label: "WhatsApp Apply",
    labelAr: "التقديم عبر واتساب",
    description: "Apply via WhatsApp message",
    descriptionAr: "التقديم عبر رسالة واتساب",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "social_posts",
    label: "Social Posts",
    labelAr: "المنشورات الاجتماعية",
    description: "Company social feed posts",
    descriptionAr: "منشورات الشركات في الموجز",
    enabled: true,
    category: "social",
    rolloutPercentage: 100,
  },
  {
    key: "portfolio_builder",
    label: "Portfolio Builder",
    labelAr: "منشئ المحفظة",
    description: "Create and showcase work portfolio",
    descriptionAr: "إنشاء وعرض محفظة الأعمال",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "premium_promotion",
    label: "Premium Promotion",
    labelAr: "الترويج المميز",
    description: "Paid job promotion tools",
    descriptionAr: "أدوات ترويج الوظائف المدفوعة",
    enabled: false,
    category: "payment",
    rolloutPercentage: 0,
  },
  {
    key: "video_interviews",
    label: "Video Interviews",
    labelAr: "مقابلات الفيديو",
    description: "In-platform video interviews via Jitsi",
    descriptionAr: "مقابلات الفيديو عبر المنصة",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "cover_letter_gen",
    label: "Cover Letter Generator",
    labelAr: "توليد رسالة التغطية",
    description: "AI-generated tailored cover letters",
    descriptionAr: "توليد رسائل تغطية مخصصة بالذكاء الاصطناعي",
    enabled: true,
    category: "ai",
    rolloutPercentage: 100,
  },
  {
    key: "interview_questions",
    label: "Interview Questions Generator",
    labelAr: "توليد أسئلة المقابلات",
    description: "AI-generated interview questions",
    descriptionAr: "توليد أسئلة المقابلات بالذكاء الاصطناعي",
    enabled: true,
    category: "ai",
    rolloutPercentage: 100,
  },
  {
    key: "loyalty_program",
    label: "Loyalty Program",
    labelAr: "برنامج الولاء",
    description: "Points earning and redemption",
    descriptionAr: "كسب النقاط واستبدالها",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "gift_codes",
    label: "Gift Codes",
    labelAr: "أكواد الهدايا",
    description: "Promotional gift code system",
    descriptionAr: "نظام أكواد الهدايا الترويجية",
    enabled: true,
    category: "core",
    rolloutPercentage: 100,
  },
  {
    key: "public_profiles",
    label: "Public Profiles",
    labelAr: "الملفات العامة",
    description: "Allow profiles to be publicly visible",
    descriptionAr: "السماح بظهور الملفات للعامة",
    enabled: true,
    category: "social",
    rolloutPercentage: 100,
  },
  {
    key: "advanced_ats",
    label: "Advanced ATS",
    labelAr: "نظام تتبع متقدم",
    description: "Advanced applicant tracking features",
    descriptionAr: "ميزات متقدمة لتتبع المتقدمين",
    enabled: true,
    category: "core",
    activeForRoles: ["company", "recruiter"],
    rolloutPercentage: 100,
  },
];
