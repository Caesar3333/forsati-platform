/**
 * Forsati Platform - Marketing Microcopy
 * نصوص التسويق والإعلانات
 */

// ============================================
// Hero Banners
// ============================================

export const heroBanners = {
  candidate: {
    headline: {
      en: "Your Career, Our Mission",
      ar: "مسيرتك المهنية، مهمتنا",
    },
    subheadline: {
      en: "Join thousands of job seekers who found their dream job through Forsati",
      ar: "انضم لآلاف الباحثين عن عمل الذين وجدوا وظيفة أحلامهم عبر فرصتي",
    },
    cta: {
      en: "Start Free Today",
      ar: "ابدأ مجاناً اليوم",
    },
  },
  company: {
    headline: {
      en: "Find Top Talent, Fast",
      ar: "اعثر على أفضل الكفاءات، بسرعة",
    },
    subheadline: {
      en: "Access 100,000+ qualified candidates across the MENA region",
      ar: "تواصل مع أكثر من 100,000 مرشح مؤهل في منطقة الشرق الأوسط",
    },
    cta: {
      en: "Post Your First Job Free",
      ar: "انشر وظيفتك الأولى مجاناً",
    },
  },
  trainer: {
    headline: {
      en: "Grow Your Coaching Business",
      ar: "طوّر أعمالك التدريبية",
    },
    subheadline: {
      en: "Connect with job seekers who need your expertise",
      ar: "تواصل مع الباحثين عن عمل الذين يحتاجون خبرتك",
    },
    cta: {
      en: "Join as a Coach",
      ar: "انضم كمدرب",
    },
  },
};

// ============================================
// Signup Incentives
// ============================================

export const signupIncentives = {
  candidate: {
    title: {
      en: "Welcome Bonus! 🎉",
      ar: "مكافأة الترحيب! 🎉",
    },
    benefits: [
      {
        icon: "📄",
        text: { en: "3 Free CV Scans", ar: "3 فحوصات سيرة ذاتية مجانية" },
      },
      {
        icon: "⭐",
        text: { en: "100 Loyalty Points", ar: "100 نقطة ولاء" },
      },
      {
        icon: "🎯",
        text: { en: "AI Job Matching", ar: "مطابقة وظائف بالذكاء الاصطناعي" },
      },
      {
        icon: "📝",
        text: {
          en: "2 Cover Letter Generations",
          ar: "رسالتا تقديم من المولّد",
        },
      },
    ],
    giftCodePromo: {
      en: "Have a gift code? Enter it below for extra benefits!",
      ar: "هل لديك كود هدية؟ أدخله أدناه للحصول على مزايا إضافية!",
    },
  },
  company: {
    title: {
      en: "Start Hiring Today! 🚀",
      ar: "ابدأ التوظيف اليوم! 🚀",
    },
    benefits: [
      {
        icon: "📋",
        text: { en: "5 Free Job Posts", ar: "5 إعلانات وظائف مجانية" },
      },
      {
        icon: "🔍",
        text: { en: "50 Candidate Searches", ar: "50 بحث عن مرشحين" },
      },
      {
        icon: "📩",
        text: { en: "100 Direct Messages", ar: "100 رسالة مباشرة" },
      },
      {
        icon: "📊",
        text: { en: "Basic Analytics Dashboard", ar: "لوحة تحليلات أساسية" },
      },
    ],
    giftCodePromo: {
      en: "Partner code? Get premium features free for 30 days!",
      ar: "كود شريك؟ احصل على ميزات مميزة مجاناً لمدة 30 يوماً!",
    },
  },
};

// ============================================
// Loyalty Program
// ============================================

