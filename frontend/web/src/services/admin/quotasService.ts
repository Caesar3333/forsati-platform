/**
 * Forsati Platform - Quotas Service
 * خدمة الحصص
 */

import { z } from "zod";
import {
  QuotaPolicy,
  UserQuota,
  UserRole,
  Market,
  defaultQuotaPolicies,
  QuotaResource,
} from "@/types/admin";

// ============================================
// Types
// ============================================

export interface QuotaUsage {
  resource: QuotaResource;
  used: number;
  limit: number;
  remaining: number;
  resetsAt?: Date;
  percentUsed: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  usage: QuotaUsage;
  upgradeMessage?: {
    en: string;
    ar: string;
  };
}

// ============================================
// Quotas Service
// ============================================

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

// Generate IDs for default policies
const defaultPoliciesWithIds: QuotaPolicy[] = defaultQuotaPolicies.map(
  (policy, index) => ({
    ...policy,
    id: `default-${policy.role}-${policy.resource}-${index}`,
  }),
);

/**
 * Get all quota policies
 * الحصول على جميع سياسات الحصص
 */
export async function getAllPolicies(token: string): Promise<QuotaPolicy[]> {
  try {
    const response = await fetch(`${apiUrl}/api/admin/quotas/policies`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      return await response.json();
    }

    return defaultPoliciesWithIds;
  } catch {
    return defaultPoliciesWithIds;
  }
}

/**
 * Get policies for a specific role
 * الحصول على السياسات لدور معين
 */
export function getPoliciesForRole(role: UserRole): QuotaPolicy[] {
  return defaultPoliciesWithIds.filter((policy) => policy.role === role);
}

/**
 * Get user's quota usage
 * الحصول على استخدام حصة المستخدم
 */
