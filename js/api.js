/**
 * Tamenny Faculty Dean Portal - API Service
 * Handles communication with Backend Dean Observability Endpoints.
 * 100% Real Backend Integration — No Mock Data Fallbacks.
 */

const DeanApiService = {
  authToken: localStorage.getItem('tameny_dean_token') || null,

  setToken(token) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('tameny_dean_token', token);
    } else {
      localStorage.removeItem('tameny_dean_token');
    }
  },

  async request(endpoint, options = {}) {
    const url = `${DeanConfig.apiBaseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: (data && data.message) || `HTTP error ${response.status}`,
          errors: data && data.errors,
          errorCode: data && data.errorCode
        };
      }
      return data;
    } catch (err) {
      console.error(`[DeanApi Error] Endpoint ${endpoint} failed:`, err.message);
      return { success: false, message: err.message };
    }
  },

  async getDeanProfile() {
    const res = await this.request(DeanConfig.endpoints.deanMe);
    return (res && res.data) ? res.data : null;
  },

  async updateDeanProfile(payload) {
    const res = await this.request(DeanConfig.endpoints.deanMe, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return (res && res.data) ? res.data : payload;
  },

  async getDashboardSummary() {
    const res = await this.request(DeanConfig.endpoints.summary);
    return (res && res.data) ? res.data : {};
  },

  async getActivityFeed(limit = 15) {
    const res = await this.request(`${DeanConfig.endpoints.activityFeed}?limit=${limit}`);
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  async getInternshipProgress() {
    const res = await this.request(DeanConfig.endpoints.internshipProgress);
    return (res && res.data) ? res.data : {};
  },

  // --- Supervisor Management (Part 4.2 API Guide) ---
  async getSupervisors() {
    const res = await this.request(DeanConfig.endpoints.supervisors);
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  async createSupervisor(payload) {
    const res = await this.request(DeanConfig.endpoints.supervisors, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res;
  },

  async updateSupervisor(id, payload) {
    const res = await this.request(DeanConfig.endpoints.updateSupervisor(id), {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res;
  },

  async setSupervisorActive(id, isActive) {
    const res = await this.request(DeanConfig.endpoints.setSupervisorActive(id), {
      method: 'POST',
      body: JSON.stringify({ isActive })
    });
    return res;
  },

  // --- Training Programs (Part 4.3 API Guide) ---
  async getTrainingPrograms() {
    const res = await this.request(DeanConfig.endpoints.trainingPrograms);
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  // --- Unassigned Queue & Internship Placement (Part 4.4 API Guide) ---
  async getUnassignedInterns() {
    const res = await this.request(DeanConfig.endpoints.unassignedInterns);
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  async createInternshipAssignment(payload) {
    const res = await this.request(DeanConfig.endpoints.internshipAssignments, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res;
  },

  async getInterns(params = {}) {
    const backendParams = {};
    if (params.search) backendParams.search = params.search;
    if (params.status && params.status !== 'all') {
      const trainingStatus = this._mapUiStatusToTrainingStatus(params.status);
      if (trainingStatus) backendParams.trainingStatus = trainingStatus;
    }
    if (params.pharmacy && params.pharmacy !== 'all') backendParams.pharmacyId = params.pharmacy;
    backendParams.pageSize = params.pageSize || 200;
    backendParams.page = params.page || 1;

    const queryString = new URLSearchParams(backendParams).toString();
    const endpoint = `${DeanConfig.endpoints.interns}${queryString ? '?' + queryString : ''}`;
    const res = await this.request(endpoint);

    if (res && res.data && res.data.items) {
      this.lastInternsPageMeta = {
        totalCount: res.data.totalCount,
        totalPages: res.data.totalPages,
        page: res.data.page
      };
      return res.data.items.map(item => this._normalizeInternSummary(item));
    }

    return [];
  },

  _mapUiStatusToTrainingStatus(uiStatus) {
    switch (uiStatus) {
      case 'active': return 'InTraining';
      case 'completed': return 'Completed';
      case 'pending': return 'Enrolled';
      case 'risk': return 'Inactive';
      default: return null;
    }
  },

  async getInternDetail(id, knownStatus = null) {
    const res = await this.request(DeanConfig.endpoints.internDetail(id));
    if (res && res.data) return this._normalizeInternDossier(res.data, id, knownStatus);
    return null;
  },

  async getInternClinicalOperations(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${DeanConfig.endpoints.internClinicalOperations(id)}${queryString ? '?' + queryString : ''}`;
    const res = await this.request(endpoint);
    return (res && res.data && Array.isArray(res.data.items)) ? res.data.items : [];
  },

  async getInternActivityLogs(id) {
    const res = await this.request(DeanConfig.endpoints.internActivityLogs(id));
    return (res && res.data && Array.isArray(res.data.items)) ? res.data.items : [];
  },

  async getInternChats(id) {
    const res = await this.request(DeanConfig.endpoints.internChats(id));
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  async getPartnerPharmacies() {
    const res = await this.request(DeanConfig.endpoints.partnerPharmacies);
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  async getInternEvaluations(id) {
    const res = await this.request(DeanConfig.endpoints.internEvaluations(id));
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  // --- Supervisor Endpoints (Part 5 & 7 API Guide + Intern-Patient Observability) ---
  async getSupervisorMyInterns() {
    const res = await this.request(DeanConfig.endpoints.supervisorMyInterns);
    return (res && Array.isArray(res.data)) ? res.data : [];
  },

  async getSupervisorInternClinicalOperations(internUserId) {
    if (!internUserId) return [];
    const res = await this.request(DeanConfig.endpoints.supervisorInternClinicalOperations(internUserId));
    if (res && Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data.items)) return res.data.items;
    return [];
  },

  async getSupervisorInternChats(internUserId) {
    if (!internUserId) return [];
    const res = await this.request(DeanConfig.endpoints.supervisorInternChats(internUserId));
    if (res && Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data.items)) return res.data.items;
    return [];
  },

  async getSupervisorInternActivityLogs(internUserId) {
    if (!internUserId) return [];
    const res = await this.request(DeanConfig.endpoints.supervisorInternActivityLogs(internUserId));
    if (res && Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data.items)) return res.data.items;
    return [];
  },

  async getSupervisorDrafts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${DeanConfig.endpoints.supervisorDrafts}${queryString ? '?' + queryString : ''}`;
    const res = await this.request(endpoint);
    if (res && res.data && Array.isArray(res.data.items)) return res.data.items;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async approveSupervisorDraft(draftId, decision, feedback = '') {
    // Backend ReviewDraftRequest accepts "Approve" or "Reject"
    const normalizedDecision = (String(decision).toLowerCase().startsWith('app') || String(decision).toLowerCase().startsWith('acc'))
      ? 'Approve'
      : 'Reject';

    const res = await this.request(DeanConfig.endpoints.supervisorApproveDraft(draftId), {
      method: 'POST',
      body: JSON.stringify({ decision: normalizedDecision, feedback: feedback || null })
    });
    return res;
  },

  async verifySupervisorActivity(logId) {
    const res = await this.request(DeanConfig.endpoints.supervisorVerifyActivity(logId), {
      method: 'POST'
    });
    return res;
  },

  async submitSupervisorEvaluation(payload) {
    const res = await this.request(DeanConfig.endpoints.supervisorEvaluations, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res;
  },

  _normalizeInternSummary(item) {
    if (!item) return item;
    return {
      id: item.internId || item.id,
      name: item.name,
      studentId: item.universityStudentId || item.studentId,
      avatarInitial: (item.name || '').trim().slice(0, 2),
      academicYear: item.academicLevel || item.academicYear,
      pharmacyChain: item.assignedPharmacy || item.pharmacyChain,
      branchName: item.assignedBranch || item.branchName,
      governorate: item.governorate || '',
      supervisorName: item.supervisorName,
      loggedHours: item.completedHours ?? item.loggedHours ?? 0,
      targetHours: item.targetHours ?? 300,
      status: DeanApiService._mapTrainingStatus(item.trainingStatus) || item.status,
      operationsCount: item.totalDraftsSubmitted ?? item.operationsCount ?? 0,
      lastActivityAt: item.lastActivityAt,
    };
  },

  _mapTrainingStatus(trainingStatus) {
    switch (trainingStatus) {
      case 'InTraining': return 'active';
      case 'Completed': return 'completed';
      case 'Enrolled': return 'pending';
      case 'Inactive': return 'risk';
      default: return null;
    }
  },

  _normalizeInternDossier(data, fallbackId, knownStatus) {
    const profile = data.profile || {};
    const placement = data.placement || {};
    const progress = data.progress || {};

    return {
      id: profile.internId || fallbackId,
      name: profile.name,
      studentId: profile.universityStudentId,
      nationalId: profile.nationalId,
      gpa: profile.gpa,
      enrollmentYear: profile.enrollmentYear,
      avatarInitial: (profile.name || '').trim().slice(0, 2),
      academicYear: profile.academicLevel,
      pharmacyChain: placement.pharmacyName,
      branchName: placement.branchName,
      assignmentId: placement.assignmentId,
      startDate: placement.startDate,
      expectedEndDate: placement.expectedEndDate,
      supervisorName: placement.supervisor ? placement.supervisor.name : '',
      supervisorLicenseNumber: placement.supervisor ? placement.supervisor.licenseNumber : '',
      loggedHours: progress.loggedHours ?? 0,
      verifiedHours: progress.verifiedHours ?? 0,
      targetHours: progress.targetHours ?? 300,
      status: knownStatus || 'active',
      rating: progress.averageSupervisorRating ?? null,
      operationsCount: (progress.prescriptionReviewsCount ?? 0) + (progress.medicationPlansDrafted ?? 0),
      documents: data.documents || [],
      clinicalOperations: [],
      chats: [],
      attendanceLogs: [],
      evaluations: data.evaluations || [],
    };
  }
};
