// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface FooterProps {
  locale: "ar" | "en";
}

const translations = {
  ar: {
    about: {
      title: "عن فرصتي",
      description:
        "فرصتي هي منصة التوظيف الذكية الأولى في الأردن، تربط الباحثين عن عمل بأفضل الفرص باستخدام الذكاء الاصطناعي.",
    },
    quickLinks: {
      title: "روابط سريعة",
      items: [
        { label: "الرئيسية", href: "/" },
        { label: "فرص العمل", href: "/jobs" },
        { label: "فرص التطوع", href: "/volunteering" },
        { label: "المنح الدراسية", href: "/scholarships" },
        { label: "الدورات التدريبية", href: "/courses" },
      ],
    },
    forJobSeekers: {
      title: "للباحثين عن عمل",
      items: [
        { label: "إنشاء حساب", href: "/auth/register" },
        { label: "افحص سيرتك الذاتية", href: "/cv-scan" },
        { label: "تصفح الفرص", href: "/jobs" },
        { label: "نصائح للتوظيف", href: "/blog" },
        { label: "الأسئلة الشائعة", href: "/faq" },
      ],
    },
    forEmployers: {
      title: "لأصحاب العمل",
      items: [
        { label: "انشر فرصة عمل", href: "/post-job" },
        { label: "ابحث عن مرشحين", href: "/candidates" },
        { label: "الباقات والأسعار", href: "/pricing" },
        { label: "حلول الشركات", href: "/enterprise" },
        { label: "تواصل معنا", href: "/contact" },
      ],
    },
    contact: {
      title: "تواصل معنا",
      email: "info@forsati.jo",
      phone: "+962 6 XXX XXXX",
      address: "عمّان، الأردن",
    },
    newsletter: {
      title: "النشرة البريدية",
      description: "اشترك للحصول على أحدث الفرص والنصائح المهنية",
      placeholder: "بريدك الإلكتروني",
      button: "اشترك",
    },
    social: "تابعنا",
    copyright: "© {year} فرصتي. جميع الحقوق محفوظة.",
    legal: {
      terms: "شروط الاستخدام",
      privacy: "سياسة الخصوصية",
      cookies: "سياسة ملفات تعريف الارتباط",
    },
  },
  en: {
    about: {
      title: "About Forsati",
      description:
        "Forsati is Jordan's first AI-powered employment platform, connecting job seekers with the best opportunities using artificial intelligence.",
    },
    quickLinks: {
      title: "Quick Links",
      items: [
        { label: "Home", href: "/" },
        { label: "Jobs", href: "/jobs" },
        { label: "Volunteering", href: "/volunteering" },
        { label: "Scholarships", href: "/scholarships" },
        { label: "Courses", href: "/courses" },
      ],
    },
    forJobSeekers: {
      title: "For Job Seekers",
      items: [
        { label: "Create Account", href: "/auth/register" },
        { label: "CV Scan", href: "/cv-scan" },
        { label: "Browse Jobs", href: "/jobs" },
        { label: "Career Tips", href: "/blog" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    forEmployers: {
      title: "For Employers",
      items: [
        { label: "Post a Job", href: "/post-job" },
        { label: "Search Candidates", href: "/candidates" },
        { label: "Pricing", href: "/pricing" },
        { label: "Enterprise Solutions", href: "/enterprise" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    contact: {
      title: "Contact Us",
      email: "info@forsati.jo",
      phone: "+962 6 XXX XXXX",
      address: "Amman, Jordan",
    },
    newsletter: {
      title: "Newsletter",
      description: "Subscribe to get the latest opportunities and career tips",
      placeholder: "Your email",
      button: "Subscribe",
    },
    social: "Follow Us",
    copyright: "© {year} Forsati. All rights reserved.",
    legal: {
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
    },
  },
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/forsati", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/forsati", label: "Twitter" },
  {
    icon: Instagram,
    href: "https://instagram.com/forsati",
    label: "Instagram",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/forsati",
    label: "LinkedIn",
  },
  { icon: Youtube, href: "https://youtube.com/forsati", label: "YouTube" },
];

export function Footer({ locale }: FooterProps) {
  const [email, setEmail] = React.useState("");
  const t = translations[locale];
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="bg-neutral-900 text-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* About */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-xl">
                ف
              </div>
              <span className="font-bold text-2xl">
                {isRTL ? "فرصتي" : "Forsati"}
              </span>
            </Link>
            <p className="text-neutral-400 mb-6 max-w-md">
              {t.about.description}
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">{t.newsletter.title}</h4>
              <p className="text-sm text-neutral-400 mb-3">
                {t.newsletter.description}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  dir={isRTL ? "rtl" : "ltr"}
                  required
                />
                <Button variant="primary" type="submit">
                  <Arrow className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-3">{t.social}</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-primary-500 text-neutral-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.quickLinks.title}</h4>
            <ul className="space-y-2">
              {t.quickLinks.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="font-semibold mb-4">{t.forJobSeekers.title}</h4>
            <ul className="space-y-2">
              {t.forJobSeekers.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers + Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t.forEmployers.title}</h4>
            <ul className="space-y-2 mb-6">
              {t.forEmployers.items.slice(0, 3).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold mb-4">{t.contact.title}</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-neutral-400">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${t.contact.email}`}
                  className="hover:text-white"
                >
                  {t.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href={`tel:${t.contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-white"
                >
                  {t.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{t.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-neutral-400">
              {t.copyright.replace("{year}", String(currentYear))}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {t.legal.terms}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {t.legal.privacy}
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {t.legal.cookies}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
