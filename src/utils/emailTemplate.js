/**
 * Department email configuration
 * Maps department IDs to recipient email addresses
 */
export const departmentEmails = {
  hr: 'hr@company.com',
  finance: 'finance@company.com',
  it: 'it@company.com',
  operations: 'operations@company.com',
  legal: 'legal@company.com',
  compliance: 'compliance@company.com',
  management: 'management@company.com'
};

/**
 * Department names in English and Arabic
 */
export const departments = {
  en: [
    { id: 'hr', name: 'Human Resources' },
    { id: 'finance', name: 'Finance & Accounting' },
    { id: 'it', name: 'Information Technology' },
    { id: 'operations', name: 'Operations' },
    { id: 'legal', name: 'Legal' },
    { id: 'compliance', name: 'Compliance & Ethics' },
    { id: 'management', name: 'Senior Management' }
  ],
  ar: [
    { id: 'hr', name: 'الموارد البشرية' },
    { id: 'finance', name: 'المالية والمحاسبة' },
    { id: 'it', name: 'تقنية المعلومات' },
    { id: 'operations', name: 'العمليات' },
    { id: 'legal', name: 'الشؤون القانونية' },
    { id: 'compliance', name: 'الامتثال والأخلاقيات' },
    { id: 'management', name: 'الإدارة العليا' }
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

/**
 * Power Automate Flow Configuration
 * Replace this URL with your actual Power Automate Flow webhook URL
 */
export const POWER_AUTOMATE_WEBHOOK_URL = 'YOUR_POWER_AUTOMATE_WEBHOOK_URL_HERE';

/**
 * Prepare data for Power Automate
 * @param {Object} formData - Form data
 * @param {Array} attachments - File attachments
 * @param {string} language - Current language
 * @returns {Object} - Formatted data for Power Automate
 */
export const preparePowerAutomateData = async (formData, attachments, language) => {
  const recipientEmail = departmentEmails[formData.department];
  const subject = getEmailSubject(formData.department, language);
  const body = generateEmailBody(formData, language);
  
  // Convert attachments to base64 for Power Automate
  const attachmentData = await Promise.all(
    attachments.map(async (att) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: att.name,
            contentBytes: e.target.result.split(',')[1], // Get base64 part only
            contentType: att.type
          });
        };
        reader.readAsDataURL(att.file);
      });
    })
  );
  
  return {
    recipientEmail,
    subject,
    body,
    attachments: attachmentData,
    metadata: {
      department: formData.department,
      language,
      submittedAt: new Date().toISOString(),
      hasAttachments: attachments.length > 0,
      attachmentCount: attachments.length
    }
  };
};

/**
 * Send report via Power Automate
 * @param {Object} data - Prepared data for Power Automate
 * @returns {Promise} - Fetch promise
 */
export const sendViaPowerAutomate = async (data) => {
  try {
    const response = await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending via Power Automate:', error);
    throw error;
  }
};