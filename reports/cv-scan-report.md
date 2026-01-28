# CV Scan Feature Implementation Report
# تقرير تنفيذ ميزة مسح السيرة الذاتية

---

## Summary | ملخص

**English:**
Implemented the CV Scan feature with full AI consent gating as per Forsati Platform development rules. This feature allows users to upload their CV/resume for AI-powered parsing, with explicit consent required before any AI processing. The implementation includes RTL support, bilingual i18n (Arabic/English), protected API routes, and comprehensive error handling.

**العربية:**
تم تنفيذ ميزة مسح السيرة الذاتية مع بوابة موافقة الذكاء الاصطناعي الكاملة وفقًا لقواعد تطوير منصة فرصتي. تتيح هذه الميزة للمستخدمين تحميل سيرتهم الذاتية للتحليل بواسطة الذكاء الاصطناعي، مع الموافقة الصريحة المطلوبة قبل أي معالجة. يتضمن التنفيذ دعم RTL، والترجمة ثنائية اللغة (عربي/إنجليزي)، ومسارات API محمية، ومعالجة شاملة للأخطاء.

---

## Branch | الفرع

```
feature/cv-scan
```

---

## Files Changed | الملفات المُعدّلة

### New Files | ملفات جديدة

| Path | Description (EN) | الوصف (AR) |
|------|------------------|------------|
| `features/cv-scan/manifest.json` | Feature manifest with markets, endpoints, i18n keys | بيان الميزة مع الأسواق والنقاط النهائية ومفاتيح الترجمة |
| `src/components/cv-scan/ConsentCheckbox.tsx` | AI consent component with PII redaction option | مكون الموافقة على الذكاء الاصطناعي مع خيار إخفاء البيانات الشخصية |
| `src/components/cv-scan/ParsedResumePreview.tsx` | Editable preview of parsed resume data | معاينة قابلة للتعديل لبيانات السيرة الذاتية المُحللة |
| `src/hooks/useCVUpload.ts` | Hook for CV upload with polling and consent | Hook لتحميل السيرة الذاتية مع الاستعلام والموافقة |
| `src/app/api/ingest/upload/route.ts` | Proxy to Ingestor with consent logging | وكيل للمُحلل مع تسجيل الموافقة |
| `src/app/api/ingest/status/[jobId]/route.ts` | Status polling proxy | وكيل استعلام الحالة |
| `src/app/api/resume-records/[id]/route.ts` | Protected resume records endpoint | نقطة نهائية محمية لسجلات السيرة الذاتية |
| `src/app/api/ingest/analyze/[parsedId]/route.ts` | AI analysis endpoint (requires consent) | نقطة نهائية للتحليل بالذكاء الاصطناعي (تتطلب الموافقة) |

### Modified Files | ملفات مُعدّلة

| Path | Changes (EN) | التغييرات (AR) |
|------|--------------|----------------|
| `src/components/cv-scan/CVScanModal.tsx` | Added consent integration, view modes | إضافة تكامل الموافقة، أوضاع العرض |
| `messages/ar.json` | Added cvScan i18n keys | إضافة مفاتيح ترجمة cvScan |
| `messages/en.json` | Added cvScan i18n keys | إضافة مفاتيح ترجمة cvScan |
| `docs/api/ingestor-openapi.yaml` | Added consent fields and error responses | إضافة حقول الموافقة واستجابات الخطأ |
| `frontend/web/.env.example` | Added INGESTOR_API_URL, MINIO_RESUME_BUCKET | إضافة متغيرات البيئة الجديدة |

---

## Manifest Path & Content | مسار ومحتوى البيان

**Path:** `features/cv-scan/manifest.json`

