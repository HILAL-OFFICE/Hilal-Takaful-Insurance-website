/**
 * Hilal Takaful CMS - Authentication Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('loginSection');
  const appSection = document.getElementById('appSection');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const userEmailDisplay = document.getElementById('userEmailDisplay');

  // Check existing session
  const session = await getSession();
  if (session && session.user) {
    showDashboard(session.user);
  } else {
    showLogin();
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted!');
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const submitBtn = document.getElementById('loginSubmitBtn');

      if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing In...';

        if (!window._sb) {
          throw new Error('Supabase client is not initialized. Please check your configuration.');
        }

        const { data, error } = await window._sb.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        showToast('Signed in successfully', 'success');
        showDashboard(data.user);
      } catch (err) {
        console.error('Sign in error details:', err);
        alert('Login failed: ' + (err.message || 'Unknown error'));
        showToast(err.message || 'Invalid login credentials', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In to Dashboard';
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to sign out?')) {
        await window._sb.auth.signOut();
        showToast('Signed out successfully', 'success');
        showLogin();
      }
    });
  }

  function showDashboard(user) {
    loginSection.classList.add('d-none');
    appSection.classList.remove('d-none');
    if (userEmailDisplay) {
      userEmailDisplay.textContent = user.email || 'Admin';
    }
    // Load initial section
    loadSection('settings');
  }

  function showLogin() {
    appSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
  }
});

