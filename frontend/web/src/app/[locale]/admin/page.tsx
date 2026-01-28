/**
 * Forsati Platform - Super Admin Dashboard
 * لوحة تحكم المشرف العام
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Settings,
  Gift,
  Star,
  ToggleLeft,
  BarChart3,
  Users,
  Shield,
  Bell,
  Download,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGiftCodes: number;
  redeemedCodes: number;
  totalPoints: number;
  activeFeatures: number;
}

// ============================================
// Main Component
// ============================================

export default function SuperAdminDashboard() {
  const _t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalGiftCodes: 0,
    redeemedCodes: 0,
    totalPoints: 0,
    activeFeatures: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Platform Control Center
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                مركز التحكم بالمنصة
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                System Online
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 gap-4 mb-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="giftcodes"
              className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <Gift className="h-4 w-4" />
              <span>Gift Codes</span>
            </TabsTrigger>
            <TabsTrigger
              value="loyalty"
              className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <Star className="h-4 w-4" />
              <span>Loyalty</span>
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <ToggleLeft className="h-4 w-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger
              value="quotas"
              className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <Shield className="h-4 w-4" />
              <span>Quotas</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg border"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab stats={stats} />
          </TabsContent>

          {/* Gift Codes Tab */}
          <TabsContent value="giftcodes">
            <GiftCodesTab />
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty">
            <LoyaltyTab />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <FeaturesTab />
          </TabsContent>

          {/* Quotas Tab */}
          <TabsContent value="quotas">
            <QuotasTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============================================
// Overview Tab
// ============================================

