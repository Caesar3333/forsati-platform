/**
 * Forsati Platform - Feature Flags Service
 * خدمة أعلام الميزات
 */

import { z } from "zod";
import {
  FeatureFlag,
  UserRole,
  Market,
  defaultFeatureFlags,
} from "@/types/admin";

// ============================================
// Types
// ============================================

export interface FeatureFlagContext {
  userId?: string;
  role?: UserRole;
  market?: Market;
  sessionId?: string;
}

export interface EvaluatedFlag {
  key: string;
  enabled: boolean;
  reason: "default" | "role" | "market" | "rollout" | "dependency";
}

// ============================================
// Feature Flags Service Class
// ============================================

class FeatureFlagsService {
  private apiUrl: string;
  private flags: Map<string, FeatureFlag>;
  private initialized: boolean = false;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
    this.flags = new Map();

    // Initialize with defaults
    defaultFeatureFlags.forEach((flag) => {
      this.flags.set(flag.key, {
        ...flag,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  /**
   * Initialize flags from server
   * تهيئة الأعلام من الخادم
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const response = await fetch(`${this.apiUrl}/api/featureflags`);

      if (response.ok) {
        const serverFlags: FeatureFlag[] = await response.json();
        serverFlags.forEach((flag) => {
          this.flags.set(flag.key, flag);
        });
      }

      this.initialized = true;
    } catch (error) {
      console.warn("Failed to fetch feature flags from server, using defaults");
      this.initialized = true;
    }
  }

  /**
   * Check if a feature is enabled
   * التحقق مما إذا كانت الميزة مفعّلة
   */
  isEnabled(key: string, context?: FeatureFlagContext): boolean {
    const flag = this.flags.get(key);

    if (!flag) {
      console.warn(`Feature flag "${key}" not found`);
      return false;
    }

    // Check if globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check role restrictions
    if (
      flag.activeForRoles &&
      flag.activeForRoles.length > 0 &&
      context?.role
    ) {
      if (!flag.activeForRoles.includes(context.role)) {
        return false;
      }
    }

    // Check market restrictions
    if (
      flag.activeForMarkets &&
      flag.activeForMarkets.length > 0 &&
      context?.market
    ) {
      if (!flag.activeForMarkets.includes(context.market)) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100 && context?.userId) {
      const hash = this.hashString(`${flag.key}:${context.userId}`);
      const percentage = hash % 100;
      if (percentage >= flag.rolloutPercentage) {
        return false;
      }
    }

    // Check dependencies
    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const depKey of flag.dependencies) {
        if (!this.isEnabled(depKey, context)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate a feature flag with detailed reason
   * تقييم علم الميزة مع السبب المفصّل
   */
  evaluate(key: string, context?: FeatureFlagContext): EvaluatedFlag {
    const flag = this.flags.get(key);

    if (!flag) {
      return { key, enabled: false, reason: "default" };
    }

    if (!flag.enabled) {
      return { key, enabled: false, reason: "default" };
    }

    if (
      flag.activeForRoles &&
      flag.activeForRoles.length > 0 &&
      context?.role
    ) {
      if (!flag.activeForRoles.includes(context.role)) {
        return { key, enabled: false, reason: "role" };
      }
    }

    if (
      flag.activeForMarkets &&
      flag.activeForMarkets.length > 0 &&
      context?.market
    ) {
      if (!flag.activeForMarkets.includes(context.market)) {
        return { key, enabled: false, reason: "market" };
      }
    }

    if (flag.rolloutPercentage < 100 && context?.userId) {
      const hash = this.hashString(`${flag.key}:${context.userId}`);
      const percentage = hash % 100;
      if (percentage >= flag.rolloutPercentage) {
        return { key, enabled: false, reason: "rollout" };
      }
    }

    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const depKey of flag.dependencies) {
        if (!this.isEnabled(depKey, context)) {
          return { key, enabled: false, reason: "dependency" };
        }
      }
    }

    return { key, enabled: true, reason: "default" };
  }

  /**
   * Get all flags
   * الحصول على جميع الأعلام
   */
  getAll(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get a specific flag
   * الحصول على علم محدد
   */
  get(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  /**
   * Get flags by category
   * الحصول على الأعلام حسب الفئة
   */
  getByCategory(category: FeatureFlag["category"]): FeatureFlag[] {
    return this.getAll().filter((flag) => flag.category === category);
  }

  /**
   * Admin: Update a feature flag
   * المشرف: تحديث علم ميزة
   */
  async update(
    key: string,
    updates: Partial<Omit<FeatureFlag, "key" | "createdAt">>,
    token: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/admin/featureflags/${key}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        },
      );

      if (response.ok) {
        const updatedFlag = await response.json();
        this.flags.set(key, updatedFlag);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to update feature flag:", error);
      return false;
    }
  }

  /**
   * Admin: Toggle a feature flag
   * المشرف: تبديل علم الميزة
   */
  async toggle(key: string, token: string): Promise<boolean> {
    const flag = this.flags.get(key);
    if (!flag) return false;

    return this.update(key, { enabled: !flag.enabled }, token);
  }

  /**
   * Admin: Set rollout percentage
   * المشرف: تعيين نسبة الإطلاق
   */
  async setRollout(
    key: string,
    percentage: number,
    token: string,
  ): Promise<boolean> {
    if (percentage < 0 || percentage > 100) return false;
    return this.update(key, { rolloutPercentage: percentage }, token);
  }

  /**
   * Admin: Create a new feature flag
   * المشرف: إنشاء علم ميزة جديد
   */
  async create(
    flag: Omit<FeatureFlag, "createdAt" | "updatedAt">,
    token: string,
  ): Promise<FeatureFlag | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/featureflags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(flag),
      });

      if (response.ok) {
        const newFlag = await response.json();
        this.flags.set(newFlag.key, newFlag);
        return newFlag;
      }

      return null;
    } catch (error) {
      console.error("Failed to create feature flag:", error);
      return null;
    }
  }

