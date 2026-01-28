# Step: Setup Dependencies & Manifests Report
# خطوة: تقرير إعداد الاعتماديات والمانيفستات

---

## Branch | الفرع

`chore/setup-deps-and-manifests`

---

## Summary | ملخص

### English
This step establishes the foundational infrastructure, frontend packages, UI components, and feature manifests for the Forsati platform. It includes:

1. **Docker Infrastructure**: Added Redis, Typesense, Apache Tika, and Celery worker services to docker-compose.yml for caching, search, document extraction, and background processing.

2. **Frontend Packages**: Installed comprehensive UI libraries (Radix UI, Headless UI, Framer Motion), state management (Zustand, React Query), form handling (React Hook Form, Zod), and testing tools (Vitest, Playwright, Storybook).

3. **Platform Pages**: Created 8 core pages including opportunities listings (jobs, volunteering, scholarships, courses), authentication (login, register), and dashboards (user, organization).

4. **Reusable Components**: Built 15+ components for layout (MobileMenu, LanguageSwitcher, UserMenu), opportunities (OpportunityCard, OpportunityFilters), and UI (Pagination, ToastProvider).

5. **Feature Manifests**: Created 7 feature manifests defining the structure, APIs, and i18n requirements for job-posting, cv-scan, apply-flow, sharing, volunteering, scholarships, and courses.

6. **Configuration**: Updated .env.example with all required environment variables and added CI workflow for automated testing.

### العربية
تُنشئ هذه الخطوة البنية التحتية الأساسية وحزم الواجهة الأمامية ومكونات UI وملفات المانيفست لمنصة فرصتي. تشمل:

1. **بنية Docker التحتية**: إضافة خدمات Redis و Typesense و Apache Tika و Celery worker إلى docker-compose.yml للتخزين المؤقت والبحث واستخراج المستندات ومعالجة الخلفية.

2. **حزم الواجهة الأمامية**: تثبيت مكتبات UI شاملة (Radix UI، Headless UI، Framer Motion)، وإدارة الحالة (Zustand، React Query)، ومعالجة النماذج (React Hook Form، Zod)، وأدوات الاختبار (Vitest، Playwright، Storybook).

3. **صفحات المنصة**: إنشاء 8 صفحات أساسية تشمل قوائم الفرص (الوظائف، التطوع، المنح، الدورات)، والمصادقة (تسجيل الدخول، التسجيل)، ولوحات التحكم (المستخدم، المؤسسة).

4. **المكونات القابلة لإعادة الاستخدام**: بناء أكثر من 15 مكونًا للتخطيط (MobileMenu، LanguageSwitcher، UserMenu)، والفرص (OpportunityCard، OpportunityFilters)، وواجهة المستخدم (Pagination، ToastProvider).

5. **ملفات المانيفست**: إنشاء 7 ملفات مانيفست تحدد الهيكل وواجهات API ومتطلبات الترجمة لنشر الوظائف ومسح السيرة الذاتية وسير التقديم والمشاركة والتطوع والمنح والدورات.

6. **الإعدادات**: تحديث .env.example بجميع متغيرات البيئة المطلوبة وإضافة سير عمل CI للاختبار الآلي.

---

## Files Created/Modified | الملفات المُنشأة/المُعدّلة

### Infrastructure | البنية التحتية

| File | Description | الوصف |
|------|-------------|-------|
| `docker-compose.yml` | Added Redis, Typesense, Tika, Celery | إضافة Redis و Typesense و Tika و Celery |
| `.github/workflows/pr-checks.yml` | CI workflow for PR checks | سير عمل CI لفحص طلبات السحب |

### Frontend Packages | حزم الواجهة الأمامية

| Package | Purpose | الغرض |
|---------|---------|-------|
| `@radix-ui/react-*` | Accessible UI primitives | عناصر UI قابلة للوصول |
| `@headlessui/react` | Unstyled UI components | مكونات UI بدون تنسيق |
| `framer-motion` | Animations | الرسوم المتحركة |
| `zustand` | State management | إدارة الحالة |
| `@tanstack/react-query` | Server state | حالة الخادم |
| `react-hook-form` | Form handling | معالجة النماذج |
| `zod` | Schema validation | التحقق من المخطط |
| `vitest` | Unit testing | اختبارات الوحدة |
| `@playwright/test` | E2E testing | اختبارات E2E |
| `@storybook/react` | Component docs | توثيق المكونات |

### Pages Created | الصفحات المُنشأة

| Path | Description | الوصف |
|------|-------------|-------|
| `src/app/[locale]/jobs/page.tsx` | Jobs listing | قائمة الوظائف |
| `src/app/[locale]/jobs/[id]/page.tsx` | Job details | تفاصيل الوظيفة |
| `src/app/[locale]/volunteering/page.tsx` | Volunteering opportunities | فرص التطوع |
| `src/app/[locale]/scholarships/page.tsx` | Scholarships listing | قائمة المنح الدراسية |
| `src/app/[locale]/courses/page.tsx` | Courses listing | قائمة الدورات |
| `src/app/[locale]/auth/login/page.tsx` | Login page | صفحة تسجيل الدخول |
| `src/app/[locale]/auth/register/page.tsx` | Registration page | صفحة التسجيل |
| `src/app/[locale]/me/dashboard/page.tsx` | User dashboard | لوحة تحكم المستخدم |
| `src/app/[locale]/org/[orgId]/dashboard/page.tsx` | Org dashboard | لوحة تحكم المؤسسة |

