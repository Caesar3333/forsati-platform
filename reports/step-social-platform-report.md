# Social Platform Integration Report
# تقرير دمج المنصة الاجتماعية

---

## Executive Summary | ملخص تنفيذي

### English
This report documents the implementation of a professional social networking layer for the Forsati platform. The architecture uses a **HumHub + Strapi Hybrid** approach to deliver:

- **Fast time-to-market**: Leveraging HumHub's ready-made social features
- **Flexibility**: Using Strapi for structured content (jobs, courses)
- **Unified authentication**: Via Keycloak SSO
- **Comprehensive apply flows**: 4 application methods implemented
- **Privacy-first**: GDPR-compliant consent management

### العربية
يوثق هذا التقرير تنفيذ طبقة الشبكات الاجتماعية المهنية لمنصة فرصتي. تستخدم الهندسة نهج **HumHub + Strapi الهجين** لتقديم:

- **سرعة الوصول للسوق**: الاستفادة من ميزات HumHub الاجتماعية الجاهزة
- **المرونة**: استخدام Strapi للمحتوى المنظم (الوظائف، الدورات)
- **مصادقة موحدة**: عبر Keycloak SSO
- **سير تقديم شامل**: 4 طرق تقديم مُنفّذة
- **الخصوصية أولاً**: إدارة موافقة متوافقة مع GDPR

---

## Branch | الفرع

`feat/social-platform-integration`

---

## Technology Decision | قرار التقنية

### Comparison Matrix | مصفوفة المقارنة

| Criterion | HumHub+Strapi | Strapi Only | Open Social |
|-----------|---------------|-------------|-------------|
| Time to Market | **9/10** | 5/10 | 7/10 |
| Social Features | **9/10** | 3/10 | 9/10 |
| Flexibility | 8/10 | **10/10** | 7/10 |
| Maintenance | 7/10 | **9/10** | 6/10 |
| **Weighted Total** | **8.4** | 6.2 | 7.4 |

### Recommendation | التوصية

**HumHub + Strapi Hybrid** selected for:
- Ready-made social features (profiles, posts, follows, messaging)
- Existing Strapi integration for structured content
- Keycloak SSO compatibility
- S3/MinIO storage support

---

## Files Created/Modified | الملفات المُنشأة/المُعدّلة

### Architecture Documentation

| File | Description |
|------|-------------|
| [docs/architecture/social-platform-integration.md](docs/architecture/social-platform-integration.md) | Complete architecture documentation |

### Feature Manifests

| File | Description |
|------|-------------|
| [features/social-network/manifest.json](features/social-network/manifest.json) | Social networking feature manifest |
| [features/professional-profile/manifest.json](features/professional-profile/manifest.json) | Professional profile feature manifest |

### Services & APIs

| File | Description |
|------|-------------|
| [src/services/profile/resumeToProfileMapper.ts](frontend/web/src/services/profile/resumeToProfileMapper.ts) | Resume to profile mapping service |
| [src/services/apply/types.ts](frontend/web/src/services/apply/types.ts) | Apply flow type definitions |
| [src/services/apply/emailTemplates.ts](frontend/web/src/services/apply/emailTemplates.ts) | Email templates (EN/AR) |
| [src/services/privacy/consentService.ts](frontend/web/src/services/privacy/consentService.ts) | Privacy & consent management |

### API Routes

| File | Description |
|------|-------------|
| [src/app/api/applications/email-forward/route.ts](frontend/web/src/app/api/applications/email-forward/route.ts) | Email forward apply endpoint |
| [src/app/api/applications/whatsapp/route.ts](frontend/web/src/app/api/applications/whatsapp/route.ts) | WhatsApp apply endpoint |

### Infrastructure

| File | Description |
|------|-------------|
| [docker-compose.yml](docker-compose.yml) | Added HumHub service |
| [services/humhub](services/humhub) | HumHub submodule |

---

## Apply Flow Implementation | تنفيذ سير التقديم

### 1. Quick Apply (In-Platform) | التقديم السريع

```
User → Select Resume → Submit → Notify Recruiter
المستخدم ← اختيار السيرة ← التقديم ← إشعار المُوظِّف
```

