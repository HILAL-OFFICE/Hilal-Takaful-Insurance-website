/**
 * Hilal Takaful CMS - Views & Section Routing
 */

// ─────────────────────────────────────────────────────────────
// DRAFT AUTO-SAVE  (localStorage-based, per-module)
// Saves form state as the user types. Restored on next open if
// the user is adding a NEW item (not editing an existing one).
// Draft is cleared on successful save OR explicit Cancel click.
// ─────────────────────────────────────────────────────────────
const DraftManager = (() => {
  const PREFIX = 'ht_draft_';

  /** Collect all serialisable field values from a form */
  function _harvest(form) {
    const data = {};
    form.querySelectorAll('input:not([type=file]):not([type=hidden]), select, textarea').forEach(el => {
      if (el.id) data[el.id] = el.value;
    });
    return data;
  }

  /** Write draft for a module key */
  function save(key, form) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(_harvest(form)));
    } catch (_) {}
  }

  /** Restore draft into form fields; returns true if data was found */
  function restore(key, form) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return false;
      const data = JSON.parse(raw);
      let restored = false;
      Object.entries(data).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el && el.closest('form') === form) {
          el.value = val;
          restored = true;
        }
      });
      return restored;
    } catch (_) { return false; }
  }

  /** Delete saved draft */
  function clear(key) {
    try { localStorage.removeItem(PREFIX + key); } catch (_) {}
  }

  /**
   * Wire a form to auto-save on every change.
   * Call once per openModal() invocation for NEW items only.
   * @param key     - storage key e.g. 'team'
   * @param form    - <form> element
   * @param cancelBtns - NodeList / array of cancel buttons that should clear the draft
   */
  function wire(key, form, cancelBtns = []) {
    // Remove any existing listener (avoid stacking)
    if (form._draftListener) form.removeEventListener('input', form._draftListener);
    if (form._draftChangeListener) form.removeEventListener('change', form._draftChangeListener);

    const handler = () => save(key, form);
    form.addEventListener('input', handler);
    form.addEventListener('change', handler);
    form._draftListener = handler;
    form._draftChangeListener = handler;

    // Cancel = discard draft (intentional dismiss)
    cancelBtns.forEach(btn => {
      btn.addEventListener('click', () => clear(key), { once: true });
    });
  }

  /** Show a small banner inside the modal body when draft is restored */
  function showRestoredBanner(form) {
    if (form.querySelector('.draft-restored-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'draft-restored-banner alert alert-warning alert-dismissible py-2 px-3 small mb-3 d-flex align-items-center gap-2';
    banner.innerHTML = `
      <i class="bi bi-clock-history fs-6"></i>
      <span><strong>Draft restored.</strong> Your unsaved changes were recovered.</span>
      <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-label="Close"></button>`;
    const body = form.querySelector('.modal-body');
    if (body) body.prepend(banner);
  }

  return { save, restore, clear, wire, showRestoredBanner };
})();

/** Invalidate public website cache in localStorage so updates reflect immediately */
function bustPublicCache(keys = []) {
  try {
    if (!keys || keys.length === 0) {
      ['settings', 'team_board', 'team_management', 'team_advisory', 'products_general', 'products_family', 'blog', 'gallery', 'reports'].forEach(k => {
        localStorage.removeItem(`hilal_cms_${k}`);
      });
    } else {
      keys.forEach(k => localStorage.removeItem(`hilal_cms_${k}`));
    }
  } catch (_) {}
}

// Keep track of loaded items in memory for fast edit pre-fill
let currentTeam = [];
let currentProducts = [];
let currentBlog = [];
let currentGallery = [];
let currentReports = [];

async function loadSection(sectionName) {
  // Update sidebar active buttons
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionName);
  });

  const titleEl = document.getElementById('viewTitle');
  const container = document.getElementById('viewContainer');

  switch (sectionName) {
    case 'settings':
      titleEl.textContent = 'Site Settings & Branding';
      await renderSettingsView(container);
      break;
    case 'leadership':
      titleEl.textContent = 'Leadership & Governance (Board, Management, Advisory)';
      await renderLeadershipView(container);
      break;
    case 'products':
      titleEl.textContent = 'Products & Takaful Plans';
      await renderProductsView(container);
      break;
    case 'blog':
      titleEl.textContent = 'Blog & News Articles';
      await renderBlogView(container);
      break;
    case 'gallery':
      titleEl.textContent = 'Event Gallery & Media';
      await renderGalleryView(container);
      break;
    case 'reports':
      titleEl.textContent = 'Financial & Annual Reports';
      await renderReportsView(container);
      break;
    case 'leads':
      titleEl.textContent = 'Customer Inquiries & Quote Requests';
      await renderLeadsView(container);
      break;
    default:
      container.innerHTML = `<p class="text-muted">Section under development.</p>`;
  }
}

