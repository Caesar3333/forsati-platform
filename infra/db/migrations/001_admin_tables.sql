-- ============================================
-- Forsati Platform - Admin System Tables
-- نظام الإدارة - جداول قاعدة البيانات
-- Migration: 001_admin_tables.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Feature Flags Table
-- جدول أعلام الميزات
-- ============================================
CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    label_ar TEXT,
    description TEXT,
    description_ar TEXT,
    category TEXT NOT NULL DEFAULT 'core' CHECK (category IN ('core', 'ai', 'social', 'monetization', 'experimental')),
    default_value BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT false,
    rollout_json JSONB DEFAULT '{}'::jsonb,
    -- rollout_json structure: {markets:["jo","sa"], roles:["recruiter"], percentage:20}
    dependencies TEXT[] DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_category ON feature_flags(category);
CREATE INDEX idx_feature_flags_active ON feature_flags(active);

-- ============================================
-- Gift Codes Table
-- جدول أكواد الهدايا
-- ============================================
CREATE TABLE IF NOT EXISTS gift_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'free_post', 'free_scan', 'discount', 'points', 'premium_trial')),
    value NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    target_roles TEXT[] DEFAULT '{}',
    markets TEXT[] DEFAULT '{}',
    campaign TEXT,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX idx_gift_codes_code ON gift_codes(code);
CREATE INDEX idx_gift_codes_type ON gift_codes(type);
CREATE INDEX idx_gift_codes_active ON gift_codes(active) WHERE deleted_at IS NULL;
CREATE INDEX idx_gift_codes_campaign ON gift_codes(campaign);
CREATE INDEX idx_gift_codes_expires ON gift_codes(expires_at) WHERE active = true;

-- ============================================
-- Gift Code Redemptions Table
-- جدول استخدامات الأكواد
-- ============================================
CREATE TABLE IF NOT EXISTS gift_code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_code_id UUID NOT NULL REFERENCES gift_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    applied_benefit TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redemptions_code ON gift_code_redemptions(gift_code_id);
CREATE INDEX idx_redemptions_user ON gift_code_redemptions(user_id);
CREATE UNIQUE INDEX idx_redemptions_unique ON gift_code_redemptions(gift_code_id, user_id);

-- ============================================
-- Loyalty Points Account Table
-- جدول حسابات نقاط الولاء
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0,
    lifetime_earned BIGINT NOT NULL DEFAULT 0,
    lifetime_redeemed BIGINT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_user ON loyalty_accounts(user_id);
CREATE INDEX idx_loyalty_tier ON loyalty_accounts(tier);
CREATE INDEX idx_loyalty_balance ON loyalty_accounts(balance DESC);

-- ============================================
-- Loyalty Points Transactions Table
-- جدول معاملات النقاط
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    amount BIGINT NOT NULL, -- positive for earn, negative for redeem
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'adjust', 'expire', 'transfer')),
    reason TEXT NOT NULL,
    description TEXT,
    bonus_amount BIGINT DEFAULT 0,
    related_entity JSONB, -- {type: "gift_code", id: "xxx"} or {type: "job_application", id: "xxx"}
    created_by UUID, -- null for system, uuid for admin manual
    expires_at TIMESTAMPTZ, -- for points that expire
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_account ON loyalty_transactions(account_id);
CREATE INDEX idx_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX idx_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_transactions_reason ON loyalty_transactions(reason);
CREATE INDEX idx_transactions_created ON loyalty_transactions(created_at DESC);

-- ============================================
-- Points Earning Rules Table
-- جدول قواعد كسب النقاط
-- ============================================
CREATE TABLE IF NOT EXISTS points_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reason TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    label_ar TEXT,
    points INTEGER NOT NULL,
    max_per_day INTEGER, -- null means unlimited
    max_per_month INTEGER,
    active BOOLEAN DEFAULT true,
    target_roles TEXT[] DEFAULT '{}',
    conditions JSONB DEFAULT '{}'::jsonb, -- custom conditions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Points Rewards (Redemption Options) Table
-- جدول مكافآت الاستبدال
-- ============================================
CREATE TABLE IF NOT EXISTS points_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    cost INTEGER NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('cv_scan', 'job_post', 'premium_days', 'discount', 'feature_unlock', 'consultation')),
    reward_value JSONB NOT NULL, -- {scans: 1} or {days: 7} or {percent: 10}
    min_tier TEXT DEFAULT 'bronze',
    stock INTEGER, -- null means unlimited
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_active ON points_rewards(active) WHERE active = true;
CREATE INDEX idx_rewards_tier ON points_rewards(min_tier);

-- ============================================
-- Quotas Policy Table
-- جدول سياسات الحصص
-- ============================================
CREATE TABLE IF NOT EXISTS quota_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    resource TEXT NOT NULL CHECK (resource IN ('cv_scan', 'cover_letter', 'job_post', 'featured_post', 'candidate_search', 'interview_gen', 'ai_match', 'export_pdf', 'message', 'training_session')),
    monthly_allowance INTEGER NOT NULL DEFAULT 0, -- -1 means unlimited
    carry_over BOOLEAN DEFAULT false, -- unused quota carries to next month
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, resource)
);

