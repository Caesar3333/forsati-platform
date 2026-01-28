-- ============================================
-- Forsati Platform - Seed Data
-- البيانات الأولية للمنصة
-- Migration: 002_seed_data.sql
-- ============================================

-- ============================================
-- Feature Flags Seed
-- ============================================
INSERT INTO feature_flags (key, label, label_ar, description, description_ar, category, default_value, active, rollout_json) VALUES
-- Core Features
('cv_scan', 'CV Scanner', 'فاحص السيرة الذاتية', 'AI-powered CV analysis and feedback', 'تحليل السيرة الذاتية بالذكاء الاصطناعي', 'ai', true, true, '{"percentage": 100}'),
('ai_matching', 'AI Job Matching', 'المطابقة الذكية للوظائف', 'Intelligent job-candidate matching', 'مطابقة ذكية بين الوظائف والمرشحين', 'ai', true, true, '{"percentage": 100}'),
('quick_apply', 'Quick Apply', 'التقديم السريع', 'One-click job applications', 'تقديم بضغطة واحدة', 'core', true, true, '{"percentage": 100}'),
('email_apply', 'Email Apply', 'التقديم بالبريد', 'Apply via email', 'التقديم عبر البريد الإلكتروني', 'core', true, true, '{"percentage": 100}'),
('whatsapp_apply', 'WhatsApp Apply', 'التقديم بواتساب', 'Apply via WhatsApp', 'التقديم عبر واتساب', 'core', true, true, '{"markets": ["jo", "sa", "ae"]}'),

-- Social Features
('social_posts', 'Social Posts', 'المنشورات الاجتماعية', 'Social networking features via HumHub', 'ميزات التواصل الاجتماعي عبر HumHub', 'social', true, true, '{"percentage": 50}'),
('portfolio_builder', 'Portfolio Builder', 'بناء المعرض', 'Visual portfolio creation tool', 'أداة إنشاء معرض الأعمال', 'core', true, true, '{"percentage": 100}'),
('public_profiles', 'Public Profiles', 'الملفات العامة', 'Shareable public profiles', 'ملفات شخصية قابلة للمشاركة', 'social', true, true, '{"percentage": 100}'),

-- Monetization Features
('premium_promotion', 'Premium Promotion', 'الترويج المميز', 'Show premium upgrade prompts', 'عرض رسائل الترقية للمميز', 'monetization', true, true, '{"percentage": 100}'),
('loyalty_program', 'Loyalty Program', 'برنامج الولاء', 'Points and rewards system', 'نظام النقاط والمكافآت', 'monetization', true, true, '{"percentage": 100}'),
('gift_codes', 'Gift Codes', 'أكواد الهدايا', 'Promotional code system', 'نظام الأكواد الترويجية', 'monetization', true, true, '{"percentage": 100}'),

-- AI Features
('cover_letter_gen', 'Cover Letter Generator', 'مولد رسائل التقديم', 'AI-generated cover letters', 'رسائل تقديم بالذكاء الاصطناعي', 'ai', true, true, '{"percentage": 75}'),
('interview_questions', 'Interview Question Generator', 'مولد أسئلة المقابلات', 'AI-generated interview prep', 'أسئلة مقابلات بالذكاء الاصطناعي', 'ai', true, true, '{"percentage": 100}'),
('advanced_ats', 'Advanced ATS', 'نظام تتبع متقدم', 'Advanced applicant tracking', 'نظام تتبع المتقدمين المتقدم', 'core', true, true, '{"roles": ["company", "recruiter"]}'),

-- Experimental Features
('video_interviews', 'Video Interviews', 'المقابلات المرئية', 'In-platform video interviews via Jitsi', 'مقابلات فيديو عبر Jitsi', 'experimental', false, false, '{"percentage": 0}'),
('ai_resume_builder', 'AI Resume Builder', 'بناء السيرة بالذكاء', 'AI-assisted resume creation', 'إنشاء السيرة بمساعدة الذكاء الاصطناعي', 'experimental', false, false, '{"percentage": 0}'),
('salary_insights', 'Salary Insights', 'رؤى الرواتب', 'Market salary data and comparisons', 'بيانات ومقارنات الرواتب في السوق', 'experimental', false, false, '{"markets": ["jo"]}')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Quota Policies Seed
-- ============================================
INSERT INTO quota_policies (role, resource, monthly_allowance, carry_over, active) VALUES
-- Candidate quotas
('candidate', 'cv_scan', 3, false, true),
('candidate', 'cover_letter', 2, false, true),
('candidate', 'ai_match', 10, false, true),
('candidate', 'export_pdf', 5, false, true),
('candidate', 'message', 20, false, true),
('candidate', 'interview_gen', 3, false, true),

