/**
 * Forsati Platform - Feature Flags Admin API
 * واجهة برمجة أعلام الميزات
 *
 * GET    /api/admin/feature-flags         - List all feature flags
 * POST   /api/admin/feature-flags         - Create feature flag
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  withAdminAuth,
  successResponse,
  validationErrorResponse,
  paginatedResponse,
  parsePagination,
  PERMISSIONS,
  AdminContext,
} from "@/lib/admin/middleware";

// ============================================
// Schemas
// ============================================

const CreateFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z][a-z0-9_]*$/),
  name_en: z.string().min(1).max(255),
  name_ar: z.string().min(1).max(255),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  enabled: z.boolean().default(false),
  rollout_json: z
    .object({
      markets: z.array(z.string()).optional(),
      roles: z.array(z.string()).optional(),
      percentage: z.number().min(0).max(100).optional(),
      user_ids: z.array(z.string()).optional(),
    })
    .optional(),
});

// ============================================
// Mock Database (Replace with actual DB)
// ============================================

let featureFlags = [
  {
    id: "1",
    key: "cv_scan",
    name_en: "CV Scan",
    name_ar: "مسح السيرة الذاتية",
    description_en: "AI-powered CV scanning feature",
    description_ar: "ميزة مسح السيرة الذاتية بالذكاء الاصطناعي",
    enabled: true,
    rollout_json: {
      markets: ["SA", "AE", "EG"],
      roles: ["candidate"],
      percentage: 100,
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    key: "ai_matching",
    name_en: "AI Job Matching",
    name_ar: "مطابقة الوظائف بالذكاء الاصطناعي",
    description_en: "AI-powered job matching",
    description_ar: "مطابقة الوظائف بالذكاء الاصطناعي",
    enabled: true,
    rollout_json: {
      markets: ["SA", "AE"],
      roles: ["candidate"],
      percentage: 50,
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ============================================
// Handlers
// ============================================

async function handleGet(
  request: NextRequest,
  ctx: AdminContext,
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(searchParams);

  // Filter
  const enabledFilter = searchParams.get("enabled");
  let filtered = [...featureFlags];

  if (enabledFilter !== null) {
    filtered = filtered.filter((f) => f.enabled === (enabledFilter === "true"));
  }

  // Search
  const search = searchParams.get("search");
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.key.includes(searchLower) ||
        f.name_en.toLowerCase().includes(searchLower) ||
        f.name_ar.includes(search),
    );
  }

  // Paginate
  const total = filtered.length;
  const items = filtered.slice(
    pagination.offset,
    pagination.offset + pagination.limit,
  );

  return paginatedResponse(items, total, pagination);
}

async function handlePost(
  request: NextRequest,
  ctx: AdminContext,
): Promise<NextResponse> {
  const body = await request.json();

  const parsed = CreateFeatureFlagSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(
      Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    );
  }

  // Check for duplicate key
  if (featureFlags.some((f) => f.key === parsed.data.key)) {
    return validationErrorResponse({ key: "Feature flag key already exists" });
  }

  const newFlag = {
    id: String(featureFlags.length + 1),
    key: parsed.data.key,
    name_en: parsed.data.name_en,
    name_ar: parsed.data.name_ar,
    description_en: parsed.data.description_en || "",
    description_ar: parsed.data.description_ar || "",
    enabled: parsed.data.enabled,
    rollout_json: {
      markets: parsed.data.rollout_json?.markets || [],
      roles: parsed.data.rollout_json?.roles || [],
      percentage: parsed.data.rollout_json?.percentage ?? 100,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  featureFlags.push(newFlag);

  // TODO: Log audit
  // await auditLog('feature_flag.create', ctx, { resource_id: newFlag.id, changes_after: newFlag });

  return successResponse(newFlag, 201);
}

// ============================================
// Route Handler
// ============================================

export const GET = withAdminAuth(handleGet, {
  requiredPermission: PERMISSIONS.FEATURE_FLAGS.READ,
});

export const POST = withAdminAuth(handlePost, {
  requiredPermission: PERMISSIONS.FEATURE_FLAGS.WRITE,
  auditAction: "feature_flag.create",
});
