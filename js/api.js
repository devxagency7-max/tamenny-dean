/**
 * Tamenny Faculty Dean Portal - API Service
 * Handles communication with Backend Dean Observability Endpoints.
 * Gracefully falls back to local data if server is offline or in demo mode.
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

  isDemoMode() {
    return localStorage.getItem('tameny_dean_demo_mode') === '1';
  },

  async request(endpoint, options = {}) {
    // In demo mode we skip the network entirely and go straight to local fallback data.
    if (this.isDemoMode()) {
      return null;
    }

    const url = `${DeanConfig.apiBaseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[DeanApi] Endpoint ${endpoint} unreachable, using local observational state:`, err.message);
      return null;
    }
  },

  async getDeanProfile() {
    const res = await this.request(DeanConfig.endpoints.deanMe);
    return (res && res.data) ? res.data : DeanConfig.currentDean;
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
    return (res && res.data) ? res.data : DeanData.kpis;
  },

  async getActivityFeed(limit = 15) {
    const res = await this.request(`${DeanConfig.endpoints.activityFeed}?limit=${limit}`);
    if (res && Array.isArray(res.data)) return res.data;
    return DeanData.liveFeed.slice(0, limit);
  },

  async getInternshipProgress() {
    const res = await this.request(DeanConfig.endpoints.internshipProgress);
    if (res && res.data) return res.data;
    return DeanData.internshipProgress;
  },

  async getInterns(params = {}) {
    // Translate the UI's local filter keys onto the backend's real query param
    // names/enum values (GET /dean/interns spec: trainingStatus, pharmacyId,
    // search, page, pageSize) — using the wrong names silently no-ops filtering
    // against the real backend instead of erroring, so this must stay in sync
    // with Part 9.2 of the backend spec.
    const backendParams = {};
    if (params.search) backendParams.search = params.search;
    if (params.status && params.status !== 'all') {
      const trainingStatus = this._mapUiStatusToTrainingStatus(params.status);
      if (trainingStatus) backendParams.trainingStatus = trainingStatus;
    }
    if (params.pharmacy && params.pharmacy !== 'all') backendParams.pharmacyId = params.pharmacy;
    // Pending real pagination UI, request a larger page so a single faculty's
    // full roster (typically well under a few hundred students) renders in one
    // page instead of being silently truncated to the backend's default of 20.
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
      return res.data.items.map(this._normalizeInternSummary);
    }

    // Local filter implementation
    let list = [...DeanData.interns];
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.studentId.includes(q) ||
        i.branchName.toLowerCase().includes(q) ||
        i.pharmacyChain.toLowerCase().includes(q)
      );
    }
    if (params.status && params.status !== 'all') {
      list = list.filter(i => i.status === params.status);
    }
    if (params.pharmacy && params.pharmacy !== 'all') {
      list = list.filter(i => i.pharmacyChain.includes(params.pharmacy));
    }
    return list;
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
    return DeanData.interns.find(i => i.id === id) || null;
  },

  async getInternClinicalOperations(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${DeanConfig.endpoints.internClinicalOperations(id)}${queryString ? '?' + queryString : ''}`;
    const res = await this.request(endpoint);
    if (res && res.data && res.data.items) return res.data.items;

    const intern = DeanData.interns.find(i => i.id === id);
    return intern ? (intern.clinicalOperations || []) : [];
  },

  async getInternActivityLogs(id) {
    const res = await this.request(DeanConfig.endpoints.internActivityLogs(id));
    if (res && res.data && res.data.items) return res.data.items;

    const intern = DeanData.interns.find(i => i.id === id);
    return intern ? (intern.attendanceLogs || []) : [];
  },

  async getInternChats(id) {
    const res = await this.request(DeanConfig.endpoints.internChats(id));
    if (res && Array.isArray(res.data)) return res.data;

    const intern = DeanData.interns.find(i => i.id === id);
    return intern ? (intern.chats || []) : [];
  },

  async getPartnerPharmacies() {
    const res = await this.request(DeanConfig.endpoints.partnerPharmacies);
    if (res && Array.isArray(res.data)) return res.data;
    return DeanData.pharmacyChains;
  },

  // --- Normalization helpers: map backend field names (Part 9 spec) onto the
  // field names the existing UI render functions already expect, so app.js
  // does not need a rewrite just to consume the real backend. ---

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
      // GET /dean/interns/{id} does not return a training-status field (see
      // backend request doc) — fall back to whatever status was known from the
      // roster row that was clicked, since that IS returned by GET /dean/interns.
      status: knownStatus || 'active',
      rating: progress.averageSupervisorRating ?? null,
      operationsCount: (progress.prescriptionReviewsCount ?? 0) + (progress.medicationPlansDrafted ?? 0),
      documents: data.documents || [],
      // Clinical drafts / chats / activity logs are fetched separately via
      // their own endpoints (getInternClinicalOperations / getInternChats /
      // getInternActivityLogs) once the dossier is opened.
      clinicalOperations: [],
      chats: [],
      attendanceLogs: [],
      evaluations: data.evaluations || [],
    };
  }
};