**Endpoint**: `POST /api/applications/quick`
**Required**: `jobId`, `resumeId`, `consentToProcess`

### 2. External Link | الرابط الخارجي

```
User → Confirm Modal → Redirect to External URL
المستخدم ← تأكيد ← التوجيه للرابط الخارجي
```

**Endpoint**: `GET /api/opportunities/{id}/external-apply`

### 3. Email Forward | إعادة التوجيه بالبريد

```
User → Consent Check → Queue Email → Send via SMTP
المستخدم ← فحص الموافقة ← وضع في الصف ← الإرسال
```

**Endpoint**: `POST /api/applications/email-forward`
**Required**: `consentToShare: true`

**Features**:
- ✅ HTML + Plain text versions
- ✅ Arabic (RTL) template
- ✅ Profile link with expiring token
- ✅ Resume/CV attachment
- ✅ Masked email in response

### 4. WhatsApp Apply | التقديم عبر واتساب

```
User → Generate Message → Open wa.me Link
المستخدم ← توليد الرسالة ← فتح رابط واتساب
```

**Endpoint**: `POST /api/applications/whatsapp`

**Features**:
- ✅ Pre-filled Arabic message
- ✅ Profile link (optional)
- ✅ Fallback copy message
- ✅ Masked phone number

---

## Resume → Profile Mapping | تحويل السيرة للملف الشخصي

### Data Flow | تدفق البيانات

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │───►│   Ingestor  │───►│   Strapi    │
│   Resume    │    │   (Parse)   │    │   (Store)   │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                   ┌─────────────┐           │
                   │   Profile   │◄──────────┘
                   │   Mapper    │
                   └──────┬──────┘
                          │
┌─────────────┐    ┌──────▼──────┐
│   User      │◄───│   Preview   │
│   Approval  │    │   Modal     │
└──────┬──────┘    └─────────────┘
       │
       ▼
┌─────────────┐
│   Update    │
│   Profile   │
└─────────────┘
```

### Field Mapping | تعيين الحقول

| Resume Field | Profile Field |
|--------------|---------------|
| `basics.name` | `full_name` |
| `basics.email` | `email` (validated) |
| `basics.phone` | `phone` (encrypted) |
| `skills[]` | `skills[]` with levels |
| `experience[]` | `experiences[]` |
| `education[]` | `education[]` |
| `projects[]` | `portfolio_projects[]` |

### Confidence Scoring | تقييم الثقة

- Starts at 100%
- Deductions for missing fields
- Warnings displayed to user
- User can edit before applying

---

## Privacy & Consent | الخصوصية والموافقة

### Consent Purposes | أغراض الموافقة

| Purpose | Required | Description |
|---------|----------|-------------|
| `ai_processing` | ✅ | AI resume analysis |
| `share_with_employer` | ✅ | Share application data |
| `share_phone` | ⚠️ | Include phone number |
| `share_profile` | ⚠️ | Share profile link |
| `email_notifications` | ❌ | Job alerts |
| `marketing` | ❌ | Promotional content |

### GDPR Compliance | التوافق مع GDPR

- ✅ **Article 7**: Consent tracking with timestamp
- ✅ **Article 17**: Right to erasure (deletion request)
- ✅ **Article 20**: Data portability (export request)
- ✅ **Article 21**: Right to object (revoke consent)

### Security Measures | إجراءات الأمان

- PII fields encrypted at rest
- Profile tokens expire after 7 days
- Audit logging for all data sharing
- Phone/email masking in responses

---

## Docker Services | خدمات Docker

### New Service: HumHub

```yaml
humhub:
  image: mriedmann/humhub:stable
  ports:
    - "8081:80"
  environment:
    HUMHUB_DB_HOST: postgres
    HUMHUB_NAME: "Forsati Community"