-- Student quotas (more generous)
('student', 'cv_scan', 5, false, true),
('student', 'cover_letter', 5, false, true),
('student', 'ai_match', 20, false, true),
('student', 'export_pdf', 10, false, true),
('student', 'message', 30, false, true),

-- New Graduate quotas
('new_graduate', 'cv_scan', 5, false, true),
('new_graduate', 'cover_letter', 3, false, true),
('new_graduate', 'ai_match', 15, false, true),
('new_graduate', 'message', 25, false, true),

-- Freelancer quotas
('freelancer', 'cv_scan', 3, false, true),
('freelancer', 'cover_letter', 2, false, true),
('freelancer', 'ai_match', 10, false, true),
('freelancer', 'message', 30, false, true),

-- Company quotas
('company', 'job_post', 5, false, true),
('company', 'featured_post', 1, false, true),
('company', 'candidate_search', 50, false, true),
('company', 'ai_match', 50, false, true),
('company', 'message', 100, false, true),
('company', 'export_pdf', 20, false, true),

-- Recruiter quotas
('recruiter', 'job_post', 10, false, true),
('recruiter', 'featured_post', 2, false, true),
('recruiter', 'candidate_search', 100, false, true),
('recruiter', 'ai_match', 100, false, true),
('recruiter', 'message', 200, false, true),

-- Trainer/Coach quotas
('trainer', 'training_session', 10, true, true),
('trainer', 'message', 50, false, true),
('coach', 'training_session', 20, true, true),
('coach', 'message', 100, false, true),

-- Premium (unlimited = -1)
('premium_candidate', 'cv_scan', -1, false, true),
('premium_candidate', 'cover_letter', -1, false, true),
('premium_candidate', 'ai_match', -1, false, true),
('premium_company', 'job_post', -1, false, true),
('premium_company', 'candidate_search', -1, false, true)
ON CONFLICT (role, resource) DO NOTHING;

-- ============================================
-- Points Rules Seed
-- ============================================
INSERT INTO points_rules (reason, label, label_ar, points, max_per_day, max_per_month, active, target_roles) VALUES
('signup', 'Sign Up Bonus', 'مكافأة التسجيل', 100, 1, 1, true, '{}'),
('profile_complete', 'Complete Profile', 'إكمال الملف الشخصي', 200, 1, 1, true, '{}'),
('upload_cv', 'Upload CV', 'رفع السيرة الذاتية', 50, 1, 1, true, ARRAY['candidate', 'student', 'new_graduate', 'freelancer']),
('cv_scan', 'Scan CV', 'فحص السيرة الذاتية', 25, 3, 10, true, ARRAY['candidate', 'student', 'new_graduate', 'freelancer']),
('apply_job', 'Apply to Job', 'التقديم على وظيفة', 10, 10, 50, true, ARRAY['candidate', 'student', 'new_graduate', 'freelancer']),
('referral_sent', 'Send Referral', 'إرسال دعوة', 25, 5, 20, true, '{}'),
('referral_confirmed', 'Referral Confirmed', 'تأكيد الدعوة', 500, 10, 50, true, '{}'),
('first_interview', 'Get First Interview', 'الحصول على أول مقابلة', 100, 1, 5, true, ARRAY['candidate', 'student', 'new_graduate']),
('job_hired', 'Get Hired', 'التوظيف', 1000, 1, 1, true, ARRAY['candidate', 'student', 'new_graduate', 'freelancer']),
('post_job', 'Post a Job', 'نشر وظيفة', 50, 5, 20, true, ARRAY['company', 'recruiter']),
('review_given', 'Leave a Review', 'ترك تقييم', 30, 3, 10, true, '{}'),
('training_completed', 'Complete Training', 'إكمال التدريب', 75, 2, 10, true, '{}'),
('daily_login', 'Daily Login', 'تسجيل دخول يومي', 5, 1, 30, true, '{}'),
('share_social', 'Share on Social', 'المشاركة على وسائل التواصل', 15, 3, 15, true, '{}'),
('profile_view', 'Profile Viewed', 'مشاهدة الملف', 2, 10, 100, true, ARRAY['candidate', 'freelancer'])
ON CONFLICT (reason) DO NOTHING;

