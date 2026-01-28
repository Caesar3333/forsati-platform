# Forsati Social Platform Integration Architecture
# هندسة دمج المنصة الاجتماعية لفرصتي

---

## 1. Executive Summary | ملخص تنفيذي

### English
This document outlines the architecture for integrating a professional social networking layer into the Forsati platform. The recommended approach uses **HumHub + Strapi Hybrid** architecture to achieve:

- **Fast time-to-market** with ready-made social features
- **Flexibility** for structured content (jobs, courses, scholarships)
- **Unified authentication** via Keycloak SSO
- **Seamless resume-to-profile** conversion flow

### العربية
توضح هذه الوثيقة هندسة دمج طبقة الشبكات الاجتماعية المهنية في منصة فرصتي. النهج الموصى به يستخدم **بنية HumHub + Strapi الهجينة** لتحقيق:

- **سرعة الوصول للسوق** مع ميزات اجتماعية جاهزة
- **المرونة** للمحتوى المنظم (وظائف، دورات، منح)
- **مصادقة موحدة** عبر Keycloak SSO
- **تحويل سلس** من السيرة الذاتية إلى الملف الشخصي

---

## 2. Technology Comparison | مقارنة التقنيات

| Feature | HumHub | Open Social | Elgg | Strapi+Next.js |
|---------|--------|-------------|------|----------------|
| **Language** | PHP (Yii) | PHP (Drupal) | PHP | JS/TS |
| **Social Features** | ✅ Complete | ✅ Complete | ⚠️ Basic | ❌ Build |
| **Profiles** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ❌ Build |
| **Posts/Feed** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ❌ Build |
| **Messaging** | ✅ Built-in | ✅ Built-in | ⚠️ Plugin | ❌ Build |
| **Follow/Connect** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ❌ Build |
| **Spaces/Groups** | ✅ Built-in | ✅ Built-in | ⚠️ Plugin | ❌ Build |
| **Modularity** | ✅ Excellent | ✅ Good | ⚠️ Fair | ✅ Excellent |
| **API Support** | ✅ REST | ✅ REST | ⚠️ Limited | ✅ REST/GraphQL |
| **RTL/Arabic** | ⚠️ Theme | ✅ Built-in | ⚠️ Theme | ✅ Full control |
| **Community Size** | Large | Large | Small | Huge |
| **Dev Time** | 2-4 weeks | 3-5 weeks | 4-6 weeks | 8-12 weeks |

### Recommendation | التوصية

**HumHub + Strapi Hybrid** for fastest path to production with:
- HumHub: Social features (profiles, posts, messaging, follows)
- Strapi: Structured content (jobs, scholarships, courses, articles)
- Keycloak: Unified SSO
- MinIO: Shared storage
- Ingestor: Resume parsing

---

## 3. Architecture Overview | نظرة عامة على الهندسة

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Forsati Platform                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Next.js    │    │   HumHub     │    │   Strapi     │          │
│  │   Frontend   │◄──►│   Social     │◄──►│   CMS        │          │
│  │   (Web App)  │    │   Engine     │    │   (Jobs/     │          │
│  └──────┬───────┘    └──────┬───────┘    │   Content)   │          │
│         │                   │            └──────┬───────┘          │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                    Keycloak SSO                          │       │
│  │                 (Identity Provider)                      │       │
│  └─────────────────────────────────────────────────────────┘       │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Ingestor   │    │   MinIO      │    │   PostgreSQL │          │
│  │   (Resume    │───►│   (S3        │    │   (Database) │          │
│  │   Parsing)   │    │   Storage)   │    │              │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Typesense  │    │   Redis      │    │   Celery     │          │
│  │   (Search)   │    │   (Cache)    │    │   (Workers)  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Jitsi      │    │   Rasa       │    │   Rocket.Chat│          │
│  │   (Video)    │    │   (Chatbot)  │    │   (Optional) │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Responsibilities | مسؤوليات المكونات

### 4.1 HumHub (Social Engine)
- User profiles with custom fields
- Posts, articles, activity feed
- Follow/friend relationships
- Spaces (groups, organizations)
- Internal messaging
- Notifications system
- File sharing

