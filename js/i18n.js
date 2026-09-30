/**
 * Tamenny Faculty Dean Portal - i18n Translation Dictionary
 * Comprehensive localization system for English (LTR) and Arabic (RTL).
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

    // Topbar & Search
    search_placeholder: 'Search intern, ID, pharmacy...',
    title_dashboard: 'Dashboard',
    title_interns: 'Interns Directory',
    title_profile: 'Dean Profile',
    title_faculty: 'Faculty Settings',
    title_intern_detail: 'Student Clinical Dossier',
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
    progress_chart_sub: 'Average Completion Time:',
    progress_chart_sub_prefix: 'Average Completion Time:',
    progress_days_unit: 'Days',

    // Tables & Feeds
    feed_title: 'Live Field Activity Stream',
    feed_sub: 'Real-time Operations Feed',
    live_badge: 'LIVE',
    interns_table_title: 'Interns',
    interns_table_sub: 'Direct Access to Student Profiles',
    page_interns_title: 'Faculty Interns Directory',
    page_interns_sub: 'Track Performance & Training Hours',
    btn_print: 'Print Roster',
    btn_full_directory: 'Full Directory',
    table_col_intern: 'Intern',
    table_col_governorate: 'Governorate',
    table_col_status: 'Status',
    table_col_operations: 'Operations',
    table_col_file: 'Medical File',
    table_col_actions: 'Actions',
    btn_view_file: 'Medical File',
    btn_details: 'Details',
    status_active: 'Active',
    status_completed: 'Completed',
    status_pending: 'Pending',
    status_risk: 'Under Review',
    ops_suffix: 'ops',
    no_results: 'No matching results found.',

    // Faculty Settings Section
    faculty_details_title: 'Faculty Details',
    label_university: 'University',
    label_faculty: 'Faculty',
    label_dean_name: 'Responsible Dean',
    label_academic_year: 'Academic Year',
    export_reports_title: 'Export Reports',
    export_reports_sub: 'Official Documents',
    btn_pdf_report: 'Field Training Grades List (PDF)',
    btn_excel_report: 'Full Students Roster (Excel)',

    // Dean Profile Section
    badge_accredited_active: 'Accredited & Active',
    btn_edit_profile: 'Edit Details',
    btn_logout: 'Sign Out',
    office_details_title: 'Accreditation & Office Details',
    office_details_sub: 'Official Dean Information',
    label_academic_email: 'Academic Email',
    label_direct_phone: 'Direct Phone',
    label_office_location: 'Office Location',
    label_institution: 'Institution',
    label_national_accreditation: 'National Accreditation',
    val_naqaae_accredited: 'NAQAAE Accredited',
    val_admin_building: 'Admin Building - Kasr Al-Ainy, Cairo',

    // Modals
    edit_modal_title: 'Edit Contact Information',
    edit_modal_sub: 'Email, Phone & Official Office',
    btn_cancel: 'Cancel',
    btn_save_changes: 'Save Changes',

    // Student Dossier Tabs
    btn_back: 'Back',
    tab_chats: 'Patient Conversations',
    tab_rx: 'Audited Prescriptions',
    tab_plans: 'Treatment Plans',
    tab_orders: 'Order Dispensing',
    tab_attendance: 'Attendance Log',
    tab_evaluations: 'Supervisor Ratings',

    // Activity Stream Items
    action_rx: 'Prescription Audit',
    action_plan: 'Treatment Plan',
    action_dispense: 'Order Dispensed',
    verified: 'Verified',
    unverified: 'Pending Verification',

    // Toast Messages
    modal_close: 'Close',
    toast_copied: 'Copied to clipboard',
    toast_lang_changed: 'Language updated',

    // Academic Supervisors & Placement (Part 4.2 & 4.4 API Guide)
    nav_supervisors: 'Academic Supervisors',
    nav_unassigned: 'Unassigned Queue',
    title_supervisors: 'Academic Supervisors',
    title_unassigned: 'Unassigned Interns Queue',
    supervisors_title: 'Academic Supervisors Directory',
    supervisors_sub: 'Faculty Teaching Staff & Clinical Mentors',
    unassigned_title: 'Unassigned Interns Placement Queue',
    unassigned_sub: 'Approved interns waiting for faculty placement',
    btn_create_supervisor: 'Add Academic Supervisor',
    btn_assign_intern: 'Assign Intern',
    col_supervisor_name: 'Supervisor Name',
    col_syndicate_license: 'Syndicate License',
    col_experience: 'Experience',
    col_capacity: 'Intern Load',
    modal_create_supervisor_title: 'Create Academic Supervisor Account',
    modal_create_supervisor_sub: 'Mint a new supervisor login for your faculty',
    modal_assign_intern_title: 'Assign Intern to Supervisor & Pharmacy',
    modal_assign_intern_sub: 'Set up internship assignment and supervisor mentorship',
    field_email: 'Academic Email',
    field_password: 'Password (Optional — Auto-generated if empty)',
    field_name: 'Full Name',
    field_phone: 'Phone Number',
    field_syndicate_license: 'Syndicate License Number',
    field_years_experience: 'Years of Experience',
    field_max_capacity: 'Max Intern Capacity',
    field_pharmacy_branch: 'Affiliated Pharmacy Branch (Optional)',
    field_training_program: 'Training Program',
    field_supervisor: 'Assigned Supervisor',
    field_pharmacy: 'Partner Pharmacy & Branch',
    field_start_date: 'Start Date',
    field_expected_end_date: 'Expected End Date (Optional)',
    password_modal_title: 'Supervisor Account Minted',
    password_modal_msg: 'Please share this one-time generated password with the supervisor now. It will not be displayed again.',
    btn_copy_password: 'Copy Password',
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

    // Academic Supervisors & Placement (Part 4.2 & 4.4 API Guide)
    nav_supervisors: 'المشرفون الأكاديميون',
    nav_unassigned: 'قائمة انتظار التسكين',
    title_supervisors: 'المشرفون الأكاديميون',
    title_unassigned: 'قائمة انتظار التسكين',
    supervisors_title: 'سجل المشرفين الأكاديميين',
    supervisors_sub: 'أعضاء الهيئة المعاونة والمشرفون الميدانيون',
    unassigned_title: 'قائمة انتظار تسكين المتدربين',
    unassigned_sub: 'الطلاب المعتمدون بانتظار التسكين الميداني',
    btn_create_supervisor: 'إضافة مشرف أكاديمي',
    btn_assign_intern: 'تسكين المتدرب',
    col_supervisor_name: 'اسم المشرف',
    col_syndicate_license: 'رقم القيد بالنقابة',
    col_experience: 'الخبرة',
    col_capacity: 'سعة التسكين',
    modal_create_supervisor_title: 'إنشاء حساب مشرف أكاديمي جديد',
    modal_create_supervisor_sub: 'إنشاء حساب رسمي لمشرف جديد بالكلية',
    modal_assign_intern_title: 'تسكين المتدرب وتعيين المشرف والصيدلية',
    modal_assign_intern_sub: 'ربط المتدرب ببرنامج التدريب والمشرف الأكاديمي',
    field_email: 'البريد الأكاديمي',
    field_password: 'كلمة المرور (اختياري — تتولد تلقائياً إذا تُركت فارغة)',
    field_name: 'الاسم بالكامل',
    field_phone: 'رقم الهاتف',
    field_syndicate_license: 'رقم القيد بنقابة الصيدلة',
    field_years_experience: 'سنوات الخبرة',
    field_max_capacity: 'الحد الأقصى لسعة التسكين',
    field_pharmacy_branch: 'فرع الصيدلية المرتبط (اختياري)',
    field_training_program: 'برنامج التدريب الميداني',
    field_supervisor: 'المشرف الأكاديمي الموجه',
    field_pharmacy: 'الصيدلية والفرع الشريك',
    field_start_date: 'تاريخ بدء التدريب',
    field_expected_end_date: 'تاريخ الانتهاء المتوقع (اختياري)',
    password_modal_title: 'تم إنشاء كلمة مرور المشرف',
    password_modal_msg: 'يرجى تزويد المشرف بكلمة المرور هذه الآن، فلن تظهر مرة أخرى.',
    btn_copy_password: 'نسخ كلمة المرور',
    observability_badge: 'المرصد الأكاديمي',
    faculty_name: 'كلية الصيدلة',
    faculty_uni: 'جامعة القاهرة',

    // Topbar & Search
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
    progress_chart_sub: 'متوسط أيام الإنجاز:',
    progress_chart_sub_prefix: 'متوسط أيام الإنجاز:',
    progress_days_unit: 'يوم',

    // Tables & Feeds
    feed_title: 'النشاط الميداني المباشر',
    feed_sub: 'تدفق فوري للعمليات',
    live_badge: 'مباشر',
    interns_table_title: 'المتدربون',
    interns_table_sub: 'الوصول المباشر لملفات الطلاب',
    page_interns_title: 'سجل متدربي الكلية',
    page_interns_sub: 'متابعة الأداء وساعات التدريب',
    btn_print: 'طباعة الكشف',
    btn_full_directory: 'السجل الموسّع',
    table_col_intern: 'المتدرب',
    table_col_governorate: 'المحافظة',
    table_col_status: 'الحالة',
    table_col_operations: 'العمليات',
    table_col_file: 'الملف الطبي',
    table_col_actions: 'التفاصيل',
    btn_view_file: 'الملف الطبي',
    btn_details: 'التفاصيل',
    status_active: 'نشط',
    status_completed: 'مكتمل',
    status_pending: 'بانتظار التحاق',
    status_risk: 'متابعة',
    ops_suffix: 'عملية',
    no_results: 'لا توجد نتائج مطابقة للبحث.',

    // Faculty Settings Section
    faculty_details_title: 'بيانات الكلية',
    label_university: 'الجامعة',
    label_faculty: 'الكلية',
    label_dean_name: 'العميد المسؤول',
    label_academic_year: 'العام الأكاديمي',
    export_reports_title: 'تصدير التقارير',
    export_reports_sub: 'مستخرجات رسمية',
    btn_pdf_report: 'بيان درجات التدريب الميداني (PDF)',
    btn_excel_report: 'كشف الطلاب الكامل (Excel)',

    // Dean Profile Section
    badge_accredited_active: 'معتمد نشط',
    btn_edit_profile: 'تعديل البيانات',
    btn_logout: 'خروج',
    office_details_title: 'بيانات الاعتماد والمكتب',
    office_details_sub: 'المعلومات الرسمية لعميد الكلية',
    label_academic_email: 'البريد الأكاديمي',
    label_direct_phone: 'الهاتف المباشر',
    label_office_location: 'مقر المكتب',
    label_institution: 'المؤسسة',
    label_national_accreditation: 'الاعتماد القومي',
    val_naqaae_accredited: 'معتمد NAQAAE',
    val_admin_building: 'المبنى الإداري - قصر العيني، القاهرة',

    // Modals
    edit_modal_title: 'تعديل بيانات التواصل',
    edit_modal_sub: 'البريد والهاتف والمقر الرسمي',
    btn_cancel: 'إلغاء',
    btn_save_changes: 'حفظ التغييرات',

    // Student Dossier Tabs
    btn_back: 'العودة',
    tab_chats: 'محادثات المرضى',
    tab_rx: 'الروشتات المفحوصة',
    tab_plans: 'خطط العلاج',
    tab_orders: 'صرف الطلبات',
    tab_attendance: 'سجل الحضور',
    tab_evaluations: 'تقييمات المشرف',

    // Activity Stream Items
    action_rx: 'فحص روشتة',
    action_plan: 'خطة علاج',
    action_dispense: 'صرف طلب',
    verified: 'موثق',
    unverified: 'بانتظار الاعتماد',

    // Toast Messages
    modal_close: 'إغلاق',
    toast_copied: 'تم النسخ إلى الحافظة',
    toast_lang_changed: 'تم تحديث اللغة'
  }
};

function t(key) {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (DeanTranslations[lang] && DeanTranslations[lang][key]) || DeanTranslations['en'][key] || key;
}

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
