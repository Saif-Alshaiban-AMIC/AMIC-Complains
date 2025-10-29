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

export const sites = {
  en: [
    { id: 'riyadh', name: 'Riyadh HQ' },
    { id: 'jeddah', name: 'Jeddah' },
    { id: 'dammam', name: 'Dammam' },
    { id: 'khasm', name: 'Khasm Alan' },
    { id: 'taif', name: 'Taif' },
    { id: 'qassim', name: 'Qassim' },
    { id: 'hofuf', name: 'Hofuf' },
    { id: 'medina', name: 'Medina' },
  ],
  ar: [
    { id: 'riyadh', name: 'الرياض - المركز الرئيسي' },
    { id: 'jeddah', name: 'جدة' },
    { id: 'dammam', name: 'الدمام' },
    { id: 'khasm', name: 'خشم العان' },
    { id: 'taif', name: 'الطائف' },
    { id: 'qassim', name: 'القصيم' },
    { id: 'hofuf', name: 'الهفوف' },
    { id: 'medina', name: 'المدينة المنورة' },
  ]
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
  const { name, email, organization, message, department, site } = formData;

  const siteName = site
    ? sites[language].find(s => s.id === site)?.name || (language === 'ar' ? 'غير محدد' : 'Not specified')
    : (language === 'ar' ? 'غير محدد' : 'Not specified');

  if (language === 'ar') {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-right: 4px solid #3b82f6; border-radius: 5px; }
    .label { font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
    .value { color: #333; margin-bottom: 15px; }
    .message-box { background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #bae6fd; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #fef3c7; padding: 15px; border-right: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔒 بلاغ سري جديد</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">تقرير المبلغين عن المخالفات</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="label">📋 القسم المعني:</div>
        <div class="value">${departments.ar.find(d => d.id === department)?.name || 'غير محدد'}</div>
        
        <div class="label">📍 الموقع:</div>
        <div class="value">${siteName}</div>
        
        <div class="label">👤 الاسم:</div>
        <div class="value">${name || 'مجهول'}</div>
        
        <div class="label">📧 البريد الإلكتروني:</div>
        <div class="value">${email || 'غير مقدم'}</div>
        
        
      </div>
      
      <div class="message-box">
        <div class="label">📝 تفاصيل البلاغ:</div>
        <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${message}</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ تنويه هام:</strong>
        <ul style="margin: 10px 0; padding-right: 20px;">
          <li>هذا البلاغ سري ويجب معالجته وفقاً لسياسة حماية المبلغين</li>
          <li>تمت إزالة جميع البيانات الوصفية من المرفقات لحماية هوية المُبلِّغ</li>
          <li>يرجى التعامل مع هذه المعلومات بسرية تامة</li>
          
        </ul>
      </div>
      
      <div style="text-align: center; color: #666; margin-top: 20px;">
        <p>📅 تاريخ الاستلام: ${new Date().toLocaleString('ar-SA', {
      timeZone: 'Asia/Riyadh',
      dateStyle: 'full',
      timeStyle: 'long'
    })}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>هذا البلاغ تم إرساله عبر منصة Speak Safe AMIC الآمنة</p>
      <p style="color: #999;">يرجى عدم الرد على هذا البريد الإلكتروني مباشرة</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  // English HTML template
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 5px; }
    .label { font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
    .value { color: #333; margin-bottom: 15px; }
    .message-box { background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #bae6fd; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔒 New Confidential Report</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Whistleblower Submission</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="label">📋 Department:</div>
        <div class="value">${departments.en.find(d => d.id === department)?.name || 'Unspecified'}</div>
        
        <div class="label">📍 Location:</div>
        <div class="value">${siteName}</div>
        
        <div class="label">👤 Name:</div>
        <div class="value">${name || 'Anonymous'}</div>
        
        <div class="label">📧 Email:</div>
        <div class="value">${email || 'Not provided'}</div>
        
        
      </div>
      
      <div class="message-box">
        <div class="label">📝 Report Details:</div>
        <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${message}</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ IMPORTANT NOTICE:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This report is confidential and must be handled per whistleblower protection policy</li>
          <li>All metadata has been removed from attachments to protect reporter identity</li>
          <li>Please treat this information with strict confidentiality</li>
      
        </ul>
      </div>
      
      <div style="text-align: center; color: #666; margin-top: 20px;">
        <p>📅 Date Received: ${new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Riyadh',
    dateStyle: 'full',
    timeStyle: 'long'
  })}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>This report was submitted through Speak Safe AMIC Platform</p>
      <p style="color: #999;">Please do not reply directly to this email</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};
