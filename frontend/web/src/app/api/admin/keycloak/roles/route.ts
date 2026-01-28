/**
 * Forsati Platform - Keycloak Admin API
 * واجهة برمجة Keycloak
 *
 * GET    /api/admin/keycloak/roles        - List all roles
 * POST   /api/admin/keycloak/roles        - Create role
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  withAdminAuth,
  successResponse,
  validationErrorResponse,
  errorResponse,
  PERMISSIONS,
  AdminContext,
} from "@/lib/admin/middleware";
import { keycloakAdmin, FORSATI_ROLES } from "@/lib/keycloak/admin";

// ============================================
// Schemas
// ============================================

const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().max(500).optional(),
  attributes: z.record(z.array(z.string())).optional(),
});

// ============================================
// Handlers
// ============================================

async function handleGetRoles(
  request: NextRequest,
  ctx: AdminContext,
): Promise<NextResponse> {
  try {
    const roles = await keycloakAdmin.getRoles();

    // Mark Forsati system roles
    const enrichedRoles = roles.map((role) => ({
      ...role,
      is_system_role: Object.values(FORSATI_ROLES).includes(role.name as any),
      can_delete: !Object.values(FORSATI_ROLES).includes(role.name as any),
    }));

    return successResponse({
      items: enrichedRoles,
      total: enrichedRoles.length,
    });
  } catch (error) {
    console.error("Failed to get Keycloak roles:", error);
    return errorResponse(
      "Failed to fetch roles from Keycloak",
      "فشل في جلب الأدوار من Keycloak",
      500,
    );
  }
}

async function handleCreateRole(
  request: NextRequest,
  ctx: AdminContext,
): Promise<NextResponse> {
  const body = await request.json();

  const parsed = CreateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(
      Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    );
  }

  try {
    await keycloakAdmin.createRole(
      parsed.data.name,
      parsed.data.description,
      parsed.data.attributes,
    );

    const newRole = await keycloakAdmin.getRole(parsed.data.name);

    // TODO: Audit log
    // await auditLog('keycloak.role_create', ctx, { resource_id: newRole.id, changes_after: newRole });

    return successResponse(newRole, 201);
  } catch (error: any) {
    if (error.message?.includes("409")) {
      return validationErrorResponse({ name: "Role already exists" });
    }
    console.error("Failed to create role:", error);
    return errorResponse("Failed to create role", "فشل في إنشاء الدور", 500);
  }
}

// ============================================
// Route Handler
// ============================================

export const GET = withAdminAuth(handleGetRoles, {
  requiredPermission: PERMISSIONS.ROLES.READ,
});

export const POST = withAdminAuth(handleCreateRole, {
  requireSuperAdmin: true,
  auditAction: "keycloak.role_create",
});
