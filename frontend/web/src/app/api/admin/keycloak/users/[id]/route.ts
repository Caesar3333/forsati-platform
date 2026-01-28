/**
 * Forsati Platform - Keycloak User Detail API
 * واجهة برمجة تفاصيل مستخدم Keycloak
 *
 * GET    /api/admin/keycloak/users/[id]           - Get user by ID
 * PUT    /api/admin/keycloak/users/[id]           - Update user
 * DELETE /api/admin/keycloak/users/[id]           - Delete user
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
import { keycloakAdmin } from "@/lib/keycloak/admin";

// ============================================
// Schemas
// ============================================

const UpdateUserSchema = z.object({
  enabled: z.boolean().optional(),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  attributes: z.record(z.array(z.string())).optional(),
});

// ============================================
// Handlers
// ============================================

async function handleGet(
  request: NextRequest,
  ctx: AdminContext,
  userId: string,
): Promise<NextResponse> {
  try {
    const user = await keycloakAdmin.getUser(userId);
    const roles = await keycloakAdmin.getUserRoles(userId);
    const sessions = await keycloakAdmin.getUserSessions(userId);

    return successResponse({
      ...user,
      roles: roles.map((r) => r.name),
      active_sessions: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress,
        started: s.start,
        lastAccess: s.lastAccess,
      })),
    });
  } catch (error: any) {
    if (error.message?.includes("404")) {
      return notFoundResponse("User");
    }
    console.error("Failed to get user:", error);
    return errorResponse("Failed to fetch user", "فشل في جلب المستخدم", 500);
  }
}

async function handlePut(
  request: NextRequest,
  ctx: AdminContext,
  userId: string,
): Promise<NextResponse> {
  const body = await request.json();

  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(
      Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    );
  }

  try {
    const oldUser = await keycloakAdmin.getUser(userId);
    await keycloakAdmin.updateUser(userId, parsed.data);
    const newUser = await keycloakAdmin.getUser(userId);

    // TODO: Audit log
    // if (oldUser.enabled !== newUser.enabled) {
    //   await auditLog(newUser.enabled ? 'user.enable' : 'user.disable', ctx, {...});
    // }

    return successResponse(newUser);
  } catch (error: any) {
    if (error.message?.includes("404")) {
      return notFoundResponse("User");
    }
    console.error("Failed to update user:", error);
    return errorResponse("Failed to update user", "فشل في تحديث المستخدم", 500);
  }
}

async function handleDelete(
  request: NextRequest,
  ctx: AdminContext,
  userId: string,
): Promise<NextResponse> {
  try {
    const user = await keycloakAdmin.getUser(userId);
    await keycloakAdmin.deleteUser(userId);

    // TODO: Audit log
    // await auditLog('user.delete', ctx, { resource_id: userId, changes_before: user });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.message?.includes("404")) {
      return notFoundResponse("User");
    }
    console.error("Failed to delete user:", error);
    return errorResponse("Failed to delete user", "فشل في حذف المستخدم", 500);
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
  const handler = withAdminAuth((req, ctx) => handleGet(req, ctx, id), {
    requiredPermission: PERMISSIONS.USERS.READ,
  });
  return handler(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handlePut(req, ctx, id), {
    requiredPermission: PERMISSIONS.USERS.WRITE,
  });
  return handler(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const handler = withAdminAuth((req, ctx) => handleDelete(req, ctx, id), {
    requireSuperAdmin: true,
  });
  return handler(request);
}