### 4.2 Strapi (Content Management)
- Job opportunities (CRUD)
- Scholarships listings
- Courses catalog
- Articles/resources
- Application records
- Resume records (parsed data)

### 4.3 Next.js (Frontend Gateway)
- Public-facing job board
- Landing pages
- SEO-optimized content
- Progressive Web App
- Embeds HumHub for social features

### 4.4 Ingestor (Resume Processing)
- File upload handling
- Virus scanning (ClamAV)
- Text extraction (Tika)
- Resume parsing (pyresparser)
- Profile mapping logic

---

## 5. Data Flow Diagrams | مخططات تدفق البيانات

### 5.1 Resume Upload → Profile Update Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────►│ Next.js │────►│Ingestor │────►│  MinIO  │
│ Upload  │     │   API   │     │ Service │     │ Storage │
└─────────┘     └────┬────┘     └────┬────┘     └─────────┘
                     │               │
                     │               ▼
                     │         ┌─────────┐
                     │         │  Tika   │
                     │         │ Extract │
                     │         └────┬────┘
                     │               │
                     │               ▼
                     │         ┌─────────┐
                     │         │pyresparser│
                     │         │  Parse  │
                     │         └────┬────┘
                     │               │
                     ▼               ▼
              ┌─────────┐     ┌─────────┐
              │ Strapi  │◄────│ Parsed  │
              │ resume_ │     │  JSON   │
              │ records │     └─────────┘
              └────┬────┘
                   │
                   ▼
              ┌─────────┐     ┌─────────┐
              │ User    │────►│ HumHub  │
              │ Review  │     │ Profile │
              │ & Approve│    │ Update  │
              └─────────┘     └─────────┘
```

### 5.2 Job Application Flows

```
┌──────────────────────────────────────────────────────────────────┐
│                    Application Flow Types                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Quick Apply (In-Platform)                                    │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐           │
│  │ Click  │───►│ Select │───►│ Submit │───►│ Notify │           │
│  │ Apply  │    │ Resume │    │ App    │    │Recruiter│           │
│  └────────┘    └────────┘    └────────┘    └────────┘           │
│                                                                  │
│  2. External Link                                                │
│  ┌────────┐    ┌────────┐    ┌────────┐                         │
│  │ Click  │───►│ Confirm│───►│ Redirect│                        │
│  │ Apply  │    │ Modal  │    │ External│                        │
│  └────────┘    └────────┘    └────────┘                         │
│                                                                  │
│  3. Email Forward                                                │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐           │
│  │ Click  │───►│ Consent│───►│ Queue  │───►│ Send   │           │
│  │ Apply  │    │ Check  │    │ Email  │    │ SMTP   │           │
│  └────────┘    └────────┘    └────────┘    └────────┘           │
│                                                                  │
│  4. WhatsApp                                                     │
│  ┌────────┐    ┌────────┐    ┌────────┐                         │
│  │ Click  │───►│ Generate│───►│ Open   │                        │
│  │ Apply  │    │ Message │    │ wa.me  │                        │
│  └────────┘    └────────┘    └────────┘                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Integration Points | نقاط التكامل

### 6.1 Keycloak Integration

| Component | Integration Method | Client Type |
|-----------|-------------------|-------------|
| Next.js | NextAuth.js + Keycloak Provider | Confidential |
| HumHub | OIDC Module / Custom Module | Confidential |
| Strapi | Keycloak Provider Plugin | Confidential |
| Rocket.Chat | OAuth2 / OIDC | Confidential |

### 6.2 MinIO Integration

| Component | Integration Method |
|-----------|-------------------|
| Next.js | AWS SDK v3 (S3 compatible) |
| HumHub | S3 Storage Module |
| Strapi | @strapi/provider-upload-aws-s3 |
| Ingestor | boto3 / minio-py |

### 6.3 Database Strategy

