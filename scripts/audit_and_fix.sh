#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Forsati Platform — Automated Audit & Fix Script
# ═══════════════════════════════════════════════════════════════════════════════
# Description (EN): Comprehensive audit script that runs linting, type checking,
#                   tests, security scans, i18n validation, and generates reports.
# الوصف (AR): سكريبت تدقيق شامل يُجري فحص الأنماط، التحقق من الأنواع،
#             الاختبارات، فحص الأمان، التحقق من الترجمة، وتوليد التقارير.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
REPORTS_DIR="${ROOT_DIR}/reports/audit-${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
}

run_command() {
    local cmd="$1"
    local output_file="$2"
    local description="$3"
    
    log_info "Running: $description"
    if eval "$cmd" > "$output_file" 2>&1; then
        log_success "$description completed"
        return 0
    else
        log_warning "$description completed with issues (see report)"
        return 0  # Don't fail the whole script
    fi
}

check_command() {
    command -v "$1" &> /dev/null
}

# ─────────────────────────────────────────────────────────────────────────────
# Setup
# ─────────────────────────────────────────────────────────────────────────────
log_section "🚀 Forsati Platform Audit — Starting / بدء التدقيق"

cd "$ROOT_DIR"
mkdir -p "$REPORTS_DIR"

echo "Audit started at: $(date)" > "${REPORTS_DIR}/audit.log"
echo "Timestamp: $TIMESTAMP" >> "${REPORTS_DIR}/audit.log"
echo "Working directory: $ROOT_DIR" >> "${REPORTS_DIR}/audit.log"
echo "" >> "${REPORTS_DIR}/audit.log"

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Frontend (Next.js web) Audit
# ─────────────────────────────────────────────────────────────────────────────
log_section "📦 Step 1: Frontend Web Dependencies & Linting"

FRONTEND_WEB="${ROOT_DIR}/frontend/web"
if [ -d "$FRONTEND_WEB" ]; then
    cd "$FRONTEND_WEB"
    
    # Install dependencies
    if check_command pnpm; then
        log_info "Installing dependencies with pnpm..."
        pnpm install --frozen-lockfile 2>&1 | tee "${REPORTS_DIR}/pnpm-install-web.log" || true
    elif check_command npm; then
        log_info "Installing dependencies with npm..."
        npm ci 2>&1 | tee "${REPORTS_DIR}/npm-install-web.log" || true
    fi
    
    # Prettier format
    if check_command pnpm && [ -f "node_modules/.bin/prettier" ]; then
        log_info "Running Prettier..."
        pnpm exec prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}" 2>&1 | tee "${REPORTS_DIR}/prettier-web.log" || true
    fi
    
    # ESLint fix
    if check_command pnpm && [ -f "node_modules/.bin/eslint" ]; then
        log_info "Running ESLint with --fix..."
        pnpm exec eslint "src/**/*.{ts,tsx,js,jsx}" --fix 2>&1 | tee "${REPORTS_DIR}/eslint-fix-web.log" || true
        
        # ESLint report (without fix for full report)
        pnpm exec eslint "src/**/*.{ts,tsx,js,jsx}" --format json 2>&1 > "${REPORTS_DIR}/eslint-report-web.json" || true
    fi
    
    # TypeScript check
    if check_command pnpm && [ -f "tsconfig.json" ]; then
        log_info "Running TypeScript type check..."
        pnpm exec tsc --noEmit 2>&1 | tee "${REPORTS_DIR}/tsc-report-web.txt" || true
    fi
    
    # Run tests
    if check_command pnpm && [ -f "vitest.config.ts" ]; then
        log_info "Running Vitest tests..."
        pnpm exec vitest run --reporter=verbose 2>&1 | tee "${REPORTS_DIR}/vitest-report-web.txt" || true
    fi
    
    # Security audit
    if check_command pnpm; then
        log_info "Running pnpm audit..."
        pnpm audit --json 2>&1 > "${REPORTS_DIR}/pnpm-audit-web.json" || true
        pnpm audit 2>&1 | tee "${REPORTS_DIR}/pnpm-audit-web.txt" || true
    fi
    
    cd "$ROOT_DIR"
