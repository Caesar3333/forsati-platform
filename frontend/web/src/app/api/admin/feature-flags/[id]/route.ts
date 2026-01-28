/**
 * Forsati Platform - Feature Flag Detail API
 * واجهة برمجة تفاصيل علم الميزة
 *
 * GET    /api/admin/feature-flags/[id]    - Get feature flag by ID
 * PUT    /api/admin/feature-flags/[id]    - Update feature flag
 * DELETE /api/admin/feature-flags/[id]    - Delete feature flag
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  withAdminAuth,
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  PERMISSIONS,
  AdminContext,
} from "@/lib/admin/middleware";

// ============================================
// Schemas
// ============================================

const UpdateFeatureFlagSchema = z.object({
  name_en: z.string().min(1).max(255).optional(),
  name_ar: z.string().min(1).max(255).optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  enabled: z.boolean().optional(),
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
// Mock Database (shared with parent route)
// In production, use a real database connection
// ============================================

// This is a simplified mock - in production, use a shared DB module
const getFeatureFlags = () => {
  // @ts-ignore - Mock global store
  if (!global.featureFlags) {
    // @ts-ignore
    global.featureFlags = [
      {
        id: "1",
        key: "cv_scan",
        name_en: "CV Scan",
        name_ar: "مسح السيرة الذاتية",
        enabled: true,
        rollout_json: { markets: ["SA", "AE", "EG"] },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
  }
  // @ts-ignore
  return global.featureFlags;
};

// ============================================
// Handlers
// ============================================

async function handleGet(
  request: NextRequest,
  ctx: AdminContext,
  params: { id: string },
): Promise<NextResponse> {
  const flags = getFeatureFlags();
  const flag = flags.find((f: any) => f.id === params.id);

  if (!flag) {
    return notFoundResponse("Feature flag");
  }

  return successResponse(flag);
}

async function handlePut(
  request: NextRequest,
  ctx: AdminContext,
  params: { id: string },
): Promise<NextResponse> {
  const flags = getFeatureFlags();
  const flagIndex = flags.findIndex((f: any) => f.id === params.id);

  if (flagIndex === -1) {
    return notFoundResponse("Feature flag");
  }

  const body = await request.json();
  const parsed = UpdateFeatureFlagSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(
      Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    );
  }

  const oldFlag = { ...flags[flagIndex] };
  const updatedFlag = {
    ...flags[flagIndex],
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  flags[flagIndex] = updatedFlag;

  // TODO: Log audit with before/after
  // await auditLog('feature_flag.update', ctx, {
  //   resource_id: params.id,
  //   changes_before: oldFlag,
  //   changes_after: updatedFlag
  // });

  return successResponse(updatedFlag);
}

async function handleDelete(
  request: NextRequest,
  ctx: AdminContext,
  params: { id: string },
): Promise<NextResponse> {
  const flags = getFeatureFlags();
  const flagIndex = flags.findIndex((f: any) => f.id === params.id);

  if (flagIndex === -1) {
    return notFoundResponse("Feature flag");
  }

  const deletedFlag = flags[flagIndex];
  flags.splice(flagIndex, 1);

  // TODO: Log audit
  // await auditLog('feature_flag.delete', ctx, { resource_id: params.id, changes_before: deletedFlag });

  return new NextResponse(null, { status: 204 });
}

// ============================================
// Route Handlers with ID Parameter
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handleGet(req, ctx, { id }), {
    requiredPermission: PERMISSIONS.FEATURE_FLAGS.READ,
  });
  return handler(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handlePut(req, ctx, { id }), {
    requiredPermission: PERMISSIONS.FEATURE_FLAGS.WRITE,
    auditAction: "feature_flag.update",
  });
  return handler(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handleDelete(req, ctx, { id }), {
    requireSuperAdmin: true,
    auditAction: "feature_flag.delete",
  });
  return handler(request);
}