```json
{
  "name": "cv-scan",
  "version": "1.0.0",
  "description": {
    "en": "CV/Resume scanning and parsing feature with AI-powered analysis",
    "ar": "ميزة مسح وتحليل السيرة الذاتية بالذكاء الاصطناعي"
  },
  "markets": ["jo", "sa", "ae"],
  "status": "development",
  "owner": "ingestor-team",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/ingest/upload",
      "auth": "required",
      "description": "Upload CV for parsing"
    },
    {
      "method": "GET",
      "path": "/api/ingest/status/{jobId}",
      "auth": "required",
      "description": "Check parsing job status"
    },
    {
      "method": "GET",
      "path": "/api/resume-records/{id}",
      "auth": "required",
      "description": "Get parsed resume record"
    },
    {
      "method": "POST",
      "path": "/api/ingest/analyze/{parsedId}",
      "auth": "required",
      "consent": "ai_analysis",
      "description": "AI analysis of parsed resume"
    }
  ],
  "i18n_keys": [
    "cvScan.title",
    "cvScan.subtitle",
    "cvScan.consent.checkbox",
    "cvScan.consent.description",
    "cvScan.consent.privacyNotice",
    "cvScan.consent.redactPII",
    "cvScan.consent.redactPIIDescription",
    "cvScan.consent.warning",
    "cvScan.dropzone.title",
    "cvScan.dropzone.subtitle",
    "cvScan.dropzone.formats",
    "cvScan.actions.upload",
    "cvScan.actions.analyze",
    "cvScan.actions.save",
    "cvScan.actions.edit",
    "cvScan.actions.cancel",
    "cvScan.preview.title",
    "cvScan.preview.skills",
    "cvScan.preview.experience",
    "cvScan.preview.education",
    "cvScan.preview.contact",
    "cvScan.preview.addSkill",
    "cvScan.preview.removeSkill",
    "cvScan.analysis.title",
    "cvScan.analysis.strengths",
    "cvScan.analysis.improvements",
    "cvScan.analysis.matchScore",
    "cvScan.errors.uploadFailed",
    "cvScan.errors.parseFailed",
    "cvScan.errors.analysisFailed",
    "cvScan.errors.consentRequired",
    "cvScan.errors.fileTooLarge",
    "cvScan.errors.invalidFormat",
    "cvScan.status.uploading",
    "cvScan.status.parsing",
    "cvScan.status.analyzing",
    "cvScan.status.complete"
  ],
  "privacy": {
    "data_collected": ["resume_content", "parsed_fields", "ai_analysis_results"],
    "retention_period": "user_controlled",
    "requires_explicit_consent": true,
    "consent_types": ["ai_analysis", "data_storage"]
  },
  "dependencies": {
    "services": ["ingestor", "minio", "strapi"],
    "components": ["ConsentCheckbox", "CVScanModal", "ParsedResumePreview"]
  }
}
```

---

## i18n Keys Added | مفاتيح الترجمة المُضافة

### Arabic (ar.json)

```json
{
  "cvScan": {
    "title": "مسح السيرة الذاتية",
    "subtitle": "قم بتحميل سيرتك الذاتية لتحليلها بالذكاء الاصطناعي",
    "consent": {
      "checkbox": "أوافق على تحليل سيرتي الذاتية بواسطة الذكاء الاصطناعي",
      "description": "سيتم استخدام الذكاء الاصطناعي لاستخراج المعلومات من سيرتك الذاتية وتحليلها",
      "privacyNotice": "يمكنك الاطلاع على سياسة الخصوصية لمعرفة كيفية حماية بياناتك",
      "redactPII": "إخفاء المعلومات الشخصية",
      "redactPIIDescription": "إخفاء الاسم ورقم الهاتف والبريد الإلكتروني من التحليل",
      "warning": "يجب الموافقة على التحليل بالذكاء الاصطناعي للمتابعة"
    },
    "dropzone": {
      "title": "اسحب وأفلت سيرتك الذاتية هنا",
      "subtitle": "أو انقر للاختيار من جهازك",
      "formats": "PDF, DOC, DOCX (الحد الأقصى 10MB)"
    },
    "actions": {
      "upload": "تحميل",
      "analyze": "تحليل بالذكاء الاصطناعي",
      "save": "حفظ التغييرات",
      "edit": "تعديل",
      "cancel": "إلغاء"
    },
    "preview": {
      "title": "معاينة السيرة الذاتية",
      "skills": "المهارات",
      "experience": "الخبرات",
      "education": "التعليم",
      "contact": "معلومات الاتصال",
      "addSkill": "إضافة مهارة",
      "removeSkill": "إزالة مهارة"
    },
    "analysis": {
      "title": "نتائج التحليل",
      "strengths": "نقاط القوة",
      "improvements": "مجالات التحسين",
      "matchScore": "نسبة التطابق"
    },
    "errors": {
      "uploadFailed": "فشل تحميل الملف",
      "parseFailed": "فشل تحليل السيرة الذاتية",
      "analysisFailed": "فشل التحليل بالذكاء الاصطناعي",
      "consentRequired": "الموافقة مطلوبة لتحليل السيرة الذاتية",
      "fileTooLarge": "حجم الملف كبير جداً (الحد الأقصى 10MB)",
      "invalidFormat": "صيغة الملف غير مدعومة"
    },
    "status": {
      "uploading": "جاري التحميل...",
      "parsing": "جاري التحليل...",
      "analyzing": "جاري التحليل بالذكاء الاصطناعي...",
      "complete": "اكتمل التحليل"
    }
  }
}
```

