/**
 * Forsati Platform - Admin API Client
 * عميل واجهة برمجة المشرف
 *
 * Client-side API service for admin operations with full Keycloak integration.
 */

// ============================================
// Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AuditLog {
  id: string;
  action: string;
  action_label: { ar: string; en: string };
  actor_id: string;
  actor_email: string;
  actor_roles: string[];
  resource_type: string;
  resource_id?: string;
  changes_before?: Record<string, any>;
  changes_after?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  createdTimestamp: number;
}

export interface KeycloakRole {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  can_delete: boolean;
}

// ============================================
// API Client
// ============================================

export class AdminApiClient {
  private baseUrl = "/api/admin";
  private getToken: () => Promise<string>;

  constructor(getToken: () => Promise<string>) {
    this.getToken = getToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============================================
  // Keycloak Roles
  // ============================================

  async getKeycloakRoles(): Promise<{ items: KeycloakRole[]; total: number }> {
    return this.request("/keycloak/roles");
  }

  async createKeycloakRole(data: {
    name: string;
    description?: string;
  }): Promise<KeycloakRole> {
    return this.request("/keycloak/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteKeycloakRole(roleName: string): Promise<void> {
    return this.request(`/keycloak/roles/${encodeURIComponent(roleName)}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // Keycloak Users
  // ============================================

  async searchUsers(params?: {
    search?: string;
    email?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: KeycloakUser[]; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.email) query.append("email", params.email);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request(`/keycloak/users?${query}`);
  }

  async getUser(
    userId: string,
  ): Promise<KeycloakUser & { active_sessions: number }> {
    return this.request(`/keycloak/users/${userId}`);
  }

  async updateUser(
    userId: string,
    data: { enabled?: boolean; firstName?: string; lastName?: string },
  ): Promise<KeycloakUser> {
    return this.request(`/keycloak/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async enableUser(userId: string): Promise<KeycloakUser> {
    return this.updateUser(userId, { enabled: true });
  }

  async disableUser(userId: string): Promise<KeycloakUser> {
    return this.updateUser(userId, { enabled: false });
  }

  async getUserRoles(
    userId: string,
  ): Promise<{ assigned: KeycloakRole[]; available: KeycloakRole[] }> {
    return this.request(`/keycloak/users/${userId}/roles`);
  }

  async assignRoleToUser(
    userId: string,
    roleName: string,
  ): Promise<{ roles: string[] }> {
    return this.request(`/keycloak/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ role_name: roleName }),
    });
  }

  async removeRoleFromUser(
    userId: string,
    roleName: string,
  ): Promise<{ roles: string[] }> {
    return this.request(
      `/keycloak/users/${userId}/roles?role_name=${encodeURIComponent(roleName)}`,
      {
        method: "DELETE",
      },
    );
  }

  // ============================================
  // Audit Logs
  // ============================================

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    category?: string;
    actor_email?: string;
    resource_type?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.action) query.append("action", params.action);
    if (params?.category) query.append("category", params.category);
    if (params?.actor_email) query.append("actor_email", params.actor_email);
    if (params?.resource_type)
      query.append("resource_type", params.resource_type);
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);

    return this.request(`/audit-logs?${query}`);
  }

  async exportAuditLogs(params?: {
    action?: string;
    category?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<Blob> {
    const query = new URLSearchParams();
    query.append("format", "csv");
    if (params?.action) query.append("action", params.action);
    if (params?.category) query.append("category", params.category);
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);

    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}/audit-logs?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/csv",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export audit logs");
    }

    return response.blob();
  }
}

// ============================================
// Factory
// ============================================

export function createAdminApiClient(getToken: () => Promise<string>) {
  return new AdminApiClient(getToken);
}
