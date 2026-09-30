/**
 * Tamenny Faculty Dean Web Portal - Master Controller (app.js)
 * Implements search-first homepage, full-page student dossier, 
 * live patient chat observability, clinical tabs, and clean theme/lang controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  currentView: 'dashboard',
  previousView: 'dashboard',
  currentIntern: null,
  currentChatId: null,
  activeFilter: 'all',
  activePharmacyFilter: 'all',
  searchQuery: '',
  internStatusCache: {},

  _cacheInternStatuses(interns) {
    (interns || []).forEach(i => { this.internStatusCache[i.id] = i.status; });
  },

  async init() {
    if (!this.requireAuth()) return;
    this.userRole = localStorage.getItem('tameny_user_role') || 'dean';
    this.initTheme();
    this.initDirection();
    this.setupRoleUI();
    this.bindEvents();
    this.handleRoute();
    await this.loadInitialData();
  },

  setupRoleUI() {
    this.userRole = localStorage.getItem('tameny_user_role') || 'dean';
    const isSupervisor = this.userRole === 'supervisor';
    
    document.querySelectorAll('.dean-only-nav').forEach(el => {
      el.style.display = isSupervisor ? 'none' : (el.classList.contains('nav-section-title') ? 'block' : 'flex');
    });

    document.querySelectorAll('.supervisor-only-nav').forEach(el => {
      el.style.display = isSupervisor ? (el.classList.contains('nav-section-title') ? 'block' : 'flex') : 'none';
    });

    const lang = document.documentElement.getAttribute('lang') || 'en';
    const topRole = document.getElementById('topbarDeanRole');
    if (topRole && isSupervisor) {
      topRole.textContent = lang === 'ar' ? 'مشرف أكاديمي' : 'Academic Supervisor';
    }
  },

  // --- Route Guard ---
  requireAuth() {
    const token = localStorage.getItem('tameny_dean_token');
    if (!token) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  // --- Theme Management ---
  initTheme() {
    const savedTheme = localStorage.getItem(DeanConfig.themeKey) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(DeanConfig.themeKey, next);
    this.updateThemeIcon(next);
    this.showToast(next === 'dark' ? 'الوضع الليلي 🌙' : 'الوضع الفاتح ☀️', 'info');
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    btn.innerHTML = theme === 'dark' 
      ? '<i class="bx bx-sun"></i>' 
      : '<i class="bx bx-moon"></i>';
  },

  // --- Language / Direction Management ---
  initDirection() {
    const savedLang = localStorage.getItem(DeanConfig.langKey) || 'en';
    document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', savedLang);
    if (typeof applyDeanTranslations === 'function') {
      applyDeanTranslations();
    }
  },

  toggleLanguage() {
    const currentLang = document.documentElement.getAttribute('lang') || 'en';
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    const nextDir = nextLang === 'ar' ? 'rtl' : 'ltr';
    
    document.documentElement.setAttribute('dir', nextDir);
    document.documentElement.setAttribute('lang', nextLang);
    localStorage.setItem(DeanConfig.langKey, nextLang);
    
    if (typeof applyDeanTranslations === 'function') {
      applyDeanTranslations();
    }
    
    this.showToast(nextLang === 'ar' ? 'العربية' : 'English', 'info');
  },

  // --- Event Bindings ---
  bindEvents() {
    // Navigation Links (Sidebar)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-view');
        if (target) this.navigateTo(target);
      });
    });

    // Sidebar Toggle
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('mainSidebar');
    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        sidebarToggleBtn.innerHTML = isCollapsed 
          ? '<i class="bx bx-chevron-left"></i>' 
          : '<i class="bx bx-chevron-right"></i>';
      });
    }

    // Theme & Lang Buttons
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) langBtn.addEventListener('click', () => this.toggleLanguage());

    // 1. Dashboard Hero Search Bar
    const dashSearch = document.getElementById('dashboardHeroSearch');
    if (dashSearch) {
      dashSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        // sync other search inputs
        const topSearch = document.getElementById('topbarSearchInput');
        if (topSearch) topSearch.value = this.searchQuery;
        const tableSearch = document.getElementById('tableSearchInput');
        if (tableSearch) tableSearch.value = this.searchQuery;

        this.renderDashboardInterns();
      });
      dashSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.navigateTo('interns');
        }
      });
    }

    // 2. Global Topbar Search
    const topSearch = document.getElementById('topbarSearchInput');
    if (topSearch) {
      topSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const dashSearch = document.getElementById('dashboardHeroSearch');
        if (dashSearch) dashSearch.value = this.searchQuery;
        const tableSearch = document.getElementById('tableSearchInput');
        if (tableSearch) tableSearch.value = this.searchQuery;

        if (this.currentView === 'dashboard') {
          this.renderDashboardInterns();
        } else if (this.currentView === 'interns') {
          this.renderInternsTable();
        } else {
          this.navigateTo('interns');
        }
      });
    }

    // 3. Table Search on Interns Page
    const tableSearch = document.getElementById('tableSearchInput');
    if (tableSearch) {
      tableSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const topSearch = document.getElementById('topbarSearchInput');
        if (topSearch) topSearch.value = this.searchQuery;
        const dashSearch = document.getElementById('dashboardHeroSearch');
        if (dashSearch) dashSearch.value = this.searchQuery;

        this.renderInternsTable();
      });
    }

    // 4. Filter Pills (sync both home and table)
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const filter = pill.getAttribute('data-filter') || 'all';
        this.activeFilter = filter;

        document.querySelectorAll('.filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-filter') === filter);
        });

        this.renderDashboardInterns();
        this.renderInternsTable();
      });
    });

    // 5. Full-Page Dossier Tab Switching
    document.querySelectorAll('.detail-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-dossier-tab');
        if (tabKey) this.switchDossierTab(tabKey);
      });
    });

    // 6. Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentView === 'intern-detail') {
        this.navigateBack();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.currentView === 'dashboard') {
          const heroInput = document.getElementById('dashboardHeroSearch');
          if (heroInput) heroInput.focus();
        } else {
          const topInput = document.getElementById('topbarSearchInput');
          if (topInput) topInput.focus();
        }
      }
    });

    // 7. Hash Route
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  handleRoute() {
    let hash = window.location.hash.replace('#', '');
    if (!hash) {
      hash = this.userRole === 'supervisor' ? 'supervisor-interns' : 'dashboard';
    }

    if (this.userRole === 'supervisor' && ['dashboard', 'interns', 'unassigned', 'supervisors', 'settings'].includes(hash)) {
      hash = 'supervisor-interns';
    }

    if (hash.startsWith('intern/')) {
      const internId = hash.replace('intern/', '');
      this.openInternProfile(internId, false);
    } else {
      this.navigateTo(hash, false);
    }
  },

  navigateTo(viewId, updateHash = true) {
    if (this.currentView !== 'intern-detail' && viewId === 'intern-detail') {
      this.previousView = this.currentView;
    } else if (viewId !== 'intern-detail') {
      this.previousView = viewId;
    }

    this.currentView = viewId;
    if (updateHash && viewId !== 'intern-detail') {
      window.location.hash = viewId;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    // Update view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Update Header
    this.updateHeaderTitle(viewId);

    // Refresh views
    if (viewId === 'dashboard') {
      this.renderDashboard();
    } else if (viewId === 'interns') {
      this.renderInternsTable();
    } else if (viewId === 'profile') {
      if (this.userRole === 'supervisor') {
        this.renderSupervisorProfile();
      } else {
        this.renderDeanProfile();
      }
    } else if (viewId === 'supervisor-interns') {
      this.renderSupervisorInterns();
    } else if (viewId === 'supervisor-drafts') {
      this.renderSupervisorDrafts();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigateBack() {
    const fallback = this.userRole === 'supervisor' ? 'supervisor-interns' : 'dashboard';
    this.navigateTo(this.previousView || fallback);
  },

  updateHeaderTitle(viewId) {
    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSubtitle');
    if (!titleEl) return;
    const lang = document.documentElement.getAttribute('lang') || 'en';

    const titles = {
      en: {
        dashboard: { title: 'Dashboard', sub: '' },
        interns: { title: 'Interns Directory', sub: '' },
        unassigned: { title: 'Unassigned Placement Queue', sub: '' },
        supervisors: { title: 'Academic Supervisors Directory', sub: '' },
        'supervisor-interns': { title: 'My Interns', sub: 'Interns assigned under your academic supervision' },
        'supervisor-drafts': { title: 'Clinical Drafts Review', sub: 'Review and approve intern clinical drafts' },
        'intern-detail': { title: 'Student Clinical Dossier', sub: '' },
        profile: { title: this.userRole === 'supervisor' ? 'Supervisor Profile' : 'Dean Profile', sub: '' },
        settings: { title: 'Faculty Settings', sub: '' },
      },
      ar: {
        dashboard: { title: 'الرئيسية', sub: '' },
        interns: { title: 'سجل المتدربين', sub: '' },
        unassigned: { title: 'قائمة انتظار التسكين', sub: '' },
        supervisors: { title: 'المشرفون الأكاديميون', sub: '' },
        'supervisor-interns': { title: 'المتدربون التابعون لي', sub: 'المتدربون الموزعون تحت إشرافي الأكاديمي' },
        'supervisor-drafts': { title: 'مراجعة المسودات الطبية', sub: 'فحص واعتماد مسودات وتوصيات المتدربين السريرية' },
        'intern-detail': { title: 'الملف الطبي للمتدرب', sub: '' },
        profile: { title: this.userRole === 'supervisor' ? 'الملف الشخصي للمشرف' : 'الملف الشخصي للعميد', sub: '' },
        settings: { title: 'ملف الكلية', sub: '' },
      }
    };

    const current = (titles[lang] && titles[lang][viewId]) || (titles.en && titles.en[viewId]) || { title: '', sub: '' };
    titleEl.textContent = current.title;
    if (subEl) {
      subEl.textContent = current.sub;
      subEl.style.display = current.sub ? 'block' : 'none';
    }
  },

  async loadInitialData() {
    if (this.userRole === 'supervisor') {
      this.renderSupervisorProfile();
      await Promise.all([
        this.renderSupervisorInterns(),
        this.renderSupervisorDrafts('PendingSupervisorReview')
      ]);
    } else {
      this.renderDeanProfile();
      this.renderDashboard();
      this.renderInternsTable();
      this.renderUnassignedInterns();
      this.renderSupervisors();
      this.refreshDeanProfileFromBackend();
    }
  },

  async refreshDeanProfileFromBackend() {
    const fresh = await DeanApiService.getDeanProfile();
    if (!fresh || fresh === DeanConfig.currentDean) return;
    const normalized = this._normalizeDeanProfile(fresh);
    const current = JSON.stringify(this.getStoredDeanData());
    const merged = { ...this.getStoredDeanData(), ...normalized };
    if (JSON.stringify(merged) === current) return;
    localStorage.setItem('tameny_dean_profile', JSON.stringify(merged));
    this.renderDeanProfile();
  },

  // --- Dean Profile Management ---
  getStoredDeanData() {
    const local = localStorage.getItem('tameny_dean_profile');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return { ...parsed };
      } catch (e) {
        return DeanConfig.currentDean;
      }
    }
    return DeanConfig.currentDean;
  },

  _normalizeDeanProfile(raw) {
    if (!raw) return {};
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const normalized = { ...raw };
    if (raw.universityName) {
      normalized.university = raw.universityName;
    } else if (raw.university && typeof raw.university === 'object') {
      normalized.university = (lang === 'en' ? raw.university.nameEn : raw.university.nameAr) || raw.university.nameAr || raw.university.nameEn;
    }
    if (raw.facultyName) {
      normalized.faculty = raw.facultyName;
    } else if (raw.faculty && typeof raw.faculty === 'object') {
      normalized.faculty = (lang === 'en' ? raw.faculty.nameEn : raw.faculty.nameAr) || raw.faculty.nameAr || raw.faculty.nameEn;
      normalized.facultyId = raw.faculty.id || normalized.facultyId;
    }
    if (raw.academicTitle) {
      normalized.title = raw.academicTitle;
    }
    return normalized;
  },

  renderDeanProfile() {
    const dean = this.getStoredDeanData();
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const name = dean.name || dean.fullName || '';
    const university = dean.university || dean.universityName || '';
    const faculty = dean.faculty || dean.facultyName || '';
    const title = dean.academicTitle || dean.title || '';
    const degree = dean.degree || '';
    const avatar = (name || 'D').trim().charAt(0).toUpperCase();

    // Topbar Profile
    const topAvatar = document.getElementById('topbarDeanAvatar');
    const topName = document.getElementById('topbarDeanName');
    const topRole = document.getElementById('topbarDeanRole');
    if (topAvatar) topAvatar.textContent = avatar;
    if (topName) topName.textContent = name;
    if (topRole) topRole.textContent = title;

    // Sidebar Faculty/University Badge
    const sideFacultyName = document.getElementById('sidebarFacultyName');
    const sideFacultyUni = document.getElementById('sidebarFacultyUni');
    if (sideFacultyName) sideFacultyName.textContent = faculty;
    if (sideFacultyUni) sideFacultyUni.textContent = university;

    // View Profile Elements
    const pAvatar = document.getElementById('profileDeanAvatar');
    const pName = document.getElementById('profileDeanName');
    const pTitle = document.getElementById('profileDeanTitle');
    const pDegree = document.getElementById('profileDeanDegree');
    const pEmail = document.getElementById('profileDeanEmail');
    const pPhone = document.getElementById('profileDeanPhone');
    const pOffice = document.getElementById('profileDeanOffice');
    const pInstitution = document.getElementById('profileDeanInstitution');

    if (pAvatar) pAvatar.textContent = avatar;
    if (pName) pName.textContent = name;
    if (pTitle) pTitle.textContent = title ? (university ? `${title} — ${university}` : title) : university;
    if (pDegree) {
      pDegree.textContent = degree;
      pDegree.style.display = degree ? 'block' : 'none';
    }
    if (pEmail) pEmail.textContent = dean.email || '';
    if (pPhone) pPhone.textContent = dean.phone || '';
    if (pOffice) pOffice.textContent = dean.office || '';
    if (pInstitution) pInstitution.textContent = (university && faculty) ? `${university} — ${faculty}` : (university || faculty || '');

    // Settings / Faculty Profile View
    const setUniversity = document.getElementById('settingsUniversityName');
    const setFaculty = document.getElementById('settingsFacultyName');
    const setDean = document.getElementById('settingsDeanName');
    const setSubtitle = document.getElementById('settingsFacultySubtitle');
    if (setUniversity) setUniversity.textContent = university;
    if (setFaculty) setFaculty.textContent = faculty;
    if (setDean) setDean.textContent = name;
    if (setSubtitle) setSubtitle.textContent = (university && faculty) ? `${university} — ${faculty}` : (university || faculty || '');
  },

  openEditProfileModal() {
    const dean = this.getStoredDeanData();
    const emailInput = document.getElementById('editDeanEmail');
    const phoneInput = document.getElementById('editDeanPhone');
    const officeInput = document.getElementById('editDeanOffice');
    const modal = document.getElementById('editProfileModal');

    if (emailInput) emailInput.value = dean.email || '';
    if (phoneInput) phoneInput.value = dean.phone || '';
    if (officeInput) officeInput.value = dean.office || '';

    if (modal) modal.classList.add('active');
  },

  closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.classList.remove('active');
  },

  async saveProfileDetails(e) {
    e.preventDefault();
    const dean = this.getStoredDeanData();
    const emailInput = document.getElementById('editDeanEmail');
    const phoneInput = document.getElementById('editDeanPhone');
    const officeInput = document.getElementById('editDeanOffice');

    const payload = {
      email: emailInput ? emailInput.value.trim() : (dean.email || ''),
      phone: phoneInput ? phoneInput.value.trim() : (dean.phone || ''),
      office: officeInput ? officeInput.value.trim() : (dean.office || '')
    };

    await DeanApiService.updateDeanProfile(payload);

    const updated = { ...this.getStoredDeanData(), ...payload };
    localStorage.setItem('tameny_dean_profile', JSON.stringify(updated));
    this.renderDeanProfile();
    this.closeEditProfileModal();
    this.showToast('تم حفظ التعديلات بنجاح', 'success');
  },

  showChangePasswordHint() {
    this.showToast('لتحديث كلمة المرور، يرجى مراجعة إدارة تكنولوجيا المعلومات بالجامعة', 'info');
  },

  logout() {
    localStorage.removeItem('tameny_dean_token');
    localStorage.removeItem('tameny_user_role');
    localStorage.removeItem('tameny_dean_email');
    localStorage.removeItem('tameny_dean_profile');
    localStorage.removeItem('tameny_dean_session_at');
    localStorage.removeItem('tameny_dean_demo_mode');
    this.showToast('تم تسجيل الخروج بنجاح', 'info');
    setTimeout(() => {
      window.location.href = 'login.html?reauth=1';
    }, 500);
  },

  // --- Render Dashboard ---
  async renderDashboard() {
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const locale = lang === 'en' ? 'en-US' : 'ar-EG';
    const k = await DeanApiService.getDashboardSummary();
    this.animateCount('statTotalInterns', k.totalEnrolledStudents ?? k.totalInterns ?? 0);

    const opsEl = document.getElementById('statTotalOperations');
    if (opsEl) {
      const totalOps = (k.totalPrescriptionReviewsLogged ?? k.totalRxReviewed ?? 0) + (k.totalMedicationPlansDrafted ?? k.totalPlansCreated ?? 0);
      opsEl.textContent = totalOps.toLocaleString(locale);
    }

    const complianceEl = document.getElementById('statComplianceRate');
    if (complianceEl) {
      const rate = k.averageClinicalCompetencyScore
        ? `${k.averageClinicalCompetencyScore.toFixed(1)} / 5`
        : `${(k.complianceRate ?? 0)}%`;
      complianceEl.textContent = rate;
    }

    // Sidebar roster badge + dashboard filter-pill counts
    const totalInterns = k.totalEnrolledStudents ?? k.totalInterns ?? 0;
    const activeInterns = k.activelyInTraining ?? k.activeInPharmacies ?? 0;
    const completedInterns = k.completedInternships ?? k.completedTraining ?? 0;
    const riskInterns = k.inactiveStudents ?? k.atRiskFollowUp ?? 0;

    const sidebarCountEl = document.getElementById('sidebarInternsCount');
    if (sidebarCountEl) sidebarCountEl.textContent = totalInterns.toLocaleString(locale);

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toLocaleString(locale);
    };
    setText('filterCountAll', totalInterns);
    setText('filterCountActive', activeInterns);
    setText('filterCountCompleted', completedInterns);
    setText('filterCountRisk', riskInterns);

    this.renderDashboardInterns();
    this.renderInternshipProgress();

    // Render Live Activity Feed
    const feedEl = document.getElementById('liveActivityList');
    if (feedEl) {
      const feed = await DeanApiService.getActivityFeed(8);
      feedEl.innerHTML = feed.map(item => {
        const studentName = item.studentName || item.name || '';
        const badgeText = item.type === 'rx' ? t('action_rx') : item.type === 'plan' ? t('action_plan') : t('action_dispense');
        const verificationText = item.supervisorVerified === false ? t('unverified') : t('verified');
        return `
        <div class="live-stream-item">
          <div class="stream-avatar">${item.avatarInitial || studentName.slice(0, 2)}</div>
          <div class="stream-content">
            <div class="stream-title-row">
              <span class="stream-student-name">${studentName}</span>
              <span class="stream-time">${item.time || ''}</span>
            </div>
            <span class="stream-action-desc">${item.action} — ${item.pharmacy}</span>
            <span class="stream-action-desc" style="font-size:0.75rem; opacity:0.85;">${item.detail || ''}</span>
            <div class="stream-badge-row">
              <span class="stream-badge ${item.type}">${badgeText}</span>
              <span style="font-size:0.68rem; color:var(--text-light);"><i class="bx bx-check-double"></i> ${verificationText}</span>
            </div>
          </div>
        </div>
      `;
      }).join('');
    }
  },

  // --- Render Internship Progress Distribution (Part 9.3 dashboard/internship-progress) ---
  async renderInternshipProgress() {
    const container = document.getElementById('internshipProgressBars');
    const avgEl = document.getElementById('internshipProgressAvgDays');
    if (!container) return;

    const lang = document.documentElement.getAttribute('lang') || 'en';
    const progress = await DeanApiService.getInternshipProgress();
    const brackets = progress.hoursBrackets || {};
    const bracketDefs = lang === 'en' ? [
      { key: 'zeroToTwentyFivePercent', label: '0 - 25%' },
      { key: 'twentySixToFiftyPercent', label: '26 - 50%' },
      { key: 'fiftyOneToSeventyFivePercent', label: '51 - 75%' },
      { key: 'seventySixToNinetyNinePercent', label: '76 - 99%' },
      { key: 'completedOneHundredPercent', label: '100% Completed' },
    ] : [
      { key: 'zeroToTwentyFivePercent', label: '٠-٢٥٪' },
      { key: 'twentySixToFiftyPercent', label: '٢٦-٥٠٪' },
      { key: 'fiftyOneToSeventyFivePercent', label: '٥١-٧٥٪' },
      { key: 'seventySixToNinetyNinePercent', label: '٧٦-٩٩٪' },
      { key: 'completedOneHundredPercent', label: '١٠٠٪ مكتمل' },
    ];
    const maxVal = Math.max(1, ...bracketDefs.map(b => brackets[b.key] || 0));

    container.innerHTML = bracketDefs.map(b => {
      const val = brackets[b.key] || 0;
      const pct = Math.round((val / maxVal) * 100);
      return `
        <div class="progress-bracket-row">
          <span class="progress-bracket-label">${b.label}</span>
          <div class="progress-bracket-track">
            <div class="progress-bracket-fill" style="width:${pct}%;"></div>
          </div>
          <span class="progress-bracket-val">${val}</span>
        </div>
      `;
    }).join('');

    if (avgEl) {
      const daysUnit = lang === 'en' ? 'Days' : 'يوم';
      if (progress.averageDaysToCompletion && progress.averageDaysToCompletion > 0) {
        avgEl.textContent = `${progress.averageDaysToCompletion.toFixed(1)} ${daysUnit}`;
      } else {
        avgEl.textContent = `0 ${daysUnit}`;
      }
    }
  },

  // --- Render Dashboard Interns Table (Quick List) ---
  async renderDashboardInterns() {
    const tbody = document.getElementById('dashInternsTableBody');
    if (!tbody) return;

    const lang = document.documentElement.getAttribute('lang') || 'en';
    const interns = await DeanApiService.getInterns({
      search: this.searchQuery,
      status: this.activeFilter
    });
    this._cacheInternStatuses(interns);

    const countEl = document.getElementById('dashInternsCount');
    if (countEl) countEl.textContent = `(${interns.length})`;

    if (interns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:32px; color:var(--text-muted);">
            <i class="bx bx-search-alt" style="font-size:2rem; color:var(--text-light); display:block; margin-bottom:6px;"></i>
            ${t('no_results')}
          </td>
        </tr>
      `;
      return;
    }

    const displayList = interns.slice(0, 6);

    tbody.innerHTML = displayList.map(i => {
      let statusClass = 'active';
      let statusLabel = t('status_active');
      if (i.status === 'completed') { statusClass = 'completed'; statusLabel = t('status_completed'); }
      if (i.status === 'pending')   { statusClass = 'pending'; statusLabel = t('status_pending'); }
      if (i.status === 'risk')      { statusClass = 'risk'; statusLabel = t('status_risk'); }

      return `
        <tr>
          <td>
            <div class="student-cell">
              <div class="student-avatar">${i.avatarInitial}</div>
              <div class="student-meta">
                <span class="student-name">${i.name}</span>
                <span class="student-id">#ID: ${i.studentId}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="font-weight:700; color:var(--primary); font-size:0.95rem;">${i.operationsCount} ${t('ops_suffix')}</span>
          </td>
          <td>
            <span class="status-badge ${statusClass}">
              <span class="status-dot"></span>
              ${statusLabel}
            </span>
          </td>
          <td>
            <button class="table-action-btn" onclick="App.openInternProfile('${i.id}')">
              <i class="bx bx-show"></i>
              ${t('btn_view_file')}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // --- Render Interns Full Directory ---
  async renderInternsTable() {
    const tbody = document.getElementById('internsTableBody');
    if (!tbody) return;

    const lang = document.documentElement.getAttribute('lang') || 'en';
    const interns = await DeanApiService.getInterns({
      search: this.searchQuery,
      status: this.activeFilter,
      pharmacy: this.activePharmacyFilter
    });
    this._cacheInternStatuses(interns);

    const countEl = document.getElementById('internsFilteredCount');
    if (countEl) countEl.textContent = `(${interns.length})`;

    if (interns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 40px; color:var(--text-muted);">
            <i class="bx bx-search-alt" style="font-size: 2.4rem; color:var(--text-light); margin-bottom: 8px; display:block;"></i>
            ${t('no_results')}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = interns.map(i => {
      let statusClass = 'active';
      let statusLabel = t('status_active');
      if (i.status === 'completed') { statusClass = 'completed'; statusLabel = t('status_completed'); }
      if (i.status === 'pending')   { statusClass = 'pending'; statusLabel = t('status_pending'); }
      if (i.status === 'risk')      { statusClass = 'risk'; statusLabel = t('status_risk'); }

      return `
        <tr>
          <td>
            <div class="student-cell">
              <div class="student-avatar">${i.avatarInitial}</div>
              <div class="student-meta">
                <span class="student-name">${i.name}</span>
                <span class="student-id">#ID: ${i.studentId} • ${i.academicYear}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size:0.85rem; color:var(--text-muted);">${i.governorate}</span>
          </td>
          <td>
            <span style="font-weight:700; color:var(--primary); font-size:0.95rem;">${i.operationsCount} ${t('ops_suffix')}</span>
          </td>
          <td>
            <span class="status-badge ${statusClass}">
              <span class="status-dot"></span>
              ${statusLabel}
            </span>
          </td>
          <td>
            <button class="table-action-btn" onclick="App.openInternProfile('${i.id}')">
              <i class="bx bx-folder-open"></i>
              ${t('btn_view_file')}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // --- Render Unassigned Interns Queue (Part 4.4 API Guide) ---
  async renderUnassignedInterns() {
    const tbody = document.getElementById('unassignedTableBody');
    const badge = document.getElementById('sidebarUnassignedCount');

    const unassigned = await DeanApiService.getUnassignedInterns();
    if (badge) badge.textContent = unassigned.length;

    if (!tbody) return;

    if (unassigned.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 40px; color:var(--text-muted);">
            <i class="bx bx-check-shield" style="font-size: 2.4rem; color:var(--success); margin-bottom: 8px; display:block;"></i>
            ${t('no_results')} — All approved interns in your faculty are assigned!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = unassigned.map(i => {
      const approvedAt = i.applicationApprovedAt ? new Date(i.applicationApprovedAt).toLocaleDateString() : '—';
      const initial = (i.name || 'S').trim().slice(0, 2);
      const safeName = (i.name || '').replace(/'/g, "\\'");
      return `
        <tr>
          <td>
            <div class="student-cell">
              <div class="student-avatar">${initial}</div>
              <div class="student-meta">
                <span class="student-name">${i.name}</span>
                <span class="student-id">${i.email}</span>
              </div>
            </div>
          </td>
          <td><span dir="ltr">${i.phone || '—'}</span></td>
          <td>${i.universityName || '—'}</td>
          <td><span class="audit-item-date">${approvedAt}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="App.openAssignInternModal('${i.userId}', '${safeName}')">
              <i class="bx bx-user-check"></i> ${t('btn_assign_intern')}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // --- Render Academic Supervisors (Part 4.2 API Guide) ---
  async renderSupervisors() {
    const tbody = document.getElementById('supervisorsTableBody');
    const badge = document.getElementById('sidebarSupervisorsCount');

    const supervisors = await DeanApiService.getSupervisors();
    if (badge) badge.textContent = supervisors.length;

    if (!tbody) return;

    if (supervisors.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 40px; color:var(--text-muted);">
            <i class="bx bx-group" style="font-size: 2.4rem; color:var(--text-light); margin-bottom: 8px; display:block;"></i>
            No academic supervisors created yet for your faculty.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = supervisors.map(s => {
      const initial = (s.name || 'Dr').trim().slice(0, 2);
      const activeCount = s.currentActiveInternCount ?? 0;
      const maxCap = s.maxInternCapacity ?? 10;
      const pct = Math.min(100, Math.round((activeCount / maxCap) * 100));
      return `
        <tr>
          <td>
            <div class="student-cell">
              <div class="student-avatar" style="background:var(--primary-light); color:var(--primary);">${initial}</div>
              <div class="student-meta">
                <span class="student-name">${s.name}</span>
                <span class="student-id">${s.email}</span>
              </div>
            </div>
          </td>
          <td>
            <span dir="ltr">${s.phone || '—'}</span>
          </td>
          <td>
            <span style="font-family:monospace; font-weight:700;">${s.syndicateLicenseNumber || '—'}</span>
          </td>
          <td>
            <span>${s.yearsOfExperience ?? 0} Yrs</span>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:700;">${activeCount} / ${maxCap}</span>
              <div style="width:60px; height:6px; background:var(--bg-input); border-radius:3px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:${pct >= 100 ? 'var(--danger)' : 'var(--primary)'};"></div>
              </div>
            </div>
          </td>
          <td>
            <span class="status-badge ${s.isActive !== false ? 'active' : 'risk'}">
              <span class="status-dot"></span>
              ${s.isActive !== false ? t('status_active') : 'Inactive'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  // --- Supervisor Creation Modal handlers ---
  openCreateSupervisorModal() {
    const modal = document.getElementById('createSupervisorModal');
    if (modal) modal.classList.add('active');
  },

  closeCreateSupervisorModal() {
    const modal = document.getElementById('createSupervisorModal');
    if (modal) modal.classList.remove('active');
  },

  async saveSupervisorDetails(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveSupervisor');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Minting...'; }

    const passInput = document.getElementById('supPassword');
    const customPassword = passInput ? passInput.value.trim() : '';

    const payload = {
      name: document.getElementById('supName').value.trim(),
      email: document.getElementById('supEmail').value.trim(),
      phone: document.getElementById('supPhone').value.trim(),
      syndicateLicenseNumber: document.getElementById('supLicense').value.trim(),
      yearsOfExperience: parseInt(document.getElementById('supExperience').value, 10) || 0,
      maxInternCapacity: parseInt(document.getElementById('supCapacity').value, 10) || 10
    };

    if (customPassword) {
      payload.password = customPassword;
    }

    const res = await DeanApiService.createSupervisor(payload);

    if (btn) { btn.disabled = false; btn.innerHTML = originalText; }

    if (res && res.success) {
      this.closeCreateSupervisorModal();
      this.renderSupervisors();

      // Show generated or custom password
      const passwordBox = document.getElementById('generatedPasswordBox');
      const passToShow = (res.data && res.data.generatedPassword) || customPassword || '—';
      if (passwordBox) {
        passwordBox.textContent = passToShow;
        this.latestGeneratedPassword = passToShow;
      }
      const passModal = document.getElementById('supervisorPasswordModal');
      if (passModal) passModal.classList.add('active');

      this.showToast('تم إنشاء حساب المشرف بنجاح', 'success');
    } else {
      this.showToast(res ? res.message : 'فشل إنشاء حساب المشرف', 'error');
    }
  },

  closeSupervisorPasswordModal() {
    const passModal = document.getElementById('supervisorPasswordModal');
    if (passModal) passModal.classList.remove('active');
  },

  copyGeneratedPassword() {
    if (this.latestGeneratedPassword) {
      navigator.clipboard.writeText(this.latestGeneratedPassword);
      this.showToast(t('toast_copied'), 'success');
    }
  },

  // --- Assign Intern Modal handlers (Part 4.4 API Guide) ---
  async openAssignInternModal(internUserId, internName) {
    const modal = document.getElementById('assignInternModal');
    if (!modal) return;

    document.getElementById('assignInternUserId').value = internUserId;
    document.getElementById('assignInternName').value = internName;
    document.getElementById('assignStartDate').value = new Date().toISOString().split('T')[0];

    // Load selects
    const progSelect = document.getElementById('assignProgramSelect');
    const supSelect = document.getElementById('assignSupervisorSelect');
    const pharmSelect = document.getElementById('assignPharmacySelect');

    progSelect.innerHTML = '<option value="">— Loading... —</option>';
    supSelect.innerHTML = '<option value="">— Loading... —</option>';
    pharmSelect.innerHTML = '<option value="">— Loading... —</option>';

    modal.classList.add('active');

    const [programs, supervisors, pharmacies] = await Promise.all([
      DeanApiService.getTrainingPrograms(),
      DeanApiService.getSupervisors(),
      DeanApiService.getPartnerPharmacies()
    ]);

    // Programs
    if (programs && programs.length > 0) {
      progSelect.innerHTML = programs.map(p => `<option value="${p.id}">${p.programName} (${p.academicYear || ''})</option>`).join('');
    } else {
      progSelect.innerHTML = '<option value="">No training programs found</option>';
    }

    // Supervisors
    if (supervisors && supervisors.length > 0) {
      supSelect.innerHTML = supervisors.map(s => `<option value="${s.id}">${s.name} (${s.currentActiveInternCount ?? 0}/${s.maxInternCapacity ?? 10})</option>`).join('');
    } else {
      supSelect.innerHTML = '<option value="">No supervisors created yet (Add supervisor first)</option>';
    }

    // Pharmacies & Branches
    if (pharmacies && pharmacies.length > 0) {
      const options = [];
      pharmacies.forEach(p => {
        if (p.branches && p.branches.length > 0) {
          p.branches.forEach(b => {
            options.push({ pharmacyId: p.id, branchId: b.id, label: `${p.chainName || p.name} — ${b.branchName || b.name}` });
          });
        } else {
          options.push({ pharmacyId: p.id, branchId: p.id, label: p.chainName || p.name });
        }
      });
      pharmSelect.innerHTML = options.map(o => `<option value="${o.pharmacyId}:${o.branchId}">${o.label}</option>`).join('');
    } else {
      pharmSelect.innerHTML = '<option value="">No partner pharmacies found</option>';
    }
  },

  closeAssignInternModal() {
    const modal = document.getElementById('assignInternModal');
    if (modal) modal.classList.remove('active');
  },

  async submitInternshipAssignment(e) {
    e.preventDefault();
    const dean = this.getStoredDeanData();
    const btn = document.getElementById('btnSubmitAssign');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Assigning...'; }

    const pharmVal = document.getElementById('assignPharmacySelect').value || '';
    const [pharmacyId, branchId] = pharmVal.split(':');

    const payload = {
      internUserId: document.getElementById('assignInternUserId').value,
      facultyId: dean.facultyId || DeanConfig.currentDean.facultyId,
      trainingProgramId: document.getElementById('assignProgramSelect').value,
      supervisorId: document.getElementById('assignSupervisorSelect').value,
      pharmacyId: pharmacyId || '',
      branchId: branchId || pharmacyId || '',
      startDate: document.getElementById('assignStartDate').value ? new Date(document.getElementById('assignStartDate').value).toISOString() : new Date().toISOString(),
    };

    const endDateVal = document.getElementById('assignEndDate').value;
    if (endDateVal) {
      payload.expectedEndDate = new Date(endDateVal).toISOString();
    }

    const res = await DeanApiService.createInternshipAssignment(payload);

    if (btn) { btn.disabled = false; btn.innerHTML = originalText; }

    if (res && res.success) {
      this.closeAssignInternModal();
      this.renderUnassignedInterns();
      this.renderInternsTable();
      this.renderDashboard();
      this.showToast('تم تسكين المتدرب وتعيين المشرف بنجاح', 'success');
    } else {
      this.showToast(res ? res.message : 'فشل تسكين المتدرب', 'error');
    }
  },

  // --- Full-Page Intern Dossier (NOT A MODAL) ---
  async openInternProfile(internId, updateHash = true) {
    const intern = await DeanApiService.getInternDetail(internId, this.internStatusCache[internId]);
    if (!intern) {
      this.showToast('لم يتم العثور على ملف المتدرب', 'warning');
      return;
    }

    // Fetch the observational sub-resources (clinical drafts, chats, attendance)
    // separately, matching the real backend's per-resource endpoints (Part 9.2 spec).
    // For local demo data, api.js already populates these directly on the intern object,
    // so only fetch if they weren't already provided by getInternDetail().
    if (!intern.clinicalOperations || intern.clinicalOperations.length === 0) {
      intern.clinicalOperations = await DeanApiService.getInternClinicalOperations(internId);
    }
    if (!intern.chats || intern.chats.length === 0) {
      intern.chats = await DeanApiService.getInternChats(internId);
    }
    if (!intern.attendanceLogs || intern.attendanceLogs.length === 0) {
      intern.attendanceLogs = await DeanApiService.getInternActivityLogs(internId);
    }

    this.currentIntern = intern;

    if (updateHash) {
      window.location.hash = `intern/${internId}`;
    }

    // Fill Hero Card Info
    const avatarEl = document.getElementById('dossierAvatar');
    if (avatarEl) avatarEl.textContent = intern.avatarInitial;

    const nameEl = document.getElementById('dossierName');
    if (nameEl) nameEl.textContent = intern.name;

    const studentIdEl = document.getElementById('dossierStudentId');
    if (studentIdEl) studentIdEl.textContent = intern.studentId;

    const yearEl = document.getElementById('dossierYear');
    if (yearEl) yearEl.textContent = intern.academicYear;

    const opsEl = document.getElementById('dossierOps');
    if (opsEl) opsEl.textContent = `${intern.operationsCount}`;

    const hoursEl = document.getElementById('dossierHours');
    if (hoursEl) hoursEl.textContent = `${intern.loggedHours ?? 0} / ${intern.targetHours ?? 300}`;

    // Documents (view-only academic credentials, Part 9.2 spec)
    const docsEl = document.getElementById('dossierDocumentsList');
    if (docsEl) {
      const docs = intern.documents || [];
      const docLabels = { NationalIdFront: 'صورة البطاقة الشخصية', InternshipCard: 'كارنيه التدريب' };
      docsEl.innerHTML = docs.length === 0
        ? `<span style="font-size:0.8rem; color:var(--text-muted);">لا توجد مستندات مرفوعة.</span>`
        : docs.map(d => `
          <a href="${d.url}" target="_blank" rel="noopener" class="document-chip">
            <i class="bx bxs-file-image"></i> ${docLabels[d.type] || d.type}
          </a>
        `).join('');
    }

    const statusEl = document.getElementById('dossierStatus');
    if (statusEl) {
      let statusClass = 'active';
      let statusLabel = t('status_active');
      if (intern.status === 'completed') { statusClass = 'completed'; statusLabel = t('status_completed'); }
      if (intern.status === 'pending')   { statusClass = 'pending'; statusLabel = t('status_pending'); }
      if (intern.status === 'risk')      { statusClass = 'risk'; statusLabel = t('status_risk'); }
      statusEl.className = `status-badge ${statusClass}`;
      statusEl.innerHTML = `<span class="status-dot"></span> ${statusLabel}`;
    }

    // 1. Populate Tab 1: Chats
    this.renderChatsTab(intern);

    // 2. Populate Tab 2: Prescriptions
    this.renderRxTab(intern);

    // 3. Populate Tab 3: Medication Plans
    this.renderPlansTab(intern);

    // 4. Populate Tab 4: Orders
    this.renderOrdersTab(intern);

    // 5. Populate Tab 5: Attendance / Training Hours Log
    this.renderAttendanceTab(intern);

    // 6. Populate Tab 6: Supervisor Evaluations
    this.renderEvaluationsTab(intern);

    // Default to chats tab
    this.switchDossierTab('chats');

    // Switch view to intern-detail
    this.navigateTo('intern-detail', false);
  },

  // --- Render Tab 1: Live Patient Chat Consultations ---
  renderChatsTab(intern) {
    const chatListEl = document.getElementById('dossierChatList');
    const bubblesContainer = document.getElementById('chatBubblesContainer');
    if (!chatListEl || !bubblesContainer) return;

    // Ensure fallback chat if intern has none
    const chats = (intern.chats && intern.chats.length > 0) ? intern.chats : [
      {
        id: `chat-${intern.id}-def`,
        patientName: 'أحمد سعيد القاضي',
        patientAge: '54 سنة',
        patientCondition: 'ضغط الدم ومتابعة الجرعات',
        lastTime: 'اليوم، 10:15 ص',
        messages: [
          { sender: 'patient', name: 'أحمد سعيد', text: `يا دكتور ${intern.name.split(' ')[0]}، هل الدواء ده يتعارض مع مسكنات الصداع؟`, time: '10:05 ص' },
          { sender: 'intern', name: `د. ${intern.name} (متدرب)`, text: 'أهلاً بحضرتك يا فندم. مسكنات NSAIDs زي البروفين ممكن ترفع ضغط الدم وتقلل كفاءة علاج الضغط. الأفضل استخدام الباراسيتامول (بنادول الأزرق) عند اللزوم، ومراجعتنا لو الصداع استمر.', time: '10:12 ص' },
          { sender: 'patient', name: 'أحمد سعيد', text: 'تمام يا دكتور شكراً جزيلاً لاهتمامك.', time: '10:15 ص' }
        ]
      }
    ];

    intern.chats = chats;
    this.currentChatId = chats[0].id;

    // Render Conversation List in Sidebar
    chatListEl.innerHTML = chats.map((c, idx) => `
      <div class="chat-convo-card ${idx === 0 ? 'active' : ''}" id="convo-${c.id}" onclick="App.selectChat('${c.id}')">
        <div class="chat-convo-top">
          <span class="chat-patient-title">${c.patientName}</span>
          <span class="chat-convo-time">${c.lastTime}</span>
        </div>
        <span class="chat-convo-condition">${c.patientCondition}</span>
        <span style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${c.messages[c.messages.length - 1]?.text || ''}
        </span>
      </div>
    `).join('');

    // Render First Chat
    this.renderActiveChatMessages(chats[0]);
  },

  selectChat(chatId) {
    if (!this.currentIntern || !this.currentIntern.chats) return;
    const chat = this.currentIntern.chats.find(c => c.id === chatId);
    if (!chat) return;

    this.currentChatId = chatId;

    // Update active class in sidebar
    document.querySelectorAll('.chat-convo-card').forEach(card => {
      card.classList.toggle('active', card.id === `convo-${chatId}`);
    });

    this.renderActiveChatMessages(chat);
  },

  renderActiveChatMessages(chat) {
    const avatarEl = document.getElementById('chatActivePatientAvatar');
    const nameEl = document.getElementById('chatActivePatientName');
    const metaEl = document.getElementById('chatActivePatientMeta');
    const container = document.getElementById('chatBubblesContainer');

    if (avatarEl) avatarEl.textContent = chat.patientName.slice(0, 2);
    if (nameEl) nameEl.textContent = chat.patientName;
    if (metaEl) metaEl.textContent = `${chat.patientAge} • ${chat.patientCondition}`;

    if (container) {
      container.innerHTML = chat.messages.map(m => `
        <div class="chat-bubble-row ${m.sender}">
          <span class="chat-bubble-sender">${m.name}</span>
          <div class="chat-bubble-box">
            ${m.text}
            <span class="chat-bubble-time">${m.time}</span>
          </div>
        </div>
      `).join('');

      container.scrollTop = container.scrollHeight;
    }
  },

  // --- Draft status badge helper (InternClinicalDrafts.Status, Part 10.7 spec) ---
  renderDraftStatusBadge(status) {
    const map = {
      PendingSupervisorReview: { cls: 'pending', label: 'بانتظار اعتماد المشرف', icon: 'bx-time-five' },
      Approved: { cls: 'active', label: 'معتمد من المشرف', icon: 'bx-badge-check' },
      ChangesRequested: { cls: 'risk', label: 'مطلوب تعديل', icon: 'bx-error' },
      Rejected: { cls: 'risk', label: 'مرفوض', icon: 'bx-x-circle' },
    };
    const s = map[status] || map.PendingSupervisorReview;
    return `<span class="status-badge ${s.cls}"><i class="bx ${s.icon}"></i> ${s.label}</span>`;
  },

  // --- Render clinical drafts related to a specific entity kind (used by Rx & Plans tabs) ---
  findDraftFor(intern, entityKind, targetEntityId) {
    if (!intern.clinicalOperations) return null;
    return intern.clinicalOperations.find(d => d.entityKind === entityKind && d.targetEntityId === targetEntityId) || null;
  },

  // --- Render Tab 2: Prescriptions ---
  renderRxTab(intern) {
    const container = document.getElementById('dossierRxList');
    if (!container) return;

    const rxs = (intern.prescriptions && intern.prescriptions.length > 0) ? intern.prescriptions : [
      {
        id: `rx-${intern.id}-def`,
        code: `RX-2026-910${intern.studentId.slice(-2)}`,
        date: '2026-03-05',
        patientName: 'عصام عبد الرحيم (48 سنة)',
        doctorName: 'د. طارق مراد (أخصائي أمراض باطنة)',
        diagnosis: 'التهاب المعدة المزمن وعسر الهضم الوظيفي',
        medications: ['Controloc 40mg (Pantoprazole)', 'Gaston 20mg', 'Digestin tab'],
        studentNote: 'تنبيه المريض بضرورة تناول Pantoprazole صباحاً قبل وجبة الإفطار بنصف ساعة للحصول على أعلى كفاءة تثبيط لإفراز الحمض.',
        supervisorSign: `معتمد بواسطة ${intern.supervisorName}`
      }
    ];

    container.innerHTML = rxs.map(rx => {
      const draft = this.findDraftFor(intern, 'PrescriptionReview', rx.id);
      return `
      <div class="audit-card-item">
        <div class="audit-item-top">
          <span class="audit-item-badge"><i class="bx bx-file-blank"></i> ${rx.code}</span>
          <span class="audit-item-date">${rx.date}</span>
        </div>
        <h4 class="audit-item-title">${rx.patientName} — ${rx.diagnosis}</h4>
        <p class="audit-item-desc"><strong>الطبيب المعالج:</strong> ${rx.doctorName}</p>
        <div class="audit-med-tags">
          ${rx.medications.map(m => `<span class="med-tag"><i class="bx bx-capsule"></i> ${m}</span>`).join('')}
        </div>
        <div style="background:var(--bg-card); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-top:6px;">
          <span style="font-size:0.78rem; font-weight:700; color:var(--primary);">💡 توصية المتدرب (Draft):</span>
          <p style="font-size:0.82rem; color:var(--text-main); margin-top:2px;">${draft ? draft.internClinicalNotes : rx.studentNote}</p>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px; flex-wrap:wrap; gap:6px;">
          ${draft ? this.renderDraftStatusBadge(draft.supervisorStatus) : `<span style="font-size:0.75rem; color:var(--success); font-weight:700; display:flex; align-items:center; gap:4px;"><i class="bx bx-badge-check"></i> ${rx.supervisorSign}</span>`}
          ${draft && draft.supervisorFeedback ? `<span style="font-size:0.78rem; color:var(--text-muted);"><i class="bx bx-comment-detail"></i> ${draft.supervisorFeedback}</span>` : ''}
        </div>
      </div>
    `;
    }).join('');
  },

  // --- Render Tab 3: Medication Plans ---
  renderPlansTab(intern) {
    const container = document.getElementById('dossierPlansList');
    if (!container) return;

    const plans = (intern.medicationPlans && intern.medicationPlans.length > 0) ? intern.medicationPlans : [
      {
        id: `pl-${intern.id}-def`,
        title: 'برنامج إدارة جرعات علاج الضغط والمعدة',
        startDate: '2026-02-22',
        duration: '60 يوماً',
        schedule: 'صباحاً: Controloc 40mg قبل الإفطار | ظهراً: مكمل غذائي وسط الغداء | مساءً: علاج الضغط',
        instructions: 'تجنب تناول المسكنات ومشروبات الكافيين العالية، والالتزام بمواعيد القياس الدورية.',
        patientName: 'عصام عبد الرحيم'
      }
    ];

    container.innerHTML = plans.map(pl => {
      const draft = this.findDraftFor(intern, 'MedicationPlan', pl.id);
      return `
      <div class="audit-card-item">
        <div class="audit-item-top">
          <span class="audit-item-badge" style="background:var(--success-light); color:var(--success-text);"><i class="bx bx-calendar-event"></i> خطة علاجية</span>
          <span class="audit-item-date">${pl.startDate} (المدة: ${pl.duration})</span>
        </div>
        <h4 class="audit-item-title">${pl.title}</h4>
        <p class="audit-item-desc"><strong>المريض:</strong> ${pl.patientName}</p>
        <div style="background:var(--bg-card); padding:10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.82rem; margin-top:4px;">
          <strong>جدول المواعيد:</strong> ${pl.schedule}
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;"><strong>تعليمات وإرشادات:</strong> ${pl.instructions}</p>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px; flex-wrap:wrap; gap:6px;">
          ${draft ? this.renderDraftStatusBadge(draft.supervisorStatus) : ''}
          ${draft && draft.supervisorFeedback ? `<span style="font-size:0.78rem; color:var(--text-muted);"><i class="bx bx-comment-detail"></i> ${draft.supervisorFeedback}</span>` : ''}
        </div>
      </div>
    `;
    }).join('');
  },

  // --- Render Tab 4: Orders ---
  renderOrdersTab(intern) {
    const tbody = document.getElementById('dossierOrdersTableBody');
    if (!tbody) return;

    const orders = (intern.ordersFulfilled && intern.ordersFulfilled.length > 0) ? intern.ordersFulfilled : [
      { id: `ord-1`, code: '#ORD-9412', date: '2026-03-06', itemsCount: 3, totalAmount: '345.00 ج.م', status: 'مكتمل ومسلم' },
      { id: `ord-2`, code: '#ORD-9380', date: '2026-03-04', itemsCount: 2, totalAmount: '190.00 ج.م', status: 'مكتمل ومسلم' }
    ];

    tbody.innerHTML = orders.map(ord => `
      <tr>
        <td><strong>${ord.code}</strong></td>
        <td>${ord.date}</td>
        <td>${ord.itemsCount} أصناف</td>
        <td><strong style="color:var(--primary);">${ord.totalAmount}</strong></td>
        <td><span class="status-badge active"><i class="bx bx-check"></i> ${ord.status}</span></td>
      </tr>
    `).join('');
  },

  // --- Render Tab 5: Attendance / Training Hours Log (TrainingActivityLogs, Part 10.8 spec) ---
  renderAttendanceTab(intern) {
    const container = document.getElementById('dossierAttendanceList');
    if (!container) return;

    const logs = intern.attendanceLogs || [];
    if (logs.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:24px; color:var(--text-muted);">لا توجد مناوبات مسجلة بعد.</p>`;
      return;
    }

    container.innerHTML = logs.map(log => {
      const verified = log.supervisorVerified !== undefined ? log.supervisorVerified : true;
      const verifierLabel = log.verifiedBy || intern.supervisorName || '';
      return `
      <div class="audit-card-item">
        <div class="audit-item-top">
          <span class="audit-item-badge"><i class="bx bx-time-five"></i> ${log.hours} ساعة</span>
          <span class="audit-item-date">${log.date}</span>
        </div>
        <p class="audit-item-desc">${log.activityDescription || log.shift || ''}</p>
        <div style="font-size:0.78rem; font-weight:700; display:flex; align-items:center; gap:4px; margin-top:4px; color:${verified ? 'var(--success)' : 'var(--warning)'};">
          <i class="bx ${verified ? 'bx-check-double' : 'bx-time'}"></i>
          ${verified ? `موثق بواسطة ${verifierLabel}` : 'بانتظار توثيق المشرف'}
        </div>
      </div>
    `;
    }).join('');
  },

  // --- Render Tab 6: Supervisor Competency Evaluations (TrainingEvaluations, new section per backend spec) ---
  renderEvaluationsTab(intern) {
    const container = document.getElementById('dossierEvaluationsList');
    if (!container) return;

    const evaluations = intern.evaluations || [];
    if (evaluations.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:24px; color:var(--text-muted);">لم يتم تسجيل تقييمات من المشرف بعد.</p>`;
      return;
    }

    const scoreRow = (label, score) => `
      <div class="eval-score-row">
        <span class="eval-score-label">${label}</span>
        <div class="eval-score-track">
          <div class="eval-score-fill" style="width:${(score / 5) * 100}%;"></div>
        </div>
        <span class="eval-score-val">${score} / 5</span>
      </div>
    `;

    container.innerHTML = evaluations.map(ev => `
      <div class="audit-card-item">
        <div class="audit-item-top">
          <span class="audit-item-badge" style="background:var(--success-light); color:var(--success-text);"><i class="bx bx-star"></i> تقييم شهري</span>
          <span class="audit-item-date">${ev.evaluatedAt ? new Date(ev.evaluatedAt).toLocaleDateString(locale) : ''}</span>
        </div>
        ${scoreRow('المعرفة السريرية', ev.clinicalKnowledgeScore)}
        ${scoreRow('مهارات التواصل', ev.communicationScore)}
        ${scoreRow('الالتزام والأخلاقيات المهنية', ev.ethicsAndDisciplineScore)}
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px solid var(--border-color-subtle);">
          <span style="font-weight:800; color:var(--primary);">التقييم العام: ${ev.overallScore} / 5</span>
        </div>
        ${ev.supervisorComments ? `<p style="font-size:0.82rem; color:var(--text-main); margin-top:6px;"><strong>ملاحظات المشرف:</strong> ${ev.supervisorComments}</p>` : ''}
      </div>
    `).join('');
  },

  // --- Switch Dossier Tabs ---
  switchDossierTab(tabKey) {
    // Buttons
    document.querySelectorAll('.detail-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-dossier-tab') === tabKey);
    });

    // Panes
    const map = {
      chats: 'dossierTabChats',
      rx: 'dossierTabRx',
      plans: 'dossierTabPlans',
      orders: 'dossierTabOrders',
      attendance: 'dossierTabAttendance',
      evaluations: 'dossierTabEvaluations'
    };

    const targetId = map[tabKey] || 'dossierTabChats';
    document.querySelectorAll('.detail-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === targetId);
    });
  },

  // --- Supervisor Workspace Methods (Part 5 & 7 API Guide) ---
  async renderSupervisorInterns() {
    const tbody = document.getElementById('supInternsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">
          <i class="bx bx-loader-alt bx-spin" style="font-size:24px; margin-bottom:8px; display:block;"></i>
          جاري تحميل المتدربين التابعين لإشرافك...
        </td>
      </tr>
    `;

    try {
      const interns = await DeanApiService.getSupervisorMyInterns();
      const badge = document.getElementById('sidebarSupInternsCount');
      if (badge) {
        badge.textContent = Array.isArray(interns) ? interns.length : 0;
        badge.style.display = (Array.isArray(interns) && interns.length > 0) ? 'inline-block' : 'none';
      }

      if (!interns || interns.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:48px 24px; color:var(--text-muted);">
              <i class="bx bx-user-x" style="font-size:36px; opacity:0.4; margin-bottom:8px; display:block;"></i>
              <p style="font-weight:600; margin-bottom:4px;">${t('empty_interns_title')}</p>
              <span style="font-size:0.85rem;">${t('empty_interns_sub')}</span>
            </td>
          </tr>
        `;
        return;
      }

      if (interns[0]) {
        const sideFaculty = document.getElementById('sidebarFacultyName');
        const sideUni = document.getElementById('sidebarFacultyUni');
        if (sideFaculty && interns[0].facultyName) sideFaculty.textContent = interns[0].facultyName;
        if (sideUni && interns[0].universityName) sideUni.textContent = interns[0].universityName;
      }

      tbody.innerHTML = interns.map(item => {
        const name = item.internName || 'متدرب';
        const email = item.internEmail || '';
        const phone = item.internPhone || '';
        const uni = item.universityName || '';
        const faculty = item.facultyName || '';
        const logged = item.loggedHours ?? 0;
        const verified = item.verifiedHours ?? 0;
        const status = item.status || 'Active';
        const assignmentId = item.assignmentId || item.id || '';
        const startDate = item.startDate ? new Date(item.startDate).toLocaleDateString() : '—';
        const endDate = item.expectedEndDate ? new Date(item.expectedEndDate).toLocaleDateString() : '—';
        const initial = (name || 'I').trim().charAt(0).toUpperCase();

        return `
          <tr>
            <td>
              <div class="table-user-cell">
                <div class="avatar-sm">${initial}</div>
                <div>
                  <div style="font-weight:700; color:var(--text-heading);">${name}</div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">${email} ${phone ? '• ' + phone : ''}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-size:0.88rem; font-weight:600;">${faculty || uni || '—'}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">${uni || ''}</div>
            </td>
            <td>
              <div style="font-weight:700; font-size:0.9rem; color:var(--primary);">${verified} / ${logged} ساعة</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">معتمدة من إجمالي المسجل</div>
            </td>
            <td>
              <div style="font-size:0.82rem;">${startDate} - ${endDate}</div>
            </td>
            <td>
              <span class="badge badge-success">${status}</span>
            </td>
            <td>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn btn-outline" style="padding:5px 10px; font-size:0.8rem;" onclick="App.openSupervisorEvaluationModal('${assignmentId}', '${name.replace(/'/g, "\\'")}')">
                  <i class="bx bx-award"></i> تقييم دوري
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('[SupervisorInterns]', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:32px; color:var(--danger);">
            <i class="bx bx-error-circle" style="font-size:24px; margin-bottom:8px; display:block;"></i>
            حدث خطأ أثناء تحميل المتدربين: ${err.message || 'تعذر الاتصال'}
          </td>
        </tr>
      `;
    }
  },

  currentSupervisorDraftFilter: 'PendingSupervisorReview',

  filterSupervisorDrafts(status) {
    this.currentSupervisorDraftFilter = status;
    const chips = {
      'PendingSupervisorReview': 'chipDraftPending',
      'Accepted': 'chipDraftAccepted',
      'Rejected': 'chipDraftRejected'
    };
    ['chipDraftPending', 'chipDraftAccepted', 'chipDraftRejected'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', id === chips[status]);
    });
    this.renderSupervisorDrafts(status);
  },

  async renderSupervisorDrafts(status = null) {
    if (!status) status = this.currentSupervisorDraftFilter;
    const listEl = document.getElementById('supDraftsList');
    if (!listEl) return;

    listEl.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-muted);">
        <i class="bx bx-loader-alt bx-spin" style="font-size:28px; margin-bottom:8px; display:block;"></i>
        جاري تحميل المسودات السريرية...
      </div>
    `;

    try {
      const drafts = await DeanApiService.getSupervisorDrafts({ status });
      const badge = document.getElementById('sidebarSupDraftsCount');
      if (badge && status === 'PendingSupervisorReview') {
        badge.textContent = Array.isArray(drafts) ? drafts.length : 0;
        badge.style.display = (Array.isArray(drafts) && drafts.length > 0) ? 'inline-block' : 'none';
      }

      if (!drafts || drafts.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state-box" style="padding:48px 24px; text-align:center; color:var(--text-muted);">
            <i class="bx bx-file-blank" style="font-size:44px; opacity:0.35; margin-bottom:12px; display:block;"></i>
            <h4 style="font-weight:700; margin-bottom:4px;">${t('empty_drafts_title')}</h4>
            <p style="font-size:0.85rem; max-width:440px; margin:0 auto;">${t('empty_drafts_sub')}</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = drafts.map(d => {
        const internName = d.internName || 'متدرب';
        const date = d.createdAt || d.submittedAt ? new Date(d.createdAt || d.submittedAt).toLocaleDateString() : '—';
        const title = d.caseTitle || d.diagnosis || d.patientCase || 'توصية علاجية / استشارة سريرية';
        const meds = d.medicationPlan || d.recommendation || d.notes || d.description || 'لا توجد تفاصيل إضافية';
        const draftId = d.id;
        const currentStatus = d.status || status;

        let statusBadge = `<span class="badge badge-warning">قيد المراجعة</span>`;
        if (currentStatus === 'Accepted') {
          statusBadge = `<span class="badge badge-success"><i class="bx bx-check"></i> معتمدة</span>`;
        } else if (currentStatus === 'Rejected') {
          statusBadge = `<span class="badge badge-danger"><i class="bx bx-x"></i> مرفوضة</span>`;
        }

        let actionButtons = '';
        if (currentStatus === 'PendingSupervisorReview' || (!String(currentStatus).includes('Accepted') && !String(currentStatus).includes('Rejected'))) {
          actionButtons = `
            <div style="display:flex; gap:8px; margin-top:12px;">
              <button class="btn btn-primary" style="padding:6px 14px; font-size:0.85rem;" onclick="App.approveSupervisorDraft('${draftId}')">
                <i class="bx bx-check"></i> اعتماد المسودة
              </button>
              <button class="btn btn-outline-danger" style="padding:6px 14px; font-size:0.85rem;" onclick="App.openRejectDraftModal('${draftId}')">
                <i class="bx bx-x"></i> رفض مع ملاحظات
              </button>
            </div>
          `;
        } else if (d.supervisorFeedback) {
          actionButtons = `
            <div style="margin-top:10px; padding:10px 14px; background:var(--bg-canvas); border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.82rem;">
              <strong>ملاحظات المشرف:</strong> ${d.supervisorFeedback}
            </div>
          `;
        }

        return `
          <div class="audit-card-item" style="padding:18px; margin-bottom:12px; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-card); display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                  <span style="font-weight:700; font-size:1.02rem; color:var(--text-heading);">${title}</span>
                  ${statusBadge}
                </div>
                <div style="font-size:0.82rem; color:var(--text-muted);">
                  المتدرب: <strong>${internName}</strong> • التاريخ: ${date}
                </div>
              </div>
            </div>

            <div style="font-size:0.88rem; line-height:1.6; color:var(--text-body); background:var(--bg-canvas); padding:12px; border-radius:var(--radius-sm); white-space:pre-wrap;">${meds}</div>

            ${actionButtons}
          </div>
        `;
      }).join('');

    } catch (err) {
      console.error('[SupervisorDrafts]', err);
      listEl.innerHTML = `
        <div style="text-align:center; padding:32px; color:var(--danger);">
          <i class="bx bx-error-circle" style="font-size:28px; margin-bottom:8px; display:block;"></i>
          حدث خطأ أثناء تحميل المسودات: ${err.message || 'تعذر الاتصال'}
        </div>
      `;
    }
  },

  async approveSupervisorDraft(draftId) {
    try {
      this.showToast('جاري اعتماد المسودة الطبية...', 'info');
      await DeanApiService.approveSupervisorDraft(draftId, 'Accepted', '');
      this.showToast('تم اعتماد المسودة الطبية بنجاح ✅', 'success');
      this.renderSupervisorDrafts();
    } catch (err) {
      this.showToast(err.message || 'تعذر اعتماد المسودة', 'error');
    }
  },

  openRejectDraftModal(draftId) {
    const input = document.getElementById('rejectDraftId');
    const fb = document.getElementById('rejectDraftFeedback');
    const modal = document.getElementById('rejectDraftModal');
    if (input) input.value = draftId;
    if (fb) fb.value = '';
    if (modal) modal.classList.add('active');
  },

  closeRejectDraftModal() {
    const modal = document.getElementById('rejectDraftModal');
    if (modal) modal.classList.remove('active');
  },

  async confirmRejectDraft(e) {
    e.preventDefault();
    const draftId = document.getElementById('rejectDraftId')?.value;
    const feedback = document.getElementById('rejectDraftFeedback')?.value;
    if (!draftId) return;

    try {
      this.showToast('جاري إرسال الرفض والملاحظات...', 'info');
      await DeanApiService.approveSupervisorDraft(draftId, 'Rejected', feedback);
      this.closeRejectDraftModal();
      this.showToast('تم رفض المسودة وإرسال الملاحظات للمتدرب بنجاح', 'success');
      this.renderSupervisorDrafts();
    } catch (err) {
      this.showToast(err.message || 'تعذر رفض المسودة', 'error');
    }
  },

  openSupervisorEvaluationModal(assignmentId, internName) {
    const inputId = document.getElementById('evalInternAssignmentId');
    const sub = document.getElementById('evalInternSubtitle');
    const modal = document.getElementById('supervisorEvaluationModal');
    if (inputId) inputId.value = assignmentId;
    if (sub) sub.textContent = `التقييم الدوري للمتدرب: ${internName}`;
    if (modal) modal.classList.add('active');
  },

  closeSupervisorEvaluationModal() {
    const modal = document.getElementById('supervisorEvaluationModal');
    if (modal) modal.classList.remove('active');
  },

  async submitSupervisorEvaluation(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitEval');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري الحفظ...';
    }

    try {
      const payload = {
        internshipAssignmentId: document.getElementById('evalInternAssignmentId')?.value,
        knowledgeScore: parseFloat(document.getElementById('evalKnowledgeScore')?.value || '4'),
        communicationScore: parseFloat(document.getElementById('evalCommunicationScore')?.value || '4'),
        ethicsScore: parseFloat(document.getElementById('evalEthicsScore')?.value || '5'),
        overallRating: parseFloat(document.getElementById('evalOverallScore')?.value || '4.5'),
        comments: document.getElementById('evalComments')?.value || ''
      };

      await DeanApiService.submitSupervisorEvaluation(payload);
      this.closeSupervisorEvaluationModal();
      this.showToast('تم تسجيل التقييم الدوري بنجاح ✅', 'success');
      this.renderSupervisorInterns();
    } catch (err) {
      this.showToast(err.message || 'تعذر تسجيل التقييم', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  },

  renderSupervisorProfile() {
    const email = localStorage.getItem('tameny_dean_email') || 'supervisor@tamenny.com';
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const isAr = lang === 'ar';
    const topAvatar = document.getElementById('topbarDeanAvatar');
    const topName = document.getElementById('topbarDeanName');
    const topRole = document.getElementById('topbarDeanRole');
    const sideFacultyName = document.getElementById('sidebarFacultyName');
    const sideFacultyUni = document.getElementById('sidebarFacultyUni');

    if (topAvatar) topAvatar.textContent = (email.charAt(0) || 'S').toUpperCase();
    if (topName) topName.textContent = email.split('@')[0];
    if (topRole) topRole.textContent = isAr ? 'مشرف أكاديمي' : 'Academic Supervisor';
    if (sideFacultyName) sideFacultyName.textContent = isAr ? 'منصة المشرف الأكاديمي' : 'Supervisor Observatory';
    if (sideFacultyUni) sideFacultyUni.textContent = isAr ? 'إشراف التدريب السريري' : 'Clinical Mentorship Portal';
  },

  // --- Export / Print Feature ---
  exportInternReport() {
    this.showToast('جاري تحضير تقرير التدريب المعتمد للطباعة...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  },

  // --- Toast Notification Helper ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'bx-check-circle' : type === 'warning' ? 'bx-error-circle' : 'bx-info-circle';
    toast.innerHTML = `<i class="bx ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // --- Helpers ---
  animateCount(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const locale = lang === 'en' ? 'en-US' : 'ar-EG';
    const num = Number(targetValue) || 0;
    if (num === 0) {
      el.textContent = (0).toLocaleString(locale);
      return;
    }
    let current = 0;
    const step = Math.ceil(num / 24) || 1;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) {
        el.textContent = num.toLocaleString(locale);
        clearInterval(timer);
      } else {
        el.textContent = current.toLocaleString(locale);
      }
    }, 30);
  }
};
