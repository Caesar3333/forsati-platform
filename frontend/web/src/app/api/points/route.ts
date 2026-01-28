/**
 * Forsati Platform - Loyalty Points API Routes
 * مسارات API لنقاط الولاء
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================
// Schemas
// ============================================

const AwardPointsSchema = z.object({
  userId: z.string().or(z.number()),
  amount: z.number().positive(),
  reason: z.enum([
    "signup",
    "profile_complete",
    "upload_cv",
    "cv_scan",
    "referral_sent",
    "referral_confirmed",
    "apply_job",
    "first_interview",
    "job_hired",
    "review_given",
    "training_completed",
    "daily_login",
    "share_social",
    "gift_code",
    "admin_bonus",
    "tier_bonus",
  ]),
  description: z.string().optional(),
});

const RedeemPointsSchema = z.object({
  rewardId: z.string().or(z.number()),
  pointsCost: z.number().positive(),
});

// ============================================
// GET /api/points - Get user's points balance
// ============================================

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    // Get current user
    const userResponse = await fetch(
      `${strapiUrl}/api/users/me?populate=loyaltyAccount`,
      {
        headers: { Authorization: authHeader },
      },
    );

    if (!userResponse.ok) {
      throw new Error("Failed to get user");
    }

    const user = await userResponse.json();

    // Get or create loyalty account
    let account = user.loyaltyAccount;

    if (!account) {
      // Create default account
      const createResponse = await fetch(`${strapiUrl}/api/loyalty-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            user: user.id,
            balance: 0,
            lifetimeEarned: 0,
            lifetimeRedeemed: 0,
            tier: "bronze",
          },
        }),
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        account = createData.data.attributes;
        account.id = createData.data.id;
      }
    }

    // Get recent transactions
    const transactionsResponse = await fetch(
      `${strapiUrl}/api/loyalty-transactions?filters[user][id][$eq]=${user.id}&sort=createdAt:desc&pagination[limit]=10`,
      { headers: { Authorization: authHeader } },
    );

    const transactions = transactionsResponse.ok
      ? (await transactionsResponse.json()).data
      : [];

    // Calculate tier progress
    const tierThresholds = {
      bronze: 0,
      silver: 500,
      gold: 2000,
      platinum: 5000,
    };

    const currentTier = account?.tier || "bronze";
    const balance = account?.balance || 0;
    const lifetimeEarned = account?.lifetimeEarned || 0;

    let nextTier = null;
    let pointsToNextTier = 0;
    let progress = 100;

    const tiers = ["bronze", "silver", "gold", "platinum"];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex < tiers.length - 1) {
      nextTier = tiers[currentIndex + 1];
      const nextThreshold =
        tierThresholds[nextTier as keyof typeof tierThresholds];
      const currentThreshold =
        tierThresholds[currentTier as keyof typeof tierThresholds];
      pointsToNextTier = Math.max(0, nextThreshold - lifetimeEarned);
      progress = Math.min(
        100,
        ((lifetimeEarned - currentThreshold) /
          (nextThreshold - currentThreshold)) *
          100,
      );
    }

    return NextResponse.json({
      balance,
      lifetimeEarned,
      lifetimeRedeemed: account?.lifetimeRedeemed || 0,
      tier: currentTier,
      nextTier,
      pointsToNextTier,
      progress: Math.round(progress),
      recentTransactions: transactions.map((t: any) => ({
        id: t.id,
        ...t.attributes,
      })),
    });
  } catch (error) {
    console.error("Points balance error:", error);
    return NextResponse.json(
      {
        error: "Failed to get points balance",
        errorAr: "فشل في الحصول على رصيد النقاط",
      },
      { status: 500 },
    );
  }
}

// ============================================
// POST /api/points/award - Award points
// ============================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", errorAr: "غير مصرح" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = AwardPointsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          errorAr: "طلب غير صالح",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { userId, amount, reason, description } = validation.data;
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    // Get user's loyalty account
    const accountResponse = await fetch(
      `${strapiUrl}/api/loyalty-accounts?filters[user][id][$eq]=${userId}`,
      { headers: { Authorization: authHeader } },
    );

    const accountData = await accountResponse.json();
    let account = accountData.data?.[0];

    if (!account) {
      // Create account
      const createResponse = await fetch(`${strapiUrl}/api/loyalty-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            user: userId,
            balance: 0,
            lifetimeEarned: 0,
            lifetimeRedeemed: 0,
            tier: "bronze",
          },
        }),
      });
      account = (await createResponse.json()).data;
    }

    // Calculate tier bonus
    const tierBonuses: Record<string, number> = {
      bronze: 0,
      silver: 10,
      gold: 25,
      platinum: 50,
    };
    const tierBonus = tierBonuses[account.attributes.tier] || 0;
    const bonusAmount = Math.round(amount * (tierBonus / 100));
    const totalAmount = amount + bonusAmount;

    // Create transaction
    await fetch(`${strapiUrl}/api/loyalty-transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          user: userId,
          amount: totalAmount,
          type: "earn",
          reason,
          description: description || getReasonDescription(reason),
          bonusAmount,
        },
      }),
    });

    // Update account balance
    const newBalance = account.attributes.balance + totalAmount;
    const newLifetimeEarned = account.attributes.lifetimeEarned + totalAmount;

    // Check for tier upgrade
    const newTier = calculateTier(newLifetimeEarned);
    const tierUpgraded = newTier !== account.attributes.tier;

    await fetch(`${strapiUrl}/api/loyalty-accounts/${account.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          balance: newBalance,
          lifetimeEarned: newLifetimeEarned,
          tier: newTier,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      awarded: totalAmount,
      baseAmount: amount,
      bonusAmount,
      newBalance,
      tier: newTier,
      tierUpgraded,
      message: tierUpgraded
        ? `Congratulations! You've reached ${newTier} tier!`
        : `You earned ${totalAmount} points!`,
      messageAr: tierUpgraded
        ? `تهانينا! لقد وصلت لمستوى ${getTierNameAr(newTier)}!`
        : `لقد كسبت ${totalAmount} نقطة!`,
    });
  } catch (error) {
    console.error("Award points error:", error);
    return NextResponse.json(
      { error: "Failed to award points", errorAr: "فشل في منح النقاط" },
      { status: 500 },
    );
  }
}

// ============================================
// Helper Functions
// ============================================

function calculateTier(lifetimePoints: number): string {
  if (lifetimePoints >= 5000) return "platinum";
  if (lifetimePoints >= 2000) return "gold";
  if (lifetimePoints >= 500) return "silver";
  return "bronze";
}

function getTierNameAr(tier: string): string {
  const names: Record<string, string> = {
    bronze: "البرونزي",
    silver: "الفضي",
    gold: "الذهبي",
    platinum: "البلاتيني",
  };
  return names[tier] || tier;
}

function getReasonDescription(reason: string): string {
  const descriptions: Record<string, string> = {
    signup: "Welcome bonus for signing up",
    profile_complete: "Completed your profile",
    upload_cv: "Uploaded your CV",
    cv_scan: "Scanned your CV",
    referral_sent: "Sent a referral",
    referral_confirmed: "Friend joined via your referral",
    apply_job: "Applied to a job",
    first_interview: "Got your first interview",
    job_hired: "Got hired through Forsati",
    review_given: "Left a review",
    training_completed: "Completed training",
    daily_login: "Daily login bonus",
    share_social: "Shared on social media",
    gift_code: "Redeemed gift code",
    admin_bonus: "Admin bonus",
    tier_bonus: "Tier milestone bonus",
  };
  return descriptions[reason] || "Points earned";
}
