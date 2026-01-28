"use client";

/**
 * Forsati Platform - User Management Panel
 * لوحة إدارة المستخدمين
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  message,
  Tooltip,
  Avatar,
  Switch,
  Select,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  createAdminApiClient,
  type KeycloakUser,
  type KeycloakRole,
} from "@/services/admin/apiClient";

// ============================================
// Constants
// ============================================

const ROLE_COLORS: Record<string, string> = {
  forsati_super_admin: "red",
  forsati_admin: "volcano",
  forsati_moderator: "orange",
  forsati_support: "gold",
  forsati_billing: "lime",
  candidate: "blue",
  student: "cyan",
  new_graduate: "geekblue",
  freelancer: "purple",
  company: "green",
  recruiter: "magenta",
  premium_candidate: "gold",
  premium_company: "gold",
};

// ============================================
// Component
// ============================================

interface UserManagementPanelProps {
  getToken: () => Promise<string>;
}

export default function UserManagementPanel({
  getToken,
}: UserManagementPanelProps) {
  const t = useTranslations("admin.users");
  const locale = useLocale();

  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [roles, setRoles] = useState<KeycloakRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selected user for role management
  const [selectedUser, setSelectedUser] = useState<KeycloakUser | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<KeycloakRole[]>([]);
  const [roleToAdd, setRoleToAdd] = useState<string | undefined>();

  const api = createAdminApiClient(getToken);

  // ============================================
  // Data Loading
  // ============================================

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.searchUsers({
        search: searchText || undefined,
        page,
        limit: pageSize,
      });
      setUsers(data.items);
    } catch (error) {
      message.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [api, searchText, page, pageSize, t]);

  const loadRoles = useCallback(async () => {
    try {
      const data = await api.getKeycloakRoles();
      setRoles(data.items);
    } catch (error) {
      console.error("Failed to load roles", error);
    }
  }, [api]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);

  // ============================================
  // Handlers
  // ============================================

  const handleToggleEnabled = async (user: KeycloakUser, enabled: boolean) => {
    try {
      if (enabled) {
        await api.enableUser(user.id);
      } else {
        await api.disableUser(user.id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, enabled } : u)),
      );
      message.success(enabled ? t("enableSuccess") : t("disableSuccess"));
    } catch (error) {
      message.error(t("toggleError"));
    }
  };

  const handleManageRoles = async (user: KeycloakUser) => {
    setSelectedUser(user);
    setRoleToAdd(undefined);
    try {
      const data = await api.getUserRoles(user.id);
      setAvailableRoles(data.available);
      setRoleModalVisible(true);
    } catch (error) {
      message.error(t("loadRolesError"));
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser || !roleToAdd) return;

    try {
      const result = await api.assignRoleToUser(selectedUser.id, roleToAdd);
      setSelectedUser((prev) =>
        prev ? { ...prev, roles: result.roles } : null,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, roles: result.roles } : u,
        ),
      );

      // Update available roles
      setAvailableRoles((prev) => prev.filter((r) => r.name !== roleToAdd));
      setRoleToAdd(undefined);

      message.success(t("addRoleSuccess"));
    } catch (error) {
      message.error(t("addRoleError"));
    }
  };

  const handleRemoveRole = async (roleName: string) => {
    if (!selectedUser) return;

    try {
      const result = await api.removeRoleFromUser(selectedUser.id, roleName);
      setSelectedUser((prev) =>
        prev ? { ...prev, roles: result.roles } : null,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, roles: result.roles } : u,
        ),
      );

      // Add back to available roles
      const removedRole = roles.find((r) => r.name === roleName);
      if (removedRole) {
        setAvailableRoles((prev) => [...prev, removedRole]);
      }

      message.success(t("removeRoleSuccess"));
    } catch (error) {
      message.error(t("removeRoleError"));
    }
  };

  // ============================================
  // Table Columns
  // ============================================

  const columns: ColumnsType<KeycloakUser> = [
    {
      title: t("user"),
      key: "user",
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t("username"),
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: t("status"),
      key: "status",
      width: 120,
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.enabled}
            onChange={(checked) => handleToggleEnabled(record, checked)}
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
          />
          <Tag color={record.enabled ? "green" : "red"}>
            {record.enabled ? t("active") : t("disabled")}
          </Tag>
        </Space>
      ),
    },
    {
      title: t("roles"),
      key: "roles",
      width: 300,
      render: (_, record) => (
        <Space wrap size={[0, 4]}>
          {record.roles?.slice(0, 3).map((role) => (
            <Tag key={role} color={ROLE_COLORS[role] || "default"}>
              {role}
            </Tag>
          ))}
          {record.roles && record.roles.length > 3 && (
            <Tag>+{record.roles.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t("emailVerified"),
      key: "emailVerified",
      width: 100,
      render: (_, record) => (
        <Tag color={record.emailVerified ? "green" : "orange"}>
          {record.emailVerified ? t("verified") : t("unverified")}
        </Tag>
      ),
    },
    {
      title: t("createdAt"),
      key: "createdAt",
      width: 150,
      render: (_, record) =>
        dayjs(record.createdTimestamp).format("YYYY-MM-DD"),
    },
    {
      title: t("actions"),
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Tooltip title={t("manageRoles")}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleManageRoles(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // ============================================
  // Render
  // ============================================

  return (
    <Card title={t("title")}>
      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder={t("searchPlaceholder")}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={loadUsers}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button className="mr-2" onClick={loadUsers}>
          {t("search")}
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => t("totalItems", { total }),
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1100 }}
      />

      {/* Role Management Modal */}
      <Modal
        title={t("manageRolesTitle")}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div>
            {/* User Info */}
            <Descriptions size="small" className="mb-4" column={2}>
              <Descriptions.Item label={t("name")}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Descriptions.Item>
              <Descriptions.Item label={t("email")}>
                {selectedUser.email}
              </Descriptions.Item>
            </Descriptions>

            {/* Current Roles */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">{t("currentRoles")}</h4>
              <Space wrap>
                {selectedUser.roles?.map((role) => (
                  <Tag
                    key={role}
                    color={ROLE_COLORS[role] || "default"}
                    closable={!role.startsWith("default-")}
                    onClose={(e) => {
                      e.preventDefault();
                      Modal.confirm({
                        title: t("removeRoleConfirm"),
                        content: t("removeRoleConfirmContent", { role }),
                        onOk: () => handleRemoveRole(role),
                      });
                    }}
                  >
                    {role}
                  </Tag>
                ))}
                {(!selectedUser.roles || selectedUser.roles.length === 0) && (
                  <span className="text-gray-500">{t("noRoles")}</span>
                )}
              </Space>
            </div>

            {/* Add Role */}
            <div>
              <h4 className="font-medium mb-2">{t("addRole")}</h4>
              <Space>
                <Select
                  placeholder={t("selectRole")}
                  value={roleToAdd}
                  onChange={setRoleToAdd}
                  style={{ width: 250 }}
                  options={availableRoles.map((r) => ({
                    label: (
                      <Space>
                        <Tag color={ROLE_COLORS[r.name] || "default"}>
                          {r.name}
                        </Tag>
                        {r.is_system_role && <Tag>System</Tag>}
                      </Space>
                    ),
                    value: r.name,
                  }))}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRole}
                  disabled={!roleToAdd}
                >
                  {t("add")}
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