// -----------------------------------------------------------------------------
// VIEW 1: SITE SETTINGS
// -----------------------------------------------------------------------------
async function renderSettingsView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/content/settings');
    const s = res.data || {};
    const ms = s.milestones || {};
    const prof = ms.company_profile || {};
    const links = ms.footer_quick_links || {};

    container.innerHTML = `
      <div class="content-card">
        <h5 class="fw-bold mb-4 text-navy"><i class="bi bi-gear-fill me-2 text-lemon"></i>Company & Contact Information</h5>
        <form id="settingsForm">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Company Name</label>
              <input type="text" class="form-control" name="company_name" value="${s.company_name || 'Hilal Takaful Insurance Limited'}" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">RC Number</label>
              <input type="text" class="form-control" name="rc_number" value="${s.rc_number || 'RC 1309373'}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Primary Phone Number (Top Bar & Footer)</label>
              <input type="text" class="form-control" name="phone_primary" value="${s.phone_primary || '+234 907 682 4451'}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Secondary Phone / WhatsApp</label>
              <input type="text" class="form-control" name="phone_secondary" value="${s.phone_secondary || ''}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Enquiries Email</label>
              <input type="email" class="form-control" name="email_enquiries" value="${s.email_enquiries || 'enquiries@hilaltakaful.com.ng'}" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Customer Service Email</label>
              <input type="email" class="form-control" name="email_customer_service" value="${s.email_customer_service || 'hilaltakafulcustomerservice@hilaltakaful.com.ng'}" required>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Head Office Physical Address (Footer & Contact)</label>
              <textarea class="form-control" name="address_line" rows="2">${s.address_line || 'Plot A2, Hakeem Balogun Street, CBD NECA House, Alausa, Ikeja, Lagos, Nigeria.'}</textarea>
            </div>
          </div>

          <hr class="my-4">

          <h5 class="fw-bold mb-3 text-navy"><i class="bi bi-share me-2 text-lemon"></i>Official Social Networks</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Facebook URL</label>
              <input type="url" class="form-control" name="facebook_url" value="${s.facebook_url || 'https://www.facebook.com/HilalTakafulNg'}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Twitter / X URL</label>
              <input type="url" class="form-control" name="twitter_url" value="${s.twitter_url || 'https://x.com/hilaltakafulng'}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Instagram URL</label>
              <input type="url" class="form-control" name="instagram_url" value="${s.instagram_url || 'https://www.instagram.com/hilaltakafulng'}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">LinkedIn URL</label>
              <input type="url" class="form-control" name="linkedin_url" value="${s.linkedin_url || 'https://www.linkedin.com/company/hilal-takaful-nigeria'}">
            </div>
          </div>

          <hr class="my-4">

          <h5 class="fw-bold mb-3 text-navy"><i class="bi bi-building me-2 text-lemon"></i>Company Profile Page Narrative</h5>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold">Profile Section Title</label>
              <input type="text" class="form-control" name="profile_headline" value="${prof.headline || 'Hilal Takaful Insurance Limited'}">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Pioneer Licensing & Origin (Paragraph 1)</label>
              <textarea class="form-control" name="profile_lead" rows="3">${prof.lead || ''}</textarea>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Products & Surplus Sharing History (Paragraph 2)</label>
              <textarea class="form-control" name="profile_p2" rows="3">${prof.p2 || ''}</textarea>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Mission & Core Values (Paragraph 3)</label>
              <textarea class="form-control" name="profile_p3" rows="3">${prof.p3 || ''}</textarea>
            </div>
          </div>

          <hr class="my-4">

          <h5 class="fw-bold mb-3 text-navy"><i class="bi bi-megaphone-fill me-2 text-lemon"></i>Homepage Hero Content</h5>
          <div class="row g-3">
            <div class="col-md-12">
              <label class="form-label fw-semibold">Hero Title</label>
              <input type="text" class="form-control" name="hero_title" value="${s.hero_title || ''}">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Hero Subtitle</label>
              <textarea class="form-control" name="hero_subtitle" rows="3">${s.hero_subtitle || ''}</textarea>
            </div>
          </div>

          <div class="mt-4 pt-3 border-top d-flex justify-content-end">
            <button type="submit" id="settingsSaveBtn" class="btn btn-lemon px-4 py-2 rounded-pill fw-bold">
              <i class="bi bi-save me-2"></i>Save All Settings
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('settingsSaveBtn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

      const formData = new FormData(e.target);

      // Package nested JSONB milestones
      const updatedMilestones = {
        ...ms,
        company_profile: {
          headline: formData.get('profile_headline') || 'Hilal Takaful Insurance Limited',
          lead: formData.get('profile_lead') || '',
          p2: formData.get('profile_p2') || '',
          p3: formData.get('profile_p3') || ''
        }
      };

      const payload = {
        company_name: formData.get('company_name'),
        rc_number: formData.get('rc_number'),
        phone_primary: formData.get('phone_primary'),
        phone_secondary: formData.get('phone_secondary') || '',
        email_enquiries: formData.get('email_enquiries'),
        email_customer_service: formData.get('email_customer_service'),
        address_line: formData.get('address_line'),
        facebook_url: formData.get('facebook_url') || '',
        twitter_url: formData.get('twitter_url') || '',
        instagram_url: formData.get('instagram_url') || '',
        linkedin_url: formData.get('linkedin_url') || '',
        hero_title: formData.get('hero_title'),
        hero_subtitle: formData.get('hero_subtitle'),
        milestones: updatedMilestones
      };

      try {
        await apiRequest('/admin/settings', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        bustPublicCache(['settings']);
        showToast('Site settings & Company Profile updated successfully!');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-save me-2"></i>Save All Settings';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading settings: ${err.message}</div>`;
  }
}