### English (en.json)

```json
{
  "cvScan": {
    "title": "CV Scan",
    "subtitle": "Upload your CV for AI-powered analysis",
    "consent": {
      "checkbox": "I consent to AI analysis of my CV",
      "description": "AI will be used to extract and analyze information from your CV",
      "privacyNotice": "See our privacy policy to learn how your data is protected",
      "redactPII": "Redact personal information",
      "redactPIIDescription": "Hide name, phone number, and email from analysis",
      "warning": "Consent to AI analysis is required to proceed"
    },
    "dropzone": {
      "title": "Drag and drop your CV here",
      "subtitle": "Or click to browse from your device",
      "formats": "PDF, DOC, DOCX (Max 10MB)"
    },
    "actions": {
      "upload": "Upload",
      "analyze": "AI Analysis",
      "save": "Save Changes",
      "edit": "Edit",
      "cancel": "Cancel"
    },
    "preview": {
      "title": "CV Preview",
      "skills": "Skills",
      "experience": "Experience",
      "education": "Education",
      "contact": "Contact Information",
      "addSkill": "Add Skill",
      "removeSkill": "Remove Skill"
    },
    "analysis": {
      "title": "Analysis Results",
      "strengths": "Strengths",
      "improvements": "Areas for Improvement",
      "matchScore": "Match Score"
    },
    "errors": {
      "uploadFailed": "File upload failed",
      "parseFailed": "CV parsing failed",
      "analysisFailed": "AI analysis failed",
      "consentRequired": "Consent is required to analyze CV",
      "fileTooLarge": "File size too large (Max 10MB)",
      "invalidFormat": "Unsupported file format"
    },
    "status": {
      "uploading": "Uploading...",
      "parsing": "Parsing...",
      "analyzing": "Running AI analysis...",
      "complete": "Analysis complete"
    }
  }
}
```

---

## Tests Needed | الاختبارات المطلوبة

### Unit Tests | اختبارات الوحدة

| Test File | Description (EN) | الوصف (AR) |
|-----------|------------------|------------|
| `ConsentCheckbox.test.tsx` | Test consent state, PII redaction toggle | اختبار حالة الموافقة، تبديل إخفاء البيانات |
| `useCVUpload.test.ts` | Test upload, polling, abort functionality | اختبار التحميل، الاستعلام، الإلغاء |
| `ParsedResumePreview.test.tsx` | Test editing, skill management | اختبار التعديل، إدارة المهارات |

### Integration Tests | اختبارات التكامل

| Test File | Description (EN) | الوصف (AR) |
|-----------|------------------|------------|
| `cv-scan-flow.test.tsx` | Full upload → parse → analyze flow | تدفق التحميل الكامل → التحليل → التحليل بالذكاء الاصطناعي |
| `consent-gating.test.tsx` | Verify consent is required for AI analysis | التحقق من طلب الموافقة للتحليل |

### E2E Tests | اختبارات شاملة

| Test File | Description (EN) | الوصف (AR) |
|-----------|------------------|------------|
| `e2e/cv-scan.spec.ts` | Full user journey with consent flow | رحلة المستخدم الكاملة مع تدفق الموافقة |

---

## Local Run Commands | أوامر التشغيل المحلي

### Prerequisites | المتطلبات الأولية

```bash
# 1. Copy environment file | نسخ ملف البيئة
cp .env.example .env.local

# 2. Fill in required values | ملء القيم المطلوبة
# Edit .env.local with your secrets
```

### Start Services | تشغيل الخدمات

