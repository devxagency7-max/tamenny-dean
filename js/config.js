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
    name: '',
    title: '',
    degree: '',
    faculty: '',
    university: '',
    facultyId: '',
    email: '',
    phone: '',
    office: '',
    accreditationStatus: '',
    academicYear: '',
    semester: '',
  },

  themeKey: 'tameny_dean_theme',
  langKey: 'tameny_dean_lang',
  
  endpoints: {
    deanMe: '/dean/me',
    summary: '/dean/dashboard/summary',
    activityFeed: '/dean/dashboard/activity-feed',
    internshipProgress: '/dean/dashboard/internship-progress',
    interns: '/dean/interns',
    unassignedInterns: '/dean/interns/unassigned',
    supervisors: '/dean/supervisors',
    trainingPrograms: '/dean/training-programs',
    internshipAssignments: '/dean/internship-assignments',
    internDetail: (id) => `/dean/interns/${id}`,
    internClinicalOperations: (id) => `/dean/interns/${id}/clinical-operations`,
    internActivityLogs: (id) => `/dean/interns/${id}/activity-logs`,
    internChats: (id) => `/dean/interns/${id}/chats`,
    partnerPharmacies: '/dean/partner-pharmacies',
  }
};
