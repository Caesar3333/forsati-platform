/**
 * Email Templates for Job Applications
 * قوالب البريد الإلكتروني لطلبات التوظيف
 */

import type { EmailTemplateData } from './types';

/**
 * Generate HTML email template for job application
 * توليد قالب HTML للبريد الإلكتروني لطلب التوظيف
 */
export function generateApplicationEmailHtml(data: EmailTemplateData): string {
  const skillsHtml = data.applicantKeySkills
    .map(skill => `<span style="background: #e8f4f8; padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block; font-size: 12px;">${escapeHtml(skill)}</span>`)
    .join('');

  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Application via Forsati | طلب توظيف عبر فرصتي</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .rtl { direction: rtl; text-align: right; }
  </style>
</head>
<body style="background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div class="container" style="max-width: 600px; margin: 0 auto;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${escapeHtml(data.forsatiLogoUrl)}" alt="Forsati | فرصتي" width="150" style="max-width: 150px;">
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">منصة التوظيف الأردنية</p>
    </div>
    
    <!-- Content -->
    <div style="background: #ffffff; padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      
      <!-- Greeting -->
      <p style="color: #333; font-size: 16px; margin: 0 0 20px;">
        Hello ${escapeHtml(data.recruiterName || 'Hiring Team')},
      </p>
      
      <!-- Introduction -->
      <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        <strong>${escapeHtml(data.applicantFullName)}</strong> has applied for the position of 
        <strong>${escapeHtml(data.jobTitle)}</strong> at <strong>${escapeHtml(data.companyName)}</strong> 
        through Forsati.
      </p>
      
      <!-- Summary Card -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1e3a5f;">
        <h3 style="margin: 0 0 20px; color: #1e3a5f; font-size: 18px;">
          📋 Applicant Summary | ملخص المرشح
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #666; padding: 8px 0; width: 140px; vertical-align: top;">
              <strong>Name:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${escapeHtml(data.applicantFullName)}
            </td>
          </tr>
          
          ${data.applicantHeadline ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>Title:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${escapeHtml(data.applicantHeadline)}
            </td>
          </tr>
          ` : ''}
          
          ${data.applicantLocation ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>Location:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              📍 ${escapeHtml(data.applicantLocation)}
            </td>
          </tr>
          ` : ''}
          
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>Email:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              <a href="mailto:${escapeHtml(data.applicantEmail)}" style="color: #1e3a5f; text-decoration: none;">
                ${escapeHtml(data.applicantEmail)}
              </a>
            </td>
          </tr>
          
          ${data.applicantPhone ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>Phone:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              <a href="tel:${escapeHtml(data.applicantPhone)}" style="color: #1e3a5f; text-decoration: none;">
                ${escapeHtml(data.applicantPhone)}
              </a>
            </td>
          </tr>
          ` : ''}
          
          ${data.applicantYearsExperience > 0 ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>Experience:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${data.applicantYearsExperience} years
            </td>
          </tr>
          ` : ''}
          
          ${data.applicantKeySkills.length > 0 ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>Key Skills:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${skillsHtml}
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <!-- Profile Link Button -->
      ${data.profileLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(data.profileLink)}" 
           style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); 
                  color: white; 
                  padding: 14px 40px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  display: inline-block;
                  font-weight: 600;
                  font-size: 15px;
                  box-shadow: 0 4px 15px rgba(30, 58, 95, 0.3);">
          View Full Profile | عرض الملف الشخصي
        </a>
        <p style="color: #999; font-size: 12px; margin: 10px 0 0;">
          Link expires in 7 days | الرابط صالح لمدة 7 أيام
        </p>
      </div>
      ` : ''}
      
      <!-- Custom Message -->
      ${data.customMessage ? `
      <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: #1e3a5f; font-weight: 600; font-size: 14px;">
          💬 Message from Applicant:
        </p>
        <p style="margin: 0; color: #333; font-style: italic; line-height: 1.6;">
          "${escapeHtml(data.customMessage)}"
        </p>
      </div>
      ` : ''}
      
      <!-- Attachments Notice -->
      <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          📎 <strong>Attachments:</strong> Resume/CV attached to this email
          ${data.coverLetterAttachment ? ' • Cover Letter attached' : ''}
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #1e3a5f; padding: 25px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 10px; color: rgba(255,255,255,0.9); font-size: 14px;">
        Sent via <strong>Forsati</strong> — منصة فرصتي
      </p>
      <p style="margin: 0 0 15px; color: rgba(255,255,255,0.7); font-size: 12px;">
        Jordan's Leading Job Platform | منصة التوظيف الرائدة في الأردن
      </p>
      
      ${data.forsatiStampUrl ? `
      <img src="${escapeHtml(data.forsatiStampUrl)}" alt="Forsati Verified" width="60" style="margin: 10px 0;">
      ` : ''}
      
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
        <a href="${escapeHtml(data.privacyPolicyUrl)}" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; margin: 0 10px;">
          Privacy Policy
        </a>
        <span style="color: rgba(255,255,255,0.3);">|</span>
        <a href="${escapeHtml(data.unsubscribeUrl)}" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; margin: 0 10px;">
          Unsubscribe
        </a>
      </div>
      
      <p style="margin: 15px 0 0; color: rgba(255,255,255,0.5); font-size: 10px;">
        © ${new Date().getFullYear()} Forsati. All rights reserved.
      </p>
    </div>
    
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template
 */
export function generateApplicationEmailText(data: EmailTemplateData): string {
  const lines = [
    `Job Application via Forsati | طلب توظيف عبر فرصتي`,
    `${'='.repeat(50)}`,
    ``,
    `Hello ${data.recruiterName || 'Hiring Team'},`,
    ``,
    `${data.applicantFullName} has applied for the position of "${data.jobTitle}" at ${data.companyName} through Forsati.`,
    ``,
    `APPLICANT SUMMARY`,
    `${'─'.repeat(30)}`,
    `Name: ${data.applicantFullName}`,
  ];

  if (data.applicantHeadline) {
    lines.push(`Title: ${data.applicantHeadline}`);
  }

  if (data.applicantLocation) {
    lines.push(`Location: ${data.applicantLocation}`);
  }

  lines.push(`Email: ${data.applicantEmail}`);

  if (data.applicantPhone) {
    lines.push(`Phone: ${data.applicantPhone}`);
  }

  if (data.applicantYearsExperience > 0) {
    lines.push(`Experience: ${data.applicantYearsExperience} years`);
  }

  if (data.applicantKeySkills.length > 0) {
    lines.push(`Key Skills: ${data.applicantKeySkills.join(', ')}`);
  }

  if (data.profileLink) {
    lines.push(``);
    lines.push(`VIEW FULL PROFILE: ${data.profileLink}`);
    lines.push(`(Link expires in 7 days)`);
  }

  if (data.customMessage) {
    lines.push(``);
    lines.push(`MESSAGE FROM APPLICANT:`);
    lines.push(`"${data.customMessage}"`);
  }

  lines.push(``);
  lines.push(`${'─'.repeat(30)}`);
  lines.push(`Attachments: Resume/CV attached`);
  if (data.coverLetterAttachment) {
    lines.push(`            Cover Letter attached`);
  }

  lines.push(``);
  lines.push(`${'='.repeat(50)}`);
  lines.push(`Sent via Forsati — منصة فرصتي`);
  lines.push(`Jordan's Leading Job Platform`);
  lines.push(``);
  lines.push(`Privacy Policy: ${data.privacyPolicyUrl}`);
  lines.push(`Unsubscribe: ${data.unsubscribeUrl}`);

  return lines.join('\n');
}