CREATE INDEX idx_quotas_role ON quota_policies(role);
CREATE INDEX idx_quotas_resource ON quota_policies(resource);

-- ============================================
-- User Quotas Usage Table
-- جدول استخدام حصص المستخدمين
-- ============================================
CREATE TABLE IF NOT EXISTS user_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resource TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    bonus INTEGER NOT NULL DEFAULT 0, -- extra quota from gift codes, etc.
    period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
    resets_at TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource, period_start)
);

CREATE INDEX idx_user_quotas_user ON user_quotas(user_id);
CREATE INDEX idx_user_quotas_resource ON user_quotas(resource);
CREATE INDEX idx_user_quotas_period ON user_quotas(period_start);

-- ============================================
-- Platform Settings Table
-- جدول إعدادات المنصة
-- ============================================
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    label TEXT NOT NULL,
    label_ar TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    data_type TEXT NOT NULL DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'array')),
    is_sensitive BOOLEAN DEFAULT false, -- hide value in logs
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_category ON platform_settings(category);

-- ============================================
-- Email Templates Table
-- جدول قوالب البريد
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    subject_en TEXT NOT NULL,
    subject_ar TEXT NOT NULL,
    body_en TEXT NOT NULL,
    body_ar TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}', -- available variables like {name}, {company}
    category TEXT NOT NULL DEFAULT 'general',
    active BOOLEAN DEFAULT true,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_templates_key ON email_templates(key);
CREATE INDEX idx_email_templates_category ON email_templates(category);

-- ============================================
-- Audit Logs Table (Immutable)
-- جدول سجلات التدقيق
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID, -- Keycloak user id, null for system
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject', 'suspend', 'activate', 'assign_role', 'remove_role', 'redeem', 'award', 'adjust')),
    resource_type TEXT NOT NULL, -- feature_flag, gift_code, user, etc.
    resource_id TEXT,
    resource_name TEXT,
    changes JSONB, -- {before: {}, after: {}}
    payload JSONB, -- request body for context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for better performance
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_combined ON audit_logs(resource_type, action, created_at DESC);

-- Make audit logs append-only (no updates/deletes by normal users)
-- This would be enforced by application logic and DB permissions

-- ============================================
-- User Moderation Table
-- جدول إدارة المستخدمين
-- ============================================
CREATE TABLE IF NOT EXISTS user_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending_review')),
    reason TEXT,
    suspended_until TIMESTAMPTZ,
    notes TEXT,
    moderated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_user ON user_moderation(user_id);
CREATE INDEX idx_moderation_status ON user_moderation(status);

-- ============================================
-- Company Moderation Table
-- جدول إدارة الشركات
-- ============================================
CREATE TABLE IF NOT EXISTS company_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    reason TEXT,
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    moderated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_mod_company ON company_moderation(company_id);
CREATE INDEX idx_company_mod_status ON company_moderation(status);

-- ============================================
-- Promotions / Campaigns Table
-- جدول الحملات الترويجية
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('points_multiplier', 'bonus_points', 'discount', 'free_trial', 'referral_bonus')),
    value JSONB NOT NULL, -- {multiplier: 2} or {bonus: 100} or {percent: 20}
    conditions JSONB DEFAULT '{}'::jsonb, -- {min_purchase: 50, first_time: true}
    target_roles TEXT[] DEFAULT '{}',
    target_markets TEXT[] DEFAULT '{}',
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotions_active ON promotions(active, starts_at, ends_at);
CREATE INDEX idx_promotions_type ON promotions(type);

-- ============================================
-- Updated_at Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gift_codes_updated_at BEFORE UPDATE ON gift_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_accounts_updated_at BEFORE UPDATE ON loyalty_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_points_rules_updated_at BEFORE UPDATE ON points_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_points_rewards_updated_at BEFORE UPDATE ON points_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quota_policies_updated_at BEFORE UPDATE ON quota_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quotas_updated_at BEFORE UPDATE ON user_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_moderation_updated_at BEFORE UPDATE ON user_moderation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_moderation_updated_at BEFORE UPDATE ON company_moderation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (Optional)
-- ============================================
-- Enable RLS on sensitive tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- Audit logs: only super_admin can read all
CREATE POLICY audit_logs_admin_policy ON audit_logs
    FOR SELECT
    USING (current_setting('app.current_role', true) IN ('super_admin', 'admin'));

-- Users can only see their own loyalty account
CREATE POLICY loyalty_own_policy ON loyalty_accounts
    FOR SELECT
    USING (user_id::text = current_setting('app.current_user_id', true) 
           OR current_setting('app.current_role', true) IN ('super_admin', 'admin'));

-- Users can only see their own quotas
CREATE POLICY quotas_own_policy ON user_quotas
    FOR SELECT
    USING (user_id::text = current_setting('app.current_user_id', true)
           OR current_setting('app.current_role', true) IN ('super_admin', 'admin'));