```bash
# Start all backend services | تشغيل جميع الخدمات الخلفية
docker-compose -f docker-compose.dev.yml up -d

# Or start individual services | أو تشغيل خدمات فردية
docker-compose -f docker-compose.dev.yml up -d minio
docker-compose -f docker-compose.dev.yml up -d keycloak
docker-compose -f docker-compose.dev.yml up -d strapi
```

### Start Ingestor Service | تشغيل خدمة المُحلل

```bash
cd services/ingestor

# Create virtual environment | إنشاء البيئة الافتراضية
python -m venv .venv

# Activate (Windows) | تفعيل (ويندوز)
.venv\Scripts\activate

# Activate (Linux/Mac) | تفعيل (لينكس/ماك)
source .venv/bin/activate

# Install dependencies | تثبيت التبعيات
pip install -r requirements.txt

# Run service | تشغيل الخدمة
uvicorn main:app --reload --port 8000
```

### Start Frontend | تشغيل الواجهة الأمامية

```bash
cd frontend/web

# Install dependencies | تثبيت التبعيات
pnpm install

# Run development server | تشغيل خادم التطوير
pnpm dev
```

### Access Application | الوصول للتطبيق

- **Frontend:** http://localhost:3000
- **Ingestor API:** http://localhost:8000
- **MinIO Console:** http://localhost:9001
- **Keycloak:** http://localhost:8080

---

## Environment Variables Required | متغيرات البيئة المطلوبة

| Variable | Description (EN) | الوصف (AR) |
|----------|------------------|------------|
| `NEXTAUTH_SECRET` | Session encryption key | مفتاح تشفير الجلسة |
| `KEYCLOAK_ISSUER` | Keycloak realm URL | رابط نطاق Keycloak |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID | معرف عميل Keycloak |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret | سر عميل Keycloak |
| `INGESTOR_API_URL` | Ingestor service URL | رابط خدمة المُحلل |
| `INGESTOR_API_KEY` | Ingestor API key | مفتاح API للمُحلل |
| `MINIO_ENDPOINT` | MinIO server endpoint | نقطة نهاية خادم MinIO |
| `MINIO_ACCESS_KEY` | MinIO access key | مفتاح وصول MinIO |
| `MINIO_SECRET_KEY` | MinIO secret key | مفتاح سر MinIO |
| `MINIO_RESUME_BUCKET` | Bucket for CV uploads | حاوية السير الذاتية |
| `STRAPI_URL` | Strapi CMS URL | رابط Strapi CMS |
| `STRAPI_API_TOKEN` | Strapi API token | رمز API لـ Strapi |

---

## Security Notes | ملاحظات الأمان

1. **No Secrets in Code:** All sensitive values use environment variables only
   
   **لا أسرار في الكود:** جميع القيم الحساسة تستخدم متغيرات البيئة فقط

2. **Consent Gating:** AI analysis requires explicit user consent
   
   **بوابة الموافقة:** التحليل بالذكاء الاصطناعي يتطلب موافقة صريحة من المستخدم

3. **Protected Routes:** All CV endpoints require authentication
   
   **المسارات المحمية:** جميع نقاط نهاية السيرة الذاتية تتطلب المصادقة

4. **PII Redaction:** Optional feature to hide personal data from AI
   
   **إخفاء البيانات الشخصية:** ميزة اختيارية لإخفاء البيانات الشخصية من الذكاء الاصطناعي

---

## Compliance Checklist | قائمة التحقق من الامتثال

- [x] Feature manifest created | تم إنشاء بيان الميزة
- [x] No secrets in code | لا أسرار في الكود
- [x] i18n support (AR/EN) | دعم الترجمة (عربي/إنجليزي)
- [x] RTL support | دعم RTL
- [x] Consent gating for AI | بوابة الموافقة للذكاء الاصطناعي
- [x] Protected endpoints | نقاط نهاية محمية
- [x] Bilingual report | تقرير ثنائي اللغة
- [x] OpenAPI documentation | توثيق OpenAPI
- [ ] Unit tests | اختبارات الوحدة
- [ ] Integration tests | اختبارات التكامل
- [ ] E2E tests | اختبارات شاملة

---

**Report Generated:** 2025-01-XX
**Author:** Development Team
**Review Status:** Pending
