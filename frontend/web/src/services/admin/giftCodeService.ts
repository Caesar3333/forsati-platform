/**
 * Forsati Platform - Gift Codes Service
 * خدمة أكواد الهدايا
 */

import { z } from "zod";
import {
  GiftCode,
  GiftCodeSchema,
  GiftCodeRedemption,
  GiftCodeType,
  UserRole,
  Market,
} from "@/types/admin";

// ============================================
// API Request/Response Types
// ============================================

export const CreateGiftCodeRequestSchema = z.object({
  code: z.string().min(4).max(20).optional(), // auto-generate if not provided
  type: z.enum([
    "credit",
    "free_post",
    "free_scan",
    "discount",
    "points",
    "premium_trial",
  ]),
  value: z.number().positive(),
  currency: z.string().default("JOD"),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  targetRoles: z.array(z.string()).optional(),
  markets: z.array(z.string()).optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  minOrderValue: z.number().optional(),
  singleUsePerUser: z.boolean().default(true),
});

export type CreateGiftCodeRequest = z.infer<typeof CreateGiftCodeRequestSchema>;

export const RedeemGiftCodeRequestSchema = z.object({
  code: z.string().min(4).max(20),
  userId: z.string().uuid(),
  appliedTo: z.string().optional(),
});

export type RedeemGiftCodeRequest = z.infer<typeof RedeemGiftCodeRequestSchema>;

export interface RedeemGiftCodeResponse {
  success: boolean;
  redemption?: GiftCodeRedemption;
  newBalance?: number;
  newQuota?: number;
  error?: string;
  errorAr?: string;
}

// ============================================
// Gift Code Service Class
// ============================================

class GiftCodeService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
  }

  /**
   * Generate a random gift code
   * توليد كود هدية عشوائي
   */
  generateCode(prefix: string = "FORSATI"): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new gift code (Admin only)
   * إنشاء كود هدية جديد
   */
  async create(
    data: CreateGiftCodeRequest,
    token: string,
  ): Promise<GiftCode | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/giftcodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          code: data.code || this.generateCode(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create gift code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create gift code:", error);
      return null;
    }
  }

  /**
   * Create multiple gift codes (bulk)
   * إنشاء أكواد هدايا متعددة
   */
  async createBulk(
    data: Omit<CreateGiftCodeRequest, "code">,
    count: number,
    prefix: string = "FORSATI",
    token: string,
  ): Promise<GiftCode[]> {
    const codes: GiftCode[] = [];
    const promises = [];

    for (let i = 0; i < count; i++) {
      promises.push(
        this.create({ ...data, code: this.generateCode(prefix) }, token),
      );
    }

    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        codes.push(result.value);
      }
    });

    return codes;
  }

  /**
   * Get all gift codes (Admin only)
   * الحصول على جميع أكواد الهدايا
   */
  async list(
    filters: {
      type?: GiftCodeType;
      active?: boolean;
      expired?: boolean;
      targetRole?: UserRole;
      market?: Market;
    } = {},
    token: string,
  ): Promise<GiftCode[]> {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.active !== undefined)
        params.set("active", String(filters.active));
      if (filters.expired !== undefined)
        params.set("expired", String(filters.expired));
      if (filters.targetRole) params.set("targetRole", filters.targetRole);
      if (filters.market) params.set("market", filters.market);

      const response = await fetch(
        `${this.apiUrl}/api/admin/giftcodes?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to list gift codes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to list gift codes:", error);
      return [];
    }
  }

  /**
   * Get a specific gift code
   * الحصول على كود هدية محدد
   */
  async get(codeId: string, token: string): Promise<GiftCode | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/admin/giftcodes/${codeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get gift code:", error);
      return null;
    }
  }

  /**
   * Validate a gift code (without redeeming)
   * التحقق من صلاحية كود الهدية
   */
  async validate(
    code: string,
    userId: string,
  ): Promise<{
    valid: boolean;
    giftCode?: GiftCode;
    error?: string;
    errorAr?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/giftcodes/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          error: data.error || "Invalid code",
          errorAr: data.errorAr || "كود غير صالح",
        };
      }

      return {
        valid: true,
        giftCode: data.giftCode,
      };
    } catch (error) {
      console.error("Failed to validate gift code:", error);
      return {
        valid: false,
        error: "Failed to validate code",
        errorAr: "فشل التحقق من الكود",
      };
    }
  }

  /**
   * Redeem a gift code
   * استبدال كود الهدية
   */
  async redeem(data: RedeemGiftCodeRequest): Promise<RedeemGiftCodeResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/giftcodes/redeem`, {
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
          error: result.error || "Failed to redeem code",
          errorAr: result.errorAr || "فشل استبدال الكود",
        };
      }

      return {
        success: true,
        redemption: result.redemption,
        newBalance: result.newBalance,
        newQuota: result.newQuota,
      };
    } catch (error) {
      console.error("Failed to redeem gift code:", error);
      return {
        success: false,
        error: "Failed to redeem code",
        errorAr: "فشل استبدال الكود",
      };
    }
  }

  /**
   * Deactivate a gift code (Admin only)
   * إلغاء تفعيل كود الهدية
   */
  async deactivate(codeId: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/admin/giftcodes/${codeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ active: false }),
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to deactivate gift code:", error);
      return false;
    }
  }

  /**
   * Get redemptions for a code (Admin only)
   * الحصول على عمليات الاستبدال لكود
   */
  async getRedemptions(
    codeId: string,
    token: string,
  ): Promise<GiftCodeRedemption[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/admin/giftcodes/${codeId}/redemptions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get redemptions:", error);
      return [];
    }
  }

  /**
   * Export gift codes to CSV
   * تصدير أكواد الهدايا إلى CSV
   */
  exportToCSV(codes: GiftCode[]): string {
    const headers = [
      "Code",
      "Type",
      "Value",
      "Currency",
      "Max Uses",
      "Used Count",
      "Active",
      "Expires At",
      "Created At",
    ];

    const rows = codes.map((code) => [
      code.code,
      code.type,
      code.value,
      code.currency,
      code.maxUses || "Unlimited",
      code.usedCount,
      code.active ? "Yes" : "No",
      code.expiresAt ? new Date(code.expiresAt).toISOString() : "Never",
      new Date(code.createdAt).toISOString(),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}

// ============================================
// Exports
// ============================================

export const giftCodeService = new GiftCodeService();
export { GiftCodeService };

// ============================================
// Validation Error Messages
// ============================================

export const giftCodeErrors = {
  INVALID_CODE: {
    en: "Invalid or expired code",
    ar: "كود غير صالح أو منتهي الصلاحية",
  },
  CODE_EXPIRED: {
    en: "This code has expired",
    ar: "انتهت صلاحية هذا الكود",
  },
  CODE_USED: {
    en: "This code has reached its usage limit",
    ar: "وصل هذا الكود إلى حد الاستخدام",
  },
  ALREADY_REDEEMED: {
    en: "You have already used this code",
    ar: "لقد استخدمت هذا الكود مسبقاً",
  },
  ROLE_NOT_ELIGIBLE: {
    en: "Your account type is not eligible for this code",
    ar: "نوع حسابك غير مؤهل لهذا الكود",
  },
  MARKET_NOT_ELIGIBLE: {
    en: "This code is not available in your region",
    ar: "هذا الكود غير متاح في منطقتك",
  },
  MIN_ORDER_NOT_MET: {
    en: "Minimum order value not met",
    ar: "لم يتم الوصول للحد الأدنى للطلب",
  },
};
