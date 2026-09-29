/**
 * Tamenny Faculty Dean Portal - i18n Translation Dictionary
 * Provides complete English and Arabic localization for all UI elements.
 */

const DeanTranslations = {
  en: {
    // Brand & Sidebar
    brand_name: 'Tamenny',
    nav_section_audit: 'OBSERVABILITY & AUDIT',
    nav_section_system: 'SYSTEM',
    nav_dashboard: 'Dashboard',
    nav_interns: 'Interns Directory',
    nav_profile: 'Profile',
    nav_faculty: 'Faculty Profile',
    observability_badge: 'Academic Observatory',
    faculty_name: 'Faculty of Pharmacy',
    faculty_uni: 'Cairo University',

    // Topbar
    search_placeholder: 'Search intern, ID, pharmacy...',
    title_dashboard: 'Dashboard',
    title_interns: 'Interns Directory',
    title_profile: 'Dean Profile',
    title_faculty: 'Faculty Settings',
    title_intern_detail: 'Intern Profile',
    theme_toggle: 'Toggle Dark / Light Mode',
    lang_toggle: 'Switch Language (عربي / EN)',

    // Hero Search & Filters
    hero_search_title: 'Quick Search',
    hero_search_placeholder: 'Search by name, ID, or pharmacy name...',
    filter_all: 'All',
    filter_active: 'Active',
    filter_completed: 'Completed',
    filter_under_review: 'Under Review',

    // Metrics Cards
    metric_performance: 'Avg Performance Rating',
    metric_operations: 'Clinical Operations',
    metric_interns: 'Total Interns',

    // Progress Section
    progress_chart_title: 'Training Hours Progress Distribution',
    progress_chart_sub: 'Average Completion Time: 92.3 Days',

    // Tables & Feeds
    feed_title: 'Live Field Activity Stream',
    feed_sub: 'Real-time Operations Feed',
    interns_table_title: 'Interns',
    interns_table_sub: 'Direct Access to Student Profiles',
    table_col_intern: 'Intern',
    table_col_status: 'Status',
    table_col_operations: 'Operations',
    table_col_file: 'Medical File',
    table_col_actions: 'Actions',
    btn_view_file: 'Medical File',
    btn_details: 'Details',
    status_active: 'Active',
    status_completed: 'Completed',

    // Dean Info Profile Card
    dean_name: 'Prof. Dr. Khaled El-Sayed Ibrahim',
    dean_title: 'Dean of Faculty of Pharmacy',
    dean_degree: 'Professor of Biochemistry & Drug Quality Control',
    dean_office: 'Admin Building - Kasr Al-Ainy, Cairo',
    accreditation_status: 'Accredited',

    // Modal & Toast
    modal_close: 'Close',
    toast_copied: 'Copied to clipboard',
    toast_lang_changed: 'Language updated'
  },

  ar: {
    // Brand & Sidebar
    brand_name: 'طَمّني',
    nav_section_audit: 'المتابعة والتدقيق',
    nav_section_system: 'النظام',
    nav_dashboard: 'الرئيسية',
    nav_interns: 'سجل المتدربين',
    nav_profile: 'الملف الشخصي',
    nav_faculty: 'ملف الكلية',
    observability_badge: 'المرصد الأكاديمي',
    faculty_name: 'كلية الصيدلة',
    faculty_uni: 'جامعة القاهرة',

    // Topbar
    search_placeholder: 'بحث عن متدرب، كود، صيدلية...',
    title_dashboard: 'الرئيسية',
    title_interns: 'سجل المتدربين',
    title_profile: 'الملف الشخصي للعميد',
    title_faculty: 'إعدادات الكلية',
    title_intern_detail: 'تفاصيل المتدرب',
    theme_toggle: 'تبديل الوضع الداكن / الفاتح',
    lang_toggle: 'تبديل اللغة والاتجاه (عربي / EN)',

    // Hero Search & Filters
    hero_search_title: 'البحث الفوري',
    hero_search_placeholder: '...ابحث بالاسم، رقم القيد، أو اسم الصيدلية',
    filter_all: 'الكل',
    filter_active: 'نشط',
    filter_completed: 'مكتمل',
    filter_under_review: 'متابعة',

    // Metrics Cards
    metric_performance: 'متوسط تقييم الكفاءة',
    metric_operations: 'العمليات السريرية',
    metric_interns: 'المتدربون',

    // Progress Section
    progress_chart_title: 'توزيع نسب إنجاز ساعات التدريب',
    progress_chart_sub: 'متوسط أيام الإنجاز: 92.3 يوم',

    // Tables & Feeds
    feed_title: 'النشاط الميداني المباشر',
    feed_sub: 'تدفق فوري للعمليات',
    interns_table_title: 'المتدربون',
    interns_table_sub: 'الوصول المباشر لملفات الطلاب',
    table_col_intern: 'المتدرب',
    table_col_status: 'الحالة',
    table_col_operations: 'العمليات',
    table_col_file: 'الملف الطبي',
    table_col_actions: 'التفاصيل',
    btn_view_file: 'الملف الطبي',
    btn_details: 'التفاصيل',
    status_active: 'نشط',
    status_completed: 'مكتمل',

    // Dean Info Profile Card
    dean_name: 'أ.د. خالد السيد إبراهيم',
    dean_title: 'عميد كلية الصيدلة',
    dean_degree: 'أستاذ الكيمياء الحيوية والرقابة الدوائية',
    dean_office: 'المبنى الإداري - قصر العيني، القاهرة',
    accreditation_status: 'معتمد',

    // Modal & Toast
    modal_close: 'إغلاق',
    toast_copied: 'تم النسخ إلى الحافظة',
    toast_lang_changed: 'تم تحديث اللغة'
  }
};

/**
 * Translates a key based on current document language attribute.
 */
function t(key) {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (DeanTranslations[lang] && DeanTranslations[lang][key]) || DeanTranslations['en'][key] || key;
}

/**
 * Scans DOM elements with [data-i18n] and updates their textContent or attributes.
 */
function applyDeanTranslations() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const val = t(key);
    if (attr) {
      el.setAttribute(attr, val);
    } else {
      el.textContent = val;
    }
  });
}
