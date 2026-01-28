/**
 * Forsati Platform - User Role Assignment API
 * واجهة برمجة تعيين أدوار المستخدم
 *
 * GET    /api/admin/keycloak/users/[id]/roles    - Get user roles
 * POST   /api/admin/keycloak/users/[id]/roles    - Assign role
 * DELETE /api/admin/keycloak/users/[id]/roles    - Remove role
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  withAdminAuth,
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  errorResponse,
  PERMISSIONS,
  AdminContext,
} from "@/lib/admin/middleware";
import { keycloakAdmin, FORSATI_ROLES } from "@/lib/keycloak/admin";

// ============================================
// Schemas
// ============================================

const RoleAssignmentSchema = z.object({
  role_name: z.string().min(1),
});

// ============================================
// Handlers
// ============================================

async function handleGetRoles(
  request: NextRequest,
  ctx: AdminContext,
  userId: string,
): Promise<NextResponse> {
  try {
    const userRoles = await keycloakAdmin.getUserRoles(userId);
    const availableRoles = await keycloakAdmin.getAvailableRoles(userId);

    return successResponse({
      assigned: userRoles.map((r) => ({
        ...r,
        is_system_role: Object.values(FORSATI_ROLES).includes(r.name as any),
      })),
      available: availableRoles.map((r) => ({
        ...r,
        is_system_role: Object.values(FORSATI_ROLES).includes(r.name as any),
      })),
    });
  } catch (error: any) {
    if (error.message?.includes("404")) {
      return notFoundResponse("User");
    }
    console.error("Failed to get user roles:", error);
    return errorResponse(
      "Failed to fetch user roles",
      "فشل في جلب أدوار المستخدم",
      500,
    );
  }
}

async function handleAssignRole(
  request: NextRequest,
  ctx: AdminContext,
  userId: string,
): Promise<NextResponse> {
  const body = await request.json();

  const parsed = RoleAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(
      Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    );
  }

  // Only super admins can assign super admin role
  if (
    parsed.data.role_name === FORSATI_ROLES.SUPER_ADMIN &&
    !ctx.isSuperAdmin
  ) {
    return errorResponse(
      "Cannot assign super admin role",
      "لا يمكن تعيين دور المشرف الأعلى",
      403,
    );
  }

  try {
    const oldRoles = await keycloakAdmin.getUserRoles(userId);
    await keycloakAdmin.assignRoleToUser(userId, parsed.data.role_name);
    const newRoles = await keycloakAdmin.getUserRoles(userId);

    // TODO: Audit log
    // await auditLog('keycloak.role_assign', ctx, {
    //   resource_id: userId,
    //   changes_before: { roles: oldRoles.map(r => r.name) },
    //   changes_after: { roles: newRoles.map(r => r.name) },
    //   metadata: { role_added: parsed.data.role_name }
    // });

    return successResponse({
      message: "Role assigned successfully",
      message_ar: "تم تعيين الدور بنجاح",
      roles: newRoles.map((r) => r.name),
    });
  } catch (error: any) {
    if (error.message?.includes("404")) {
      return notFoundResponse("User or Role");
    }
    console.error("Failed to assign role:", error);
    return errorResponse("Failed to assign role", "فشل في تعيين الدور", 500);
  }
}

async function handleRemoveRole(
  request: NextRequest,
  ctx: AdminContext,
  userId: string,
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const roleName = searchParams.get("role_name");

  if (!roleName) {
    return validationErrorResponse({ role_name: "Role name is required" });
  }

  // Only super admins can remove super admin role
  if (roleName === FORSATI_ROLES.SUPER_ADMIN && !ctx.isSuperAdmin) {
    return errorResponse(
      "Cannot remove super admin role",
      "لا يمكن إزالة دور المشرف الأعلى",
      403,
    );
  }

  // Prevent removing own super admin role
  if (roleName === FORSATI_ROLES.SUPER_ADMIN && ctx.userId === userId) {
    return errorResponse(
      "Cannot remove your own super admin role",
      "لا يمكن إزالة دور المشرف الأعلى الخاص بك",
      403,
    );
  }

  try {
    const oldRoles = await keycloakAdmin.getUserRoles(userId);
    await keycloakAdmin.removeRoleFromUser(userId, roleName);
    const newRoles = await keycloakAdmin.getUserRoles(userId);

    // TODO: Audit log
    // await auditLog('keycloak.role_remove', ctx, {
    //   resource_id: userId,
    //   changes_before: { roles: oldRoles.map(r => r.name) },
    //   changes_after: { roles: newRoles.map(r => r.name) },
    //   metadata: { role_removed: roleName }
    // });

    return successResponse({
      message: "Role removed successfully",
      message_ar: "تم إزالة الدور بنجاح",
      roles: newRoles.map((r) => r.name),
    });
  } catch (error: any) {
    if (error.message?.includes("404")) {
      return notFoundResponse("User or Role");
    }
    console.error("Failed to remove role:", error);
    return errorResponse("Failed to remove role", "فشل في إزالة الدور", 500);
  }
}

// ============================================
// Route Handlers
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handleGetRoles(req, ctx, id), {
    requiredPermission: PERMISSIONS.USERS.READ,
  });
  return handler(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handleAssignRole(req, ctx, id), {
    requiredPermission: PERMISSIONS.ROLES.WRITE,
    auditAction: "keycloak.role_assign",
  });
  return handler(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handleRemoveRole(req, ctx, id), {
    requiredPermission: PERMISSIONS.ROLES.WRITE,
    auditAction: "keycloak.role_remove",
  });
  return handler(request);
}
