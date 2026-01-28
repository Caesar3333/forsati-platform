/**
 * Forsati Platform - Keycloak Users Admin API
 * واجهة برمجة مستخدمي Keycloak
 *
 * GET  /api/admin/keycloak/users           - Search users
 * GET  /api/admin/keycloak/users/[id]      - Get user details
 * PUT  /api/admin/keycloak/users/[id]      - Update user
 */

import { NextRequest, NextResponse } from "next/server";
import {
  withAdminAuth,
  successResponse,
  paginatedResponse,
  parsePagination,
  errorResponse,
  PERMISSIONS,
  AdminContext,
} from "@/lib/admin/middleware";
import { keycloakAdmin } from "@/lib/keycloak/admin";

// ============================================
// Handlers
// ============================================

async function handleSearchUsers(
  request: NextRequest,
  ctx: AdminContext,
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(searchParams);

  const search = searchParams.get("search") || undefined;
  const email = searchParams.get("email") || undefined;
  const username = searchParams.get("username") || undefined;

  try {
    const users = await keycloakAdmin.searchUsers({
      search,
      email,
      username,
      first: pagination.offset,
      max: pagination.limit,
    });

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        try {
          const roles = await keycloakAdmin.getUserRoles(user.id);
          return {
            ...user,
            roles: roles.map((r) => r.name),
          };
        } catch {
          return { ...user, roles: [] };
        }
      }),
    );

    // Note: Keycloak doesn't return total count efficiently
    // In production, you might want to cache this or use a different approach
    return successResponse({
      items: usersWithRoles,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    console.error("Failed to search users:", error);
    return errorResponse(
      "Failed to search users",
      "فشل في البحث عن المستخدمين",
      500,
    );
  }
}

// ============================================
// Route Handler
// ============================================

export const GET = withAdminAuth(handleSearchUsers, {
  requiredPermission: PERMISSIONS.USERS.READ,
});