-- ============================================
-- Points Rewards Seed
-- ============================================
INSERT INTO points_rewards (name, name_ar, description, description_ar, cost, reward_type, reward_value, min_tier, active) VALUES
('Free CV Scan', 'فحص سيرة مجاني', 'Get one free CV scan', 'احصل على فحص سيرة ذاتية مجاني', 100, 'cv_scan', '{"scans": 1}', 'bronze', true),
('3 CV Scans Bundle', 'حزمة 3 فحوصات', 'Get three CV scans', 'احصل على 3 فحوصات للسيرة الذاتية', 250, 'cv_scan', '{"scans": 3}', 'silver', true),
('Priority Application', 'تقديم أولوية', 'Your application shown first to recruiters', 'يظهر طلبك أولاً للمسؤولين', 200, 'feature_unlock', '{"feature": "priority_apply", "duration_days": 7}', 'bronze', true),
('Featured Profile (7 days)', 'ملف مميز (7 أيام)', 'Highlight your profile for a week', 'أبرز ملفك لمدة أسبوع', 500, 'feature_unlock', '{"feature": "featured_profile", "duration_days": 7}', 'silver', true),
('10% Discount Coupon', 'كوبون خصم 10%', '10% off your next premium purchase', '10% خصم على اشتراكك القادم', 300, 'discount', '{"percent": 10}', 'bronze', true),
('25% Discount Coupon', 'كوبون خصم 25%', '25% off your next premium purchase', '25% خصم على اشتراكك القادم', 700, 'discount', '{"percent": 25}', 'gold', true),
('Premium Trial (7 days)', 'تجربة مميزة (7 أيام)', 'Try premium for a week', 'جرب المميز لمدة أسبوع', 1000, 'premium_days', '{"days": 7}', 'silver', true),
('Premium Trial (30 days)', 'تجربة مميزة (30 يوم)', 'Try premium for a month', 'جرب المميز لمدة شهر', 3500, 'premium_days', '{"days": 30}', 'gold', true),
('Career Consultation (30 min)', 'استشارة مهنية (30 د)', '30-minute session with career coach', 'جلسة 30 دقيقة مع مدرب مهني', 2000, 'consultation', '{"minutes": 30, "type": "career"}', 'gold', true),
('Free Job Post', 'نشر وظيفة مجاني', 'Post one job for free', 'انشر وظيفة واحدة مجاناً', 500, 'job_post', '{"posts": 1}', 'bronze', true),
('5 Job Posts Bundle', 'حزمة 5 وظائف', 'Post five jobs', 'انشر 5 وظائف', 2000, 'job_post', '{"posts": 5}', 'silver', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Platform Settings Seed
-- ============================================
INSERT INTO platform_settings (key, value, label, label_ar, description, category, data_type, is_sensitive) VALUES
-- General Settings
('platform_name', '"Forsati"', 'Platform Name', 'اسم المنصة', 'The name displayed across the platform', 'general', 'string', false),
('platform_name_ar', '"فرصتي"', 'Platform Name (Arabic)', 'اسم المنصة (عربي)', 'Arabic platform name', 'general', 'string', false),
('support_email', '"support@forsati.com"', 'Support Email', 'بريد الدعم', 'Support contact email', 'general', 'string', false),
('default_language', '"ar"', 'Default Language', 'اللغة الافتراضية', 'Default language for new users', 'general', 'string', false),
('default_market', '"jo"', 'Default Market', 'السوق الافتراضي', 'Default market/country', 'general', 'string', false),
('maintenance_mode', 'false', 'Maintenance Mode', 'وضع الصيانة', 'Enable maintenance mode', 'general', 'boolean', false),
('maintenance_message', '""', 'Maintenance Message', 'رسالة الصيانة', 'Message shown during maintenance', 'general', 'string', false),

-- Loyalty Settings
('loyalty_enabled', 'true', 'Loyalty Program Enabled', 'برنامج الولاء مفعّل', 'Enable/disable loyalty program', 'loyalty', 'boolean', false),
('points_expiry_days', '365', 'Points Expiry (Days)', 'انتهاء النقاط (أيام)', 'Days until points expire (0 = never)', 'loyalty', 'number', false),
('tier_bronze_threshold', '0', 'Bronze Threshold', 'حد البرونزي', 'Points needed for bronze tier', 'loyalty', 'number', false),
('tier_silver_threshold', '500', 'Silver Threshold', 'حد الفضي', 'Points needed for silver tier', 'loyalty', 'number', false),
('tier_gold_threshold', '2000', 'Gold Threshold', 'حد الذهبي', 'Points needed for gold tier', 'loyalty', 'number', false),
('tier_platinum_threshold', '5000', 'Platinum Threshold', 'حد البلاتيني', 'Points needed for platinum tier', 'loyalty', 'number', false),
('silver_bonus_percent', '10', 'Silver Bonus %', 'مكافأة الفضي %', 'Bonus percentage for silver tier', 'loyalty', 'number', false),
('gold_bonus_percent', '25', 'Gold Bonus %', 'مكافأة الذهبي %', 'Bonus percentage for gold tier', 'loyalty', 'number', false),
('platinum_bonus_percent', '50', 'Platinum Bonus %', 'مكافأة البلاتيني %', 'Bonus percentage for platinum tier', 'loyalty', 'number', false),

-- AI Settings
('cv_scan_model', '"gpt-4"', 'CV Scan Model', 'نموذج فحص السيرة', 'LLM model for CV scanning', 'ai', 'string', false),
('cover_letter_model', '"gpt-4"', 'Cover Letter Model', 'نموذج رسالة التقديم', 'LLM model for cover letters', 'ai', 'string', false),
('ai_rate_limit_per_hour', '60', 'AI Rate Limit/Hour', 'حد الطلبات/ساعة', 'Max AI requests per user per hour', 'ai', 'number', false),
('redact_pii_in_scan', 'true', 'Redact PII in Scan', 'إخفاء البيانات الشخصية', 'Redact personal info before AI processing', 'ai', 'boolean', false),

-- Security Settings
('session_timeout_minutes', '60', 'Session Timeout (min)', 'مهلة الجلسة (دقائق)', 'Session timeout in minutes', 'security', 'number', false),
('max_login_attempts', '5', 'Max Login Attempts', 'محاولات تسجيل الدخول', 'Max failed login attempts before lockout', 'security', 'number', false),
('lockout_duration_minutes', '30', 'Lockout Duration (min)', 'مدة الحظر (دقائق)', 'Account lockout duration', 'security', 'number', false),
('require_email_verification', 'true', 'Require Email Verification', 'تأكيد البريد مطلوب', 'Require email verification for signup', 'security', 'boolean', false),

-- Audit Settings
('audit_retention_days', '365', 'Audit Log Retention (Days)', 'الاحتفاظ بسجلات التدقيق', 'Days to retain audit logs', 'audit', 'number', false),
('log_read_operations', 'false', 'Log Read Operations', 'تسجيل عمليات القراءة', 'Log read operations in audit', 'audit', 'boolean', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Email Templates Seed
-- ============================================
INSERT INTO email_templates (key, name, name_ar, subject_en, subject_ar, body_en, body_ar, variables, category, active) VALUES
('welcome', 'Welcome Email', 'بريد الترحيب', 
 'Welcome to Forsati! 🚀', 
 'مرحباً بك في فرصتي! 🚀',
 'Hi {name},\n\nWelcome to Forsati! We''re excited to have you on board.\n\nHere''s what you can do to get started:\n1. Complete your profile\n2. Upload your CV for a free AI scan\n3. Explore jobs matched to your skills\n\nYou''ve received {points} bonus points to get started!\n\nBest regards,\nThe Forsati Team',
 'مرحباً {name}،\n\nأهلاً بك في فرصتي! نحن متحمسون لانضمامك.\n\nإليك ما يمكنك فعله للبدء:\n1. أكمل ملفك الشخصي\n2. ارفع سيرتك الذاتية لفحص ذكي مجاني\n3. استكشف وظائف تناسب مهاراتك\n\nلقد حصلت على {points} نقطة مكافأة للبدء!\n\nمع أطيب التحيات،\nفريق فرصتي',
 ARRAY['name', 'points'], 'onboarding', true),

('gift_code_received', 'Gift Code Received', 'استلام كود هدية',
 'You''ve received a gift from Forsati! 🎁',
 'لقد استلمت هدية من فرصتي! 🎁',
 'Hi {name},\n\nSomeone special sent you a Forsati gift code!\n\nCode: {code}\nBenefit: {benefit}\n\nRedeem it now at forsati.com/redeem\n\nEnjoy!\nThe Forsati Team',
 'مرحباً {name}،\n\nشخص مميز أرسل لك كود هدية من فرصتي!\n\nالكود: {code}\nالمزايا: {benefit}\n\nاستخدمه الآن على forsati.com/redeem\n\nاستمتع!\nفريق فرصتي',
 ARRAY['name', 'code', 'benefit'], 'promotions', true),

('points_earned', 'Points Earned', 'كسب نقاط',
 'You earned {points} points! 🌟',
 'كسبت {points} نقطة! 🌟',
 'Hi {name},\n\nCongratulations! You''ve earned {points} points for {action}.\n\nYour total balance is now {total} points.\n\nKeep going!\nThe Forsati Team',
 'مرحباً {name}،\n\nتهانينا! لقد كسبت {points} نقطة مقابل {action}.\n\nرصيدك الإجمالي الآن {total} نقطة.\n\nاستمر!\nفريق فرصتي',
 ARRAY['name', 'points', 'action', 'total'], 'loyalty', true),

('tier_upgrade', 'Tier Upgrade', 'ترقية المستوى',
 'Level up! You reached {tier} tier 🏆',
 'ترقية! وصلت لمستوى {tier} 🏆',
 'Hi {name},\n\nAmazing work! You''ve reached {tier} tier status.\n\nYour new benefits:\n{benefits}\n\nKeep earning!\nThe Forsati Team',
 'مرحباً {name}،\n\nعمل رائع! لقد وصلت لمستوى {tier}.\n\nمزاياك الجديدة:\n{benefits}\n\nاستمر في الكسب!\nفريق فرصتي',
 ARRAY['name', 'tier', 'benefits'], 'loyalty', true),

('job_application_received', 'Application Received', 'استلام الطلب',
 'Your application for {job_title} was received',
 'تم استلام طلبك لوظيفة {job_title}',
 'Hi {name},\n\nYour application for {job_title} at {company} has been received.\n\nWe''ll notify you when there''s an update.\n\nGood luck!\nThe Forsati Team',
 'مرحباً {name}،\n\nتم استلام طلبك لوظيفة {job_title} في {company}.\n\nسنخبرك عند وجود أي تحديث.\n\nحظاً موفقاً!\nفريق فرصتي',
 ARRAY['name', 'job_title', 'company'], 'applications', true),

('password_reset', 'Password Reset', 'إعادة تعيين كلمة المرور',
 'Reset your Forsati password',
 'إعادة تعيين كلمة مرور فرصتي',
 'Hi {name},\n\nClick the link below to reset your password:\n\n{reset_link}\n\nThis link expires in 1 hour.\n\nIf you didn''t request this, please ignore this email.\n\nThe Forsati Team',
 'مرحباً {name}،\n\nاضغط على الرابط أدناه لإعادة تعيين كلمة مرورك:\n\n{reset_link}\n\nينتهي هذا الرابط خلال ساعة.\n\nإذا لم تطلب هذا، تجاهل هذا البريد.\n\nفريق فرصتي',
 ARRAY['name', 'reset_link'], 'auth', true),

('account_suspended', 'Account Suspended', 'تعليق الحساب',
 'Your Forsati account has been suspended',
 'تم تعليق حسابك في فرصتي',
 'Hi {name},\n\nYour account has been suspended for the following reason:\n\n{reason}\n\nIf you believe this is a mistake, please contact support@forsati.com.\n\nThe Forsati Team',
 'مرحباً {name}،\n\nتم تعليق حسابك للسبب التالي:\n\n{reason}\n\nإذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع support@forsati.com.\n\nفريق فرصتي',
 ARRAY['name', 'reason'], 'moderation', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Sample Gift Codes (for testing)
-- ============================================
INSERT INTO gift_codes (code, type, value, currency, max_uses, target_roles, markets, campaign, active, expires_at, metadata) VALUES
('WELCOME2024', 'points', 500, NULL, 1000, '{}', '{}', 'welcome_campaign', true, '2025-12-31 23:59:59+00', '{"description": "Welcome bonus for new users"}'),
('FREESCAN', 'free_scan', 3, NULL, 500, ARRAY['candidate', 'student'], '{}', 'cv_scan_promo', true, '2025-06-30 23:59:59+00', '{}'),
('FREEPOST', 'free_post', 1, NULL, 100, ARRAY['company'], '{}', 'company_promo', true, '2025-06-30 23:59:59+00', '{}'),
('SAVE20', 'discount', 20, 'percent', 200, '{}', ARRAY['jo', 'sa', 'ae'], 'mena_discount', true, '2025-03-31 23:59:59+00', '{}'),
('PREMIUM7', 'premium_trial', 7, 'days', 500, '{}', '{}', 'premium_trial', true, '2025-12-31 23:59:59+00', '{}')
ON CONFLICT (code) DO NOTHING;
