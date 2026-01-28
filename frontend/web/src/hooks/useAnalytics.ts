// © 2026 Forsati. All rights reserved.
// Analytics tracking hook

"use client";

import { useCallback } from "react";

// Event types for type safety
export type AnalyticsEvent =
  | "page_view"
  | "resume.upload_start"
  | "resume.upload_complete"
  | "resume.upload_error"
  | "resume.parse_start"
  | "resume.parse_complete"
  | "resume.parse_error"
  | "resume.analyze_start"
  | "resume.analyze_complete"
  | "resume.save_to_profile"
  | "job.view"
  | "job.search"
  | "job.filter"
  | "job.save"
  | "job.unsave"
  | "job.share"
  | "job.copy_link"
  | "apply.start"
  | "apply.quick_apply"
  | "apply.submit"
  | "apply.cancel"
  | "apply.withdraw"
  | "auth.login_start"
  | "auth.login_success"
  | "auth.login_error"
  | "auth.logout"
  | "auth.register_start"
  | "auth.register_success"
  | "profile.view"
  | "profile.edit"
  | "profile.complete"
  | "search.query"
  | "search.filter_change"
  | "search.result_click"
  | "error.api"
  | "error.client";

export interface EventProperties {
  // Resume events
  fileType?: string;
  fileSize?: number;
  mode?: "resume" | "audio" | "photo";
  jobId?: string;
  resumeId?: string;
  analysisScore?: number;

  // Job events
  jobTitle?: string;
  company?: string;
  location?: string;
  jobType?: string;
  source?: string;

  // Search events
  query?: string;
  filters?: Record<string, unknown>;
  resultsCount?: number;
  position?: number;

  // Auth events
  provider?: string;
  method?: string;

  // Error events
  errorCode?: string;
  errorMessage?: string;
  endpoint?: string;

  // Generic
  page?: string;
  locale?: string;
  [key: string]: unknown;
}

interface AnalyticsProvider {
  track: (event: string, properties?: Record<string, unknown>) => void;
  page: (name?: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
}

// Global analytics instance (will be set by provider)
let analytics: AnalyticsProvider | null = null;

/**
 * Initialize analytics with provider (call once in app initialization)
 */
export function initAnalytics(provider: AnalyticsProvider) {
  analytics = provider;
}

/**
 * Create a no-op analytics instance for development/testing
 */
export function createNoopAnalytics(): AnalyticsProvider {
  return {
    track: (event, props) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics]", event, props);
      }
    },
    page: (name, props) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Page:", name, props);
      }
    },
    identify: (userId, traits) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Identify:", userId, traits);
      }
    },
  };
}

/**
 * Analytics hook for tracking events
 */
export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent, properties?: EventProperties) => {
    if (!analytics) {
      // Fallback to console in development
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Track:", event, properties);
      }
      return;
    }

    // Add common properties
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      locale: typeof document !== "undefined" ? document.documentElement.lang : "ar",
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    analytics.track(event, enrichedProperties);
  }, []);

  const page = useCallback((name?: string, properties?: EventProperties) => {
    if (!analytics) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Page:", name, properties);
      }
      return;
    }

    analytics.page(name, {
      ...properties,
      locale: typeof document !== "undefined" ? document.documentElement.lang : "ar",
    });
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, unknown>) => {
    if (!analytics) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Identify:", userId, traits);
      }
      return;
    }

    analytics.identify(userId, traits);
  }, []);

  // Convenience methods for common events
  const trackResumeUpload = useCallback(
    (properties: { fileType: string; fileSize: number; mode: "resume" | "audio" | "photo" }) => {
      track("resume.upload_start", properties);
    },
    [track]
  );

  const trackJobView = useCallback(
    (properties: { jobId: string; jobTitle: string; company: string; source?: string }) => {
      track("job.view", properties);
    },
    [track]
  );

  const trackApplyStart = useCallback(
    (properties: { jobId: string; jobTitle: string; method: "quick" | "full" }) => {
      track("apply.start", properties);
    },
    [track]
  );

  const trackSearch = useCallback(
    (properties: { query: string; filters?: Record<string, unknown>; resultsCount: number }) => {
      track("search.query", properties);
    },
    [track]
  );

  const trackError = useCallback(
    (properties: { errorCode?: string; errorMessage: string; endpoint?: string }) => {
      track("error.api", properties);
    },
    [track]
  );

  return {
    track,
    page,
    identify,
    trackResumeUpload,
    trackJobView,
    trackApplyStart,
    trackSearch,
    trackError,
  };
}

export default useAnalytics;
