// © 2026 Forsati. All rights reserved.
"use client";

/**
 * ConsentCheckbox Component
 * مكون مربع الموافقة الصريحة لتحليل الذكاء الاصطناعي
 *
 * This component implements explicit consent for AI analysis as required by privacy rules.
 * يطبق هذا المكون الموافقة الصريحة لتحليل الذكاء الاصطناعي كما هو مطلوب بقواعد الخصوصية.
 */

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showRedactionOption?: boolean;
  redactPII?: boolean;
  onRedactPIIChange?: (redact: boolean) => void;
  className?: string;
}

export function ConsentCheckbox({
  checked,
  onChange,
  disabled = false,
  showRedactionOption = true,
  redactPII = false,
  onRedactPIIChange,
  className,
}: ConsentCheckboxProps) {
  const t = useTranslations("cvScan.consent");

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-4",
        checked
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 bg-gray-50",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {/* Header with icon */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-full",
            checked
              ? "bg-emerald-100 text-emerald-600"
              : "bg-gray-200 text-gray-500",
          )}
        >
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{t("title")}</h4>
          <p className="text-sm text-gray-600 mt-1">{t("description")}</p>
        </div>
      </div>

      {/* Main consent checkbox */}
      <label
        className={cn(
          "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
          checked
            ? "border-emerald-300 bg-white"
            : "border-gray-200 bg-white hover:bg-gray-50",
          disabled && "cursor-not-allowed",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={cn(
            "mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600",
            "focus:ring-emerald-500 focus:ring-offset-0",
            disabled && "cursor-not-allowed",
          )}
        />
        <div className="flex-1">
          <span className="font-medium text-gray-900">{t("checkbox")}</span>
          <p className="text-xs text-gray-500 mt-1">{t("privacy")}</p>
        </div>
      </label>

      {/* PII Redaction Option (only shown when consent is given) */}
      {showRedactionOption && checked && (
        <div className="border-t pt-4">
          <label
            className={cn(
              "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
              redactPII
                ? "border-amber-300 bg-amber-50"
                : "border-gray-200 bg-white hover:bg-gray-50",
            )}
          >
            <input
              type="checkbox"
              checked={redactPII}
              onChange={(e) => onRedactPIIChange?.(e.target.checked)}
              disabled={disabled}
              className={cn(
                "mt-1 h-5 w-5 rounded border-gray-300 text-amber-600",
                "focus:ring-amber-500 focus:ring-offset-0",
              )}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-gray-900">
                  {t("redactPII") || "Redact personal information"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("redactPIIDescription") ||
                  "Remove name, email, and phone before AI analysis"}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Privacy notice */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          {t("privacyNotice") ||
            "Your data is processed securely and never shared without your explicit permission."}
        </p>
      </div>

      {/* Warning when not consented */}
      {!checked && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            {t("noConsentWarning") ||
              "Without consent, only basic parsing will be performed. AI-powered suggestions will not be available."}
          </p>
        </div>
      )}
    </div>
  );
}

export default ConsentCheckbox;
