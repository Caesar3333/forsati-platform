/**
 * Forsati Platform - Loyalty Points Service
 * خدمة نقاط الولاء
 */

import { z } from "zod";
import {
  LoyaltyAccount,
  PointsTransaction,
  PointsReason,
  PointsRule,
  PointsReward,
  defaultPointsRules,
} from "@/types/admin";

// ============================================
// API Request/Response Types
// ============================================

export const AwardPointsRequestSchema = z.object({
  userId: z.string().uuid(),
  reason: z.enum([
    "signup",
    "profile_complete",
    "upload_cv",
    "cv_scan",
    "referral_sent",
    "referral_confirmed",
    "apply_job",
    "interview_complete",
    "review_complete",
    "course_complete",
    "daily_login",
    "share_social",
    "gift_code",
    "admin_adjustment",
  ]),
  points: z.number().int().optional(), // override default rule points
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  referenceId: z.string().optional(),
});

export type AwardPointsRequest = z.infer<typeof AwardPointsRequestSchema>;

export const RedeemPointsRequestSchema = z.object({
  userId: z.string().uuid(),
  rewardCode: z.string(),
  quantity: z.number().int().positive().default(1),
});

export type RedeemPointsRequest = z.infer<typeof RedeemPointsRequestSchema>;

export interface PointsBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  expiringPoints: number;
  expiringDate?: Date;
}

// ============================================
// Tier Configuration
// ============================================

export const tierThresholds = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
};

export const tierBenefits = {
  bronze: {
    name: "Bronze",
    nameAr: "برونزي",
    benefits: [
      { en: "Basic loyalty rewards", ar: "مكافآت ولاء أساسية" },
      { en: "Birthday bonus points", ar: "نقاط مكافأة عيد الميلاد" },
    ],
  },
  silver: {
    name: "Silver",
    nameAr: "فضي",
    benefits: [
      { en: "All Bronze benefits", ar: "جميع مزايا البرونزي" },
      {
        en: "10% bonus on point earnings",
        ar: "مكافأة 10% على النقاط المكتسبة",
      },
      { en: "1 free CV scan per month", ar: "فحص سيرة مجاني شهرياً" },
    ],
  },
  gold: {
    name: "Gold",
    nameAr: "ذهبي",
    benefits: [
      { en: "All Silver benefits", ar: "جميع مزايا الفضي" },
      {
        en: "25% bonus on point earnings",
        ar: "مكافأة 25% على النقاط المكتسبة",
      },
      { en: "3 free CV scans per month", ar: "3 فحوصات سيرة مجانية شهرياً" },
      { en: "Priority support", ar: "دعم ذو أولوية" },
    ],
  },
  platinum: {
    name: "Platinum",
    nameAr: "بلاتيني",
    benefits: [
      { en: "All Gold benefits", ar: "جميع مزايا الذهبي" },
      {
        en: "50% bonus on point earnings",
        ar: "مكافأة 50% على النقاط المكتسبة",
      },
      { en: "Unlimited CV scans", ar: "فحوصات سيرة غير محدودة" },
      { en: "Featured profile listing", ar: "عرض الملف الشخصي المميز" },
      { en: "Exclusive job access", ar: "وصول حصري للوظائف" },
    ],
  },
};

// ============================================
// Loyalty Points Service Class
// ============================================

