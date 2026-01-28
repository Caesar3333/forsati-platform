"use client";

/**
 * Forsati Platform - Super Admin Dashboard
 * لوحة تحكم المشرف الأعلى
 */

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
  Space,
  Tag,
  Divider,
} from "antd";
import {
  DashboardOutlined,
  FlagOutlined,
  GiftOutlined,
  TrophyOutlined,
  ControlOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined,
  BarChartOutlined,
  MailOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

// Import panels
import FeatureFlagsPanel from "./FeatureFlagsPanel";
import AuditLogsViewer from "./AuditLogsViewer";
import UserManagementPanel from "./UserManagementPanel";

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

// ============================================
// Menu Items
// ============================================

type MenuItem = Required<MenuProps>["items"][number];

function getMenuItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

// ============================================
// Component
// ============================================

interface SuperAdminDashboardProps {
  user: {
    email: string;
    name?: string;
    roles: string[];
  };
  getToken: () => Promise<string>;
}

export default function SuperAdminDashboard({
  user,
  getToken,
}: SuperAdminDashboardProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState("dashboard");

  // ============================================
  // Menu Items
  // ============================================

  const menuItems: MenuItem[] = [
    getMenuItem(t("menu.dashboard"), "dashboard", <DashboardOutlined />),

    { type: "divider" },

    getMenuItem(t("menu.incentives"), "incentives", <GiftOutlined />, [
      getMenuItem(t("menu.giftCodes"), "gift-codes", <GiftOutlined />),
      getMenuItem(
        t("menu.loyaltyPoints"),
        "loyalty-points",
        <TrophyOutlined />,
      ),
      getMenuItem(t("menu.quotas"), "quotas", <ControlOutlined />),
    ]),

    getMenuItem(t("menu.platform"), "platform", <SettingOutlined />, [
      getMenuItem(t("menu.featureFlags"), "feature-flags", <FlagOutlined />),
      getMenuItem(t("menu.settings"), "settings", <SettingOutlined />),
      getMenuItem(
        t("menu.emailTemplates"),
        "email-templates",
        <MailOutlined />,
      ),
    ]),

    getMenuItem(t("menu.users"), "users-section", <TeamOutlined />, [
      getMenuItem(t("menu.userManagement"), "users", <UserOutlined />),
      getMenuItem(t("menu.roles"), "roles", <SafetyOutlined />),
      getMenuItem(t("menu.moderation"), "moderation", <SafetyOutlined />),
    ]),

    { type: "divider" },

    getMenuItem(t("menu.auditLogs"), "audit-logs", <HistoryOutlined />),
    getMenuItem(t("menu.reports"), "reports", <BarChartOutlined />),
  ];

  // ============================================
  // Content Renderer
  // ============================================

  const renderContent = () => {
    switch (activeKey) {
      case "dashboard":
        return <DashboardContent t={t} />;
      case "feature-flags":
        return <FeatureFlagsPanel />;
      case "audit-logs":
        return <AuditLogsViewer getToken={getToken} />;
      case "users":
        return <UserManagementPanel getToken={getToken} />;
      case "gift-codes":
        return <PlaceholderPanel title={t("menu.giftCodes")} />;
      case "loyalty-points":
        return <PlaceholderPanel title={t("menu.loyaltyPoints")} />;
      case "quotas":
        return <PlaceholderPanel title={t("menu.quotas")} />;
      case "settings":
        return <PlaceholderPanel title={t("menu.settings")} />;
      case "email-templates":
        return <PlaceholderPanel title={t("menu.emailTemplates")} />;
      case "roles":
        return <PlaceholderPanel title={t("menu.roles")} />;
      case "moderation":
        return <PlaceholderPanel title={t("menu.moderation")} />;
      case "reports":
        return <PlaceholderPanel title={t("menu.reports")} />;
      default:
        return <DashboardContent t={t} />;
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <Layout style={{ minHeight: "100vh" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={260}
        style={{
          position: "fixed",
          height: "100vh",
          [isRTL ? "right" : "left"]: 0,
          overflow: "auto",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b">
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {collapsed ? "F" : "Forsati Admin"}
          </Title>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          defaultOpenKeys={["incentives", "platform", "users-section"]}
          items={menuItems}
          onClick={({ key }) => setActiveKey(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{ [isRTL ? "marginRight" : "marginLeft"]: collapsed ? 80 : 260 }}
      >
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {t("title")}
          </Title>

          {/* User Info */}
          <Space>
            <Space>
              {user.roles.includes("forsati_super_admin") && (
                <Tag color="red">{t("superAdmin")}</Tag>
              )}
              <Text>{user.name || user.email}</Text>
            </Space>
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24, minHeight: "calc(100vh - 64px - 48px)" }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

// ============================================
// Dashboard Content
// ============================================

function DashboardContent({ t }: { t: (key: string) => string }) {
  // Mock stats - in production, fetch from API
  const stats = {
    totalUsers: 15420,
    activeUsers: 8750,
    totalCompanies: 342,
    activeJobs: 1250,
    giftCodesActive: 5,
    giftCodesRedeemed: 1230,
    featureFlagsEnabled: 12,
    featureFlagsTotal: 17,
  };

  return (
    <div>
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("stats.totalUsers")}
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("stats.activeUsers")}
              value={stats.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("stats.companies")}
              value={stats.totalCompanies}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("stats.activeJobs")}
              value={stats.activeJobs}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Secondary Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t("stats.giftCodesActive")}
              value={stats.giftCodesActive}
              prefix={<GiftOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t("stats.giftCodesRedeemed")}
              value={stats.giftCodesRedeemed}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t("stats.featureFlags")}
              value={`${stats.featureFlagsEnabled}/${stats.featureFlagsTotal}`}
              prefix={<FlagOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t("stats.systemHealth")}
              value="100%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Quick Actions */}
      <Card title={t("quickActions.title")}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small" hoverable>
              <Space>
                <GiftOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                <Text>{t("quickActions.createGiftCode")}</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small" hoverable>
              <Space>
                <FlagOutlined style={{ fontSize: 24, color: "#722ed1" }} />
                <Text>{t("quickActions.manageFeatures")}</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small" hoverable>
              <Space>
                <UserOutlined style={{ fontSize: 24, color: "#13c2c2" }} />
                <Text>{t("quickActions.searchUsers")}</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small" hoverable>
              <Space>
                <HistoryOutlined style={{ fontSize: 24, color: "#eb2f96" }} />
                <Text>{t("quickActions.viewAuditLogs")}</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

// ============================================
// Placeholder Panel
// ============================================

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <Card title={title}>
      <div className="text-center py-12 text-gray-500">
        <SettingOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <p>This panel is under development</p>
        <p>هذه اللوحة قيد التطوير</p>
      </div>
    </Card>
  );
}
