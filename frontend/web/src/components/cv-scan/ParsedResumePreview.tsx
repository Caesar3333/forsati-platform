// © 2026 Forsati. All rights reserved.
"use client";

/**
 * ParsedResumePreview Component
 * مكون معاينة السيرة الذاتية المحللة قابلة للتعديل
 *
 * Displays and allows editing of parsed resume data before submission
 * يعرض ويسمح بتعديل بيانات السيرة الذاتية المحللة قبل الإرسال
 */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface Experience {
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface Education {
  degree?: string;
  institution?: string;
  year?: string;
  field?: string;
}

export interface ParsedResumeData {
  id: string;
  filename: string;
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  total_experience_years?: number;
  language?: string;
}

interface ParsedResumePreviewProps {
  data: ParsedResumeData;
  onChange?: (data: ParsedResumeData) => void;
  isEditable?: boolean;
  className?: string;
}

export function ParsedResumePreview({
  data,
  onChange,
  isEditable = true,
  className,
}: ParsedResumePreviewProps) {
  const t = useTranslations("cvScan.preview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [newSkill, setNewSkill] = useState("");

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = (field: string) => {
    if (onChange) {
      onChange({
        ...data,
        [field]: tempValue,
      });
    }
    setEditingField(null);
    setTempValue("");
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && onChange) {
      onChange({
        ...data,
        skills: [...data.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    if (onChange) {
      const newSkills = [...data.skills];
      newSkills.splice(index, 1);
      onChange({
        ...data,
        skills: newSkills,
      });
    }
  };

  const renderEditableField = (
    field: string,
    value: string | undefined,
    icon: React.ReactNode,
    label: string,
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group">
        <div className="p-2 rounded-full bg-white text-gray-500">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              <button
                onClick={() => handleSave(field)}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  value ? "text-gray-900" : "text-gray-400 italic",
                )}
              >
                {value || t("notProvided") || "Not provided"}
              </p>
              {isEditable && (
                <button
                  onClick={() => handleEdit(field, value || "")}
                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("title") || "Parsed Resume"}
        </h3>
        {data.language && (
          <Badge variant="secondary">
            {data.language === "ar" ? "عربي" : "English"}
          </Badge>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4" />
          {t("contactInfo") || "Contact Information"}
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {renderEditableField(
            "name",
            data.name,
            <User className="w-4 h-4" />,
            t("name") || "Name",
          )}
          {renderEditableField(
            "email",
            data.email,
            <Mail className="w-4 h-4" />,
            t("email") || "Email",
          )}
          {renderEditableField(
            "phone",
            data.phone,
            <Phone className="w-4 h-4" />,
            t("phone") || "Phone",
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Code className="w-4 h-4" />
          {t("skills") || "Skills"}
          {data.skills.length > 0 && (
            <span className="text-xs text-gray-400">
              ({data.skills.length})
            </span>
          )}
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <Badge
              key={index}
              variant="outline"
              className="group flex items-center gap-1"
            >
              {skill}
              {isEditable && (
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
          {data.skills.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              {t("noSkillsFound") || "No skills found"}
            </p>
          )}
        </div>
        {isEditable && (
          <div className="flex items-center gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder={t("addSkillPlaceholder") || "Add a skill..."}
              className="h-8 text-sm max-w-[200px]"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          {t("experience") || "Experience"}
          {data.experience.length > 0 && (
            <span className="text-xs text-gray-400">
              ({data.experience.length})
            </span>
          )}
          {data.total_experience_years && (
            <Badge variant="success" className="ms-2">
              {data.total_experience_years} {t("years") || "years"}
            </Badge>
          )}
        </h4>
        {data.experience.length > 0 ? (
          <div className="space-y-3">
            {data.experience.map((exp, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {exp.title || "Position"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exp.company || "Company"}
                    </p>
                    {(exp.start_date || exp.end_date) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {exp.start_date} -{" "}
                        {exp.end_date || t("present") || "Present"}
                      </p>
                    )}
                  </div>
                  {isEditable && (
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic p-3 bg-gray-50 rounded-lg">
            {t("noExperienceFound") || "No experience found"}
          </p>
        )}
      </div>

      {/* Education */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          {t("education") || "Education"}
          {data.education.length > 0 && (
            <span className="text-xs text-gray-400">
              ({data.education.length})
            </span>
          )}
        </h4>
        {data.education.length > 0 ? (
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {edu.degree || "Degree"}
                      {edu.field && ` - ${edu.field}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {edu.institution || "Institution"}
                    </p>
                    {edu.year && (
                      <p className="text-xs text-gray-400 mt-1">{edu.year}</p>
                    )}
                  </div>
                  {isEditable && (
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic p-3 bg-gray-50 rounded-lg">
            {t("noEducationFound") || "No education found"}
          </p>
        )}
      </div>
    </div>
  );
}

export default ParsedResumePreview;