### Components Created | المكونات المُنشأة

| Path | Description | الوصف |
|------|-------------|-------|
| `src/components/layout/MobileMenu.tsx` | Mobile navigation | التنقل على الجوال |
| `src/components/layout/LanguageSwitcher.tsx` | AR/EN language toggle | تبديل اللغة عربي/إنجليزي |
| `src/components/layout/UserMenu.tsx` | User dropdown menu | قائمة المستخدم المنسدلة |
| `src/components/jobs/JobCard.tsx` | Job listing card | بطاقة قائمة الوظائف |
| `src/components/apply/QuickApplyForm.tsx` | Quick apply form | نموذج التقديم السريع |
| `src/components/shared/ShareButtons.tsx` | Social sharing | أزرار المشاركة الاجتماعية |
| `src/components/notifications/ToastProvider.tsx` | Toast notifications | إشعارات Toast |
| `src/components/opportunities/OpportunityCard.tsx` | Generic opportunity card | بطاقة فرص عامة |
| `src/components/opportunities/OpportunityFilters.tsx` | Filters component | مكون الفلاتر |
| `src/components/ui/Pagination.tsx` | Pagination component | مكون ترقيم الصفحات |

### Feature Manifests | ملفات المانيفست

| Feature | Path | Description | الوصف |
|---------|------|-------------|-------|
| Job Posting | `features/job-posting/manifest.json` | Job listing & management | نشر وإدارة الوظائف |
| CV Scan | `features/cv-scan/manifest.json` | Resume parsing with AI | تحليل السيرة الذاتية بالذكاء الاصطناعي |
| Apply Flow | `features/apply-flow/manifest.json` | Application workflow | سير عمل التقديم |
| Sharing | `features/sharing/manifest.json` | Social sharing | المشاركة الاجتماعية |
| Volunteering | `features/volunteering/manifest.json` | Volunteering opportunities | فرص التطوع |
| Scholarships | `features/scholarships/manifest.json` | Scholarships discovery | اكتشاف المنح |
| Courses | `features/courses/manifest.json` | Online courses | الدورات التدريبية |

### Configuration Files | ملفات الإعدادات

| File | Description | الوصف |
|------|-------------|-------|
| `frontend/web/.env.example` | Environment variables template | قالب متغيرات البيئة |
| `frontend/web/next.config.mjs` | Next.js configuration | إعدادات Next.js |
| `frontend/web/tailwind.config.js` | Tailwind CSS configuration | إعدادات Tailwind CSS |
| `frontend/web/tsconfig.json` | TypeScript configuration | إعدادات TypeScript |
| `frontend/web/vitest.config.ts` | Vitest testing config | إعدادات اختبار Vitest |
| `frontend/web/messages/ar.json` | Arabic translations | الترجمة العربية |
| `frontend/web/messages/en.json` | English translations | الترجمة الإنجليزية |

---

## Environment Variables Added | متغيرات البيئة المُضافة

```bash
# Market configuration
NEXT_PUBLIC_MARKET_DEFAULT=jo
ENABLED_MARKETS=jo,sa,ae

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=forsati
POSTGRES_PASSWORD=forsati
POSTGRES_DB=forsati

# Typesense Search
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=forsati_typesense_key

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
HUGGINGFACE_API_KEY=hf_your-huggingface-api-key
```

---

## Commands to Run | الأوامر للتشغيل

### Start Infrastructure | بدء البنية التحتية
```bash
docker compose up -d
```

### Install Dependencies | تثبيت الاعتماديات
```bash
cd frontend/web
pnpm install
```

### Start Development Server | بدء خادم التطوير
```bash
pnpm dev
```

### Run Tests | تشغيل الاختبارات
```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm storybook     # Component documentation
```

---

## Health Check URLs | روابط فحص الصحة

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| Strapi CMS | http://localhost:1337/admin | Strapi admin panel |
| Keycloak | http://localhost:8080 | Auth admin console |
| MinIO | http://localhost:9001 | MinIO console |
| Ingestor | http://localhost:8000/docs | API documentation |
| Typesense | http://localhost:8108/health | Search service health |
| Redis | localhost:6379 | Cache service |

---

## Commits | الالتزامات

1. `feat(infra): add Redis, Typesense, Tika & Celery to docker-compose`
2. `feat(deps): install UI, state, form & testing packages`
3. `feat(ui): add pages & components for opportunities platform`
4. `feat(manifests): add feature manifests for all platform features`
5. `feat(config): add .env.example & CI workflow`
6. `feat(config): add Next.js, Tailwind, TS, i18n & e2e configs`
7. `docs: add OpenAPI specs for ingestor and opportunities APIs`

---

## Next Steps | الخطوات التالية

1. **Review & Merge**: Review this PR and merge to main
2. **Configure Secrets**: Add secrets to GitHub repository settings
3. **Start Services**: Run `docker compose up -d` to start infrastructure
4. **Test Locally**: Run `pnpm dev` and verify all pages load correctly
5. **Add Data**: Configure Strapi with sample opportunities data

---

## References | المراجع

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)
- [Typesense](https://typesense.org/docs)
- [Apache Tika](https://tika.apache.org)

---

**Generated**: {{ date }}
**Branch**: `chore/setup-deps-and-manifests`
**PR**: Pending