class LoyaltyPointsService {
  private apiUrl: string;
  private rules: PointsRule[];

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
    this.rules = defaultPointsRules;
  }

  /**
   * Get points balance for a user
   * الحصول على رصيد النقاط للمستخدم
   */
  async getBalance(userId: string): Promise<PointsBalance | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/users/${userId}/points`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get points balance:", error);
      return null;
    }
  }

  /**
   * Get full loyalty account with transactions
   * الحصول على حساب الولاء الكامل مع المعاملات
   */
  async getAccount(userId: string): Promise<LoyaltyAccount | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/users/${userId}/points/account`,
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get loyalty account:", error);
      return null;
    }
  }

  /**
   * Get transaction history
   * الحصول على سجل المعاملات
   */
  async getTransactions(
    userId: string,
    options: { page?: number; limit?: number; reason?: PointsReason } = {},
  ): Promise<{ transactions: PointsTransaction[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));
      if (options.reason) params.set("reason", options.reason);

      const response = await fetch(
        `${this.apiUrl}/api/users/${userId}/points/transactions?${params}`,
      );

      if (!response.ok) {
        return { transactions: [], total: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get transactions:", error);
      return { transactions: [], total: 0 };
    }
  }

  /**
   * Award points to a user
   * منح نقاط للمستخدم
   */
  async award(data: AwardPointsRequest): Promise<{
    success: boolean;
    transaction?: PointsTransaction;
    newBalance?: number;
    error?: string;
  }> {
    try {
      // Get points from rule if not specified
      const rule = this.rules.find((r) => r.reason === data.reason);
      const points = data.points ?? rule?.points ?? 0;

      if (points <= 0) {
        return {
          success: false,
          error: "Invalid points amount",
        };
      }

      const response = await fetch(`${this.apiUrl}/api/points/award`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          points,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to award points",
        };
      }

      return {
        success: true,
        transaction: result.transaction,
        newBalance: result.newBalance,
      };
    } catch (error) {
      console.error("Failed to award points:", error);
      return {
        success: false,
        error: "Failed to award points",
      };
    }
  }

  /**
   * Redeem points for a reward
   * استبدال النقاط بمكافأة
   */
  async redeem(data: RedeemPointsRequest): Promise<{
    success: boolean;
    reward?: PointsReward;
    transaction?: PointsTransaction;
    newBalance?: number;
    error?: string;
    errorAr?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/points/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to redeem points",
          errorAr: result.errorAr || "فشل استبدال النقاط",
        };
      }

      return {
        success: true,
        reward: result.reward,
        transaction: result.transaction,
        newBalance: result.newBalance,
      };
    } catch (error) {
      console.error("Failed to redeem points:", error);
      return {
        success: false,
        error: "Failed to redeem points",
        errorAr: "فشل استبدال النقاط",
      };
    }
  }

  /**
   * Get available rewards
   * الحصول على المكافآت المتاحة
   */
  async getRewards(userId?: string): Promise<PointsReward[]> {
    try {
      const params = userId ? `?userId=${userId}` : "";
      const response = await fetch(
        `${this.apiUrl}/api/points/rewards${params}`,
      );

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get rewards:", error);
      return [];
    }
  }

  /**
   * Check if user can afford a reward
   * التحقق من قدرة المستخدم على الاستبدال
   */
  async canAfford(userId: string, rewardCode: string): Promise<boolean> {
    const [balance, rewards] = await Promise.all([
      this.getBalance(userId),
      this.getRewards(userId),
    ]);

    if (!balance) return false;

    const reward = rewards.find((r) => r.code === rewardCode);
    if (!reward) return false;

    return balance.balance >= reward.pointsCost;
  }

  /**
   * Calculate tier based on lifetime points
   * حساب المستوى بناءً على النقاط الإجمالية
   */
  calculateTier(
    lifetimeEarned: number,
  ): "bronze" | "silver" | "gold" | "platinum" {
    if (lifetimeEarned >= tierThresholds.platinum) return "platinum";
    if (lifetimeEarned >= tierThresholds.gold) return "gold";
    if (lifetimeEarned >= tierThresholds.silver) return "silver";
    return "bronze";
  }

  /**
   * Get tier progress
   * الحصول على تقدم المستوى
   */
  getTierProgress(lifetimeEarned: number): {
    currentTier: string;
    nextTier: string | null;
    pointsToNext: number;
    progress: number;
  } {
    const currentTier = this.calculateTier(lifetimeEarned);
    const tiers = ["bronze", "silver", "gold", "platinum"] as const;
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === tiers.length - 1) {
      return {
        currentTier,
        nextTier: null,
        pointsToNext: 0,
        progress: 100,
      };
    }

    const nextTier = tiers[currentIndex + 1];
    const currentThreshold = tierThresholds[currentTier];
    const nextThreshold = tierThresholds[nextTier];
    const pointsToNext = nextThreshold - lifetimeEarned;
    const progress =
      ((lifetimeEarned - currentThreshold) /
        (nextThreshold - currentThreshold)) *
      100;

    return {
      currentTier,
      nextTier,
      pointsToNext,
      progress: Math.min(100, Math.max(0, progress)),
    };
  }

  /**
   * Get tier bonus multiplier
   * الحصول على مضاعف المكافأة حسب المستوى
   */
  getTierBonus(tier: "bronze" | "silver" | "gold" | "platinum"): number {
    const bonuses = {
      bronze: 1.0,
      silver: 1.1,
      gold: 1.25,
      platinum: 1.5,
    };
    return bonuses[tier];
  }

  /**
   * Get points rule for a reason
   * الحصول على قاعدة النقاط لسبب معين
   */
  getRule(reason: PointsReason): PointsRule | undefined {
    return this.rules.find((r) => r.reason === reason);
  }

  /**
   * Admin: Update points rules
   * المشرف: تحديث قواعد النقاط
   */
  async updateRules(rules: PointsRule[], token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/points/rules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rules }),
      });

      if (response.ok) {
        this.rules = rules;
      }

      return response.ok;
    } catch (error) {
      console.error("Failed to update rules:", error);
      return false;
    }
  }

  /**
   * Admin: Create a reward
   * المشرف: إنشاء مكافأة
   */
  async createReward(
    reward: Omit<PointsReward, "id">,
    token: string,
  ): Promise<PointsReward | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/points/rewards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reward),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create reward:", error);
      return null;
    }
  }

  /**
   * Admin: Adjust user points manually
   * المشرف: تعديل نقاط المستخدم يدوياً
   */
  async adminAdjust(
    userId: string,
    points: number,
    description: string,
    descriptionAr: string,
    token: string,
  ): Promise<{ success: boolean; transaction?: PointsTransaction }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/points/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          points,
          reason: "admin_adjustment",
          description,
          descriptionAr,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        transaction: result.transaction,
      };
    } catch (error) {
      console.error("Failed to adjust points:", error);
      return { success: false };
    }
  }
}

