/**
 * Resume to Profile Mapper Service
 * خدمة تحويل السيرة الذاتية إلى الملف الشخصي
 *
 * Maps parsed resume JSON to user profile fields
 */

import { z } from "zod";

// ============================================
// Type Definitions
// ============================================

export interface ParsedResume {
  basics?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    url?: string;
    profiles?: Array<{
      network?: string;
      url?: string;
      username?: string;
    }>;
  };
  skills?:
    | Array<{
        name?: string;
        level?: string;
        keywords?: string[];
      }>
    | string[];
  experience?: Array<{
    company?: string;
    position?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    studyType?: string;
    area?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    courses?: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    url?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  languages?: Array<{
    language?: string;
    fluency?: string;
  }>;
}

export type EmploymentStatus =
  | "employed"
  | "seeking"
  | "open_to_work"
  | "student"
  | "new_graduate"
  | "freelance";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface ProfileSkill {
  name: string;
  level: SkillLevel;
  endorsed_count: number;
}

export interface ProfileExperience {
  id?: string;
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills_used: string[];
  is_current: boolean;
}

export interface ProfileEducation {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number;
  end_year: number | null;
  gpa: number | null;
}

export interface ProfileCertification {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string;
  credential_id: string;
}

export interface PortfolioProject {
  id?: string;
  title: string;
  description: string;
  role: string;
  year: number;
  media_urls: string[];
  repo_url: string;
  live_url: string;
  technologies: string[];
}

export interface UserProfile {
  // Basic Info
  full_name: string;
  headline: string;
  summary: string;
  avatar_url?: string;
  cover_url?: string;

  // Status
  employment_status: EmploymentStatus;

  // Location
  primary_location: string;
  willing_to_relocate: boolean;
  preferred_locations: string[];

  // Contact
  email: string;
  phone?: string;
  linkedin_url?: string;
  website_url?: string;

  // Professional
  current_employer?: string;
  current_title?: string;
  years_experience: number;

  // Collections
  skills: ProfileSkill[];
  experiences: ProfileExperience[];
  education: ProfileEducation[];
  certifications: ProfileCertification[];
  portfolio_projects: PortfolioProject[];
  languages: Array<{ language: string; fluency: string }>;
}

export interface MappingResult {
  profile: Partial<UserProfile>;
  confidence: number;
  warnings: string[];
  unmapped_fields: string[];
}

// ============================================
// Validation Schemas
// ============================================

const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format");

const EmailSchema = z.string().email("Invalid email format");

// ============================================
// Helper Functions
// ============================================

/**
 * Parse date string to ISO format
 */
function parseDate(dateStr?: string): string | null {
  if (!dateStr) return null;

  // Handle various date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{4})$/, // MM/YYYY
    /^(\d{4})$/, // YYYY
    /^(\w+)\s+(\d{4})$/, // Month YYYY
  ];

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try MM/YYYY
  const mmyyyy = dateStr.match(/^(\d{2})\/(\d{4})$/);
  if (mmyyyy) {
    return `${mmyyyy[2]}-${mmyyyy[1]}-01`;
  }

  // Try YYYY only
  if (/^\d{4}$/.test(dateStr)) {
    return `${dateStr}-01-01`;
  }

  // Try Month YYYY
  const monthYear = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const months: Record<string, string> = {
      january: "01",
      jan: "01",
      february: "02",
      feb: "02",
      march: "03",
      mar: "03",
      april: "04",
      apr: "04",
      may: "05",
      june: "06",
      jun: "06",
      july: "07",
      jul: "07",
      august: "08",
      aug: "08",
      september: "09",
      sep: "09",
      october: "10",
      oct: "10",
      november: "11",
      nov: "11",
      december: "12",
      dec: "12",
    };
    const monthNum = months[monthYear[1].toLowerCase()];
    if (monthNum) {
      return `${monthYear[2]}-${monthNum}-01`;
    }
  }

  return null;
}

/**
 * Extract year from date string
 */
function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;

  const yearMatch = dateStr.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

/**
 * Map skill level string to enum
 */