```

### Service URLs | روابط الخدمات

| Service | URL | Purpose |
|---------|-----|---------|
| HumHub | http://localhost:8081 | Social networking |
| Strapi | http://localhost:1337 | Content management |
| Keycloak | http://localhost:8080 | Authentication |
| MinIO | http://localhost:9001 | File storage |
| Typesense | http://localhost:8108 | Search |
| Redis | localhost:6379 | Cache/Queue |

---

## Profile Schema | مخطط الملف الشخصي

### Employment Status | حالة التوظيف

```typescript
type EmploymentStatus = 
  | 'employed'       // موظف
  | 'seeking'        // يبحث عن عمل
  | 'open_to_work'   // منفتح على العمل
  | 'student'        // طالب
  | 'new_graduate'   // خريج جديد
  | 'freelance';     // مستقل
```

### Profile Visibility | رؤية الملف الشخصي

```typescript
type ProfileVisibility = 
  | 'public'      // عام
  | 'connections' // الاتصالات فقط
  | 'private';    // خاص
```

---

## Execution Plan | خطة التنفيذ

### Phase A: Foundation (Week 1-2)

| Task | Status | Notes |
|------|--------|-------|
| Add HumHub submodule | ✅ | Added to services/humhub |
| Create architecture docs | ✅ | Complete with diagrams |
| Update docker-compose | ✅ | HumHub + volumes |
| Design profile schema | ✅ | Documented in manifest |

### Phase B: Resume Integration (Week 2-3)

| Task | Status | Notes |
|------|--------|-------|
| Resume-to-profile mapper | ✅ | With confidence scoring |
| Type definitions | ✅ | Zod validation |
| Merge profiles logic | ✅ | Non-destructive merge |

### Phase C: Apply Flows (Week 3-4)

| Task | Status | Notes |
|------|--------|-------|
| Quick apply API | ✅ | POST /api/applications/quick |
| Email forward API | ✅ | With templates |
| WhatsApp apply API | ✅ | wa.me link generation |
| External apply tracking | ⏳ | Analytics pending |

### Phase D: Privacy & Consent (Week 4)

| Task | Status | Notes |
|------|--------|-------|
| Consent service | ✅ | Record/check/revoke |
| Privacy settings | ✅ | Visibility controls |
| Data export/deletion | ✅ | GDPR compliance |
| PII redaction | ✅ | Utility functions |

### Phase E: Integration Testing (Week 5-6)

| Task | Status | Notes |
|------|--------|-------|
| E2E apply flow tests | ⏳ | Playwright |
| Security audit | ⏳ | SAST/DAST |
| Performance testing | ⏳ | Load tests |

---

## Next Steps | الخطوات التالية

1. **Configure Keycloak Client for HumHub**
   ```bash
   # Create OIDC client in Keycloak admin
   # Set redirect URI: http://localhost:8081/user/auth/external
   ```

2. **Create HumHub Resume Import Module**
   ```bash
   mkdir -p services/humhub/modules/resumeimport
   # Implement PHP module for Yii2
   ```

3. **Setup MinIO Buckets**
   ```bash
   mc alias set minio http://localhost:9000 minioadmin minioadmin
   mc mb minio/forsati-humhub
   mc mb minio/forsati-profiles
   ```

4. **Start Services**
   ```bash
   docker compose up -d
   ```

5. **Test Apply Flows**
   ```bash
   cd frontend/web
   pnpm test
   pnpm test:e2e
   ```

---

## References | المراجع

- [HumHub Documentation](https://docs.humhub.org)
- [HumHub SSO Guide](https://docs.humhub.org/docs/admin/authentication)
- [Strapi v4 API](https://docs.strapi.io/dev-docs/api/rest)
- [WhatsApp Click to Chat](https://faq.whatsapp.com/5913398998672934)
- [GDPR Compliance](https://gdpr.eu/checklist/)

---

## Commits | الالتزامات

1. `docs: add social platform integration architecture`
2. `feat: add HumHub as git submodule`
3. `feat(profile): add resume-to-profile mapping service`
4. `feat(apply): implement email forward and WhatsApp apply flows`
5. `feat(privacy): add consent and privacy management service`
6. `feat(infra): add HumHub to docker-compose`
7. `feat(manifests): add social-network and professional-profile features`

---

**Generated**: 2026-01-28
**Branch**: `feat/social-platform-integration`
**Author**: Forsati Platform Team