export const loyaltyProgram = {
  title: {
    en: "Forsati Rewards",
    ar: "مكافآت فرصتي",
  },
  tagline: {
    en: "Earn points. Unlock rewards. Advance your career.",
    ar: "اكسب النقاط. افتح المكافآت. طوّر مسيرتك.",
  },
  tiers: {
    bronze: {
      name: { en: "Bronze", ar: "برونزي" },
      description: {
        en: "Just getting started? Welcome to the family!",
        ar: "بدأت للتو؟ مرحباً بك في العائلة!",
      },
      benefits: [
        { en: "Basic rewards access", ar: "وصول للمكافآت الأساسية" },
        { en: "Birthday bonus points", ar: "نقاط إضافية لعيد ميلادك" },
      ],
    },
    silver: {
      name: { en: "Silver", ar: "فضي" },
      description: {
        en: "You're building momentum!",
        ar: "أنت تبني زخماً!",
      },
      benefits: [
        { en: "10% bonus on all earnings", ar: "مكافأة 10% على جميع النقاط" },
        { en: "Priority support", ar: "دعم أولوية" },
        { en: "Early access to features", ar: "وصول مبكر للميزات" },
      ],
    },
    gold: {
      name: { en: "Gold", ar: "ذهبي" },
      description: {
        en: "You're a Forsati superstar!",
        ar: "أنت نجم فرصتي!",
      },
      benefits: [
        { en: "25% bonus on all earnings", ar: "مكافأة 25% على جميع النقاط" },
        { en: "Exclusive rewards", ar: "مكافآت حصرية" },
        { en: "Featured profile badge", ar: "شارة ملف مميز" },
        { en: "Monthly free CV scan", ar: "فحص سيرة شهري مجاني" },
      ],
    },
    platinum: {
      name: { en: "Platinum", ar: "بلاتيني" },
      description: {
        en: "Elite status achieved!",
        ar: "حققت المستوى النخبوي!",
      },
      benefits: [
        { en: "50% bonus on all earnings", ar: "مكافأة 50% على جميع النقاط" },
        { en: "Unlimited CV scans", ar: "فحوصات سيرة غير محدودة" },
        { en: "Personal career advisor", ar: "مستشار مهني شخصي" },
        { en: "VIP event invitations", ar: "دعوات للفعاليات VIP" },
        { en: "Custom profile URL", ar: "رابط ملف مخصص" },
      ],
    },
  },
  earningActions: {
    signup: {
      points: 100,
      label: { en: "Sign up", ar: "التسجيل" },
    },
    profile_complete: {
      points: 200,
      label: { en: "Complete your profile", ar: "أكمل ملفك الشخصي" },
    },
    upload_cv: {
      points: 50,
      label: { en: "Upload your CV", ar: "ارفع سيرتك الذاتية" },
    },
    cv_scan: {
      points: 25,
      label: { en: "Scan your CV", ar: "افحص سيرتك" },
    },
    apply_job: {
      points: 10,
      label: { en: "Apply to a job", ar: "قدّم على وظيفة" },
    },
    referral_confirmed: {
      points: 500,
      label: { en: "Friend signs up with your link", ar: "صديق يسجّل برابطك" },
    },
    first_interview: {
      points: 100,
      label: { en: "Get your first interview", ar: "احصل على أول مقابلة" },
    },
    job_hired: {
      points: 1000,
      label: { en: "Get hired through Forsati", ar: "توظّف عبر فرصتي" },
    },
  },
};

// ============================================
// Gift Code Promotions
// ============================================

export const giftCodePromos = {
  modalTitle: {
    en: "Redeem Your Gift Code",
    ar: "استخدم كود الهدية",
  },
  placeholder: {
    en: "Enter your code (e.g., WELCOME2024)",
    ar: "أدخل الكود (مثال: WELCOME2024)",
  },
  submitButton: {
    en: "Redeem",
    ar: "استخدام",
  },
  successMessage: {
    en: "Code redeemed successfully! Your benefits have been applied.",
    ar: "تم استخدام الكود بنجاح! تم تطبيق المزايا.",
  },
  errorMessages: {
    INVALID_CODE: {
      en: "This code is not valid. Please check and try again.",
      ar: "هذا الكود غير صالح. يرجى التحقق والمحاولة مرة أخرى.",
    },
    CODE_EXPIRED: {
      en: "This code has expired.",
      ar: "انتهت صلاحية هذا الكود.",
    },
    CODE_MAX_USES: {
      en: "This code has reached its maximum usage limit.",
      ar: "وصل هذا الكود إلى الحد الأقصى للاستخدام.",
    },
    ALREADY_REDEEMED: {
      en: "You've already used this code.",
      ar: "لقد استخدمت هذا الكود من قبل.",
    },
  },
};

// ============================================
// Upgrade Prompts
// ============================================

