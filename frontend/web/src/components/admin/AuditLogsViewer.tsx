"use client";

/**
 * Forsati Platform - Audit Logs Viewer
 * عارض سجلات المراجعة
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Table,
  Card,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  message,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ACTION_LABELS, ACTION_CATEGORIES } from "@/lib/audit/logger";

// ============================================
// Types
// ============================================

interface AuditLog {
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

// ============================================
// Constants
// ============================================

const CATEGORY_OPTIONS = Object.keys(ACTION_CATEGORIES).map((cat) => ({
  label: cat.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
  value: cat,
}));

const RESOURCE_TYPES = [
  "feature_flag",
  "gift_code",
  "loyalty_account",
  "quota_policy",
  "user",
  "role",
  "settings",
  "email_template",
  "promotion",
];

// ============================================
// Component
// ============================================

interface AuditLogsViewerProps {
  getToken: () => Promise<string>;
}

export default function AuditLogsViewer({ getToken }: AuditLogsViewerProps) {
  const t = useTranslations("admin.auditLogs");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [category, setCategory] = useState<string | undefined>();
  const [actorEmail, setActorEmail] = useState("");
  const [resourceType, setResourceType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null,
  );

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // ============================================
  // Data Loading
  // ============================================

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(pageSize));
      if (category) params.append("category", category);
      if (actorEmail) params.append("actor_email", actorEmail);
      if (resourceType) params.append("resource_type", resourceType);
      if (dateRange) {
        params.append("from_date", dateRange[0].toISOString());
        params.append("to_date", dateRange[1].toISOString());
      }

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load logs");

      const data = await response.json();
      setLogs(data.items);
      setTotal(data.total);
    } catch (error) {
      message.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [
    getToken,
    page,
    pageSize,
    category,
    actorEmail,
    resourceType,
    dateRange,
    t,
  ]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ============================================
  // Handlers
  // ============================================

  const handleExport = async () => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      params.append("format", "csv");
      if (category) params.append("category", category);
      if (actorEmail) params.append("actor_email", actorEmail);
      if (resourceType) params.append("resource_type", resourceType);
      if (dateRange) {
        params.append("from_date", dateRange[0].toISOString());
        params.append("to_date", dateRange[1].toISOString());
      }

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/csv",
        },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${dayjs().format("YYYY-MM-DD")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success(t("exportSuccess"));
    } catch (error) {
      message.error(t("exportError"));
    }
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  const handleClearFilters = () => {
    setCategory(undefined);
    setActorEmail("");
    setResourceType(undefined);
    setDateRange(null);
    setPage(1);
  };

  // ============================================
  // Table Columns
  // ============================================

  const columns: ColumnsType<AuditLog> = [
    {
      title: t("timestamp"),
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
      sorter: true,
    },
    {
      title: t("action"),
      key: "action",
      width: 200,
      render: (_, record) => {
        const label =
          record.action_label ||
          ACTION_LABELS[record.action as keyof typeof ACTION_LABELS];
        const displayLabel = label
          ? isArabic
            ? label.ar
            : label.en
          : record.action;

        const categoryColor = getCategoryColor(record.action.split(".")[0]);
        return <Tag color={categoryColor}>{displayLabel}</Tag>;
      },
    },
    {
      title: t("actor"),
      dataIndex: "actor_email",
      key: "actor_email",
      width: 200,
      render: (email: string, record) => (
        <Tooltip title={record.actor_roles.join(", ")}>
          <span>{email}</span>
        </Tooltip>
      ),
    },
    {
      title: t("resource"),
      key: "resource",
      width: 150,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.resource_type}</div>
          {record.resource_id && (
            <div className="text-xs text-gray-500">{record.resource_id}</div>
          )}
        </div>
      ),
    },
    {
      title: t("ipAddress"),
      dataIndex: "ip_address",
      key: "ip_address",
      width: 130,
      render: (ip: string) => ip || "-",
    },
    {
      title: t("actions"),
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Tooltip title={t("viewDetails")}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // ============================================
  // Render
  // ============================================

  return (
    <Card
      title={t("title")}
      extra={
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          {t("export")}
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          placeholder={t("filterCategory")}
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          allowClear
          style={{ width: 180 }}
        />
        <Input
          placeholder={t("filterActor")}
          prefix={<SearchOutlined />}
          value={actorEmail}
          onChange={(e) => setActorEmail(e.target.value)}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder={t("filterResource")}
          value={resourceType}
          onChange={setResourceType}
          options={RESOURCE_TYPES.map((r) => ({ label: r, value: r }))}
          allowClear
          style={{ width: 150 }}
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) =>
            setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
          }
          style={{ width: 280 }}
        />
        <Button icon={<FilterOutlined />} onClick={handleClearFilters}>
          {t("clearFilters")}
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => t("totalItems", { total }),
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1000 }}
      />

      {/* Detail Modal */}
      <Modal
        title={t("detailTitle")}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedLog && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={t("id")}>
              {selectedLog.id}
            </Descriptions.Item>
            <Descriptions.Item label={t("timestamp")}>
              {dayjs(selectedLog.created_at).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label={t("action")} span={2}>
              {selectedLog.action_label
                ? isArabic
                  ? selectedLog.action_label.ar
                  : selectedLog.action_label.en
                : selectedLog.action}
            </Descriptions.Item>
            <Descriptions.Item label={t("actor")}>
              {selectedLog.actor_email}
            </Descriptions.Item>
            <Descriptions.Item label={t("roles")}>
              <Space wrap>
                {selectedLog.actor_roles.map((role) => (
                  <Tag key={role}>{role}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("resourceType")}>
              {selectedLog.resource_type}
            </Descriptions.Item>
            <Descriptions.Item label={t("resourceId")}>
              {selectedLog.resource_id || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("ipAddress")}>
              {selectedLog.ip_address || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("userAgent")} span={2}>
              <span className="text-xs">{selectedLog.user_agent || "-"}</span>
            </Descriptions.Item>
            {selectedLog.changes_before && (
              <Descriptions.Item label={t("changesBefore")} span={2}>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedLog.changes_before, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {selectedLog.changes_after && (
              <Descriptions.Item label={t("changesAfter")} span={2}>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedLog.changes_after, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {selectedLog.metadata && (
              <Descriptions.Item label={t("metadata")} span={2}>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
}

// ============================================
// Helpers
// ============================================

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    feature_flag: "blue",
    gift_code: "green",
    points: "gold",
    quota: "purple",
    keycloak: "cyan",
    user: "orange",
    moderation: "red",
    settings: "geekblue",
    email_template: "magenta",
    promotion: "lime",
    report: "volcano",
    system: "default",
  };
  return colors[category] || "default";
}