function mapSkillLevel(level?: string): SkillLevel {
  if (!level) return "intermediate";

  const normalized = level.toLowerCase();

  if (
    normalized.includes("expert") ||
    normalized.includes("advanced") ||
    normalized.includes("senior")
  ) {
    return "expert";
  }
  if (normalized.includes("proficient") || normalized.includes("good")) {
    return "advanced";
  }
  if (
    normalized.includes("beginner") ||
    normalized.includes("basic") ||
    normalized.includes("learning")
  ) {
    return "beginner";
  }

  return "intermediate";
}

/**
 * Calculate years of experience from experiences array
 */
function calculateYearsExperience(experiences: ProfileExperience[]): number {
  if (!experiences.length) return 0;

  const now = new Date();
  let totalMonths = 0;

  for (const exp of experiences) {
    const startDate = new Date(exp.start_date);
    const endDate = exp.end_date ? new Date(exp.end_date) : now;

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    totalMonths += Math.max(0, months);
  }

  return Math.round(totalMonths / 12);
}

/**
 * Detect employment status from resume data
 */
function detectEmploymentStatus(parsed: ParsedResume): EmploymentStatus {
  const summary = parsed.basics?.summary?.toLowerCase() || "";
  const currentExp = parsed.experience?.find(
    (e) =>
      !e.endDate ||
      e.endDate.toLowerCase().includes("present") ||
      e.endDate.toLowerCase().includes("current"),
  );

  // Check for student indicators
  if (summary.includes("student") || summary.includes("طالب")) {
    return "student";
  }

  // Check for new graduate indicators
  if (
    summary.includes("recent graduate") ||
    summary.includes("fresh graduate") ||
    summary.includes("خريج جديد")
  ) {
    return "new_graduate";
  }

  // Check for freelance indicators
  if (
    summary.includes("freelance") ||
    summary.includes("consultant") ||
    summary.includes("مستقل")
  ) {
    return "freelance";
  }

  // Check for seeking indicators
  if (
    summary.includes("seeking") ||
    summary.includes("looking for") ||
    summary.includes("أبحث عن")
  ) {
    return "seeking";
  }

  // If has current experience, likely employed
  if (currentExp) {
    return "employed";
  }

  return "open_to_work";
}

/**
 * Extract LinkedIn URL from profiles
 */
function extractLinkedInUrl(
  profiles?: Array<{ network?: string; url?: string; username?: string }>,
): string | undefined {
  if (!profiles) return undefined;

  const linkedin = profiles.find(
    (p) =>
      p.network?.toLowerCase() === "linkedin" ||
      p.url?.includes("linkedin.com"),
  );

  return linkedin?.url;
}

/**
 * Generate headline from resume data
 */
function generateHeadline(parsed: ParsedResume): string {
  const currentExp = parsed.experience?.find(
    (e) => !e.endDate || e.endDate.toLowerCase().includes("present"),
  );

  if (currentExp?.position && currentExp?.company) {
    return `${currentExp.position} at ${currentExp.company}`;
  }

  if (currentExp?.position) {
    return currentExp.position;
  }

  const latestEducation = parsed.education?.[0];
  if (latestEducation?.studyType && latestEducation?.area) {
    return `${latestEducation.studyType} in ${latestEducation.area}`;
  }

  return "";
}

// ============================================
// Main Mapping Function
// ============================================