| Component | Database | Tables/Collections |
|-----------|----------|-------------------|
| HumHub | PostgreSQL (humhub_db) | user, profile, post, space, etc. |
| Strapi | PostgreSQL (strapi_db) | jobs, applications, resume_records |
| Keycloak | PostgreSQL (keycloak_db) | users, realms, clients |

---

## 7. Profile Schema | مخطط الملف الشخصي

### 7.1 HumHub Extended Profile Fields

```yaml
profile:
  # Basic Info
  full_name: string
  headline: string (50 chars)
  summary: text (rich)
  avatar_url: string
  cover_url: string
  
  # Status
  employment_status: enum
    - employed
    - seeking
    - open_to_work
    - student
    - new_graduate
    - freelance
  
  # Location
  primary_location: string
  willing_to_relocate: boolean
  preferred_locations: string[]
  
  # Contact (visibility controlled)
  email: string (verified)
  phone: string (validated)
  linkedin_url: string
  website_url: string
  
  # Professional
  current_employer: string
  current_title: string
  years_experience: integer
  
  # Skills (tags with weights)
  skills:
    - name: string
      level: enum (beginner, intermediate, advanced, expert)
      endorsed_count: integer
  
  # Experience
  experiences:
    - company: string
      title: string
      location: string
      start_date: date
      end_date: date | null (current)
      description: text
      skills_used: string[]
  
  # Education
  education:
    - institution: string
      degree: string
      field: string
      start_year: integer
      end_year: integer
      gpa: float | null
  
  # Certifications
  certifications:
    - name: string
      issuer: string
      issue_date: date
      expiry_date: date | null
      credential_url: string
      credential_id: string
  
  # Portfolio
  portfolio_projects:
    - title: string
      description: text
      role: string
      year: integer
      media_urls: string[]
      repo_url: string
      live_url: string
      technologies: string[]
  
  # Verified Badges
  verified_badges:
    - type: enum (email, phone, education, employment)
      verified_at: datetime
      verifier: string
```

### 7.2 Resume Parsed JSON → Profile Mapping

```javascript
const resumeToProfileMapping = {
  // Basic Info
  'basics.name': 'full_name',
  'basics.email': 'email',
  'basics.phone': 'phone',
  'basics.summary': 'summary',
  'basics.location': 'primary_location',
  
  // Skills
  'skills': 'skills', // Array mapping with default level
  
  // Experience
  'experience': 'experiences', // Array mapping
  'experience[].company': 'experiences[].company',
  'experience[].position': 'experiences[].title',
  'experience[].startDate': 'experiences[].start_date',
  'experience[].endDate': 'experiences[].end_date',
  'experience[].summary': 'experiences[].description',
  
  // Education
  'education': 'education', // Array mapping
  'education[].institution': 'education[].institution',
  'education[].studyType': 'education[].degree',
  'education[].area': 'education[].field',
  'education[].startDate': 'education[].start_year',
  'education[].endDate': 'education[].end_year',
  
  // Projects → Portfolio
  'projects': 'portfolio_projects',
  'projects[].name': 'portfolio_projects[].title',
  'projects[].description': 'portfolio_projects[].description',
  'projects[].url': 'portfolio_projects[].live_url',
};
```

---

## 8. Apply Flow Implementation | تنفيذ سير التقديم

### 8.1 Quick Apply (In-Platform)

```typescript
// POST /api/applications/quick
interface QuickApplyRequest {
  jobId: string;
  resumeId: string;
  coverLetterId?: string;
  answers?: Record<string, string>; // screening questions
}

interface QuickApplyResponse {
  applicationId: string;
  status: 'submitted' | 'pending_review';
  appliedAt: string;
}
```

### 8.2 External Link Apply

```typescript
// GET /api/opportunities/{id}/external-apply
interface ExternalApplyResponse {
  externalUrl: string;
  trackingPixelUrl?: string; // optional analytics
}
```

### 8.3 Email Forward Apply

```typescript
// POST /api/applications/email-forward
interface EmailForwardRequest {
  jobId: string;
  resumeId: string;
  coverLetterId?: string;
  consentToShare: boolean; // REQUIRED
  includePhone: boolean;
  includeProfileLink: boolean;
  customMessage?: string;
}

interface EmailForwardResponse {
  applicationId: string;
  emailSentTo: string; // masked: h***@company.com
  sentAt: string;
}
```

