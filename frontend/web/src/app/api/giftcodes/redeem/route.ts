/**
 * Forsati Platform - Gift Code Redemption API
 * مسار API لاستخدام كود الهدية
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RedeemSchema = z.object({
  code: z.string().min(1),
});

// ============================================
// POST /api/giftcodes/redeem - Redeem a code
// ============================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "يجب تسجيل الدخول" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = RedeemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Code is required",
          errorAr: "الكود مطلوب",
          code: "MISSING_CODE",
        },
        { status: 400 },
      );
    }

    const { code } = validation.data;
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    // 1. Find the gift code
    const findResponse = await fetch(
      `${strapiUrl}/api/gift-codes?filters[code][$eq]=${code}&populate=*`,
      { headers: { Authorization: authHeader } },
    );

    if (!findResponse.ok) {
      throw new Error("Failed to validate code");
    }

    const findData = await findResponse.json();

    if (!findData.data || findData.data.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid code",
          errorAr: "كود غير صالح",
          code: "INVALID_CODE",
        },
        { status: 400 },
      );
    }

    const giftCode = findData.data[0];
    const { attributes } = giftCode;

    // 2. Validate code status
    if (!attributes.isActive) {
      return NextResponse.json(
        {
          error: "Code is inactive",
          errorAr: "الكود غير نشط",
          code: "CODE_INACTIVE",
        },
        { status: 400 },
      );
    }

    // 3. Check expiry
    if (attributes.expiresAt && new Date(attributes.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          error: "Code has expired",
          errorAr: "انتهت صلاحية الكود",
          code: "CODE_EXPIRED",
        },
        { status: 400 },
      );
    }

    // 4. Check max uses
    if (attributes.maxUses && attributes.usedCount >= attributes.maxUses) {
      return NextResponse.json(
        {
          error: "Code has reached maximum uses",
          errorAr: "وصل الكود للحد الأقصى من الاستخدام",
          code: "CODE_MAX_USES",
        },
        { status: 400 },
      );
    }

    // 5. Get current user
    const userResponse = await fetch(`${strapiUrl}/api/users/me`, {
      headers: { Authorization: authHeader },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user");
    }

    const user = await userResponse.json();

    // 6. Check if already redeemed by this user
    const redemptionCheck = await fetch(
      `${strapiUrl}/api/gift-code-redemptions?filters[giftCode][id][$eq]=${giftCode.id}&filters[user][id][$eq]=${user.id}`,
      { headers: { Authorization: authHeader } },
    );

    const redemptionData = await redemptionCheck.json();
    if (redemptionData.data && redemptionData.data.length > 0) {
      return NextResponse.json(
        {
          error: "You have already redeemed this code",
          errorAr: "لقد استخدمت هذا الكود من قبل",
          code: "ALREADY_REDEEMED",
        },
        { status: 400 },
      );
    }

    // 7. Check role restrictions
    if (attributes.targetRoles && attributes.targetRoles.length > 0) {
      if (!attributes.targetRoles.includes(user.role?.type)) {
        return NextResponse.json(
          {
            error: "This code is not valid for your account type",
            errorAr: "هذا الكود غير صالح لنوع حسابك",
            code: "ROLE_RESTRICTED",
          },
          { status: 400 },
        );
      }
    }

    // 8. Apply the benefit based on code type
    const benefit = await applyBenefit(strapiUrl, authHeader, user, attributes);

    // 9. Record redemption
    await fetch(`${strapiUrl}/api/gift-code-redemptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          giftCode: giftCode.id,
          user: user.id,
          redeemedAt: new Date().toISOString(),
          appliedBenefit: benefit,
        },
      }),
    });

    // 10. Increment used count
    await fetch(`${strapiUrl}/api/gift-codes/${giftCode.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          usedCount: attributes.usedCount + 1,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Code redeemed successfully",
      messageAr: "تم استخدام الكود بنجاح",
      benefit,
      codeType: attributes.type,
      value: attributes.value,
    });
  } catch (error) {
    console.error("Gift code redemption error:", error);
    return NextResponse.json(
      {
        error: "Failed to redeem code",
        errorAr: "فشل في استخدام الكود",
        code: "REDEMPTION_FAILED",
      },
      { status: 500 },
    );
  }
}

// ============================================
// Apply Benefit Helper
// ============================================

async function applyBenefit(
  strapiUrl: string,
  authHeader: string,
  user: any,
  codeAttributes: any,
): Promise<string> {
  const { type, value } = codeAttributes;

  switch (type) {
    case "points":
      // Award loyalty points
      await fetch(`${strapiUrl}/api/loyalty-transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            user: user.id,
            amount: value,
            type: "earn",
            reason: "gift_code",
            description: `Gift code redemption: ${value} points`,
          },
        }),
      });
      return `${value} loyalty points added`;

    case "free_scan":
      // Grant free CV scans
      await updateUserQuota(strapiUrl, authHeader, user.id, "cv_scan", value);
      return `${value} free CV scan(s) added`;

    case "free_post":
      // Grant free job posts
      await updateUserQuota(strapiUrl, authHeader, user.id, "job_post", value);
      return `${value} free job post(s) added`;

    case "credit":
      // Add account credit
      await fetch(`${strapiUrl}/api/user-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            user: user.id,
            amount: value,
            type: "gift_code",
          },
        }),
      });
      return `$${value} credit added to account`;

    case "discount":
      // Store discount for next purchase
      await fetch(`${strapiUrl}/api/user-discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            user: user.id,
            discountPercent: value,
            validUntil: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        }),
      });
      return `${value}% discount on next purchase`;

    case "premium_trial":
      // Grant premium trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + value);

      await fetch(`${strapiUrl}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          premiumTrialUntil: trialEndDate.toISOString(),
        }),
      });
      return `${value}-day premium trial activated`;

    default:
      return "Benefit applied";
  }
}

async function updateUserQuota(
  strapiUrl: string,
  authHeader: string,
  userId: number,
  resource: string,
  bonus: number,
): Promise<void> {
  // Find existing quota
  const response = await fetch(
    `${strapiUrl}/api/user-quotas?filters[user][id][$eq]=${userId}&filters[resource][$eq]=${resource}`,
    { headers: { Authorization: authHeader } },
  );

  const data = await response.json();

  if (data.data && data.data.length > 0) {
    // Update existing
    const quotaId = data.data[0].id;
    const currentBonus = data.data[0].attributes.bonus || 0;

    await fetch(`${strapiUrl}/api/user-quotas/${quotaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: { bonus: currentBonus + bonus },
      }),
    });
  } else {
    // Create new
    await fetch(`${strapiUrl}/api/user-quotas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          user: userId,
          resource,
          used: 0,
          bonus,
        },
      }),
    });
  }
}