export function mapResumeToProfile(parsed: ParsedResume): MappingResult {
  const warnings: string[] = [];
  const unmapped_fields: string[] = [];
  let confidence = 100;

  // Map basic info
  const full_name = parsed.basics?.name || "";
  if (!full_name) {
    warnings.push("Name not found in resume");
    confidence -= 10;
  }

  // Map and validate email
  let email = parsed.basics?.email || "";
  if (email) {
    try {
      EmailSchema.parse(email);
    } catch {
      warnings.push(`Invalid email format: ${email}`);
      email = "";
      confidence -= 5;
    }
  } else {
    warnings.push("Email not found in resume");
    confidence -= 10;
  }

  // Map and validate phone
  let phone = parsed.basics?.phone?.replace(/[\s\-\(\)]/g, "") || undefined;
  if (phone) {
    try {
      PhoneSchema.parse(phone);
    } catch {
      warnings.push(`Invalid phone format: ${phone}`);
      phone = undefined;
      confidence -= 3;
    }
  }

  // Map skills
  const skills: ProfileSkill[] = [];
  if (parsed.skills) {
    for (const skill of parsed.skills) {
      if (typeof skill === "string") {
        skills.push({
          name: skill,
          level: "intermediate",
          endorsed_count: 0,
        });
      } else if (skill.name) {
        skills.push({
          name: skill.name,
          level: mapSkillLevel(skill.level),
          endorsed_count: 0,
        });

        // Add keywords as additional skills
        if (skill.keywords) {
          for (const keyword of skill.keywords) {
            if (
              !skills.find(
                (s) => s.name.toLowerCase() === keyword.toLowerCase(),
              )
            ) {
              skills.push({
                name: keyword,
                level: "intermediate",
                endorsed_count: 0,
              });
            }
          }
        }
      }
    }
  }

  if (!skills.length) {
    warnings.push("No skills found in resume");
    confidence -= 5;
  }

  // Map experiences
  const experiences: ProfileExperience[] = [];
  if (parsed.experience) {
    for (const exp of parsed.experience) {
      const startDate = parseDate(exp.startDate);
      const endDate = parseDate(exp.endDate);
      const isCurrent =
        !exp.endDate ||
        exp.endDate.toLowerCase().includes("present") ||
        exp.endDate.toLowerCase().includes("current");

      if (exp.company || exp.position) {
        experiences.push({
          company: exp.company || "Unknown Company",
          title: exp.position || "Unknown Position",
          location: exp.location || "",
          start_date: startDate || new Date().toISOString().split("T")[0],
          end_date: isCurrent ? null : endDate,
          description: exp.summary || exp.highlights?.join("\n") || "",
          skills_used: [],
          is_current: isCurrent,
        });
      }
    }
  }

  if (!experiences.length) {
    warnings.push("No experience found in resume");
    confidence -= 5;
  }

  // Map education
  const education: ProfileEducation[] = [];
  if (parsed.education) {
    for (const edu of parsed.education) {
      if (edu.institution) {
        education.push({
          institution: edu.institution,
          degree: edu.studyType || "",
          field: edu.area || "",
          start_year:
            extractYear(edu.startDate) || new Date().getFullYear() - 4,
          end_year: extractYear(edu.endDate),
          gpa: edu.gpa ? parseFloat(edu.gpa) : null,
        });
      }
    }
  }

  // Map certifications
  const certifications: ProfileCertification[] = [];
  if (parsed.certifications) {
    for (const cert of parsed.certifications) {
      if (cert.name) {
        certifications.push({
          name: cert.name,
          issuer: cert.issuer || "",
          issue_date: parseDate(cert.date) || "",
          expiry_date: null,
          credential_url: cert.url || "",
          credential_id: "",
        });
      }
    }
  }

  // Map portfolio projects
  const portfolio_projects: PortfolioProject[] = [];
  if (parsed.projects) {
    for (const proj of parsed.projects) {
      if (proj.name) {
        portfolio_projects.push({
          title: proj.name,
          description: proj.description || proj.highlights?.join("\n") || "",
          role: "",
          year:
            extractYear(proj.endDate) ||
            extractYear(proj.startDate) ||
            new Date().getFullYear(),
          media_urls: [],
          repo_url: "",
          live_url: proj.url || "",
          technologies: proj.keywords || [],
        });
      }
    }
  }

  // Map languages
  const languages =
    parsed.languages?.map((lang) => ({
      language: lang.language || "",
      fluency: lang.fluency || "intermediate",
    })) || [];

  // Calculate derived fields
  const years_experience = calculateYearsExperience(experiences);
  const employment_status = detectEmploymentStatus(parsed);
  const headline = generateHeadline(parsed);

  // Get current employer and title
  const currentExp = experiences.find((e) => e.is_current);

  const profile: Partial<UserProfile> = {
    full_name,
    headline,
    summary: parsed.basics?.summary || "",
    employment_status,
    primary_location: parsed.basics?.location || "",
    willing_to_relocate: false,
    preferred_locations: [],
    email,
    phone,
    linkedin_url: extractLinkedInUrl(parsed.basics?.profiles),
    website_url: parsed.basics?.url,
    current_employer: currentExp?.company,
    current_title: currentExp?.title,
    years_experience,
    skills,
    experiences,
    education,
    certifications,
    portfolio_projects,
    languages,
  };

  // Adjust confidence based on data completeness
  if (!profile.summary) confidence -= 5;
  if (!profile.primary_location) confidence -= 3;
  if (experiences.length < 1) confidence -= 10;
  if (education.length < 1) confidence -= 5;

  confidence = Math.max(0, Math.min(100, confidence));

  return {
    profile,
    confidence,
    warnings,
    unmapped_fields,
  };
}