### 8.4 WhatsApp Apply

```typescript
// GET /api/applications/whatsapp-link
interface WhatsAppLinkRequest {
  jobId: string;
  includeProfileLink: boolean;
}

interface WhatsAppLinkResponse {
  whatsappUrl: string; // wa.me/{phone}?text={encoded}
  prefilledMessage: string;
  fallbackMessage: string; // for copy
}
```

---

## 9. Security & Privacy | الأمان والخصوصية

### 9.1 Consent Management

| Action | Consent Required | Storage |
|--------|-----------------|---------|
| Parse resume | ✅ AI processing consent | consent_log |
| Share with employer (email) | ✅ Explicit checkbox | application.consent_share |
| Share phone number | ✅ Explicit checkbox | application.consent_phone |
| WhatsApp message | ✅ Implicit (user action) | N/A |
| Profile public view | ⚠️ Privacy settings | profile.visibility |

### 9.2 Data Protection Measures

```yaml
encryption:
  at_rest: AES-256 (MinIO server-side)
  in_transit: TLS 1.3
  pii_fields: encrypted with user key

access_control:
  profile_tokens: JWT with expiry (24h for employers)
  api_rate_limiting: 100 req/min per user
  ip_allowlisting: optional for enterprise

audit_logging:
  events:
    - application.submitted
    - application.email_sent
    - application.viewed_by_employer
    - profile.shared
    - consent.granted
    - consent.revoked
  retention: 2 years
  storage: separate audit_log table

pii_handling:
  national_id: never stored, redacted on parse
  phone: stored encrypted, shown only with consent
  email: verified before sharing
```

### 9.3 GDPR/Privacy Compliance

- **Right to Access**: API endpoint to export user data
- **Right to Erasure**: Account deletion with cascade
- **Data Portability**: Export in JSON/PDF formats
- **Consent Records**: Timestamped, purpose-specific

---

## 10. Email Template | قالب البريد الإلكتروني

### 10.1 Application Email Template

```html
Subject: Application: {job.title} — {applicant.full_name} — via Forsati

<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="UTF-8">
  <title>Job Application via Forsati</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  
  <!-- Header -->
  <div style="background: #1e3a5f; padding: 20px; text-align: center;">
    <img src="{forsati_logo_url}" alt="Forsati" width="150">
  </div>
  
  <!-- Content -->
  <div style="padding: 30px; background: #ffffff;">
    <p style="color: #333;">Hello {recruiter_name || 'Hiring Team'},</p>
    
    <p style="color: #333;">
      <strong>{applicant.full_name}</strong> has applied for 
      <strong>{job.title}</strong> on Forsati.
    </p>
    
    <!-- Summary Card -->
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e3a5f;">Applicant Summary</h3>
      <table style="width: 100%;">
        <tr>
          <td style="color: #666; padding: 5px 0;">Name:</td>
          <td style="color: #333;">{applicant.full_name}</td>
        </tr>
        <tr>
          <td style="color: #666; padding: 5px 0;">Title:</td>
          <td style="color: #333;">{applicant.headline}</td>
        </tr>
        <tr>
          <td style="color: #666; padding: 5px 0;">Location:</td>
          <td style="color: #333;">{applicant.location}</td>
        </tr>
        {#if applicant.consent_phone}
        <tr>
          <td style="color: #666; padding: 5px 0;">Phone:</td>
          <td style="color: #333;">{applicant.phone}</td>
        </tr>
        {/if}
        <tr>
          <td style="color: #666; padding: 5px 0;">Email:</td>
          <td style="color: #333;">{applicant.email}</td>
        </tr>
        <tr>
          <td style="color: #666; padding: 5px 0;">Experience:</td>
          <td style="color: #333;">{applicant.years_experience} years</td>
        </tr>
        <tr>
          <td style="color: #666; padding: 5px 0;">Key Skills:</td>
          <td style="color: #333;">{applicant.skills.slice(0,5).join(', ')}</td>
        </tr>
      </table>
    </div>
    
    <!-- Profile Link -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{profile_link}" style="background: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Full Profile
      </a>
    </div>
    
    <!-- Custom Message -->
    {#if custom_message}
    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333; font-style: italic;">
        "{custom_message}"
      </p>
      <p style="margin: 10px 0 0; color: #666; font-size: 12px;">
        — Message from applicant
      </p>
    </div>
    {/if}
    
  </div>
  
  <!-- Footer -->
  <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>Sent via <strong>Forsati</strong> — منصة فرصتي</p>
    <p>
      <a href="{privacy_policy_url}" style="color: #1e3a5f;">Privacy Policy</a> | 
      <a href="{unsubscribe_url}" style="color: #1e3a5f;">Unsubscribe</a>
    </p>
    <img src="{forsati_stamp_url}" alt="Forsati Verified" width="80">
  </div>
  
</body>
</html>
```