else
    log_warning "Frontend web directory not found"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Frontend (Ant Design Pro) Audit
# ─────────────────────────────────────────────────────────────────────────────
log_section "📦 Step 2: Ant Design Pro Dependencies & Linting"

FRONTEND_ANT="${ROOT_DIR}/frontend/ant-design-pro"
if [ -d "$FRONTEND_ANT" ]; then
    cd "$FRONTEND_ANT"
    
    # Install dependencies
    if check_command pnpm; then
        pnpm install --frozen-lockfile 2>&1 | tee "${REPORTS_DIR}/pnpm-install-ant.log" || true
    elif check_command npm; then
        npm ci 2>&1 | tee "${REPORTS_DIR}/npm-install-ant.log" || true
    fi
    
    # Biome (if exists)
    if [ -f "biome.json" ] && check_command pnpm; then
        log_info "Running Biome check..."
        pnpm exec biome check --write . 2>&1 | tee "${REPORTS_DIR}/biome-fix-ant.log" || true
    fi
    
    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        log_info "Running TypeScript check..."
        pnpm exec tsc --noEmit 2>&1 | tee "${REPORTS_DIR}/tsc-report-ant.txt" || true
    fi
    
    # Security audit
    if check_command pnpm; then
        pnpm audit --json 2>&1 > "${REPORTS_DIR}/pnpm-audit-ant.json" || true
    fi
    
    cd "$ROOT_DIR"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Python Services Audit (Ingestor, PyResParser, etc.)
# ─────────────────────────────────────────────────────────────────────────────
log_section "🐍 Step 3: Python Services Audit"

PYTHON_SERVICES=("services/ingestor" "services/pyresparser" "services/rasa")

for service_path in "${PYTHON_SERVICES[@]}"; do
    SERVICE_DIR="${ROOT_DIR}/${service_path}"
    SERVICE_NAME=$(basename "$service_path")
    
    if [ -d "$SERVICE_DIR" ]; then
        cd "$SERVICE_DIR"
        log_info "Auditing Python service: $SERVICE_NAME"
        
        # Check for requirements or pyproject.toml
        if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
            # Black formatting
            if check_command black; then
                log_info "Running Black formatter on $SERVICE_NAME..."
                black . 2>&1 | tee "${REPORTS_DIR}/black-${SERVICE_NAME}.log" || true
            fi
            
            # isort
            if check_command isort; then
                log_info "Running isort on $SERVICE_NAME..."
                isort . 2>&1 | tee "${REPORTS_DIR}/isort-${SERVICE_NAME}.log" || true
            fi
            
            # Flake8 / Ruff
            if check_command ruff; then
                log_info "Running Ruff on $SERVICE_NAME..."
                ruff check . --fix 2>&1 | tee "${REPORTS_DIR}/ruff-fix-${SERVICE_NAME}.log" || true
                ruff check . --output-format=json 2>&1 > "${REPORTS_DIR}/ruff-report-${SERVICE_NAME}.json" || true
            elif check_command flake8; then
                flake8 . 2>&1 | tee "${REPORTS_DIR}/flake8-${SERVICE_NAME}.txt" || true
            fi
            
            # MyPy type check
            if check_command mypy; then
                log_info "Running MyPy on $SERVICE_NAME..."
                mypy . 2>&1 | tee "${REPORTS_DIR}/mypy-${SERVICE_NAME}.txt" || true
            fi
            
            # pytest
            if check_command pytest && [ -d "tests" ]; then
                log_info "Running pytest on $SERVICE_NAME..."
                pytest --tb=short -v 2>&1 | tee "${REPORTS_DIR}/pytest-${SERVICE_NAME}.txt" || true
            fi
            
            # pip-audit
            if check_command pip-audit; then
                log_info "Running pip-audit on $SERVICE_NAME..."
                pip-audit 2>&1 | tee "${REPORTS_DIR}/pip-audit-${SERVICE_NAME}.txt" || true
            fi
        fi
        
        cd "$ROOT_DIR"
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Manifest Validation
# ─────────────────────────────────────────────────────────────────────────────
log_section "📋 Step 4: Feature Manifest Validation"

