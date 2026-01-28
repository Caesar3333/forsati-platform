# Platform Libraries & Services Enhancement Report
# تقرير تحسين مكتبات وخدمات المنصة

---

## Summary | ملخص

This report documents the comprehensive enhancement of Forsati platform with essential libraries, services, and infrastructure components based on the recommended stack analysis.

يوثق هذا التقرير التحسين الشامل لمنصة فرصتي بالمكتبات والخدمات ومكونات البنية التحتية الأساسية بناءً على تحليل الحزمة الموصى بها.

---

## Branch | الفرع

`feat/social-platform-integration` (continued)

---

## 1. Frontend Libraries | مكتبات الواجهة الأمامية

### Already Configured ✅ | تم تكوينها مسبقاً

| Library | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | ^3.4.0 | Utility-first CSS framework |
| @radix-ui/* | ^1.0.x | Accessible UI primitives |
| @headlessui/react | ^2.2.9 | Unstyled, accessible components |
| @tanstack/react-query | ^5.28.0 | Data fetching & caching |
| react-hook-form | ^7.51.0 | Form management |
| zod | ^3.22.0 | Schema validation |
| framer-motion | ^11.0.0 | Animations |
| @heroicons/react | ^2.2.0 | Icon library |
| lucide-react | ^0.356.0 | Additional icons |
| class-variance-authority | ^0.7.0 | Variant management |

### Fonts Added | الخطوط المُضافة

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
```

---

## 2. Infrastructure Services | خدمات البنية التحتية

### Core Services (docker-compose.yml)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **postgres** | postgres:16-alpine | 5432 | Database |
| **minio** | minio/minio:latest | 9000, 9001 | S3-compatible storage |
| **keycloak** | quay.io/keycloak/keycloak:24.0 | 8080 | IAM / SSO |
| **strapi** | Custom build | 1337 | Headless CMS |
| **redis** | redis:7-alpine | 6379 | Cache & Queues |
| **typesense** | typesense/typesense:0.25.2 | 8108 | Search engine |
| **tika** | apache/tika:latest | 9998 | Document parsing |
| **humhub** | mriedmann/humhub:stable | 8081 | Social networking |

### New Services Added | الخدمات الجديدة المُضافة

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **matomo** | matomo:latest | 8082 | Self-hosted analytics |
| **prometheus** | prom/prometheus:latest | 9090 | Metrics collection |
| **grafana** | grafana/grafana:latest | 3000 | Dashboards & visualization |
| **loki** | grafana/loki:latest | 3100 | Log aggregation |
| **mailhog** | mailhog/mailhog:latest | 1025, 8025 | Dev email server |
| **jitsi-web** | jitsi/web:stable | 8443 | Video conferencing |
| **jitsi-prosody** | jitsi/prosody:stable | - | XMPP server |
| **jitsi-jvb** | jitsi/jvb:stable | 10000/udp | Video bridge |

---

## 3. Files Created | الملفات المُنشأة

### Services

| File | Description |
|------|-------------|
| [src/services/notifications/notificationService.ts](frontend/web/src/services/notifications/notificationService.ts) | Notification service (email, push, in-app) |
| [src/services/search/searchService.ts](frontend/web/src/services/search/searchService.ts) | Typesense search service |

### Storybook Configuration

| File | Description |
|------|-------------|
| [.storybook/main.ts](frontend/web/.storybook/main.ts) | Storybook configuration |
| [.storybook/preview.tsx](frontend/web/.storybook/preview.tsx) | Storybook preview with RTL support |

### UI Components

| File | Description |
|------|-------------|
| [src/components/ui/Button/Button.tsx](frontend/web/src/components/ui/Button/Button.tsx) | Button component with variants |
| [src/components/ui/Button/Button.stories.tsx](frontend/web/src/components/ui/Button/Button.stories.tsx) | Button Storybook stories |
| [src/components/ui/Button/index.ts](frontend/web/src/components/ui/Button/index.ts) | Button exports |

### Infrastructure

| File | Description |
|------|-------------|
| [infra/prometheus/prometheus.yml](infra/prometheus/prometheus.yml) | Prometheus scrape configuration |
| [infra/grafana/provisioning/datasources/datasources.yml](infra/grafana/provisioning/datasources/datasources.yml) | Grafana data sources |

### Modified Files

| File | Changes |
|------|---------|
| [docker-compose.yml](docker-compose.yml) | Added Matomo, Prometheus, Grafana, Loki, MailHog, Jitsi |
| [src/styles/globals.css](frontend/web/src/styles/globals.css) | Added Google Fonts imports |

---

## 4. Notification Service | خدمة الإشعارات

### Channels | القنوات

- ✅ **Email** - Via SMTP/MailHog
- ✅ **Web Push** - VAPID notifications
- ✅ **In-App** - Real-time notifications
- ✅ **SMS** - Optional integration
- ✅ **WhatsApp** - wa.me links

### Notification Types | أنواع الإشعارات

```typescript
type NotificationType = 
  | 'application_received'      // تم استلام الطلب
  | 'application_viewed'        // تم عرض الطلب
  | 'application_status_change' // تغيير حالة الطلب
  | 'interview_scheduled'       // تمت جدولة المقابلة
  | 'interview_reminder'        // تذكير بالمقابلة
  | 'message_received'          // رسالة جديدة
  | 'profile_viewed'            // تم عرض الملف الشخصي
  | 'job_recommendation'        // توصية وظيفية
  | 'scholarship_deadline'      // موعد نهائي للمنحة
  | 'course_reminder'           // تذكير بالدورة
  | 'system_announcement'       // إعلان النظام
  | 'verification_complete'     // اكتمال التحقق
  | 'badge_earned';             // شارة مكتسبة
```

### Features | الميزات

- Bilingual templates (EN/AR)
- Priority levels (low, normal, high, urgent)
- Quiet hours support
- Per-channel preferences
- Scheduled notifications

---

## 5. Search Service | خدمة البحث

### Indexes | الفهارس

```typescript
type SearchIndex = 
  | 'opportunities'  // الفرص
  | 'profiles'       // الملفات الشخصية
  | 'courses'        // الدورات
  | 'scholarships'   // المنح
  | 'companies'      // الشركات
  | 'articles';      // المقالات
```

### Features | الميزات

- ✅ Full-text search with highlighting
- ✅ Faceted filtering
- ✅ Multi-index search
- ✅ Autocomplete suggestions
- ✅ Bilingual support (EN/AR query fields)
- ✅ Trending searches

### Filters | الفلاتر

- Job type (full-time, part-time, contract, etc.)
- Experience level
- Salary range
- Location (country, city, remote)
- Industry & category
- Skills
- Date ranges
- Company size & type

---

## 6. Monitoring Stack | حزمة المراقبة

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Services  │────►│  Prometheus │────►│   Grafana   │
│  (metrics)  │     │  (collect)  │     │ (visualize) │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│    Loki     │────►│   Grafana   │
│   (logs)    │     │   (view)    │
└─────────────┘     └─────────────┘
```

### Prometheus Targets

- Self-monitoring
- Redis
- PostgreSQL (via exporter)
- Strapi
- Ingestor
- Keycloak
- Typesense
- MinIO
- HumHub
- Celery workers

### Grafana Data Sources

1. **Prometheus** - Metrics
2. **Loki** - Logs
3. **PostgreSQL** - Direct queries

---

## 7. Analytics | التحليلات

### Matomo (Self-Hosted)

- **URL**: http://localhost:8082
- **Database**: PostgreSQL (matomo_db)
- **Features**:
  - Privacy-focused
  - GDPR compliant
  - Real-time visitors
  - Goal tracking
  - E-commerce tracking
  - Custom dimensions

---

## 8. Video Conferencing | مؤتمرات الفيديو

### Jitsi Meet Setup

| Component | Purpose |
|-----------|---------|
| **jitsi-web** | Web frontend |
| **jitsi-prosody** | XMPP server |
| **jitsi-jvb** | Video bridge |

### Configuration

- JWT authentication enabled
- Guest access disabled
- Timezone: Asia/Amman

---

## 9. Email (Development) | البريد الإلكتروني (التطوير)

### MailHog

- **SMTP**: localhost:1025
- **Web UI**: http://localhost:8025
- **Features**:
  - Catch-all email server
  - Web UI to view emails
  - JSON API

---

## 10. Storybook Configuration | تكوين Storybook

### Addons | الإضافات

- @storybook/addon-essentials
- @storybook/addon-a11y (accessibility)
- @storybook/addon-viewport
- @storybook/addon-docs
- @storybook/addon-interactions

### Features | الميزات

- ✅ RTL/LTR toggle
- ✅ Locale switching (EN/AR)
- ✅ Responsive viewports
- ✅ Accessibility testing
- ✅ Auto-generated docs
- ✅ Dark/Light backgrounds

---

## 11. Service URLs Summary | ملخص روابط الخدمات

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | - |
| Strapi | http://localhost:1337 | admin/admin |
| Keycloak | http://localhost:8080 | admin/admin |
| MinIO Console | http://localhost:9001 | minioadmin/minioadmin |
| HumHub | http://localhost:8081 | admin/changeme |
| Matomo | http://localhost:8082 | Setup required |
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Typesense | http://localhost:8108 | API key required |
| MailHog | http://localhost:8025 | - |
| Jitsi | http://localhost:8443 | JWT required |
| Storybook | http://localhost:6006 | - |

---

## 12. Quick Start Commands | أوامر البدء السريع

```bash
# Start all services | تشغيل جميع الخدمات
docker compose up -d

# Check service health | فحص صحة الخدمات
docker compose ps

# View logs | عرض السجلات
docker compose logs -f

# Start frontend development | تشغيل تطوير الواجهة
cd frontend/web && pnpm dev

# Start Storybook | تشغيل Storybook
cd frontend/web && pnpm storybook

# Run tests | تشغيل الاختبارات
cd frontend/web && pnpm test

# Run e2e tests | تشغيل اختبارات E2E
cd frontend/web && pnpm test:e2e
```

---

## 13. Remaining Tasks | المهام المتبقية

### High Priority | أولوية عالية

- [ ] Configure Keycloak OIDC clients for all services
- [ ] Setup MinIO buckets and policies
- [ ] Create Typesense collection schemas
- [ ] Configure Grafana dashboards

### Medium Priority | أولوية متوسطة

- [ ] Setup Celery flower for monitoring
- [ ] Configure Sentry for error tracking
- [ ] Add vector search with embeddings
- [ ] Setup Trivy for container scanning

### Optional | اختياري

- [ ] Add Rocket.Chat for messaging
- [ ] Configure Plausible as Matomo alternative
- [ ] Setup PWA with Workbox
- [ ] Add gamification system

---

## 14. Package.json Scripts | سكربتات package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test e2e/accessibility.spec.ts",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## 15. Environment Variables | متغيرات البيئة

### New Variables Added

```env
# Analytics
MATOMO_DB_NAME=matomo_db

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# Jitsi
JITSI_JWT_APP_ID=forsati
JITSI_JWT_SECRET=jitsi_secret
JITSI_JWT_ISSUERS=forsati
JITSI_JWT_AUDIENCES=forsati
JITSI_PUBLIC_URL=http://localhost:8443

# Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
SMTP_HOST=mailhog
SMTP_PORT=1025
```

---

**Generated**: 2026-01-28
**Branch**: `feat/social-platform-integration`
**Author**: Forsati Platform Team