---

## 11. Execution Plan | خطة التنفيذ

### Phase A: Foundation (Week 1-2)

| Task | Owner | Duration |
|------|-------|----------|
| Add HumHub as submodule | DevOps | 1 day |
| Configure Keycloak clients | DevOps | 1 day |
| Setup MinIO S3 adapters | Backend | 2 days |
| Create HumHub resume-import module skeleton | Backend | 2 days |
| Design profile schema | Full-stack | 1 day |
| Setup database migrations | Backend | 1 day |

### Phase B: Resume Integration (Week 2-3)

| Task | Owner | Duration |
|------|-------|----------|
| Enhance Ingestor for profile mapping | Backend | 3 days |
| Create resume_records Strapi collection | Backend | 1 day |
| Build ParsedResumePreview component | Frontend | 2 days |
| Implement profile update API | Backend | 2 days |
| Create consent management service | Backend | 2 days |

### Phase C: Apply Flows (Week 3-4)

| Task | Owner | Duration |
|------|-------|----------|
| Quick Apply endpoint | Backend | 2 days |
| Email forward service | Backend | 3 days |
| WhatsApp link generator | Backend | 1 day |
| External apply tracking | Backend | 1 day |
| Apply UI components | Frontend | 3 days |

### Phase D: Social Features (Week 4-5)

| Task | Owner | Duration |
|------|-------|----------|
| HumHub posts/feed integration | Full-stack | 3 days |
| Follow/connect system | Full-stack | 2 days |
| Messaging integration | Full-stack | 2 days |
| Notifications system | Backend | 2 days |

### Phase E: Testing & Hardening (Week 5-6)

| Task | Owner | Duration |
|------|-------|----------|
| E2E tests for apply flows | QA | 3 days |
| Security audit | Security | 2 days |
| Performance testing | DevOps | 2 days |
| Privacy compliance review | Legal | 1 day |
| Documentation | Full-stack | 2 days |

---

## 12. Decision Matrix | مصفوفة القرار

### Recommended: HumHub + Strapi Hybrid

| Criterion | Weight | HumHub+Strapi | Strapi Only | Open Social |
|-----------|--------|---------------|-------------|-------------|
| Time to Market | 30% | 9/10 | 5/10 | 7/10 |
| Social Features | 25% | 9/10 | 3/10 | 9/10 |
| Flexibility | 20% | 8/10 | 10/10 | 7/10 |
| Maintenance | 15% | 7/10 | 9/10 | 6/10 |
| Community | 10% | 8/10 | 9/10 | 8/10 |
| **Total** | 100% | **8.4** | 6.2 | 7.4 |

---

## References | المراجع

- [HumHub Documentation](https://docs.humhub.org)
- [Strapi Documentation](https://docs.strapi.io)
- [Keycloak OIDC](https://www.keycloak.org/docs/latest/securing_apps/)
- [MinIO S3 API](https://min.io/docs/minio/linux/developers/python/API.html)
- [WhatsApp Click to Chat](https://faq.whatsapp.com/5913398998672934)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-28
**Author**: Forsati Platform Team
