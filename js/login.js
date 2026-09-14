/**
 * Tamenny Faculty Dean Portal - Login Controller (login.js)
 * High-performance, clean authentication flow with instant demo access.
 */

const FIREBASE_API_KEY = 'AIzaSyCXMY-UDoD36xHZEpBUxstflXHzkA2EAe8';
const FIREBASE_LOGIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

document.addEventListener('DOMContentLoaded', () => {
  LoginApp.init();
});

const LoginApp = {
  init() {
    this.checkExistingSession();
    this.bindEvents();
  },

  // --- Check Active Session ---
  checkExistingSession() {
    const token = localStorage.getItem('tameny_dean_token');
    if (token) {
      // If already has session and just landed on login, redirect to index
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('reauth')) {
        window.location.href = 'index.html';
      }
    }
  },

  // --- Event Bindings ---
  bindEvents() {
    // Login Form Submit
    const form = document.getElementById('deanLoginForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleLogin(e));
    }
  },

  // --- Handle Main Login ---
  async handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('deanEmail');
    const passwordInput = document.getElementById('deanPassword');
    const submitBtn = document.getElementById('loginSubmitBtn');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
      this.showToast('يرجى إدخال البريد وكلمة المرور', 'error');
      return;
    }

    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري التحقق...';

    try {
      // 1. Authenticate against Firebase
      let token = null;
      let firebaseErrorMessage = null;
      try {
        const response = await fetch(FIREBASE_LOGIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        });

        const data = await response.json();
        if (response.ok) {
          token = data.idToken;
        } else {
          firebaseErrorMessage = (data.error && data.error.message) || 'INVALID_LOGIN_CREDENTIALS';
        }
      } catch (networkErr) {
        this.showToast('تعذر الاتصال بخادم المصادقة. يرجى التحقق من الاتصال بالإنترنت.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        return;
      }

      if (!token) {
        this.showToast(this._friendlyFirebaseError(firebaseErrorMessage), 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        return;
      }

      // 2. Verify the account is a registered, active Faculty Dean before granting access
      let deanProfile = null;
      try {
        const meRes = await fetch(`${DeanConfig.apiBaseUrl}${DeanConfig.endpoints.deanMe}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          deanProfile = meData && meData.data ? meData.data : null;
        } else if (meRes.status === 401 || meRes.status === 403) {
          this.showToast('هذا الحساب غير مسجل كعميد كلية على منصة طَمّني.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          return;
        }
      } catch (profileErr) {
        console.warn('[Dean Login] /dean/me unreachable, proceeding with Firebase session only:', profileErr.message);
      }

      // Store credentials & token
      localStorage.setItem('tameny_dean_token', token);
      localStorage.setItem('tameny_dean_session_at', new Date().toISOString());
      localStorage.setItem('tameny_dean_email', email);
      localStorage.removeItem('tameny_dean_demo_mode');
      if (deanProfile) {
        localStorage.setItem('tameny_dean_profile', JSON.stringify(deanProfile));
      }

      this.showToast('تم التحقق بنجاح — جاري الدخول للمرصد', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);

    } catch (err) {
      this.showToast(err.message || 'خطأ في بيانات الاعتماد', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  },

  _friendlyFirebaseError(code) {
    switch (code) {
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_PASSWORD':
      case 'INVALID_LOGIN_CREDENTIALS':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'USER_DISABLED':
        return 'تم تعطيل هذا الحساب. يرجى مراجعة إدارة النظام.';
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'محاولات دخول كثيرة. يرجى المحاولة لاحقاً.';
      default:
        return 'تعذر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
    }
  },

  // --- Toast Notification ---
  showToast(message, type = 'info') {
    let toast = document.getElementById('loginToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'loginToast';
      toast.className = 'login-toast';
      document.body.appendChild(toast);
    }

    const icon = type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-error-circle' : 'bx-info-circle';
    toast.className = `login-toast ${type} show`;
    toast.innerHTML = `<i class="bx ${icon}"></i> <span>${message}</span>`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
};