export const upgradePrompts = {
  cvScanLimit: {
    title: {
      en: "You've used your free scans",
      ar: "استخدمت فحوصاتك المجانية",
    },
    message: {
      en: "Upgrade to Premium for unlimited CV scans and get detailed feedback to improve your resume.",
      ar: "قم بالترقية للحصول على فحوصات غير محدودة وملاحظات تفصيلية لتحسين سيرتك.",
    },
    cta: { en: "Upgrade Now", ar: "قم بالترقية الآن" },
    altCta: { en: "Use Points", ar: "استخدم النقاط" },
  },
  jobPostLimit: {
    title: {
      en: "Post more jobs",
      ar: "انشر المزيد من الوظائف",
    },
    message: {
      en: "You've reached your monthly job post limit. Upgrade to post unlimited jobs and access premium features.",
      ar: "وصلت للحد الشهري لنشر الوظائف. قم بالترقية لنشر وظائف غير محدودة.",
    },
    cta: { en: "View Plans", ar: "عرض الخطط" },
  },
  featureLocked: {
    title: {
      en: "Premium Feature",
      ar: "ميزة مميزة",
    },
    message: {
      en: "This feature is available for Premium users. Upgrade to unlock all features.",
      ar: "هذه الميزة متاحة للمستخدمين المميزين. قم بالترقية لفتح جميع الميزات.",
    },
    cta: { en: "Go Premium", ar: "اشترك المميز" },
  },
};

// ============================================
// Email Templates Copy
// ============================================

export const emailCopy = {
  welcome: {
    subject: {
      en: "Welcome to Forsati! Your career journey starts here 🚀",
      ar: "مرحباً بك في فرصتي! رحلتك المهنية تبدأ هنا 🚀",
    },
    greeting: {
      en: "Hi {name}, welcome to the Forsati family!",
      ar: "مرحباً {name}، أهلاً بك في عائلة فرصتي!",
    },
    body: {
      en: "We're excited to have you on board. Here's what you can do to get started:",
      ar: "نحن متحمسون لانضمامك. إليك ما يمكنك فعله للبدء:",
    },
    steps: [
      {
        en: "Complete your profile to stand out",
        ar: "أكمل ملفك الشخصي لتتميز",
      },
      {
        en: "Upload your CV for a free AI scan",
        ar: "ارفع سيرتك الذاتية لفحص ذكي مجاني",
      },
      {
        en: "Explore jobs matched to your skills",
        ar: "استكشف وظائف تناسب مهاراتك",
      },
    ],
  },
  giftCodeReceived: {
    subject: {
      en: "You've received a gift from Forsati! 🎁",
      ar: "لقد استلمت هدية من فرصتي! 🎁",
    },
    body: {
      en: "Someone special sent you a Forsati gift code. Use code {code} to unlock special benefits!",
      ar: "شخص مميز أرسل لك كود هدية من فرصتي. استخدم الكود {code} لفتح مزايا خاصة!",
    },
  },
  pointsEarned: {
    subject: {
      en: "You earned {points} points! 🌟",
      ar: "كسبت {points} نقطة! 🌟",
    },
    body: {
      en: "Congratulations! You've earned {points} points for {action}. Your total is now {total} points.",
      ar: "تهانينا! لقد كسبت {points} نقطة مقابل {action}. رصيدك الإجمالي الآن {total} نقطة.",
    },
  },
  tierUpgrade: {
    subject: {
      en: "Level up! You reached {tier} tier 🏆",
      ar: "ترقية! وصلت لمستوى {tier} 🏆",
    },
    body: {
      en: "Amazing work! You've reached {tier} tier status. Enjoy your new benefits:",
      ar: "عمل رائع! لقد وصلت لمستوى {tier}. استمتع بمزاياك الجديدة:",
    },
  },
};

// ============================================
// Notification Messages
// ============================================

export const notifications = {
  pointsEarned: {
    title: { en: "Points Earned!", ar: "كسبت نقاطاً!" },
    body: {
      en: "+{points} points for {action}",
      ar: "+{points} نقطة مقابل {action}",
    },
  },
  quotaWarning: {
    title: { en: "Running Low", ar: "على وشك النفاد" },
    body: {
      en: "You have {remaining} {resource} left this month",
      ar: "متبقي لديك {remaining} {resource} هذا الشهر",
    },
  },
  quotaRefreshed: {
    title: { en: "Quota Refreshed", ar: "تم تجديد الحصة" },
    body: {
      en: "Your monthly {resource} quota has been reset",
      ar: "تم إعادة تعيين حصتك الشهرية من {resource}",
    },
  },
  giftCodeReceived: {
    title: { en: "Gift Received!", ar: "استلمت هدية!" },
    body: {
      en: "You received a gift code: {benefit}",
      ar: "استلمت كود هدية: {benefit}",
    },
  },
  tierUpgrade: {
    title: { en: "Tier Upgrade!", ar: "ترقية المستوى!" },
    body: {
      en: "Congratulations! You're now a {tier} member",
      ar: "تهانينا! أنت الآن عضو {tier}",
    },
  },
};