// ============================================
// Merge Profiles (User Edits + Import)
// ============================================

export interface MergeOptions {
  overwrite_existing: boolean;
  merge_arrays: boolean;
  preserve_user_edits: boolean;
}

export function mergeProfiles(
  existing: Partial<UserProfile>,
  imported: Partial<UserProfile>,
  options: MergeOptions = {
    overwrite_existing: false,
    merge_arrays: true,
    preserve_user_edits: true,
  },
): Partial<UserProfile> {
  const result = { ...existing };

  // Simple fields
  const simpleFields: (keyof UserProfile)[] = [
    "full_name",
    "headline",
    "summary",
    "employment_status",
    "primary_location",
    "email",
    "phone",
    "linkedin_url",
    "website_url",
    "current_employer",
    "current_title",
    "years_experience",
  ];

  for (const field of simpleFields) {
    const importedValue = imported[field];
    const existingValue = existing[field];

    if (importedValue !== undefined && importedValue !== "") {
      if (!existingValue || options.overwrite_existing) {
        (result as any)[field] = importedValue;
      }
    }
  }

  // Array fields - merge or replace
  const arrayFields: (keyof UserProfile)[] = [
    "skills",
    "experiences",
    "education",
    "certifications",
    "portfolio_projects",
    "languages",
    "preferred_locations",
  ];

  for (const field of arrayFields) {
    const importedArr = imported[field] as any[];
    const existingArr = (existing[field] as any[]) || [];

    if (importedArr && importedArr.length > 0) {
      if (options.merge_arrays) {
        // Merge arrays, avoiding duplicates
        const merged = [...existingArr];

        for (const item of importedArr) {
          // Check for duplicates based on key fields
          const isDuplicate = merged.some((existing) => {
            if (field === "skills") {
              return existing.name?.toLowerCase() === item.name?.toLowerCase();
            }
            if (field === "experiences") {
              return (
                existing.company === item.company &&
                existing.title === item.title
              );
            }
            if (field === "education") {
              return (
                existing.institution === item.institution &&
                existing.degree === item.degree
              );
            }
            if (field === "certifications") {
              return (
                existing.name === item.name && existing.issuer === item.issuer
              );
            }
            if (field === "portfolio_projects") {
              return existing.title === item.title;
            }
            return false;
          });

          if (!isDuplicate) {
            merged.push(item);
          }
        }

        (result as any)[field] = merged;
      } else {
        (result as any)[field] = importedArr;
      }
    }
  }

  return result;
}

// ============================================
// Export Profile to Resume Format
// ============================================

export function exportProfileToResumeJson(profile: UserProfile): ParsedResume {
  return {
    basics: {
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.primary_location,
      summary: profile.summary,
      url: profile.website_url,
      profiles: profile.linkedin_url
        ? [{ network: "LinkedIn", url: profile.linkedin_url }]
        : [],
    },
    skills: profile.skills.map((s) => ({
      name: s.name,
      level: s.level,
      keywords: [],
    })),
    experience: profile.experiences.map((exp) => ({
      company: exp.company,
      position: exp.title,
      location: exp.location,
      startDate: exp.start_date,
      endDate: exp.end_date || "Present",
      summary: exp.description,
      highlights: [],
    })),
    education: profile.education.map((edu) => ({
      institution: edu.institution,
      studyType: edu.degree,
      area: edu.field,
      startDate: edu.start_year?.toString(),
      endDate: edu.end_year?.toString(),
      gpa: edu.gpa?.toString(),
      courses: [],
    })),
    projects: profile.portfolio_projects.map((proj) => ({
      name: proj.title,
      description: proj.description,
      url: proj.live_url,
      highlights: [],
      keywords: proj.technologies,
    })),
    certifications: profile.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.issue_date,
      url: cert.credential_url,
    })),
    languages: profile.languages,
  };
}
