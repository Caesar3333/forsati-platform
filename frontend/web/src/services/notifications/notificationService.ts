/**
 * Forsati Platform - Notification Service
 * خدمة الإشعارات لمنصة فرصتي
 *
 * Features:
 * - Email notifications (SMTP/Mailhog)
 * - Web Push notifications (VAPID)
 * - In-app notifications (Real-time)
 * - SMS notifications (optional)
 */

import { z } from "zod";

// ============================================
// Types & Schemas | الأنواع والمخططات
// ============================================

export const NotificationTypeSchema = z.enum([
  "application_received", // تم استلام الطلب
  "application_viewed", // تم عرض الطلب
  "application_status_change", // تغيير حالة الطلب
  "interview_scheduled", // تمت جدولة المقابلة
  "interview_reminder", // تذكير بالمقابلة
  "message_received", // رسالة جديدة
  "profile_viewed", // تم عرض الملف الشخصي
  "job_recommendation", // توصية وظيفية
  "scholarship_deadline", // موعد نهائي للمنحة
  "course_reminder", // تذكير بالدورة
  "system_announcement", // إعلان النظام
  "verification_complete", // اكتمال التحقق
  "badge_earned", // شارة مكتسبة
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationChannelSchema = z.enum([
  "email",
  "push",
  "in_app",
  "sms",
  "whatsapp",
]);

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationPrioritySchema = z.enum([
  "low",
  "normal",
  "high",
  "urgent",
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  userId: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  imageUrl?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;
  };
  channels: {
    [key in NotificationType]?: NotificationChannel[];
  };
}

export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  createdAt: Date;
}

// ============================================
// Notification Templates | قوالب الإشعارات
// ============================================

export const notificationTemplates: Record<
  NotificationType,
  {
    title: { en: string; ar: string };
    body: { en: string; ar: string };
    defaultChannels: NotificationChannel[];
    priority: NotificationPriority;
  }
> = {
  application_received: {
    title: {
      en: "Application Received",
      ar: "تم استلام طلبك",
    },
    body: {
      en: "Your application for {{jobTitle}} at {{company}} has been received.",
      ar: "تم استلام طلبك لوظيفة {{jobTitle}} في {{company}}.",
    },
    defaultChannels: ["email", "push", "in_app"],
    priority: "normal",
  },
  application_viewed: {
    title: {
      en: "Your Application Was Viewed",
      ar: "تم عرض طلبك",
    },
    body: {
      en: "{{company}} viewed your application for {{jobTitle}}.",
      ar: "قامت {{company}} بعرض طلبك لوظيفة {{jobTitle}}.",
    },
    defaultChannels: ["push", "in_app"],
    priority: "normal",
  },
  application_status_change: {
    title: {
      en: "Application Status Update",
      ar: "تحديث حالة الطلب",
    },
    body: {
      en: "Your application for {{jobTitle}} has been {{status}}.",
      ar: "تم {{status}} طلبك لوظيفة {{jobTitle}}.",
    },
    defaultChannels: ["email", "push", "in_app"],
    priority: "high",
  },
  interview_scheduled: {
    title: {
      en: "Interview Scheduled",
      ar: "تمت جدولة المقابلة",
    },
    body: {
      en: "Your interview with {{company}} is scheduled for {{date}} at {{time}}.",
      ar: "تمت جدولة مقابلتك مع {{company}} في {{date}} الساعة {{time}}.",
    },
    defaultChannels: ["email", "push", "in_app", "sms"],
    priority: "high",
  },
  interview_reminder: {
    title: {
      en: "Interview Reminder",
      ar: "تذكير بالمقابلة",
    },
    body: {
      en: "Reminder: Your interview with {{company}} is {{timeUntil}}.",
      ar: "تذكير: مقابلتك مع {{company}} بعد {{timeUntil}}.",
    },
    defaultChannels: ["push", "sms"],
    priority: "urgent",
  },
  message_received: {
    title: {
      en: "New Message",
      ar: "رسالة جديدة",
    },
    body: {
      en: "You have a new message from {{senderName}}.",
      ar: "لديك رسالة جديدة من {{senderName}}.",
    },
    defaultChannels: ["push", "in_app"],
    priority: "normal",
  },
  profile_viewed: {
    title: {
      en: "Profile Viewed",
      ar: "تم عرض ملفك الشخصي",
    },
    body: {
      en: "{{viewerName}} from {{company}} viewed your profile.",
      ar: "قام {{viewerName}} من {{company}} بعرض ملفك الشخصي.",
    },
    defaultChannels: ["in_app"],
    priority: "low",
  },
  job_recommendation: {
    title: {
      en: "Job Recommendation",
      ar: "توصية وظيفية",
    },
    body: {
      en: "We found a job that matches your profile: {{jobTitle}} at {{company}}.",
      ar: "وجدنا وظيفة تناسب ملفك الشخصي: {{jobTitle}} في {{company}}.",
    },
    defaultChannels: ["email", "push"],
    priority: "normal",
  },
  scholarship_deadline: {
    title: {
      en: "Scholarship Deadline",
      ar: "موعد نهائي للمنحة",
    },
    body: {
      en: "The deadline for {{scholarshipName}} is {{daysLeft}} days away.",
      ar: "الموعد النهائي لـ {{scholarshipName}} بعد {{daysLeft}} أيام.",
    },
    defaultChannels: ["email", "push"],
    priority: "high",
  },
  course_reminder: {
    title: {
      en: "Course Reminder",
      ar: "تذكير بالدورة",
    },
    body: {
      en: "Your course {{courseName}} starts in {{timeUntil}}.",
      ar: "دورتك {{courseName}} تبدأ بعد {{timeUntil}}.",
    },
    defaultChannels: ["push", "in_app"],
    priority: "normal",
  },
  system_announcement: {
    title: {
      en: "Announcement",
      ar: "إعلان",
    },
    body: {
      en: "{{message}}",
      ar: "{{message}}",
    },
    defaultChannels: ["in_app"],
    priority: "normal",
  },
  verification_complete: {
    title: {
      en: "Verification Complete",
      ar: "اكتمل التحقق",
    },
    body: {
      en: "Your {{verificationType}} has been verified successfully.",
      ar: "تم التحقق من {{verificationType}} بنجاح.",
    },
    defaultChannels: ["email", "push", "in_app"],
    priority: "normal",
  },
  badge_earned: {
    title: {
      en: "New Badge Earned!",
      ar: "شارة جديدة!",
    },
    body: {
      en: "Congratulations! You earned the {{badgeName}} badge.",
      ar: "تهانينا! حصلت على شارة {{badgeName}}.",
    },
    defaultChannels: ["push", "in_app"],
    priority: "low",
  },
};

// ============================================
// Notification Service Class
// ============================================

class NotificationService {
  private apiUrl: string;
  private vapidPublicKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  }

  /**
   * Send notification to user
   * إرسال إشعار للمستخدم
   */
  async send(
    payload: NotificationPayload,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error("Failed to send notification:", error);
      return { success: false };
    }
  }

  /**
   * Send bulk notifications
   * إرسال إشعارات جماعية
   */
  async sendBulk(
    payloads: NotificationPayload[],
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    const results = await Promise.allSettled(payloads.map((p) => this.send(p)));

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.length - sent;

    return { success: failed === 0, sent, failed };
  }

  /**
   * Schedule notification for later
   * جدولة إشعار لوقت لاحق
   */
  async schedule(
    payload: NotificationPayload,
    scheduledAt: Date,
  ): Promise<{ success: boolean; jobId?: string }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/notifications/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            scheduledAt: scheduledAt.toISOString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to schedule notification: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return { success: true, jobId: data.jobId };
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      return { success: false };
    }
  }

  /**
   * Cancel scheduled notification
   * إلغاء إشعار مجدول
   */
  async cancelScheduled(jobId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/notifications/schedule/${jobId}`,
        {
          method: "DELETE",
        },
      );

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to cancel scheduled notification:", error);
      return { success: false };
    }
  }

  /**
   * Get user's notification preferences
   * الحصول على تفضيلات إشعارات المستخدم
   */
  async getPreferences(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/users/${userId}/notification-preferences`,
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get notification preferences:", error);
      return null;
    }
  }

  /**
   * Update user's notification preferences
   * تحديث تفضيلات إشعارات المستخدم
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/users/${userId}/notification-preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        },
      );

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      return { success: false };
    }
  }

  /**
   * Get unread notifications count
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/users/${userId}/notifications/unread-count`,
      );

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   * تحديد الإشعار كمقروء
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/notifications/${notificationId}/read`,
        {
          method: "POST",
        },
      );

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to mark as read:", error);
      return { success: false };
    }
  }

  /**
   * Mark all notifications as read
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/users/${userId}/notifications/mark-all-read`,
        {
          method: "POST",
        },
      );

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      return { success: false };
    }
  }
}

// ============================================
// Web Push Service
// ============================================

class WebPushService {
  private vapidPublicKey: string;
  private supported: boolean;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
    this.supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
  }

  /**
   * Check if push notifications are supported
   * التحقق من دعم إشعارات Push
   */
  isSupported(): boolean {
    return this.supported;
  }

  /**
   * Request push notification permission
   * طلب إذن إشعارات Push
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) {
      return "denied";
    }

    return await Notification.requestPermission();
  }

  /**
   * Get current permission status
   * الحصول على حالة الإذن الحالية
   */
  getPermissionStatus(): NotificationPermission | "unsupported" {
    if (!this.supported) {
      return "unsupported";
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   * الاشتراك في إشعارات Push
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.supported || Notification.permission !== "granted") {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const serverKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: serverKey.buffer as ArrayBuffer,
      });

      // Convert to our PushSubscription type
      const subscriptionJson = subscription.toJSON();

      return {
        userId: "", // Will be set by backend
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJson.keys?.p256dh || "",
          auth: subscriptionJson.keys?.auth || "",
        },
        userAgent: navigator.userAgent,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   * إلغاء الاشتراك من إشعارات Push
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.supported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        return await subscription.unsubscribe();
      }

      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push:", error);
      return false;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// ============================================