// ============================================
// Feature Tooltips
// ============================================

export const featureTooltips = {
  cvScan: {
    title: { en: "CV Scanner", ar: "فاحص السيرة الذاتية" },
    description: {
      en: "Get instant AI-powered feedback on your CV. Our scanner analyzes formatting, keywords, and content to help you stand out.",
      ar: "احصل على ملاحظات فورية بالذكاء الاصطناعي على سيرتك. يحلل الفاحص التنسيق والكلمات والمحتوى لتتميز.",
    },
  },
  aiMatching: {
    title: { en: "AI Job Matching", ar: "المطابقة الذكية للوظائف" },
    description: {
      en: "Our AI analyzes your profile and matches you with the best job opportunities based on your skills, experience, and preferences.",
      ar: "الذكاء الاصطناعي يحلل ملفك ويطابقك مع أفضل الفرص بناءً على مهاراتك وخبرتك وتفضيلاتك.",
    },
  },
  quickApply: {
    title: { en: "Quick Apply", ar: "التقديم السريع" },
    description: {
      en: "Apply to multiple jobs with a single click. Your profile and CV are automatically attached.",
      ar: "قدّم لعدة وظائف بضغطة واحدة. يتم إرفاق ملفك وسيرتك تلقائياً.",
    },
  },
  loyaltyPoints: {
    title: { en: "Loyalty Points", ar: "نقاط الولاء" },
    description: {
      en: "Earn points for every action on Forsati. Redeem for premium features, discounts, and exclusive rewards.",
      ar: "اكسب نقاطاً على كل نشاط في فرصتي. استبدلها بميزات مميزة وخصومات ومكافآت حصرية.",
    },
  },
};

// ============================================
// Empty States
// ============================================

export const emptyStates = {
  noJobs: {
    title: { en: "No Jobs Found", ar: "لم يتم العثور على وظائف" },
    message: {
      en: "We couldn't find jobs matching your criteria. Try adjusting your filters or check back later.",
      ar: "لم نجد وظائف تطابق معاييرك. جرّب تعديل الفلاتر أو تحقق لاحقاً.",
    },
    cta: { en: "Clear Filters", ar: "مسح الفلاتر" },
  },
  noApplications: {
    title: { en: "No Applications Yet", ar: "لا توجد طلبات بعد" },
    message: {
      en: "You haven't applied to any jobs yet. Start exploring opportunities!",
      ar: "لم تقدّم على أي وظيفة بعد. ابدأ باستكشاف الفرص!",
    },
    cta: { en: "Browse Jobs", ar: "تصفح الوظائف" },
  },
  noPoints: {
    title: { en: "Start Earning Points", ar: "ابدأ بكسب النقاط" },
    message: {
      en: "Complete actions on Forsati to earn loyalty points and unlock rewards.",
      ar: "أكمل النشاطات في فرصتي لكسب نقاط الولاء وفتح المكافآت.",
    },
    cta: { en: "How to Earn", ar: "كيف تكسب" },
  },
};

// ============================================
// Footer CTAs
// ============================================

export const footerCtas = {
  candidate: {
    text: {
      en: "Ready to find your next opportunity?",
      ar: "جاهز لإيجاد فرصتك القادمة؟",
    },
    cta: { en: "Search Jobs", ar: "ابحث عن وظائف" },
  },
  company: {
    text: { en: "Looking for top talent?", ar: "تبحث عن أفضل الكفاءات؟" },
    cta: { en: "Post a Job", ar: "انشر وظيفة" },
  },
};

// ============================================
// Export All
// ============================================

export const marketing = {
  heroBanners,
  signupIncentives,
  loyaltyProgram,
  giftCodePromos,
  upgradePrompts,
  emailCopy,
  notifications,
  featureTooltips,
  emptyStates,
  footerCtas,
};

export default marketing;
