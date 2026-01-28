# تقرير Step A — Bootstrap | Step A Report — Bootstrap

**التاريخ | Date**: 2026-01-28  
**الحالة | Status**: ✅ PASS (Prerequisites) | ⏳ PENDING (Services)

---

## العربية

### ملخص

تم إنشاء هيكل منصة فرصتي الأساسي بنجاح مع جميع الملفات المطلوبة للتشغيل.

### المتطلبات المتحققة ✅

| الأداة | الإصدار | الحالة |
| ------ | ------- | ------ |
| Git | 2.51.0 | ✅ |
| Docker | 29.1.3 | ✅ |
| Docker Compose | 2.40.3 | ✅ |
| Node.js | 22.18.0 | ✅ |
| npm | 10.9.3 | ✅ |
| Python | 3.12.10 | ✅ |

### الملفات المنشأة

```text
forsati-platform/
├── .env.example                              # متغيرات البيئة
├── .gitignore                                # استثناءات Git
├── .gitmodules                               # تعريف الـ submodules
├── docker-compose.yml                        # تعريف الحاويات
├── README.md                                 # توثيق المشروع
├── features/
│   └── platform-bootstrap/
│       └── manifest.json                     # manifest الميزة
├── roles/
│   └── keycloak-roles.json                   # تعريف الأدوار
├── scripts/
│   ├── bootstrap.sh                          # سكريبت التهيئة (Bash)
│   ├── bootstrap.ps1                         # سكريبت التهيئة (PowerShell)
│   ├── keycloak_create_roles.sh              # إنشاء أدوار Keycloak
│   └── validate_manifests.py                 # التحقق من الـ manifests
└── services/
    └── ingestor/
        ├── main.py                           # خدمة تحليل السير الذاتية
        ├── requirements.txt                  # اعتماديات Python
        └── Dockerfile                        # صورة Docker
```

### متغيرات البيئة المطلوبة (أسماء فقط — لا قيم)

```text
MARKET_DEFAULT, ENABLED_MARKETS
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
STRAPI_URL, STRAPI_API_TOKEN, STRAPI_APP_KEYS, STRAPI_API_TOKEN_SALT
STRAPI_ADMIN_JWT_SECRET, STRAPI_TRANSFER_TOKEN_SALT, STRAPI_JWT_SECRET
MINIO_ENDPOINT, MINIO_PORT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD
KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD
INGESTOR_URL, INGESTOR_API_KEY
```

### الـ Submodules المضافة (10 مشاريع)

| المسار | المشروع | الإصدار |
| ------ | ------- | ------- |
| services/strapi | Strapi CMS | v5.33.4 |
| services/directus | Directus | v9.14.1 |
| services/pyresparser | PyResParser | v1.0.6 |
| services/opencats | OpenCATS | 0.9.7.4 |
| services/jitsi | Jitsi Meet | stable-10008 |
| services/rasa | Rasa | 3.6.20 |
| services/botpress | Botpress | latest |
| services/appsmith | Appsmith | v1.2.24 |
| frontend/ant-design-pro | Ant Design Pro | v6.0.0 |
| frontend/nextjs-examples | Next.js | v16.2.0 |

### الخطوات التالية

1. نسخ `.env.example` إلى `.env`
2. تعبئة القيم السرية في `.env`
3. تشغيل `docker-compose up -d`
4. التحقق من صحة الخدمات

### المصادر المرجعية

- Docker Compose: <https://docs.docker.com/compose/>
- Strapi: <https://docs.strapi.io>
- Keycloak: <https://www.keycloak.org/documentation>
- MinIO: <https://min.io/docs>
- FastAPI: <https://fastapi.tiangolo.com>

---

## English

### Summary

Successfully created the Forsati platform base structure with all required files for operation.

### Prerequisites Verified ✅

| Tool | Version | Status |
| ---- | ------- | ------ |
| Git | 2.51.0 | ✅ |
| Docker | 29.1.3 | ✅ |
| Docker Compose | 2.40.3 | ✅ |
| Node.js | 22.18.0 | ✅ |
| npm | 10.9.3 | ✅ |
| Python | 3.12.10 | ✅ |

### Files Created

```text
forsati-platform/
├── .env.example                              # Environment variables
├── .gitignore                                # Git exclusions
├── .gitmodules                               # Submodules definition
├── docker-compose.yml                        # Container definitions
├── README.md                                 # Project documentation
├── features/
│   └── platform-bootstrap/
│       └── manifest.json                     # Feature manifest
├── roles/
│   └── keycloak-roles.json                   # Role definitions
├── scripts/
│   ├── bootstrap.sh                          # Bootstrap script (Bash)
│   ├── bootstrap.ps1                         # Bootstrap script (PowerShell)
│   ├── keycloak_create_roles.sh              # Keycloak roles creation
│   └── validate_manifests.py                 # Manifest validator
└── services/
    └── ingestor/
        ├── main.py                           # Resume parser service
        ├── requirements.txt                  # Python dependencies
        └── Dockerfile                        # Docker image
```

### Required Environment Variables (names only — no values)

```text
MARKET_DEFAULT, ENABLED_MARKETS
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
STRAPI_URL, STRAPI_API_TOKEN, STRAPI_APP_KEYS, STRAPI_API_TOKEN_SALT
STRAPI_ADMIN_JWT_SECRET, STRAPI_TRANSFER_TOKEN_SALT, STRAPI_JWT_SECRET
MINIO_ENDPOINT, MINIO_PORT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD
KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD
INGESTOR_URL, INGESTOR_API_KEY
```

### Submodules Added (10 projects)

| Path | Project | Version |
| ---- | ------- | ------- |
| services/strapi | Strapi CMS | v5.33.4 |
| services/directus | Directus | v9.14.1 |
| services/pyresparser | PyResParser | v1.0.6 |
| services/opencats | OpenCATS | 0.9.7.4 |
| services/jitsi | Jitsi Meet | stable-10008 |
| services/rasa | Rasa | 3.6.20 |
| services/botpress | Botpress | latest |
| services/appsmith | Appsmith | v1.2.24 |
| frontend/ant-design-pro | Ant Design Pro | v6.0.0 |
| frontend/nextjs-examples | Next.js | v16.2.0 |

### Next Steps

1. Copy `.env.example` to `.env`
2. Fill secret values in `.env`
3. Run `docker-compose up -d`
4. Verify services health

### References

- Docker Compose: <https://docs.docker.com/compose/>
- Strapi: <https://docs.strapi.io>
- Keycloak: <https://www.keycloak.org/documentation>
- MinIO: <https://min.io/docs>
- FastAPI: <https://fastapi.tiangolo.com>

---

## Service URLs (After Starting)

| Service | URL | Purpose |
| ------- | --- | ------- |
| Strapi Admin | `http://localhost:1337/admin` | Content Management |
| MinIO Console | `http://localhost:9001` | File Storage |
| Keycloak Admin | `http://localhost:8080/admin` | Identity Management |
| Ingestor Docs | `http://localhost:8000/docs` | Resume Parser API |
| PostgreSQL | `localhost:5432` | Database |

---

## Validation Results

```text
✅ Manifest Validation: PASS
   - features/platform-bootstrap/manifest.json: VALID
   - Markets: [jo, sa, ae]
   - Roles: [admin]
```

---

**Report Generated**: 2026-01-28  
**Branch**: main  
**Status**: Ready for docker-compose | جاهز لتشغيل docker-compose