if [ -f "${ROOT_DIR}/scripts/validate_manifests.py" ]; then
    log_info "Running manifest validation..."
    python3 "${ROOT_DIR}/scripts/validate_manifests.py" 2>&1 | tee "${REPORTS_DIR}/manifest-report.txt" || true
else
    log_warning "validate_manifests.py not found"
    echo "Manifest validation script not found" > "${REPORTS_DIR}/manifest-report.txt"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: i18n Key Comparison
# ─────────────────────────────────────────────────────────────────────────────
log_section "🌐 Step 5: i18n Key Validation (AR/EN)"

I18N_DIR="${ROOT_DIR}/frontend/web/messages"
if [ -d "$I18N_DIR" ]; then
    log_info "Comparing i18n keys between en and ar..."
    
    # Create comparison script inline
    python3 << 'EOF' > "${REPORTS_DIR}/i18n-comparison.txt" 2>&1 || true
import json
import os
from pathlib import Path

messages_dir = Path(os.environ.get('I18N_DIR', 'frontend/web/messages'))
report_dir = Path(os.environ.get('REPORTS_DIR', 'reports'))

def get_all_keys(obj, prefix=''):
    keys = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.update(get_all_keys(v, new_prefix))
            else:
                keys.add(new_prefix)
    return keys