/**
 * Generate email subject line
 */
export function generateEmailSubject(data: Pick<EmailTemplateData, 'jobTitle' | 'applicantFullName' | 'companyName'>): string {
  return `Application: ${data.jobTitle} — ${data.applicantFullName} — via Forsati`;
}

/**
 * Arabic version of email template
 */
export function generateApplicationEmailHtmlArabic(data: EmailTemplateData): string {
  const skillsHtml = data.applicantKeySkills
    .map(skill => `<span style="background: #e8f4f8; padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block; font-size: 12px;">${escapeHtml(skill)}</span>`)
    .join('');

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب توظيف عبر فرصتي</title>
</head>
<body style="background-color: #f5f5f5; margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; direction: rtl; text-align: right;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${escapeHtml(data.forsatiLogoUrl)}" alt="فرصتي" width="150" style="max-width: 150px;">
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">منصة التوظيف الأردنية</p>
    </div>
    
    <!-- Content -->
    <div style="background: #ffffff; padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      
      <p style="color: #333; font-size: 16px; margin: 0 0 20px;">
        مرحباً ${escapeHtml(data.recruiterName || 'فريق التوظيف')},
      </p>
      
      <p style="color: #333; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
        تقدم <strong>${escapeHtml(data.applicantFullName)}</strong> لوظيفة 
        <strong>${escapeHtml(data.jobTitle)}</strong> في <strong>${escapeHtml(data.companyName)}</strong> 
        عبر منصة فرصتي.
      </p>
      
      <!-- Summary Card -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-right: 4px solid #1e3a5f;">
        <h3 style="margin: 0 0 20px; color: #1e3a5f; font-size: 18px;">
          📋 ملخص المرشح
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #666; padding: 8px 0; width: 120px; vertical-align: top;">
              <strong>الاسم:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${escapeHtml(data.applicantFullName)}
            </td>
          </tr>
          
          ${data.applicantHeadline ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>المسمى:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${escapeHtml(data.applicantHeadline)}
            </td>
          </tr>
          ` : ''}
          
          ${data.applicantLocation ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>الموقع:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              📍 ${escapeHtml(data.applicantLocation)}
            </td>
          </tr>
          ` : ''}
          
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>البريد:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              <a href="mailto:${escapeHtml(data.applicantEmail)}" style="color: #1e3a5f; text-decoration: none;">
                ${escapeHtml(data.applicantEmail)}
              </a>
            </td>
          </tr>
          
          ${data.applicantPhone ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>الهاتف:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              <a href="tel:${escapeHtml(data.applicantPhone)}" style="color: #1e3a5f; text-decoration: none; direction: ltr; display: inline-block;">
                ${escapeHtml(data.applicantPhone)}
              </a>
            </td>
          </tr>
          ` : ''}
          
          ${data.applicantYearsExperience > 0 ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>الخبرة:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${data.applicantYearsExperience} سنوات
            </td>
          </tr>
          ` : ''}
          
          ${data.applicantKeySkills.length > 0 ? `
          <tr>
            <td style="color: #666; padding: 8px 0; vertical-align: top;">
              <strong>المهارات:</strong>
            </td>
            <td style="color: #333; padding: 8px 0;">
              ${skillsHtml}
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <!-- Profile Link Button -->
      ${data.profileLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(data.profileLink)}" 
           style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); 
                  color: white; 
                  padding: 14px 40px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  display: inline-block;
                  font-weight: 600;
                  font-size: 15px;">
          عرض الملف الشخصي الكامل
        </a>
        <p style="color: #999; font-size: 12px; margin: 10px 0 0;">
          الرابط صالح لمدة 7 أيام
        </p>
      </div>
      ` : ''}
      
      ${data.customMessage ? `
      <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: #1e3a5f; font-weight: 600; font-size: 14px;">
          💬 رسالة من المتقدم:
        </p>
        <p style="margin: 0; color: #333; font-style: italic; line-height: 1.8;">
          "${escapeHtml(data.customMessage)}"
        </p>
      </div>
      ` : ''}
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-right: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          📎 <strong>المرفقات:</strong> السيرة الذاتية مرفقة مع هذا البريد
          ${data.coverLetterAttachment ? ' • خطاب التقديم مرفق' : ''}
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #1e3a5f; padding: 25px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 10px; color: rgba(255,255,255,0.9); font-size: 14px;">
        تم الإرسال عبر <strong>فرصتي</strong>
      </p>
      <p style="margin: 0 0 15px; color: rgba(255,255,255,0.7); font-size: 12px;">
        منصة التوظيف الرائدة في الأردن
      </p>
      
      ${data.forsatiStampUrl ? `
      <img src="${escapeHtml(data.forsatiStampUrl)}" alt="Forsati Verified" width="60" style="margin: 10px 0;">
      ` : ''}
      
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
        <a href="${escapeHtml(data.privacyPolicyUrl)}" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; margin: 0 10px;">
          سياسة الخصوصية
        </a>
        <span style="color: rgba(255,255,255,0.3);">|</span>
        <a href="${escapeHtml(data.unsubscribeUrl)}" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; margin: 0 10px;">
          إلغاء الاشتراك
        </a>
      </div>
      
      <p style="margin: 15px 0 0; color: rgba(255,255,255,0.5); font-size: 10px;">
        © ${new Date().getFullYear()} فرصتي. جميع الحقوق محفوظة.
      </p>
    </div>
    
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