  /**
   * Admin: Delete a feature flag
   * المشرف: حذف علم ميزة
   */
  async delete(key: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/admin/featureflags/${key}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        this.flags.delete(key);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to delete feature flag:", error);
      return false;
    }
  }

  /**
   * Refresh flags from server
   * تحديث الأعلام من الخادم
   */
  async refresh(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// ============================================
// Exports
// ============================================

export const featureFlagsService = new FeatureFlagsService();
export { FeatureFlagsService };

// Re-export FeatureFlag type from admin types
export type { FeatureFlag } from "@/types/admin";

/**
 * Get all flags - convenience function
 * الحصول على جميع الأعلام - دالة مساعدة
 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  await featureFlagsService.initialize();
  return featureFlagsService.getAll();
}

/**
 * Update flag - convenience function
 * تحديث علم - دالة مساعدة
 */
export async function updateFlag(
  key: string,
  updates: Partial<Omit<FeatureFlag, "key" | "createdAt">>,
  token: string,
): Promise<boolean> {
  return featureFlagsService.update(key, updates, token);
}

// ============================================
// React Hook
// ============================================

export function useFeatureFlag(
  key: string,
  context?: FeatureFlagContext,
): boolean {
  // In a real implementation, this would use React context
  return featureFlagsService.isEnabled(key, context);
}

export function useFeatureFlags(
  keys: string[],
  context?: FeatureFlagContext,
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  keys.forEach((key) => {
    result[key] = featureFlagsService.isEnabled(key, context);
  });
  return result;
}

// ============================================
// Feature Flag Keys (for type safety)
// ============================================

export const FeatureKeys = {
  CV_SCAN: "cv_scan",
  AI_MATCHING: "ai_matching",
  QUICK_APPLY: "quick_apply",
  EMAIL_APPLY: "email_apply",
  WHATSAPP_APPLY: "whatsapp_apply",
  SOCIAL_POSTS: "social_posts",
  PORTFOLIO_BUILDER: "portfolio_builder",
  PREMIUM_PROMOTION: "premium_promotion",
  VIDEO_INTERVIEWS: "video_interviews",
  COVER_LETTER_GEN: "cover_letter_gen",
  INTERVIEW_QUESTIONS: "interview_questions",
  LOYALTY_PROGRAM: "loyalty_program",
  GIFT_CODES: "gift_codes",
  PUBLIC_PROFILES: "public_profiles",
  ADVANCED_ATS: "advanced_ats",
} as const;

export type FeatureKey = (typeof FeatureKeys)[keyof typeof FeatureKeys];