// ============================================
// Exports
// ============================================

export const loyaltyPointsService = new LoyaltyPointsService();
export { LoyaltyPointsService };

// ============================================
// Points Display Helpers
// ============================================

export function formatPoints(
  points: number,
  locale: "en" | "ar" = "en",
): string {
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-JO" : "en-JO",
  ).format(points);
  return locale === "ar" ? `${formatted} نقطة` : `${formatted} pts`;
}

export function getReasonLabel(
  reason: PointsReason,
  locale: "en" | "ar" = "en",
): string {
  const labels: Record<PointsReason, { en: string; ar: string }> = {
    signup: { en: "Welcome bonus", ar: "مكافأة الترحيب" },
    profile_complete: { en: "Profile completed", ar: "إكمال الملف الشخصي" },
    upload_cv: { en: "CV uploaded", ar: "رفع السيرة الذاتية" },
    cv_scan: { en: "CV scanned", ar: "فحص السيرة الذاتية" },
    referral_sent: { en: "Referral sent", ar: "إرسال دعوة" },
    referral_confirmed: { en: "Referral confirmed", ar: "تأكيد دعوة" },
    apply_job: { en: "Job application", ar: "التقديم على وظيفة" },
    interview_complete: { en: "Interview completed", ar: "إكمال المقابلة" },
    review_complete: { en: "Review completed", ar: "إكمال المراجعة" },
    course_complete: { en: "Course completed", ar: "إكمال الدورة" },
    daily_login: { en: "Daily login", ar: "تسجيل دخول يومي" },
    share_social: { en: "Social share", ar: "مشاركة اجتماعية" },
    gift_code: { en: "Gift code", ar: "كود هدية" },
    admin_adjustment: { en: "Admin adjustment", ar: "تعديل إداري" },
    expiry: { en: "Points expired", ar: "انتهاء صلاحية النقاط" },
    redemption: { en: "Reward redeemed", ar: "استبدال مكافأة" },
  };

  return labels[reason]?.[locale] || reason;
}
