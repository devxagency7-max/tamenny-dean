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

  async request(endpoint, options = {}) {
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

  async getDashboardSummary() {
    const res = await this.request(DeanConfig.endpoints.summary);
    return (res && res.data) ? res.data : DeanData.kpis;
  },

  async getInterns(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${DeanConfig.endpoints.interns}${queryString ? '?' + queryString : ''}`;
    const res = await this.request(endpoint);
    
    if (res && res.data && res.data.items) {
      return res.data.items;
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

  async getInternDetail(id) {
    const res = await this.request(DeanConfig.endpoints.internDetail(id));
    if (res && res.data) return res.data;
    return DeanData.interns.find(i => i.id === id) || null;
  },

  async getPartnerPharmacies() {
    return DeanData.pharmacyChains;
  }
};