export async function getUserQuota(
  userId: string,
  resource: QuotaResource,
  token: string,
): Promise<UserQuota | null> {
  try {
    const response = await fetch(`${apiUrl}/api/quotas/${userId}/${resource}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all quotas for a user
 * الحصول على جميع حصص المستخدم
 */
export async function getAllUserQuotas(
  userId: string,
  token: string,
): Promise<UserQuota[]> {
  try {
    const response = await fetch(`${apiUrl}/api/quotas/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Check if user can use a resource
 * التحقق مما إذا كان المستخدم يمكنه استخدام المورد
 */
export async function checkQuota(
  userId: string,
  resource: QuotaResource,
  role: UserRole,
  token: string,
): Promise<QuotaCheckResult> {
  const userQuota = await getUserQuota(userId, resource, token);
  const policies = getPoliciesForRole(role);
  const policy = policies.find((p) => p.resource === resource);

  const limit = policy?.monthlyAllowance ?? 0;
  const used = userQuota?.used ?? 0;
  const remaining = Math.max(0, limit - used);
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

  const periodEnd = userQuota?.periodEnd
    ? new Date(userQuota.periodEnd)
    : undefined;

  const usage: QuotaUsage = {
    resource,
    used,
    limit,
    remaining,
    percentUsed,
    resetsAt: periodEnd,
  };

  const allowed = remaining > 0 || limit === -1; // -1 means unlimited

  if (!allowed) {
    return {
      allowed: false,
      usage,
      upgradeMessage: getUpgradeMessage(resource),
    };
  }

  return { allowed: true, usage };
}

/**
 * Consume quota
 * استهلاك الحصة
 */
export async function consumeQuota(
  userId: string,
  resource: QuotaResource,
  amount: number,
  token: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/api/quotas/consume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, resource, amount }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Admin: Update quota policy
 * المشرف: تحديث سياسة الحصة
 */
export async function updatePolicy(
  id: string,
  updates: Partial<QuotaPolicy>,
  token: string,
): Promise<QuotaPolicy | null> {
  try {
    const response = await fetch(`${apiUrl}/api/admin/quotas/policies/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Admin: Create quota policy
 * المشرف: إنشاء سياسة حصة
 */
export async function createPolicy(
  policy: Omit<QuotaPolicy, "id" | "createdAt" | "updatedAt">,
  token: string,
): Promise<QuotaPolicy | null> {
  try {
    const response = await fetch(`${apiUrl}/api/admin/quotas/policies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(policy),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Admin: Reset user quota
 * المشرف: إعادة تعيين حصة المستخدم
 */
export async function resetUserQuota(
  userId: string,
  resource: QuotaResource,
  token: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/api/admin/quotas/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, resource }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Admin: Grant bonus quota
 * المشرف: منح حصة إضافية
 */
export async function grantBonus(
  userId: string,
  resource: QuotaResource,
  amount: number,
  reason: string,
  token: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/api/admin/quotas/bonus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, resource, amount, reason }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get upgrade message for a resource
 * الحصول على رسالة الترقية للمورد
 */
function getUpgradeMessage(resource: QuotaResource): {
  en: string;
  ar: string;
} {
  const messages: Record<QuotaResource, { en: string; ar: string }> = {
    cv_scan: {
      en: "You've used all your free CV scans this month. Upgrade to Premium for unlimited scans!",
      ar: "لقد استخدمت جميع فحوصات السيرة الذاتية المجانية هذا الشهر. قم بالترقية للحصول على فحوصات غير محدودة!",
    },
    cover_letter: {
      en: "You've reached your cover letter limit. Upgrade for more!",
      ar: "لقد وصلت إلى حد رسائل التقديم. قم بالترقية للمزيد!",
    },
    job_post: {
      en: "You've used all your job posts. Upgrade your plan to post more jobs!",
      ar: "لقد استخدمت جميع إعلانات الوظائف. قم بترقية خطتك لنشر المزيد!",
    },
    featured_post: {
      en: "Upgrade to feature your job posts and reach more candidates!",
      ar: "قم بالترقية لتمييز إعلاناتك والوصول لمرشحين أكثر!",
    },
    candidate_search: {
      en: "You've reached your candidate search limit. Upgrade for unlimited searches!",
      ar: "لقد وصلت إلى حد البحث عن المرشحين. قم بالترقية للبحث غير المحدود!",
    },
    interview_gen: {
      en: "Generate more interview questions with a Premium account!",
      ar: "قم بإنشاء المزيد من أسئلة المقابلات مع الحساب المميز!",
    },
    ai_match: {
      en: "Get unlimited AI-powered job matches with Premium!",
      ar: "احصل على مطابقات وظيفية غير محدودة بالذكاء الاصطناعي مع المميز!",
    },
    export_pdf: {
      en: "Export more PDFs with a Premium subscription!",
      ar: "قم بتصدير المزيد من ملفات PDF مع الاشتراك المميز!",
    },
    message: {
      en: "You've used all your messages. Upgrade to contact more people!",
      ar: "لقد استخدمت جميع رسائلك. قم بالترقية للتواصل مع المزيد!",
    },
    training_session: {
      en: "Book more training sessions with an upgraded account!",
      ar: "احجز المزيد من جلسات التدريب مع حساب مرقّى!",
    },
  };

  return messages[resource];
}

/**
 * Format quota display
 * تنسيق عرض الحصة
 */
export function formatQuotaDisplay(
  usage: QuotaUsage,
  locale: "en" | "ar" = "en",
): string {
  if (usage.limit === -1) {
    return locale === "ar" ? "غير محدود" : "Unlimited";
  }

  return `${usage.used} / ${usage.limit}`;
}

/**
 * Get resource label
 * الحصول على تسمية المورد
 */
export function getResourceLabel(
  resource: QuotaResource,
  locale: "en" | "ar" = "en",
): string {
  const labels: Record<QuotaResource, { en: string; ar: string }> = {
    cv_scan: { en: "CV Scans", ar: "فحوصات السيرة الذاتية" },
    cover_letter: { en: "Cover Letters", ar: "رسائل التقديم" },
    job_post: { en: "Job Posts", ar: "إعلانات الوظائف" },
    featured_post: { en: "Featured Posts", ar: "الإعلانات المميزة" },
    candidate_search: { en: "Candidate Searches", ar: "بحث المرشحين" },
    interview_gen: { en: "Interview Questions", ar: "أسئلة المقابلات" },
    ai_match: { en: "AI Matches", ar: "المطابقات الذكية" },
    export_pdf: { en: "PDF Exports", ar: "تصدير PDF" },
    message: { en: "Messages", ar: "الرسائل" },
    training_session: { en: "Training Sessions", ar: "جلسات التدريب" },
  };

  return labels[resource][locale];
}

/**
 * Get quota status color
 * الحصول على لون حالة الحصة
 */
export function getQuotaStatusColor(
  percentUsed: number,
): "success" | "warning" | "error" {
  if (percentUsed < 70) return "success";
  if (percentUsed < 90) return "warning";
  return "error";
}

// ============================================
// Exports
// ============================================

export const quotasService = {
  getAllPolicies,
  getPoliciesForRole,
  getUserQuota,
  getAllUserQuotas,
  checkQuota,
  consumeQuota,
  updatePolicy,
  createPolicy,
  resetUserQuota,
  grantBonus,
  formatQuotaDisplay,
  getResourceLabel,
  getQuotaStatusColor,
};