function OverviewTab({ stats }: { stats: DashboardStats }) {
  const kpiCards = [
    {
      label: "Total Users",
      labelAr: "إجمالي المستخدمين",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "blue",
    },
    {
      label: "Active Gift Codes",
      labelAr: "أكواد الهدايا النشطة",
      value: stats.totalGiftCodes.toLocaleString(),
      icon: Gift,
      color: "purple",
    },
    {
      label: "Points Distributed",
      labelAr: "النقاط الموزعة",
      value: stats.totalPoints.toLocaleString(),
      icon: Star,
      color: "yellow",
    },
    {
      label: "Active Features",
      labelAr: "الميزات النشطة",
      value: stats.activeFeatures.toString(),
      icon: ToggleLeft,
      color: "green",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-xs text-gray-400">{kpi.labelAr}</p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div
                  className={`p-3 rounded-full bg-${kpi.color}-100 text-${kpi.color}-600`}
                >
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity / النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No recent activity to display
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Gift Codes Tab
// ============================================

interface GiftCode {
  id: string;
  code: string;
  type: string;
  status: string;
}

function GiftCodesTab() {
  const [_codes, _setCodes] = useState<GiftCode[]>([]);

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button>
                <Gift className="h-4 w-4 mr-2" />
                Create Code / إنشاء كود
              </Button>
              <Button variant="outline">Bulk Import / استيراد مجمّع</Button>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search codes..." className="w-64" />
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gift Codes / أكواد الهدايا</CardTitle>
          <CardDescription>
            Manage promotional codes and track redemptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Uses
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No gift codes found. Create your first code to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Loyalty Tab
// ============================================

function LoyaltyTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Points Earning Rules / قواعد كسب النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Sign Up", actionAr: "التسجيل", points: 100 },
                {
                  action: "Complete Profile",
                  actionAr: "إكمال الملف",
                  points: 200,
                },
                { action: "Upload CV", actionAr: "رفع السيرة", points: 50 },
                {
                  action: "Refer a Friend",
                  actionAr: "دعوة صديق",
                  points: 500,
                },
                {
                  action: "Apply to Job",
                  actionAr: "التقديم لوظيفة",
                  points: 10,
                },
              ].map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{rule.action}</p>
                    <p className="text-sm text-gray-500">{rule.actionAr}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{rule.points} pts</Badge>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Tiers / مستويات الولاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  tier: "Bronze",
                  tierAr: "برونزي",
                  threshold: 0,
                  color: "amber-600",
                },
                {
                  tier: "Silver",
                  tierAr: "فضي",
                  threshold: 500,
                  color: "gray-400",
                },
                {
                  tier: "Gold",
                  tierAr: "ذهبي",
                  threshold: 2000,
                  color: "yellow-500",
                },
                {
                  tier: "Platinum",
                  tierAr: "بلاتيني",
                  threshold: 5000,
                  color: "purple-500",
                },
              ].map((tier, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full bg-${tier.color}`}
                    ></div>
                    <div>
                      <p className="font-medium">{tier.tier}</p>
                      <p className="text-sm text-gray-500">{tier.tierAr}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {tier.threshold.toLocaleString()} pts
                    </p>
                    <p className="text-xs text-gray-500">minimum threshold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Redemption Rewards / مكافآت الاستبدال</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Free CV Scan", nameAr: "فحص سيرة مجاني", cost: 100 },
              {
                name: "Priority Application",
                nameAr: "تقديم أولوية",
                cost: 200,
              },
              {
                name: "Featured Profile (7 days)",
                nameAr: "ملف مميز (7 أيام)",
                cost: 500,
              },
              {
                name: "10% Discount Coupon",
                nameAr: "كوبون خصم 10%",
                cost: 300,
              },
              {
                name: "Premium Trial (1 week)",
                nameAr: "تجربة مميزة (أسبوع)",
                cost: 1000,
              },
              {
                name: "Career Consultation",
                nameAr: "استشارة مهنية",
                cost: 2000,
              },
            ].map((reward, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <p className="font-medium">{reward.name}</p>
                <p className="text-sm text-gray-500">{reward.nameAr}</p>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline">{reward.cost} pts</Badge>
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Features Tab
// ============================================

function FeaturesTab() {
  const features = [
    {
      key: "cv_scan",
      name: "CV Scanner",
      nameAr: "فاحص السيرة الذاتية",
      enabled: true,
      rollout: 100,
    },
    {
      key: "ai_matching",
      name: "AI Job Matching",
      nameAr: "المطابقة الذكية",
      enabled: true,
      rollout: 100,
    },
    {
      key: "quick_apply",
      name: "Quick Apply",
      nameAr: "التقديم السريع",
      enabled: true,
      rollout: 100,
    },
    {
      key: "video_interviews",
      name: "Video Interviews",
      nameAr: "المقابلات المرئية",
      enabled: false,
      rollout: 0,
    },
    {
      key: "social_posts",
      name: "Social Posts",
      nameAr: "المنشورات الاجتماعية",
      enabled: true,
      rollout: 50,
    },
    {
      key: "loyalty_program",
      name: "Loyalty Program",
      nameAr: "برنامج الولاء",
      enabled: true,
      rollout: 100,
    },
    {
      key: "gift_codes",
      name: "Gift Codes",
      nameAr: "أكواد الهدايا",
      enabled: true,
      rollout: 100,
    },
    {
      key: "cover_letter_gen",
      name: "Cover Letter Generator",
      nameAr: "مولد رسائل التقديم",
      enabled: true,
      rollout: 75,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags / أعلام الميزات</CardTitle>
          <CardDescription>
            Enable or disable features globally or for specific user segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${feature.enabled ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <div>
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm text-gray-500">{feature.nameAr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {feature.rollout}% Rollout
                    </p>
                    <p className="text-xs text-gray-500">نسبة الإطلاق</p>
                  </div>
                  <Badge variant={feature.enabled ? "default" : "secondary"}>
                    {feature.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Quotas Tab
// ============================================

function QuotasTab() {
  const quotas = [
    {
      resource: "cv_scan",
      nameAr: "فحص السيرة",
      candidate: 3,
      company: 0,
      premium: -1,
    },
    {
      resource: "job_post",
      nameAr: "نشر الوظائف",
      candidate: 0,
      company: 5,
      premium: -1,
    },
    {
      resource: "cover_letter",
      nameAr: "رسائل التقديم",
      candidate: 2,
      company: 0,
      premium: -1,
    },
    {
      resource: "ai_match",
      nameAr: "المطابقة الذكية",
      candidate: 10,
      company: 50,
      premium: -1,
    },
    {
      resource: "message",
      nameAr: "الرسائل",
      candidate: 20,
      company: 100,
      premium: -1,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Quotas / حصص الموارد</CardTitle>
          <CardDescription>
            Configure free tier limits per user role (-1 = unlimited)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Resource / المورد
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Candidate / المرشح
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Company / الشركة
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Premium / المميز
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quotas.map((quota) => (
                  <tr key={quota.resource}>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {quota.resource.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-500">{quota.nameAr}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">
                        {quota.candidate === -1 ? "∞" : quota.candidate}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">
                        {quota.company === -1 ? "∞" : quota.company}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">
                        {quota.premium === -1 ? "∞" : quota.premium}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Settings Tab
// ============================================

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings / الإعدادات العامة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Platform Name / اسم المنصة
              </label>
              <Input defaultValue="Forsati" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">
                Support Email / بريد الدعم
              </label>
              <Input defaultValue="support@forsati.com" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">
                Default Language / اللغة الافتراضية
              </label>
              <select className="w-full mt-1 border rounded-md p-2">
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
              </select>
            </div>
            <Button>Save Settings / حفظ الإعدادات</Button>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode / وضع الصيانة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div>
                <p className="font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-gray-500">تفعيل وضع الصيانة</p>
              </div>
              <Button variant="outline">Activate</Button>
            </div>
            <div>
              <label className="text-sm font-medium">Maintenance Message</label>
              <textarea
                className="w-full mt-1 border rounded-md p-2 h-24"
                placeholder="Enter maintenance message..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Logs / سجلات المراجعة</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No audit logs available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