// -----------------------------------------------------------------------------
// VIEW 2: LEADERSHIP & GOVERNANCE
// -----------------------------------------------------------------------------
async function renderLeadershipView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/content/team');
    currentTeam = res.data || [];

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <p class="text-muted mb-0">Total Profiles: <strong>${currentTeam.length}</strong></p>
        <button class="btn btn-lemon rounded-pill px-3 py-1 btn-sm" onclick="openTeamModal()">
          <i class="bi bi-plus-circle me-1"></i>Add New Leader
        </button>
      </div>

      <div class="content-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name & Title</th>
                <th>Category</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${currentTeam.length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-4">No leadership profiles found. Click "Add New Leader" to create one.</td></tr>' : ''}
              ${currentTeam.map(m => `
                <tr>
                  <td>
                    <img src="${m.avatar_url || '../assets/images/favicon.png'}" class="rounded-circle border" width="44" height="44" style="object-fit: cover;" onerror="this.src='../assets/images/favicon.png'">
                  </td>
                  <td>
                    <div class="fw-bold text-navy">${m.name} ${m.honorifics ? `<span class="badge bg-light text-navy border ms-1">${m.honorifics}</span>` : ''}</div>
                    <small class="text-muted">${m.sub_title || ''}</small>
                  </td>
                  <td><span class="badge badge-lemon text-capitalize">${m.category}</span></td>
                  <td>${m.role}</td>
                  <td><span class="badge ${m.is_active ? 'bg-success' : 'bg-secondary'}">${m.is_active ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" onclick="editTeamMember('${m.id}')" title="Edit Profile">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteTeamMember('${m.id}')" title="Delete Profile">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading team: ${err.message}</div>`;
  }
}

// Cropper instance reference
let cropperInstance = null;
let croppedAvatarBlob = null;

function initCropperListeners() {
  const photoInput = document.getElementById('teamPhotoInput');
  const cropModalEl = document.getElementById('cropModal');
  const cropperImg = document.getElementById('cropperImage');
  const confirmBtn = document.getElementById('cropConfirmBtn');
  const previewImg = document.getElementById('teamAvatarPreview');

  if (!photoInput || !cropModalEl || !cropperImg || !confirmBtn) return;

  photoInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        cropperImg.src = event.target.result;
        const cropModal = new bootstrap.Modal(cropModalEl);
        cropModal.show();

        cropModalEl.addEventListener('shown.bs.modal', function onModalShown() {
          if (cropperInstance) cropperInstance.destroy();
          cropperInstance = new Cropper(cropperImg, {
            aspectRatio: 1, // 1:1 circular/square like WhatsApp
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.9,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false
          });
          cropModalEl.removeEventListener('shown.bs.modal', onModalShown);
        });
      };
      reader.readAsDataURL(file);
    }
  });

  confirmBtn.onclick = () => {
    if (!cropperInstance) return;
    const canvas = cropperInstance.getCroppedCanvas({
      width: 600,
      height: 600,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    canvas.toBlob((blob) => {
      croppedAvatarBlob = blob;
      if (previewImg) {
        previewImg.src = canvas.toDataURL('image/jpeg', 0.9);
      }
      const cropModal = bootstrap.Modal.getInstance(cropModalEl);
      if (cropModal) cropModal.hide();
    }, 'image/jpeg', 0.88);
  };
}

function openTeamModal(member = null) {
  const modalEl = document.getElementById('teamMemberModal');
  if (!modalEl) return;
  const form = document.getElementById('teamMemberForm');
  form.reset();
  croppedAvatarBlob = null;

  const preview = document.getElementById('teamAvatarPreview');
  if (preview) {
    preview.src = member && member.avatar_url ? member.avatar_url : '../assets/images/favicon.png';
  }

  document.getElementById('teamModalTitle').textContent = member ? 'Edit Leadership Profile' : 'Add Leadership Profile';
  document.getElementById('teamId').value = member ? member.id : '';
  document.getElementById('teamName').value = member ? member.name : '';
  document.getElementById('teamHonorifics').value = member ? (member.honorifics || '') : '';
  document.getElementById('teamCategory').value = member ? member.category : 'board';
  document.getElementById('teamRole').value = member ? member.role : '';
  document.getElementById('teamSubTitle').value = member ? (member.sub_title || '') : '';
  document.getElementById('teamAvatarUrl').value = member ? (member.avatar_url || '') : '';
  document.getElementById('teamBioSnippet').value = member ? (member.bio_snippet || '') : '';
  document.getElementById('teamBioFull').value = member ? (member.bio_full || '') : '';

  // ── Draft: restore on NEW only; wire auto-save; clear on cancel
  if (!member) {
    const cancelBtns = modalEl.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    const restored = DraftManager.restore('team', form);
    if (restored) DraftManager.showRestoredBanner(form);
    DraftManager.wire('team', form, cancelBtns);
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('teamSaveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
      let avatarUrl = document.getElementById('teamAvatarUrl').value;

      // If user cropped a new photo
      if (croppedAvatarBlob) {
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading avatar...';
        const file = new File([croppedAvatarBlob], `${Date.now()}-avatar.jpg`, { type: 'image/jpeg' });
        avatarUrl = await uploadFile(file, 'team-avatars');
      }

      const id = document.getElementById('teamId').value;
      const payload = {
        name: document.getElementById('teamName').value.trim(),
        honorifics: document.getElementById('teamHonorifics').value.trim(),
        category: document.getElementById('teamCategory').value,
        role: document.getElementById('teamRole').value.trim(),
        sub_title: document.getElementById('teamSubTitle').value.trim(),
        avatar_url: avatarUrl,
        bio_snippet: document.getElementById('teamBioSnippet').value.trim(),
        bio_full: document.getElementById('teamBioFull').value.trim(),
        is_active: true
      };

      if (id) {
        await apiRequest(`/admin/team/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        bustPublicCache(['team_board', 'team_management', 'team_advisory']);
        showToast('Profile updated successfully!');
      } else {
        await apiRequest('/admin/team', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        DraftManager.clear('team');
        bustPublicCache(['team_board', 'team_management', 'team_advisory']);
        showToast('New leader added successfully!');
      }

      modal.hide();
      loadSection('leadership');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}

function editTeamMember(id) {
  const member = currentTeam.find(m => m.id === id);
  if (member) openTeamModal(member);
}

/**
 * Custom Confirmation Dialog Utility
 * Replaces native window.confirm() with a sleek Bootstrap modal
 */
function confirmAction(message, onConfirm) {
  const modalEl = document.getElementById('deleteConfirmModal');
  const msgEl = document.getElementById('deleteModalMessage');
  const btn = document.getElementById('confirmDeleteBtn');

  if (!modalEl || !msgEl || !btn) {
    if (window.confirm(message)) onConfirm();
    return;
  }

  msgEl.textContent = message;
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Deleting...';
    try {
      await onConfirm();
      modal.hide();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Delete';
    }
  };
}

async function deleteTeamMember(id) {
  confirmAction('Are you sure you want to delete this leadership profile? This action cannot be undone.', async () => {
    try {
      await apiRequest(`/admin/team/${id}`, { method: 'DELETE' });
      bustPublicCache(['team_board', 'team_management', 'team_advisory']);
      showToast('Profile deleted successfully');
      loadSection('leadership');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// -----------------------------------------------------------------------------
// VIEW 3: PRODUCTS & PLANS
// -----------------------------------------------------------------------------
async function renderProductsView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/content/products');
    currentProducts = res.data || [];

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <p class="text-muted mb-0">Total Products: <strong>${currentProducts.length}</strong></p>
        <button class="btn btn-lemon rounded-pill px-3 py-1 btn-sm" onclick="openProductModal()">
          <i class="bi bi-plus-circle me-1"></i>Add New Product
        </button>
      </div>

      <div class="content-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Features</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${currentProducts.length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-4">No products found. Click "Add New Product" to create one.</td></tr>' : ''}
              ${currentProducts.map(p => `
                <tr>
                  <td class="fw-bold text-navy">${p.title}</td>
                  <td><span class="badge badge-lemon text-capitalize">${p.category} Takaful</span></td>
                  <td><code>${p.slug}</code></td>
                  <td><small class="badge bg-light text-navy border">${Array.isArray(p.features) ? p.features.length : 0} benefits</small></td>
                  <td><span class="badge ${p.is_active ? 'bg-success' : 'bg-secondary'}">${p.is_active ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${p.id}')" title="Edit Product">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p.id}')" title="Delete Product">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading products: ${err.message}</div>`;
  }
}

function openProductModal(prod = null) {
  const modalEl = document.getElementById('productModal');
  if (!modalEl) return;
  const form = document.getElementById('productForm');
  form.reset();

  document.getElementById('productModalTitle').textContent = prod ? 'Edit Product & Plan' : 'Add New Product & Plan';
  document.getElementById('productId').value = prod ? prod.id : '';
  document.getElementById('productTitle').value = prod ? prod.title : '';
  document.getElementById('productCategory').value = prod ? prod.category : 'general';
  document.getElementById('productSlug').value = prod ? prod.slug : '';
  document.getElementById('productIconClass').value = prod ? (prod.icon_class || 'bi-shield-check') : 'bi-shield-check';
  document.getElementById('productShariahModel').value = prod ? (prod.shariah_model || '') : '';
  document.getElementById('productBrochureUrl').value = prod ? (prod.brochure_url || '') : '';
  document.getElementById('productShortDesc').value = prod ? prod.short_description : '';
  document.getElementById('productFeaturesRaw').value = prod && Array.isArray(prod.features) ? prod.features.join('\n') : '';
  document.getElementById('productFullDesc').value = prod ? prod.full_description : '';

  // ── Draft: restore on NEW only
  if (!prod) {
    const cancelBtns = modalEl.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    const restored = DraftManager.restore('product', form);
    if (restored) DraftManager.showRestoredBanner(form);
    DraftManager.wire('product', form, cancelBtns);
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('productSaveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
      const fileInput = document.getElementById('productImageInput');
      let brochureUrl = document.getElementById('productBrochureUrl').value;

      if (fileInput && fileInput.files.length > 0) {
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading banner...';
        brochureUrl = await uploadFile(fileInput.files[0], 'gallery-images');
      }

      // Warn if no image — but allow saving (icon placeholder will show on frontend)
      if (!brochureUrl) {
        showToast('No banner image uploaded — a placeholder icon will appear on the site. You can edit this product later to add one.', 'error');
      }

      const id = document.getElementById('productId').value;
      const rawFeatures = document.getElementById('productFeaturesRaw').value;
      const features = rawFeatures.split('\n').map(s => s.trim()).filter(s => s.length > 0);

      const payload = {
        title: document.getElementById('productTitle').value.trim(),
        category: document.getElementById('productCategory').value,
        slug: document.getElementById('productSlug').value.trim(),
        icon_class: document.getElementById('productIconClass').value.trim() || 'bi-shield-check',
        shariah_model: document.getElementById('productShariahModel').value.trim() || 'Al-Tabarru',
        brochure_url: brochureUrl,
        short_description: document.getElementById('productShortDesc').value.trim(),
        full_description: document.getElementById('productFullDesc').value.trim(),
        features,
        is_active: true
      };

      if (id) {
        await apiRequest(`/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        bustPublicCache(['products_general', 'products_family']);
        showToast('Product updated successfully!');
      } else {
        await apiRequest('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        DraftManager.clear('product');
        bustPublicCache(['products_general', 'products_family']);
        showToast('New product created successfully!');
      }

      modal.hide();
      loadSection('products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}

function editProduct(id) {
  const prod = currentProducts.find(p => p.id === id);
  if (prod) openProductModal(prod);
}

async function deleteProduct(id) {
  confirmAction('Are you sure you want to delete this product? It will be removed from the public website.', async () => {
    try {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      bustPublicCache(['products_general', 'products_family']);
      showToast('Product deleted successfully');
      loadSection('products');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// -----------------------------------------------------------------------------
// VIEW 4: BLOG & NEWS ARTICLES
// -----------------------------------------------------------------------------
async function renderBlogView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/content/blog');
    currentBlog = res.data || [];

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <p class="text-muted mb-0">Total Posts: <strong>${currentBlog.length}</strong></p>
        <button class="btn btn-lemon rounded-pill px-3 py-1 btn-sm" onclick="openBlogModal()">
          <i class="bi bi-plus-circle me-1"></i>New Article
        </button>
      </div>

      <div class="content-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Published Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${currentBlog.length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-4">No blog posts found. Click "New Article" to create one.</td></tr>' : ''}
              ${currentBlog.map(b => `
                <tr>
                  <td class="fw-bold text-navy">${b.title}</td>
                  <td><span class="badge badge-lemon">${b.category || 'Takaful'}</span></td>
                  <td>${b.author_name || 'Hilal Team'}</td>
                  <td><small class="text-muted">${new Date(b.published_at).toLocaleDateString()}</small></td>
                  <td><span class="badge ${b.status === 'published' ? 'bg-success' : 'bg-warning'} text-capitalize">${b.status}</span></td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" onclick="editBlogPost('${b.id}')" title="Edit Article">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteBlogPost('${b.id}')" title="Delete Article">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading blog: ${err.message}</div>`;
  }
}

function openBlogModal(post = null) {
  const modalEl = document.getElementById('blogModal');
  if (!modalEl) return;
  const form = document.getElementById('blogForm');
  form.reset();

  document.getElementById('blogModalTitle').textContent = post ? 'Edit Blog Article' : 'Write New Article';
  document.getElementById('blogId').value = post ? post.id : '';
  document.getElementById('blogTitle').value = post ? post.title : '';
  document.getElementById('blogCategory').value = post ? post.category : 'Takaful Insights';
  document.getElementById('blogAuthor').value = post ? post.author_name : 'Hilal Takaful Team';
  document.getElementById('blogStatus').value = post ? post.status : 'published';
  document.getElementById('blogFeaturedImage').value = post ? (post.featured_image || '') : '';
  document.getElementById('blogExcerpt').value = post ? post.excerpt : '';
  document.getElementById('blogContentHtml').value = post ? post.content_html : '';

  // ── Draft: restore on NEW only
  if (!post) {
    const cancelBtns = modalEl.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    const restored = DraftManager.restore('blog', form);
    if (restored) DraftManager.showRestoredBanner(form);
    DraftManager.wire('blog', form, cancelBtns);
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('blogSaveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
      const fileInput = document.getElementById('blogImageInput');
      let featuredImage = document.getElementById('blogFeaturedImage').value;

      if (fileInput && fileInput.files.length > 0) {
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading image...';
        featuredImage = await uploadFile(fileInput.files[0], 'blog-images');
      }

      const id = document.getElementById('blogId').value;
      const title = document.getElementById('blogTitle').value.trim();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      let contentHtml = document.getElementById('blogContentHtml').value.trim();

      // Automatically prepend the featured image at the top of the article body if not already present
      if (featuredImage && !contentHtml.includes(featuredImage) && !contentHtml.startsWith('<img')) {
        contentHtml = `<img src="${featuredImage}" class="img-fluid rounded-3 mb-4 w-100" alt="${title}" style="max-height:360px;object-fit:cover;">\n` + contentHtml;
      }

      const payload = {
        title,
        slug,
        category: document.getElementById('blogCategory').value.trim(),
        author_name: document.getElementById('blogAuthor').value.trim(),
        status: document.getElementById('blogStatus').value,
        featured_image: featuredImage,
        excerpt: document.getElementById('blogExcerpt').value.trim(),
        content_html: contentHtml
      };

      if (id) {
        await apiRequest(`/admin/blog/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        bustPublicCache(['blog']);
        showToast('Article updated successfully!');
      } else {
        await apiRequest('/admin/blog', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        DraftManager.clear('blog');
        bustPublicCache(['blog']);
        showToast('New article published successfully!');
      }

      modal.hide();
      loadSection('blog');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}

function editBlogPost(id) {
  const post = currentBlog.find(b => b.id === id);
  if (post) openBlogModal(post);
}

async function deleteBlogPost(id) {
  confirmAction('Are you sure you want to delete this blog article?', async () => {
    try {
      await apiRequest(`/admin/blog/${id}`, { method: 'DELETE' });
      bustPublicCache(['blog']);
      showToast('Article deleted successfully');
      loadSection('blog');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// -----------------------------------------------------------------------------
// VIEW 5: GALLERY
// -----------------------------------------------------------------------------
async function renderGalleryView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/content/gallery');
    currentGallery = res.data || [];

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <p class="text-muted mb-0">Total Gallery Photos: <strong>${currentGallery.length}</strong></p>
        <button class="btn btn-lemon rounded-pill px-3 py-1 btn-sm" onclick="openGalleryModal()">
          <i class="bi bi-plus-circle me-1"></i>Add Photo
        </button>
      </div>

      <div class="content-card">
        <div class="row g-3">
          ${currentGallery.length === 0 ? '<div class="col-12 text-center text-muted py-4">No gallery photos found. Click "Add Photo" to upload.</div>' : ''}
          ${currentGallery.map(g => `
            <div class="col-md-4 col-sm-6">
              <div class="card h-100 border rounded-3 overflow-hidden shadow-sm">
                <img src="${g.cover_image_url || '../assets/images/favicon.png'}" class="card-img-top" style="height: 160px; object-fit: cover;" onerror="this.src='../assets/images/favicon.png'">
                <div class="card-body p-3">
                  <h6 class="fw-bold text-navy mb-1 text-truncate">${g.title}</h6>
                  <small class="text-muted d-block mb-3">${g.description || ''}</small>
                  <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="editGallery('${g.id}')">
                      <i class="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGallery('${g.id}')">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading gallery: ${err.message}</div>`;
  }
}

function openGalleryModal(item = null) {
  const modalEl = document.getElementById('galleryModal');
  if (!modalEl) return;
  const form = document.getElementById('galleryForm');
  form.reset();

  document.getElementById('galleryModalTitle').textContent = item ? 'Edit Photo' : 'Add Photo';
  document.getElementById('galleryId').value = item ? item.id : '';
  document.getElementById('galleryTitle').value = item ? item.title : '';
  document.getElementById('galleryDesc').value = item ? (item.description || '') : '';
  document.getElementById('galleryCoverUrl').value = item ? item.cover_image_url : '';

  // ── Draft: restore on NEW only
  if (!item) {
    const cancelBtns = modalEl.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    const restored = DraftManager.restore('gallery', form);
    if (restored) DraftManager.showRestoredBanner(form);
    DraftManager.wire('gallery', form, cancelBtns);
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('gallerySaveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
      const fileInput = document.getElementById('galleryPhotoInput');
      let coverUrl = document.getElementById('galleryCoverUrl').value;

      if (fileInput && fileInput.files.length > 0) {
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading photo...';
        coverUrl = await uploadFile(fileInput.files[0], 'gallery-images');
      }

      const id = document.getElementById('galleryId').value;
      const payload = {
        title: document.getElementById('galleryTitle').value.trim(),
        description: document.getElementById('galleryDesc').value.trim(),
        cover_image_url: coverUrl,
        images: [coverUrl],
        is_active: true
      };

      if (id) {
        await apiRequest(`/admin/gallery/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        bustPublicCache(['gallery']);
        showToast('Gallery item updated!');
      } else {
        await apiRequest('/admin/gallery', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        DraftManager.clear('gallery');
        bustPublicCache(['gallery']);
        showToast('Photo added to gallery!');
      }

      modal.hide();
      loadSection('gallery');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}

function editGallery(id) {
  const item = currentGallery.find(g => g.id === id);
  if (item) openGalleryModal(item);
}

async function deleteGallery(id) {
  confirmAction('Are you sure you want to delete this gallery photo?', async () => {
    try {
      await apiRequest(`/admin/gallery/${id}`, { method: 'DELETE' });
      bustPublicCache(['gallery']);
      showToast('Photo deleted successfully');
      loadSection('gallery');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// -----------------------------------------------------------------------------
// VIEW 6: FINANCIAL REPORTS
// -----------------------------------------------------------------------------
async function renderReportsView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/content/reports');
    currentReports = res.data || [];

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <p class="text-muted mb-0">Total Reports: <strong>${currentReports.length}</strong></p>
        <button class="btn btn-lemon rounded-pill px-3 py-1 btn-sm" onclick="openReportModal()">
          <i class="bi bi-plus-circle me-1"></i>Add New Report
        </button>
      </div>

      <div class="content-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Report Title</th>
                <th>Category</th>
                <th>File Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${currentReports.length === 0 ? '<tr><td colspan="5" class="text-center text-muted py-4">No financial reports published yet.</td></tr>' : ''}
              ${currentReports.map(r => `
                <tr>
                  <td class="fw-bold text-navy">${r.year}</td>
                  <td>${r.title}</td>
                  <td><span class="badge badge-lemon text-capitalize">${(r.category || '').replace('_', ' ')}</span></td>
                  <td><a href="${r.file_url}" target="_blank" class="small text-truncate d-inline-block" style="max-width: 250px;"><i class="bi bi-link-45deg me-1"></i>View Document</a></td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" onclick="editReport('${r.id}')" title="Edit Report">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteReport('${r.id}')" title="Delete Report">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading reports: ${err.message}</div>`;
  }
}

function openReportModal(rep = null) {
  const modalEl = document.getElementById('reportModal');
  if (!modalEl) return;
  const form = document.getElementById('reportForm');
  form.reset();

  document.getElementById('reportModalTitle').textContent = rep ? 'Edit Financial Report' : 'Add Financial Report';
  document.getElementById('reportId').value = rep ? rep.id : '';
  document.getElementById('reportTitle').value = rep ? rep.title : '';
  document.getElementById('reportYear').value = rep ? rep.year : new Date().getFullYear();
  document.getElementById('reportCategory').value = rep ? rep.category : 'annual_report';
  document.getElementById('reportFileUrl').value = rep ? rep.file_url : '';
  document.getElementById('reportFileSize').value = rep ? (rep.file_size || '') : 'PDF Document';

  // ── Draft: restore on NEW only
  if (!rep) {
    const cancelBtns = modalEl.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    const restored = DraftManager.restore('report', form);
    if (restored) DraftManager.showRestoredBanner(form);
    DraftManager.wire('report', form, cancelBtns);
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('reportSaveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
      const id = document.getElementById('reportId').value;
      const payload = {
        title: document.getElementById('reportTitle').value.trim(),
        year: parseInt(document.getElementById('reportYear').value, 10),
        category: document.getElementById('reportCategory').value,
        file_url: document.getElementById('reportFileUrl').value.trim(),
        file_size: document.getElementById('reportFileSize').value.trim(),
        is_active: true
      };

      if (id) {
        await apiRequest(`/admin/reports/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        bustPublicCache(['reports']);
        showToast('Report updated successfully!');
      } else {
        await apiRequest('/admin/reports', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        DraftManager.clear('report');
        bustPublicCache(['reports']);
        showToast('New report added successfully!');
      }

      modal.hide();
      loadSection('reports');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}

function editReport(id) {
  const rep = currentReports.find(r => r.id === id);
  if (rep) openReportModal(rep);
}

async function deleteReport(id) {
  confirmAction('Are you sure you want to delete this financial report?', async () => {
    try {
      await apiRequest(`/admin/reports/${id}`, { method: 'DELETE' });
      bustPublicCache(['reports']);
      showToast('Report deleted successfully');
      loadSection('reports');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// -----------------------------------------------------------------------------
// VIEW 7: INQUIRIES & LEADS
// -----------------------------------------------------------------------------
async function renderLeadsView(container) {
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  try {
    const res = await apiRequest('/leads');
    const leads = res.data || [];

    container.innerHTML = `
      <div class="content-card">
        <h5 class="fw-bold mb-3 text-navy">Customer Inquiries Inbox (${leads.length})</h5>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client Name</th>
                <th>Contact</th>
                <th>Service Interest</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${leads.length === 0 ? '<tr><td colspan="7" class="text-center text-muted py-4">No customer inquiries yet.</td></tr>' : ''}
              ${leads.map(l => `
                <tr>
                  <td><small class="text-muted">${new Date(l.created_at).toLocaleDateString()}</small></td>
                  <td class="fw-bold">${l.full_name}</td>
                  <td>
                    <div><a href="mailto:${l.email}" class="text-decoration-none">${l.email}</a></div>
                    <small class="text-muted">${l.phone || ''}</small>
                  </td>
                  <td><span class="badge bg-light text-navy border">${l.service_type || 'General'}</span></td>
                  <td><small class="text-truncate d-inline-block" style="max-width: 250px;">${l.message}</small></td>
                  <td><span class="badge bg-primary text-uppercase">${l.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteLead('${l.id}')" title="Delete Inquiry">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading leads: ${err.message}</div>`;
  }
}

async function deleteLead(id) {
  confirmAction('Are you sure you want to delete this customer inquiry? This cannot be undone.', async () => {
    try {
      await apiRequest(`/leads/${id}`, { method: 'DELETE' });
      showToast('Inquiry deleted successfully');
      loadSection('leads');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Global hook for section buttons
document.addEventListener('DOMContentLoaded', () => {
  initCropperListeners();
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (section) loadSection(section);
    });
  });
});
