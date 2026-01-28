/**
 * Forsati Platform - Audit Logs Admin API
 * واجهة برمجة سجلات المراجعة
 *
 * GET    /api/admin/audit-logs           - Query audit logs
 * POST   /api/admin/audit-logs           - Create audit log entry (internal)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  withAdminAuth,
  successResponse,
  validationErrorResponse,
  paginatedResponse,
  parsePagination,
  csvResponse,
  PERMISSIONS,
  AdminContext,
} from "@/lib/admin/middleware";
import { AuditActionSchema, ACTION_LABELS } from "@/lib/audit/logger";

// ============================================
// Schemas
// ============================================

const CreateAuditLogSchema = z.object({
  action: AuditActionSchema,
  actor_id: z.string(),
  actor_email: z.string().email(),
  actor_roles: z.array(z.string()),
  resource_type: z.string(),
  resource_id: z.string().optional().default(""),
  changes_before: z.record(z.any()).optional(),
  changes_after: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================
// Mock Database
// ============================================

let auditLogs = [
  {
    id: "1",
    action: "feature_flag.create",
    actor_id: "admin-001",
    actor_email: "admin@forsati.sa",
    actor_roles: ["forsati_super_admin"],
    resource_type: "feature_flag",
    resource_id: "1",
    changes_before: null,
    changes_after: { key: "cv_scan", enabled: true },
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
    metadata: null,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    action: "gift_code.create",
    actor_id: "admin-001",
    actor_email: "admin@forsati.sa",
    actor_roles: ["forsati_super_admin"],
    resource_type: "gift_code",
    resource_id: "1",
    changes_before: null,
    changes_after: {
      code: "WELCOME2024",
      benefit_type: "points",
      benefit_value: 100,
    },
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
    metadata: null,
    created_at: "2024-01-15T11:00:00Z",
  },
  {
    id: "3",
    action: "keycloak.role_assign",
    actor_id: "admin-001",
    actor_email: "admin@forsati.sa",
    actor_roles: ["forsati_super_admin"],
    resource_type: "user",
    resource_id: "user-123",
    changes_before: { roles: ["candidate"] },
    changes_after: { roles: ["candidate", "premium_candidate"] },
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
    metadata: { role_added: "premium_candidate" },
    created_at: "2024-01-15T12:00:00Z",
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

  let filtered = [...auditLogs];

  // Filter by action
  const action = searchParams.get("action");
  if (action) {
    filtered = filtered.filter((log) => log.action === action);
  }

  // Filter by action category
  const category = searchParams.get("category");
  if (category) {
    filtered = filtered.filter((log) => log.action.startsWith(category + "."));
  }

  // Filter by actor
  const actorId = searchParams.get("actor_id");
  if (actorId) {
    filtered = filtered.filter((log) => log.actor_id === actorId);
  }

  const actorEmail = searchParams.get("actor_email");
  if (actorEmail) {
    filtered = filtered.filter((log) =>
      log.actor_email.toLowerCase().includes(actorEmail.toLowerCase()),
    );
  }

  // Filter by resource
  const resourceType = searchParams.get("resource_type");
  if (resourceType) {
    filtered = filtered.filter((log) => log.resource_type === resourceType);
  }

  const resourceId = searchParams.get("resource_id");
  if (resourceId) {
    filtered = filtered.filter((log) => log.resource_id === resourceId);
  }

  // Filter by date range
  const fromDate = searchParams.get("from_date");
  if (fromDate) {
    filtered = filtered.filter((log) => log.created_at >= fromDate);
  }

  const toDate = searchParams.get("to_date");
  if (toDate) {
    filtered = filtered.filter((log) => log.created_at <= toDate);
  }

  // Sort by created_at descending (newest first)
  filtered.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Check if export requested
  const format = searchParams.get("format");
  if (format === "csv") {
    return exportAsCsv(filtered);
  }

  // Paginate
  const total = filtered.length;
  const items = filtered.slice(
    pagination.offset,
    pagination.offset + pagination.limit,
  );

  // Enrich with action labels
  const enrichedItems = items.map((item) => ({
    ...item,
    action_label: ACTION_LABELS[item.action as keyof typeof ACTION_LABELS] || {
      en: item.action,
      ar: item.action,
    },
  }));

  return paginatedResponse(enrichedItems, total, pagination);
}

async function handlePost(
  request: NextRequest,
  ctx: AdminContext,
): Promise<NextResponse> {
  const body = await request.json();

  const parsed = CreateAuditLogSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(
      Object.fromEntries(
        parsed.error.errors.map((e) => [e.path.join("."), e.message]),
      ),
    );
  }

  const newLog = {
    id: String(auditLogs.length + 1),
    action: parsed.data.action,
    actor_id: parsed.data.actor_id,
    actor_email: parsed.data.actor_email,
    actor_roles: parsed.data.actor_roles,
    resource_type: parsed.data.resource_type,
    resource_id: parsed.data.resource_id || "",
    changes_before: parsed.data.changes_before || null,
    changes_after: parsed.data.changes_after || null,
    ip_address: parsed.data.ip_address || null,
    user_agent: parsed.data.user_agent || null,
    metadata: parsed.data.metadata || null,
    created_at: new Date().toISOString(),
  };

  auditLogs.push(newLog as (typeof auditLogs)[0]);

  return successResponse(newLog, 201);
}

// ============================================
// CSV Export
// ============================================

function exportAsCsv(logs: typeof auditLogs): NextResponse {
  const headers = [
    "ID",
    "Action",
    "Action (EN)",
    "Action (AR)",
    "Actor ID",
    "Actor Email",
    "Actor Roles",
    "Resource Type",
    "Resource ID",
    "IP Address",
    "User Agent",
    "Created At",
  ];

  const rows = logs.map((log) => {
    const label = ACTION_LABELS[log.action as keyof typeof ACTION_LABELS] || {
      en: log.action,
      ar: log.action,
    };
    return [
      log.id,
      log.action,
      label.en,
      label.ar,
      log.actor_id,
      log.actor_email,
      log.actor_roles.join(";"),
      log.resource_type,
      log.resource_id || "",
      log.ip_address || "",
      log.user_agent || "",
      log.created_at,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;

  return csvResponse("\uFEFF" + csv, filename); // BOM for UTF-8 Excel compatibility
}

// ============================================
// Route Handler
// ============================================

export const GET = withAdminAuth(handleGet, {
  requiredPermission: PERMISSIONS.AUDIT.READ,
});

export const POST = withAdminAuth(handlePost, {
  requiredPermission: PERMISSIONS.AUDIT.READ, // Internal use
});
