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
    internEvaluations: (id) => `/dean/interns/${id}/evaluations`,
    updateSupervisor: (id) => `/dean/supervisors/${id}`,
    setSupervisorActive: (id) => `/dean/supervisors/${id}/set-active`,
    partnerPharmacies: '/dean/partner-pharmacies',

    // Supervisor Endpoints (Part 5 & 7 API Guide + Intern Observability)
    supervisorMyInterns: '/supervisor/my-interns',
    supervisorDrafts: '/supervisor/drafts',
    supervisorInternClinicalOperations: (internUserId) => `/supervisor/interns/${internUserId}/clinical-operations`,
    supervisorInternChats: (internUserId) => `/supervisor/interns/${internUserId}/chats`,
    supervisorInternActivityLogs: (internUserId) => `/supervisor/interns/${internUserId}/activity-logs`,
    supervisorApproveDraft: (id) => `/supervisor/drafts/${id}/approve`,
    supervisorVerifyActivity: (logId) => `/supervisor/activities/${logId}/verify`,
    supervisorEvaluations: '/supervisor/evaluations',
  }
};
