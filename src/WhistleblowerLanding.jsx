import React, { useState } from 'react';
import { Shield, Lock, FileText, MessageSquare, ChevronDown, Menu, X, Globe, Upload, File, XCircle } from 'lucide-react';
import en from './locale/en.json';
import ar from './locale/ar.json';
// Import utility functions
import { stripMetadata, formatFileSize, validateFileSize, validateFileType } from './utils/metadataUtils';
import {
  departments, sites, getEmailSubject, generateEmailBody, departmentEmails
} from './utils/emailTemplate';
import { fileToBase64 } from './utils/base64';

const translations = { en, ar };

// Allowed file types for upload
const ALLOWED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export default function WhistleblowerLanding() {
  const [language, setLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    site: '',
    department: '', // Added department field
    message: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Added submitting state

  const t = translations[language];
  const isRTL = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      // Validate files before processing
      const validFiles = files.filter(file => {
        // Validate file size (max 10MB)
        if (!validateFileSize(file, 10)) {
          alert(language === 'en'
            ? `File "${file.name}" exceeds 10MB limit`
            : `الملف "${file.name}" يتجاوز حد 10 ميجابايت`);
          return false;
        }

        // Validate file type
        if (!validateFileType(file, ALLOWED_FILE_TYPES)) {
          alert(language === 'en'
            ? `File type not allowed: "${file.name}"`
            : `نوع الملف غير مسموح به: "${file.name}"`);
          return false;
        }

        return true;
      });

      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          // Strip metadata using utility function
          const strippedFile = await stripMetadata(file);

          return {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            file: strippedFile
          };
        })
      );

      setAttachments([...attachments, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      alert(language === 'en'
        ? 'Error processing files. Please try again.'
        : 'خطأ في معالجة الملفات. يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate department selection
    if (!formData.department) {
      alert(language === 'en'
        ? 'Please select a department'
        : 'يرجى اختيار قسم');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare email data
      const subject = getEmailSubject(formData.department, language);
      const body = generateEmailBody(formData, language);

      const files = attachments;

      const preparedAttachments  = await Promise.all(
        files.map(async file => ({
          filename: file.name,
          content: await fileToBase64(file),
          contentType: file.type
        }))
      );




      // Call your Netlify function
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: departmentEmails[formData.department], // department email
          subject,
          body,
          attachments:preparedAttachments
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Success message
      alert(language === 'en'
        ? 'Report submitted securely. You will receive a confirmation email with your case ID.'
        : 'تم تقديم البلاغ بأمان. ستتلقى بريدًا إلكترونيًا للتأكيد مع رقم الحالة الخاص بك.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        site: '',
        department: '',
        message: ''
      });
      setAttachments([]);

    } catch (error) {
      console.error('Error submitting report:', error);
      alert(language === 'en'
        ? 'Error submitting report. Please try again or contact support.'
        : 'خطأ في تقديم البلاغ. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-blue-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Speak Safe AMIC</span>
            </div>

            {/* Desktop Navigation */}
            <div className={`hidden md:flex items-center space-x-8 ${isRTL ? 'space-x-reverse' : ''}`}>
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                {t.nav.home}
              </button>
              <button
                onClick={() => scrollToSection('form')}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                {t.nav.form}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                {t.nav.faq}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-blue-500/20">
            <div className="px-4 py-3 space-y-3">
              <button
                onClick={() => scrollToSection('home')}
                className="block w-full text-left text-gray-300 hover:text-blue-400 transition-colors"
              >
                {t.nav.home}
              </button>
              <button
                onClick={() => scrollToSection('form')}
                className="block w-full text-left text-gray-300 hover:text-blue-400 transition-colors"
              >
                {t.nav.form}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left text-gray-300 hover:text-blue-400 transition-colors"
              >
                {t.nav.faq}
              </button>
              <button
                onClick={toggleLanguage}
                className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors w-full`}
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
            <span className="text-blue-300 text-sm font-medium">{t.hero.badge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t.hero.title1}<br />{t.hero.title2}
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('form')}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              {t.hero.submitBtn}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all border border-blue-500/30"
            >
              {t.hero.learnBtn}
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">

            <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">{t.features.anonymity.title}</h3>
              <p className="text-gray-400">{t.features.anonymity.desc}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">{t.features.legal.title}</h3>
              <p className="text-gray-400">{t.features.legal.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="form" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{t.form.title}</h2>
            <p className="text-gray-300">{t.form.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-blue-500/20">
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">{t.form.name}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t.form.namePlaceholder}
                className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">{t.form.email}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t.form.emailPlaceholder}
                className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {/* Department Dropdown - ADDED */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                {language === 'en' ? 'Department *' : 'القسم *'}
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">
                  {language === 'en' ? '-- Select Department --' : '-- اختر القسم --'}
                </option>
                {departments[language].map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>




            {/* Site Dropdown - ADDED */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                {language === 'en' ? 'Location (Optional)' : 'الموقع (اختياري)'}
              </label>
              <select
                required
                name="site"
                value={formData.site}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">
                  {language === 'en' ? '-- Select Location --' : '-- اختر الموقع --'}
                </option>
                {sites[language].map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">{t.form.message}</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="8"
                placeholder={t.form.messagePlaceholder}
                className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* File Upload Section */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                {language === 'en' ? 'Attachments (Optional)' : 'المرفقات (اختياري)'}
              </label>
              <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-blue-400 mb-3" />
                  <span className="text-gray-300 mb-2">
                    {language === 'en'
                      ? 'Click to upload or drag and drop'
                      : 'انقر للتحميل أو اسحب وأفلت'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {language === 'en'
                      ? 'Images, PDFs, Documents (Max 10MB each)'
                      : 'الصور، ملفات PDF، المستندات (حد أقصى 10 ميجابايت لكل ملف)'}
                  </span>
                </label>
              </div>

              {/* Metadata Stripping Notice */}
              <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className={`flex items-start space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    {language === 'en'
                      ? 'All metadata (location, device info, etc.) is automatically removed from uploaded files to protect your privacy.'
                      : 'تتم إزالة جميع البيانات الوصفية (الموقع، معلومات الجهاز، إلخ) تلقائيًا من الملفات المحملة لحماية خصوصيتك.'}
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-slate-900/50 border border-blue-500/30 rounded-lg p-3"
                    >
                      <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} flex-1`}>
                        <File className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className={`text-red-400 hover:text-red-300 transition-colors ${isRTL ? 'mr-2' : 'ml-2'}`}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploading && (
                <div className="mt-3 text-center text-blue-400 text-sm">
                  {language === 'en' ? 'Processing files...' : 'معالجة الملفات...'}
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className={`flex items-start space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Lock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  {t.form.securityNote}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || submitting}
              className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting
                ? (language === 'en' ? 'Submitting...' : 'جارٍ الإرسال...')
                : t.form.submitBtn
              }
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{t.faq.title}</h2>
            <p className="text-gray-300">{t.faq.subtitle}</p>
          </div>

          <div className="space-y-4">
            {t.faq.questions.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur rounded-xl border border-blue-500/20 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/70 transition-colors"
                >
                  <span className={`text-lg font-semibold text-white ${isRTL ? 'pl-4' : 'pr-4'}`}>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-400 flex-shrink-0 transition-transform ${openFaq === index ? 'transform rotate-180' : ''
                      }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-500/30 text-center">
            <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">{t.faq.stillQuestions}</h3>
            <p className="text-gray-300 mb-6">{t.faq.supportText}</p>
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all">
              {t.faq.contactBtn}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-blue-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`flex items-center justify-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} mb-4`}>
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold text-white">SecureReport</span>
          </div>
          <p className="text-gray-400 text-sm">
            {t.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}