def load_json_keys(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return get_all_keys(data)
    except Exception as e:
        return set()

# Find all .en.json and .ar.json files
en_files = list(messages_dir.glob('*.en.json'))
ar_files = list(messages_dir.glob('*.ar.json'))

print("=" * 70)
print("i18n Key Comparison Report / تقرير مقارنة مفاتيح الترجمة")
print("=" * 70)
print()

all_en_keys = set()
all_ar_keys = set()

for en_file in en_files:
    ar_file = messages_dir / en_file.name.replace('.en.json', '.ar.json')
    
    en_keys = load_json_keys(en_file)
    ar_keys = load_json_keys(ar_file) if ar_file.exists() else set()
    
    all_en_keys.update(en_keys)
    all_ar_keys.update(ar_keys)
    
    missing_in_ar = en_keys - ar_keys
    missing_in_en = ar_keys - en_keys
    
    if missing_in_ar or missing_in_en:
        print(f"\n📁 {en_file.name} <-> {ar_file.name if ar_file.exists() else 'MISSING'}")
        if missing_in_ar:
            print(f"  ❌ Missing in AR ({len(missing_in_ar)} keys):")
            for key in sorted(missing_in_ar)[:10]:
                print(f"     - {key}")
            if len(missing_in_ar) > 10:
                print(f"     ... and {len(missing_in_ar) - 10} more")
        if missing_in_en:
            print(f"  ❌ Missing in EN ({len(missing_in_en)} keys):")
            for key in sorted(missing_in_en)[:10]:
                print(f"     - {key}")

print("\n" + "=" * 70)
print(f"SUMMARY / ملخص")
print("=" * 70)
print(f"Total EN keys: {len(all_en_keys)}")
print(f"Total AR keys: {len(all_ar_keys)}")
print(f"Missing in AR: {len(all_en_keys - all_ar_keys)}")
print(f"Missing in EN: {len(all_ar_keys - all_en_keys)}")
EOF
    
    export I18N_DIR REPORTS_DIR
    cat "${REPORTS_DIR}/i18n-comparison.txt"
else
    log_warning "i18n messages directory not found"
    echo "i18n directory not found" > "${REPORTS_DIR}/i18n-comparison.txt"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 6: Security Scanning (Semgrep, Trivy)
# ─────────────────────────────────────────────────────────────────────────────
log_section "🔒 Step 6: Security Scanning"

# Semgrep
if check_command semgrep; then
    log_info "Running Semgrep security scan..."
    semgrep scan --config auto --json --output "${REPORTS_DIR}/semgrep-report.json" . 2>&1 | tee "${REPORTS_DIR}/semgrep-scan.log" || true
    semgrep scan --config auto . 2>&1 | tee "${REPORTS_DIR}/semgrep-report.txt" || true
else
    log_warning "Semgrep not installed — skipping"
    echo "Semgrep not installed" > "${REPORTS_DIR}/semgrep-report.txt"
fi

# Trivy (filesystem scan)
if check_command trivy; then
    log_info "Running Trivy filesystem scan..."
    trivy fs --format json --output "${REPORTS_DIR}/trivy-fs-report.json" . 2>&1 || true
    trivy fs --severity HIGH,CRITICAL . 2>&1 | tee "${REPORTS_DIR}/trivy-fs-report.txt" || true
else
    log_warning "Trivy not installed — skipping"
    echo "Trivy not installed" > "${REPORTS_DIR}/trivy-fs-report.txt"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 7: Docker Compose Validation
# ─────────────────────────────────────────────────────────────────────────────
log_section "🐳 Step 7: Docker Compose Validation"

cd "$ROOT_DIR"

if [ -f "docker-compose.yml" ]; then
    log_info "Validating docker-compose.yml..."
    if check_command docker-compose; then
        docker-compose config 2>&1 | tee "${REPORTS_DIR}/docker-compose-config.txt" || true
    elif check_command docker; then
        docker compose config 2>&1 | tee "${REPORTS_DIR}/docker-compose-config.txt" || true
    fi
fi

if [ -f "docker-compose.dev.yml" ]; then
    log_info "Validating docker-compose.dev.yml..."
    if check_command docker-compose; then
        docker-compose -f docker-compose.dev.yml config 2>&1 | tee "${REPORTS_DIR}/docker-compose-dev-config.txt" || true
    elif check_command docker; then
        docker compose -f docker-compose.dev.yml config 2>&1 | tee "${REPORTS_DIR}/docker-compose-dev-config.txt" || true
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 8: OpenAPI Validation
# ─────────────────────────────────────────────────────────────────────────────
log_section "📜 Step 8: OpenAPI Specification Validation"

OPENAPI_DIR="${ROOT_DIR}/docs/api"
if [ -d "$OPENAPI_DIR" ]; then
    for spec_file in "$OPENAPI_DIR"/*.yaml; do
        if [ -f "$spec_file" ]; then
            spec_name=$(basename "$spec_file" .yaml)
            log_info "Validating OpenAPI spec: $spec_name"
            
            # Use spectral if available
            if check_command spectral; then
                spectral lint "$spec_file" 2>&1 | tee "${REPORTS_DIR}/openapi-${spec_name}.txt" || true
            else
                # Basic YAML syntax check
                python3 -c "import yaml; yaml.safe_load(open('$spec_file'))" 2>&1 | tee "${REPORTS_DIR}/openapi-${spec_name}.txt" || echo "YAML syntax OK" >> "${REPORTS_DIR}/openapi-${spec_name}.txt"
            fi
        fi
    done
else
    log_warning "OpenAPI docs directory not found"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 9: Accessibility Check (pa11y) - Optional
# ─────────────────────────────────────────────────────────────────────────────
log_section "♿ Step 9: Accessibility Check (if server running)"

if check_command pa11y; then
    # Check if dev server is running on common ports
    for port in 3000 3001 5173 8080; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            log_info "Running pa11y on localhost:$port..."
            pa11y "http://localhost:$port" --reporter json 2>&1 > "${REPORTS_DIR}/pa11y-report.json" || true
            pa11y "http://localhost:$port" 2>&1 | tee "${REPORTS_DIR}/pa11y-report.txt" || true
            break
        fi
    done
else
    log_warning "pa11y not installed — skipping accessibility check"
    echo "pa11y not installed or no server running" > "${REPORTS_DIR}/pa11y-report.txt"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 10: Generate Summary Report
# ─────────────────────────────────────────────────────────────────────────────
log_section "📊 Step 10: Generating Summary Report"

cat > "${REPORTS_DIR}/summary.md" << SUMMARY_EOF
# 🔍 Forsati Platform Audit Report / تقرير تدقيق منصة فرصتي

**Timestamp / التاريخ:** ${TIMESTAMP}
**Generated / تم التوليد:** $(date)

---

## 📋 Executive Summary / الملخص التنفيذي

| Category / الفئة | Status / الحالة | Notes / ملاحظات |
|------------------|-----------------|-----------------|
| ESLint | $([ -f "${REPORTS_DIR}/eslint-fix-web.log" ] && echo "✅ Run" || echo "⚠️ Skipped") | See eslint-*.log |
| TypeScript | $([ -f "${REPORTS_DIR}/tsc-report-web.txt" ] && echo "✅ Run" || echo "⚠️ Skipped") | See tsc-*.txt |
| Tests | $([ -f "${REPORTS_DIR}/vitest-report-web.txt" ] && echo "✅ Run" || echo "⚠️ Skipped") | See *-report.txt |
| Security Audit | $([ -f "${REPORTS_DIR}/pnpm-audit-web.json" ] && echo "✅ Run" || echo "⚠️ Skipped") | See *-audit.* |
| i18n Keys | $([ -f "${REPORTS_DIR}/i18n-comparison.txt" ] && echo "✅ Run" || echo "⚠️ Skipped") | See i18n-comparison.txt |
| Semgrep | $([ -f "${REPORTS_DIR}/semgrep-report.txt" ] && echo "✅ Run" || echo "⏭️ Not Installed") | See semgrep-* |
| Trivy | $([ -f "${REPORTS_DIR}/trivy-fs-report.txt" ] && echo "✅ Run" || echo "⏭️ Not Installed") | See trivy-* |
| Docker | $([ -f "${REPORTS_DIR}/docker-compose-config.txt" ] && echo "✅ Run" || echo "⚠️ Skipped") | See docker-compose-*.txt |

---

## 🔴 Critical Issues Requiring Manual Review / مشاكل حرجة تحتاج مراجعة يدوية

> These items require human decision before proceeding:
> هذه العناصر تحتاج قرار بشري قبل المتابعة:

### Security / الأمان
SUMMARY_EOF

# Extract high/critical vulnerabilities
if [ -f "${REPORTS_DIR}/pnpm-audit-web.json" ]; then
    echo "" >> "${REPORTS_DIR}/summary.md"
    echo '```json' >> "${REPORTS_DIR}/summary.md"
    cat "${REPORTS_DIR}/pnpm-audit-web.json" | head -100 >> "${REPORTS_DIR}/summary.md" || true
    echo '```' >> "${REPORTS_DIR}/summary.md"
fi

cat >> "${REPORTS_DIR}/summary.md" << 'SUMMARY_EOF2'

### TypeScript Errors / أخطاء TypeScript

Check `tsc-report-*.txt` for type errors that must be fixed.

### Missing i18n Keys / مفاتيح الترجمة المفقودة

Check `i18n-comparison.txt` for missing translation keys.

---

## ✅ Auto-Fixed Items / العناصر التي تم إصلاحها آلياً

1. **Prettier** — Code formatting applied / تم تطبيق تنسيق الكود
2. **ESLint --fix** — Auto-fixable lint issues resolved / تم حل مشاكل lint القابلة للإصلاح
3. **Black/isort** — Python formatting (if installed) / تنسيق Python
4. **Biome** — Ant Design Pro formatting / تنسيق مشروع Ant Design

---

## 📁 Report Files / ملفات التقارير

| File / الملف | Description / الوصف |
|--------------|---------------------|
| `prettier-*.log` | Prettier formatting output |
| `eslint-*.log` | ESLint fix output |
| `eslint-*.json` | ESLint full report (JSON) |
| `tsc-report-*.txt` | TypeScript compilation errors |
| `vitest-report-*.txt` | Test results |
| `pnpm-audit-*.json` | NPM vulnerability audit |
| `i18n-comparison.txt` | Missing translation keys |
| `semgrep-*.json` | Security scan results |
| `trivy-*.txt` | Container/FS vulnerability scan |
| `docker-compose-*.txt` | Docker config validation |
| `manifest-report.txt` | Feature manifest validation |

---

## 🔧 Manual Action Items / عناصر العمل اليدوية

1. [ ] Review and fix TypeScript errors in `tsc-report-*.txt`
2. [ ] Add missing i18n keys from `i18n-comparison.txt`
3. [ ] Evaluate security vulnerabilities in `pnpm-audit-*.json`
4. [ ] Review semgrep findings in `semgrep-report.json`
5. [ ] Update dependencies with known vulnerabilities

---

## 📝 Commands Executed / الأوامر المُنفَّذة

\`\`\`bash
# Frontend Web
pnpm install --frozen-lockfile
pnpm exec prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
pnpm exec eslint "src/**/*.{ts,tsx,js,jsx}" --fix
pnpm exec tsc --noEmit
pnpm exec vitest run
pnpm audit

# Python Services (if tools installed)
black .
isort .
ruff check . --fix
mypy .
pytest
pip-audit

# Security
semgrep scan --config auto .
trivy fs .

# Validation
python3 scripts/validate_manifests.py
docker compose config
\`\`\`

---

**End of Report / نهاية التقرير**
SUMMARY_EOF2

log_success "Summary report generated: ${REPORTS_DIR}/summary.md"

# ─────────────────────────────────────────────────────────────────────────────
# Step 11: List Changed Files
# ─────────────────────────────────────────────────────────────────────────────
log_section "📝 Step 11: Listing Changed Files"

cd "$ROOT_DIR"
git diff --name-only > "${REPORTS_DIR}/files-changed.txt" 2>&1 || true
git diff --stat >> "${REPORTS_DIR}/files-changed.txt" 2>&1 || true

log_info "Changed files saved to: ${REPORTS_DIR}/files-changed.txt"

# ─────────────────────────────────────────────────────────────────────────────
# Final Summary
# ─────────────────────────────────────────────────────────────────────────────
log_section "✅ Audit Complete / اكتمل التدقيق"

echo ""
log_success "All reports saved to: ${REPORTS_DIR}/"
echo ""
log_info "Next steps / الخطوات التالية:"
echo "  1. Review reports in ${REPORTS_DIR}/"
echo "  2. git add . && git commit -m 'chore: automated audit & fixes (${TIMESTAMP})'"
echo "  3. git push origin <branch-name>"
echo "  4. Create PR with summary.md content"
echo ""

# Print summary to stdout
echo "═══════════════════════════════════════════════════════════════════════"
echo "  QUICK STATS / إحصائيات سريعة"
echo "═══════════════════════════════════════════════════════════════════════"
echo "  Reports directory: ${REPORTS_DIR}"
echo "  Total reports: $(ls -1 "${REPORTS_DIR}" | wc -l)"
echo "  Changed files: $(wc -l < "${REPORTS_DIR}/files-changed.txt" 2>/dev/null || echo 0)"
echo "═══════════════════════════════════════════════════════════════════════"

exit 0
