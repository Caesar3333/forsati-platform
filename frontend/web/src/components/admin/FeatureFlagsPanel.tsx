"use client";

/**
 * Forsati Platform - Feature Flags Admin Panel
 * لوحة إدارة أعلام الميزات
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  Switch,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Tag,
  Space,
  message,
  Tooltip,
  Card,
  Slider,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  featureFlagsService,
  getAllFlags,
  updateFlag,
} from "@/services/admin/featureFlagsService";
import type { FeatureFlag } from "@/types/admin";

// ============================================
// Types
// ============================================

interface FeatureFlagFormData {
  key: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  enabled: boolean;
  rollout_markets: string[];
  rollout_roles: string[];
  rollout_percentage: number;
}

// ============================================
// Constants
// ============================================

const MARKETS = ["SA", "AE", "EG", "KW", "QA", "BH", "OM", "JO", "LB"];
const ROLES = [
  "candidate",
  "student",
  "new_graduate",
  "freelancer",
  "company",
  "recruiter",
  "trainer",
  "coach",
  "premium_candidate",
  "premium_company",
];

// ============================================
// Component
// ============================================

export default function FeatureFlagsPanel() {
  const t = useTranslations("admin.featureFlags");
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [form] = Form.useForm();

  // ============================================
  // Data Loading
  // ============================================

  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllFlags();
      setFlags(data);
    } catch (error) {
      message.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // ============================================
  // Handlers
  // ============================================

  const handleToggle = async (flag: FeatureFlag, enabled: boolean) => {
    try {
      await updateFlag(flag.key, { enabled }, "");
      setFlags((prev) =>
        prev.map((f) => (f.key === flag.key ? { ...f, enabled } : f)),
      );
      message.success(enabled ? t("enabled") : t("disabled"));
    } catch (error) {
      message.error(t("toggleError"));
    }
  };

  const handleCreate = () => {
    setEditingFlag(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: false,
      rollout_markets: [],
      rollout_roles: [],
      rollout_percentage: 100,
    });
    setModalVisible(true);
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    form.setFieldsValue({
      key: flag.key,
      name_en: flag.label,
      name_ar: flag.labelAr,
      description_en: flag.description,
      description_ar: flag.descriptionAr,
      enabled: flag.enabled,
      rollout_markets: flag.activeForMarkets || [],
      rollout_roles: flag.activeForRoles || [],
      rollout_percentage: flag.rolloutPercentage ?? 100,
    });
    setModalVisible(true);
  };

  const handleDelete = (flag: FeatureFlag) => {
    Modal.confirm({
      title: t("deleteConfirmTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("deleteConfirmContent", { name: flag.label }),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          // In production, call API to delete
          setFlags((prev) => prev.filter((f) => f.key !== flag.key));
          message.success(t("deleteSuccess"));
        } catch (error) {
          message.error(t("deleteError"));
        }
      },
    });
  };

  const handleSubmit = async (values: FeatureFlagFormData) => {
    try {
      const flagData = {
        key: values.key,
        label: values.name_en,
        labelAr: values.name_ar,
        description: values.description_en || "",
        descriptionAr: values.description_ar || "",
        enabled: values.enabled,
        activeForMarkets:
          values.rollout_markets as FeatureFlag["activeForMarkets"],
        activeForRoles: values.rollout_roles as FeatureFlag["activeForRoles"],
        rolloutPercentage: values.rollout_percentage,
      };

      if (editingFlag) {
        await updateFlag(editingFlag.key, flagData, "");
        setFlags((prev) =>
          prev.map((f) =>
            f.key === editingFlag.key
              ? { ...f, ...flagData, updatedAt: new Date() }
              : f,
          ),
        );
        message.success(t("updateSuccess"));
      } else {
        // In production, call create API
        const newFlag: FeatureFlag = {
          ...flagData,
          category: "core",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setFlags((prev) => [...prev, newFlag]);
        message.success(t("createSuccess"));
      }
      setModalVisible(false);
    } catch (error) {
      message.error(editingFlag ? t("updateError") : t("createError"));
    }
  };

  // ============================================
  // Filtered Data
  // ============================================

  const filteredFlags = flags.filter(
    (flag) =>
      flag.key.toLowerCase().includes(searchText.toLowerCase()) ||
      flag.label.toLowerCase().includes(searchText.toLowerCase()) ||
      flag.labelAr.includes(searchText),
  );

  // ============================================
  // Table Columns
  // ============================================

  const columns: ColumnsType<FeatureFlag> = [
    {
      title: t("key"),
      dataIndex: "key",
      key: "key",
      render: (key: string) => <code>{key}</code>,
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: t("name"),
      key: "name",
      render: (_, record) => (
        <div>
          <div>{record.label}</div>
          <div className="text-gray-500 text-sm">{record.labelAr}</div>
        </div>
      ),
    },
    {
      title: t("status"),
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled: boolean, record) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggle(record, checked)}
          checkedChildren={t("on")}
          unCheckedChildren={t("off")}
        />
      ),
      filters: [
        { text: t("enabled"), value: true },
        { text: t("disabled"), value: false },
      ],
      onFilter: (value, record) => record.enabled === value,
    },
    {
      title: t("rollout"),
      key: "rollout",
      render: (_, record) => {
        const { activeForMarkets, rolloutPercentage } = record;

        return (
          <Space wrap size={[0, 4]}>
            {activeForMarkets?.map((m: string) => (
              <Tag key={m} color="blue">
                {m}
              </Tag>
            ))}
            {rolloutPercentage !== undefined && rolloutPercentage < 100 && (
              <Tag color="orange">{rolloutPercentage}%</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: t("updatedAt"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: Date) => new Date(date).toLocaleDateString("ar-SA"),
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title={t("edit")}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t("create")}
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder={t("searchPlaceholder")}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ maxWidth: 300 }}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredFlags}
        rowKey="key"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => t("totalItems", { total }),
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingFlag ? t("editTitle") : t("createTitle")}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="key"
            label={t("form.key")}
            rules={[
              { required: true, message: t("form.keyRequired") },
              { pattern: /^[a-z][a-z0-9_]*$/, message: t("form.keyPattern") },
            ]}
          >
            <Input disabled={!!editingFlag} placeholder="feature_name" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name_en"
              label={t("form.nameEn")}
              rules={[{ required: true, message: t("form.nameRequired") }]}
            >
              <Input placeholder="Feature Name" />
            </Form.Item>
            <Form.Item
              name="name_ar"
              label={t("form.nameAr")}
              rules={[{ required: true, message: t("form.nameRequired") }]}
            >
              <Input placeholder="اسم الميزة" dir="rtl" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="description_en" label={t("form.descriptionEn")}>
              <Input.TextArea rows={2} placeholder="Description..." />
            </Form.Item>
            <Form.Item name="description_ar" label={t("form.descriptionAr")}>
              <Input.TextArea rows={2} placeholder="الوصف..." dir="rtl" />
            </Form.Item>
          </div>

          <Form.Item
            name="enabled"
            valuePropName="checked"
            label={t("form.enabled")}
          >
            <Switch checkedChildren={t("on")} unCheckedChildren={t("off")} />
          </Form.Item>

          <Form.Item name="rollout_markets" label={t("form.markets")}>
            <Checkbox.Group
              options={MARKETS.map((m) => ({ label: m, value: m }))}
            />
          </Form.Item>

          <Form.Item name="rollout_roles" label={t("form.roles")}>
            <Select
              mode="multiple"
              placeholder={t("form.selectRoles")}
              options={ROLES.map((r) => ({ label: r, value: r }))}
            />
          </Form.Item>

          <Form.Item name="rollout_percentage" label={t("form.percentage")}>
            <Slider
              min={0}
              max={100}
              marks={{ 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" }}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-left">
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                {t("cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingFlag ? t("update") : t("create")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