// Email Service
// ============================================

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

class EmailService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
  }

  /**
   * Send email
   * إرسال بريد إلكتروني
   */
  async send(
    payload: EmailPayload,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false };
    }
  }

  /**
   * Send templated email
   * إرسال بريد إلكتروني بقالب
   */
  async sendTemplate(
    templateId: string,
    to: string | string[],
    variables: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/email/send-template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          to,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send templated email: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error("Failed to send templated email:", error);
      return { success: false };
    }
  }
}

// ============================================
// Exports
// ============================================

export const notificationService = new NotificationService();
export const webPushService = new WebPushService();
export const emailService = new EmailService();

export { NotificationService, WebPushService, EmailService };

// Helper function to create notification from template
export function createNotificationFromTemplate(
  type: NotificationType,
  userId: string,
  variables: Record<string, string>,
  locale: "en" | "ar" = "en",
  overrides: Partial<NotificationPayload> = {},
): NotificationPayload {
  const template = notificationTemplates[type];

  const interpolate = (text: string, vars: Record<string, string>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
  };

  return {
    id: crypto.randomUUID(),
    type,
    userId,
    title: interpolate(template.title[locale], variables),
    titleAr: interpolate(template.title.ar, variables),
    body: interpolate(template.body[locale], variables),
    bodyAr: interpolate(template.body.ar, variables),
    channels: template.defaultChannels,
    priority: template.priority,
    ...overrides,
  };
}
