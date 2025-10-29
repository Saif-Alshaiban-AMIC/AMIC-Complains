/**
 * Department email configuration
 * Maps department IDs to recipient email addresses
 */

export const departmentEmails = {
  hr: 'hr@company.com',
  finance: 'finance@company.com',
  it: 'it@company.com',
  compliance: 'compliance@company.com',
  other: 'other@company.com',
  project: 'projectmanagement@company.com'
};



/**
 * Department names in English and Arabic
 */
export const departments = {
  en: [
    { id: 'hr', name: 'Human Resources' },
    { id: 'finance', name: 'Finance' },
    { id: 'it', name: 'Information Technology' },
    { id: 'compliance', name: 'Contracts & Compliance' },
    { id: 'project', name: 'Project Management' },
    { id: 'other', name: 'Other' },
  ],
  ar: [
    { id: 'hr', name: 'الموارد البشرية' },
    { id: 'finance', name: 'المالية' },
    { id: 'it', name: 'تقنية المعلومات' },
    { id: 'compliance', name: 'العقود والامتثال' },
    { id: 'project', name: 'إدارة المشاريع' },
    { id: 'other', name: 'أخرى' },
  ]
};


/**
 * Generate email subject based on department and language
 */
export const getEmailSubject = (departmentId, language = 'en') => {
  const dept = departments[language].find(d => d.id === departmentId);
  const deptName = dept ? dept.name : 'General';

  return language === 'en'
    ? `[CONFIDENTIAL] Whistleblower Report - ${deptName}`
    : `[سري] بلاغ المبلغين عن المخالفات - ${deptName}`;
};

/**
 * Generate email body content
 * @param {Object} formData - Form data from submission
 * @param {string} language - Current language (en/ar)
 * @returns {string} - Formatted email body
 */
export const generateEmailBody = (formData, language = 'en') => {
  const { name, email, organization, message, department } = formData;

  if (language === 'ar') {
    return `
تقرير بلاغ سري جديد

═══════════════════════════════════════

📋 تفاصيل التقرير:
${'-'.repeat(50)}

القسم المعني: ${departments.ar.find(d => d.id === department)?.name || 'غير محدد'}

الاسم: ${name || 'مجهول'}
البريد الإلكتروني: ${email || 'غير مقدم'}
المؤسسة: ${organization || 'غير محددة'}

═══════════════════════════════════════

📝 تفاصيل البلاغ:

${message}

═══════════════════════════════════════

⚠️ تنويه:
• هذا البلاغ سري ويجب معالجته وفقاً لسياسة حماية المبلغين
• تمت إزالة جميع البيانات الوصفية من المرفقات لحماية هوية المُبلِّغ
• يرجى التعامل مع هذه المعلومات بسرية تامة
• الرد على هذا البلاغ خلال 48 ساعة مطلوب

تاريخ الاستلام: ${new Date().toLocaleString('ar-SA')}

═══════════════════════════════════════

هذا البلاغ تم إرساله عبر منصة SecureReport
    `.trim();
  }

  // English template
  return `
New Confidential Whistleblower Report

═══════════════════════════════════════

📋 REPORT DETAILS:
${'-'.repeat(50)}

Department: ${departments.en.find(d => d.id === department)?.name || 'Unspecified'}

Name: ${name || 'Anonymous'}
Email: ${email || 'Not provided'}
Organization: ${organization || 'Not specified'}

═══════════════════════════════════════

📝 REPORT CONTENT:

${message}

═══════════════════════════════════════

⚠️ IMPORTANT NOTICE:
• This report is confidential and must be handled per whistleblower protection policy
• All metadata has been removed from attachments to protect reporter identity
• Please treat this information with strict confidentiality
• Response to this report is required within 48 hours

Date Received: ${new Date().toLocaleString('en-US')}

═══════════════════════════════════════

This report was submitted through SecureReport Platform
  `.trim();
};


