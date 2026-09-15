/**
 * Tamenny Faculty Dean Portal Configuration
 */

const DeanConfig = {
  appName: 'طَمّني',
  brandName: 'Tamenny',
  // Relative path — proxied to the plain-HTTP backend via vercel.json rewrites.
  // A direct http:// URL would be blocked as mixed content on the https:// deployed site.
  apiBaseUrl: '/api/v1',
  observabilityMode: true, // Read-Only Observability (No Approvals)

  currentDean: {
    name: 'أ.د. خالد السيد إبراهيم',
    title: 'عميد كلية الصيدلة',
    degree: 'أستاذ الكيمياء الحيوية والرقابة الدوائية',
    faculty: 'كلية الصيدلة',
    university: 'جامعة القاهرة',
    facultyId: 'fac-cairo-pharm-01',
    email: 'dean.pharmacy@cu.edu.eg',
    phone: '+20 2 3567 6100',
    office: 'المبنى الإداري - قصر العيني، القاهرة',
    accreditationStatus: 'معتمد',
    academicYear: '2025 / 2026',
    semester: 'الفصل الدراسي الثاني (فترة التدريب الميداني)',
  },

  themeKey: 'tameny_dean_theme',
  langKey: 'tameny_dean_lang',
  
  endpoints: {
    deanMe: '/dean/me',
    summary: '/dean/dashboard/summary',
    activityFeed: '/dean/dashboard/activity-feed',
    internshipProgress: '/dean/dashboard/internship-progress',
    interns: '/dean/interns',
    internDetail: (id) => `/dean/interns/${id}`,
    internClinicalOperations: (id) => `/dean/interns/${id}/clinical-operations`,
    internActivityLogs: (id) => `/dean/interns/${id}/activity-logs`,
    internChats: (id) => `/dean/interns/${id}/chats`,
    partnerPharmacies: '/dean/partner-pharmacies',
  }
};
