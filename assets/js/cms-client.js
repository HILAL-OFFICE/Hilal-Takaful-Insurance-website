/**
 * Hilal Takaful Insurance Limited - CMS Dynamic Client
 * Automatically hydrates static HTML pages with real-time updates from Supabase/Backend.
 * Features:
 *  - Full Dynamic Grid Sync (renders newly added leaders, products, blog articles, and financial reports directly into the DOM)
 *  - Instant local cache (SWR - Stale-While-Revalidate) with ZERO flicker
 *  - Universal Image Resolver (handles both local relative and Supabase cloud URLs)
 *  - Graceful fallback for broken images
 */

(function () {
  'use strict';

  // Configuration - automatically uses local or production backend
  const API_BASE = window.CMS_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000/api'
      : 'https://admin.hilaltakaful.com.ng/api');

  /**
   * Universal Image Resolver & Fallback
   */
  function resolveImageUrl(url, fallback = 'assets/images/favicon.png') {
    if (!url || typeof url !== 'string' || url.trim() === '') return fallback;
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.replace(/^\/?/, '');
  }

  function bindImageErrorHandler(imgEl, fallback = 'assets/images/favicon.png') {
    if (!imgEl) return;
    imgEl.onerror = function () {
      this.onerror = null;
      this.src = fallback;
    };
  }

  /**
   * Local storage cache helper to eliminate flash of old content
   */
  const Cache = {
    get(key) {
      try {
        const item = localStorage.getItem(`hilal_cms_${key}`);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    },
    set(key, data) {
      try {
        localStorage.setItem(`hilal_cms_${key}`, JSON.stringify(data));
      } catch (e) {}
    }
  };

  /**
   * Safe fetch with short timeout
   */
  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 3500 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. SITE SETTINGS HYDRATION (Header, Footer, Company Profile, Hero)
  // ---------------------------------------------------------------------------
  function applySiteSettings(data) {
    if (!data) return;
    const ms = data.milestones || {};
    const prof = ms.company_profile || {};
    const links = ms.footer_quick_links || {};

    // 1. Company Name & RC Number in Footer
    if (data.company_name) {
      document.querySelectorAll('.footer-col-title, .footer-title').forEach(el => {
        if (el.textContent.includes('Hilal') || el.closest('.col-lg-4')) {
          el.textContent = data.company_name;
        }
      });
    }
    if (data.rc_number) {
      document.querySelectorAll('.badge').forEach(b => {
        if (b.textContent.includes('RC')) {
          b.innerHTML = `<i class="bi bi-shield-check text-lemon me-1"></i> ${data.rc_number}`;
        }
      });
    }

    // 2. Primary Phone (Top Bar & Footer)
    if (data.phone_primary) {
      document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        el.href = `tel:${data.phone_primary.replace(/\s+/g, '')}`;
        const icon = el.querySelector('i');
        if (icon) {
          el.innerHTML = '';
          el.appendChild(icon);
          el.appendChild(document.createTextNode(` ${data.phone_primary}`));
        } else {
          el.textContent = data.phone_primary;
        }
      });
    }

    // 3. Emails
    if (data.email_enquiries) {
      document.querySelectorAll('a[href^="mailto:enquiries@"]').forEach(el => {
        el.href = `mailto:${data.email_enquiries}`;
        el.textContent = data.email_enquiries;
      });
    }
    if (data.email_customer_service) {
      document.querySelectorAll('a[href*="customerservice@"]').forEach(el => {
        el.href = `mailto:${data.email_customer_service}`;
        el.textContent = data.email_customer_service;
      });
    }

    // 4. Physical Address in Footer & Contact
    if (data.address_line) {
      document.querySelectorAll('.footer-text, .footer-address-text').forEach(el => {
        if (el.textContent.includes('Hakeem Balogun') || el.textContent.includes('NECA House')) {
          el.innerHTML = data.address_line.replace(/,\s*/g, ',<br>');
        }
      });
    }

    // 5. Social Links (Top Bar & Footer)
    if (data.facebook_url) {
      document.querySelectorAll('a[href*="facebook.com"]').forEach(a => a.href = data.facebook_url);
    }
    if (data.twitter_url) {
      document.querySelectorAll('a[href*="x.com"], a[href*="twitter.com"]').forEach(a => a.href = data.twitter_url);
    }
    if (data.instagram_url) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = data.instagram_url);
    }
    if (data.linkedin_url) {
      document.querySelectorAll('a[href*="linkedin.com"]').forEach(a => a.href = data.linkedin_url);
    }

    // 7. Company Profile Page Hydration (company-profile.html)
    if (window.location.pathname.includes('company-profile')) {
      const card = document.querySelector('.card.border-0.shadow-sm.rounded-4.p-4');
      if (card) {
        if (prof.headline) {
          const h3 = card.querySelector('h3.fw-bold');
          if (h3) {
            h3.innerHTML = `<span class="badge bg-lemon text-white rounded-circle p-2 fs-6 me-2"><i class="bi bi-building"></i></span> ${prof.headline}`;
          }
        }
        if (prof.lead) {
          const lead = card.querySelector('p.lead');
          if (lead) lead.textContent = prof.lead;
        }
        const paras = card.querySelectorAll('p.text-body');
        if (paras.length >= 2) {
          if (prof.p2) paras[0].textContent = prof.p2;
          if (prof.p3) paras[1].textContent = prof.p3;
        }
      }
    }

    // 8. Homepage Hero Content
    const heroTitleEl = document.querySelector('.hero-title');
    if (heroTitleEl && data.hero_title) {
      heroTitleEl.innerHTML = data.hero_title.replace(/\n/g, '<br>');
    }
    const heroSubtitleEl = document.querySelector('.hero-subtitle');
    if (heroSubtitleEl && data.hero_subtitle) {
      heroSubtitleEl.textContent = data.hero_subtitle;
    }
  }

  async function hydrateSiteSettings() {
    const cached = Cache.get('settings');
    if (cached) applySiteSettings(cached);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/content/settings`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          Cache.set('settings', json.data);
          applySiteSettings(json.data);
        }
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 2. TEAM MEMBERS FULL RENDER & SYNC (Board, Management, Advisory)
  // ---------------------------------------------------------------------------
  function applyTeamMembers(members) {
    if (!Array.isArray(members) || members.length === 0) return;

    const gridContainer = document.querySelector('.row.g-4.justify-content-center') || document.querySelector('.row.justify-content-center');
    if (!gridContainer) return;

    // Update existing matching cards
    const existingCards = Array.from(document.querySelectorAll('.team-card'));
    const matchedMemberIds = new Set();

    members.forEach(member => {
      const matchedHeader = existingCards.map(c => c.querySelector('.team-member-name')).find(h => 
        h && h.textContent.trim().toLowerCase().includes(member.name.toLowerCase())
      );

      if (matchedHeader) {
        matchedMemberIds.add(member.id);
        const card = matchedHeader.closest('.team-card');
        if (card) {
          const roleEl = card.querySelector('.team-member-role');
          if (roleEl && member.role) roleEl.textContent = member.role;

          const snippetEl = card.querySelector('.team-bio-snippet');
          if (snippetEl && member.bio_snippet) snippetEl.textContent = member.bio_snippet;

          if (member.avatar_url) {
            const imgEl = card.querySelector('.team-avatar-img');
            if (imgEl) {
              imgEl.src = resolveImageUrl(member.avatar_url);
              bindImageErrorHandler(imgEl);
            }
          }

          const modalTarget = card.getAttribute('data-bs-target');
          if (modalTarget) {
            const modalEl = document.querySelector(modalTarget);
            if (modalEl && member.bio_full) {
              const modalBody = modalEl.querySelector('.modal-body');
              if (modalBody) {
                const paras = member.bio_full.split('\n\n').filter(p => p.trim().length > 0);
                if (paras.length > 0) {
                  const existingP = modalBody.querySelectorAll('p');
                  if (existingP.length >= paras.length) {
                    paras.forEach((text, i) => {
                      if (existingP[i]) existingP[i].textContent = text;
                    });
                  }
                }
              }
            }
          }
        }
      }
    });

    // Append newly added leaders
    members.forEach(member => {
      if (!matchedMemberIds.has(member.id)) {
        const safeSlug = member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const modalId = `modal-dyn-${safeSlug}`;

        // If card already exists in DOM from cache or previous call, don't re-create or delete it
        if (document.querySelector(`[data-dyn-member-id="${member.id}"]`)) {
          return;
        }

        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4 dyn-team-card';
        col.setAttribute('data-dyn-member-id', member.id);
        col.innerHTML = `
          <div class="team-card h-100" data-bs-toggle="modal" data-bs-target="#${modalId}">
            <div class="team-card-banner"></div>
            <div class="text-center">
              <div class="team-avatar-wrapper">
                <img src="${resolveImageUrl(member.avatar_url)}" alt="${member.name}" class="team-avatar-img" onerror="this.src='assets/images/favicon.png'">
              </div>
            </div>
            <div class="team-card-body text-center">
              <h4 class="team-member-name">${member.name} ${member.honorifics ? `<span class="small">(${member.honorifics})</span>` : ''}</h4>
              <div class="d-flex justify-content-center">
                <span class="team-member-role">${member.role}</span>
              </div>
              <p class="team-bio-snippet">${member.bio_snippet || ''}</p>
              <div class="team-card-footer justify-content-center">
                <span class="btn btn-outline-lemon rounded-pill px-4 py-1 btn-sm fw-bold">
                  View Full Profile <i class="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>
          </div>
        `;
        gridContainer.appendChild(col);

        if (!document.getElementById(modalId)) {
          const modalDiv = document.createElement('div');
          modalDiv.className = 'modal fade';
          modalDiv.id = modalId;
          modalDiv.tabIndex = -1;
          modalDiv.setAttribute('aria-hidden', 'true');
          modalDiv.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-team-dialog">
              <div class="modal-content modal-team-content">
                <div class="modal-team-header-bar">
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 p-md-5 pt-0">
                  <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4 mb-4 pb-3 border-bottom">
                    <div class="modal-team-avatar-box flex-shrink-0">
                      <img src="${resolveImageUrl(member.avatar_url)}" alt="${member.name}" class="modal-team-avatar-img" onerror="this.src='assets/images/favicon.png'">
                    </div>
                    <div class="text-center text-md-start flex-grow-1 pt-2">
                      <h3 class="fw-bold text-navy mb-1">${member.name}</h3>
                      <p class="fs-6 text-lemon fw-bold mb-2">${member.role}</p>
                      ${member.honorifics ? `<p class="small text-muted mb-0"><i class="bi bi-patch-check-fill text-lemon me-1"></i>${member.honorifics}</p>` : ''}
                    </div>
                  </div>
                  <div class="mb-4">
                    <h5 class="fw-bold text-navy mb-3 d-flex align-items-center gap-2">
                      <i class="bi bi-person-lines-fill text-lemon"></i> Biography & Background
                    </h5>
                    <div class="lh-lg text-body fs-6">
                      ${member.bio_full ? member.bio_full.split('\n\n').map(p => `<p>${p}</p>`).join('') : `<p>${member.bio_snippet || ''}</p>`}
                    </div>
                  </div>
                  <div class="d-flex justify-content-end pt-3 border-top">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4 btn-sm" data-bs-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modalDiv);
        }
      }
    });
  }

  async function hydrateTeamMembers() {
    const isBoard = window.location.pathname.includes('board-of-directors');
    const isManagement = window.location.pathname.includes('management-team');
    const isAdvisory = window.location.pathname.includes('advisory-council');

    if (!isBoard && !isManagement && !isAdvisory) return;

    const category = isBoard ? 'board' : (isManagement ? 'management' : 'advisory');
    const cacheKey = `team_${category}`;

    const cached = Cache.get(cacheKey);
    if (cached) applyTeamMembers(cached);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/content/team?category=${category}`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          Cache.set(cacheKey, json.data);
          applyTeamMembers(json.data);
        }
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 3. PRODUCTS FULL RENDER & SYNC (General & Family Takaful)
  // ---------------------------------------------------------------------------
  function applyProducts(products) {
    if (!Array.isArray(products) || products.length === 0) return;

    const gridContainer = document.getElementById('productsCatalogContainer') || document.querySelector('.row.g-4') || document.getElementById('productsGrid');
    const existingCards = Array.from(document.querySelectorAll('.product-card-modern, .product-item-col'));
    const matchedProdIds = new Set();

    // Update existing matching product cards
    products.forEach(prod => {
      const titles = existingCards.map(c => c.querySelector('.product-card-title')).filter(Boolean);
      const matchedTitle = titles.find(t => t.textContent.trim().toLowerCase().includes(prod.title.toLowerCase()));

      if (matchedTitle) {
        matchedProdIds.add(prod.id);
        const card = matchedTitle.closest('.product-card-modern') || matchedTitle.closest('.card');
        if (card) {
          const descEl = card.querySelector('.product-card-desc');
          if (descEl && prod.short_description) descEl.textContent = prod.short_description;

          if (prod.brochure_url) {
            const img = card.querySelector('.product-card-banner img');
            if (img) {
              img.src = resolveImageUrl(prod.brochure_url);
              bindImageErrorHandler(img);
            }
          }

          // Also update features in the card if available
          if (Array.isArray(prod.features) && prod.features.length > 0) {
            const featBox = card.querySelector('.product-features-box ul');
            if (featBox) {
              featBox.innerHTML = prod.features.map(f => `<li><i class="bi bi-shield-check"></i><span>${f}</span></li>`).join('');
            }
          }

          // Also update the static reading modal linked to this card if open
          const modalBtn = card.querySelector('[data-bs-toggle="modal"]');
          if (modalBtn) {
            const targetModalSelector = modalBtn.getAttribute('data-bs-target');
            if (targetModalSelector) {
              const staticModal = document.querySelector(targetModalSelector);
              if (staticModal) {
                // Update shariah model badge
                if (prod.shariah_model) {
                  const shariahBadge = staticModal.querySelector('.badge.bg-lemon');
                  if (shariahBadge) shariahBadge.textContent = `Shariah Model: ${prod.shariah_model}`;
                  const contractP = staticModal.querySelectorAll('.col-4 span');
                  if (contractP && contractP[1]) contractP[1].textContent = prod.shariah_model;
                }
                // Update modal overview / full description
                if (prod.full_description) {
                  const overviewP = staticModal.querySelector('.col-md-7 p.text-muted');
                  if (overviewP) overviewP.textContent = prod.full_description;
                }
                // Update modal features list
                if (Array.isArray(prod.features) && prod.features.length > 0) {
                  const scopeList = staticModal.querySelector('.col-md-7 ul');
                  if (scopeList) {
                    scopeList.innerHTML = prod.features.map(f => `<li><i class="bi bi-check-circle-fill text-lemon me-2"></i>${f}</li>`).join('');
                  }
                }
              }
            }
          }
        }
      }
    });

    // Append newly created products
    if (gridContainer) {
      products.forEach(prod => {
        if (!matchedProdIds.has(prod.id)) {
          const safeSlug = prod.slug || prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const modalId = `modal-dyn-prod-${safeSlug}`;

          // If card already exists in DOM, update its contents
          const existingDynCard = document.querySelector(`[data-dyn-prod-id="${prod.id}"]`);
          if (existingDynCard) {
            const titleEl = existingDynCard.querySelector('.product-card-title');
            if (titleEl && prod.title) titleEl.textContent = prod.title;

            const descEl = existingDynCard.querySelector('.product-card-desc');
            if (descEl && prod.short_description) descEl.textContent = prod.short_description;

            if (prod.brochure_url) {
              const banner = existingDynCard.querySelector('.product-card-banner');
              if (banner) {
                banner.innerHTML = `<img src="${resolveImageUrl(prod.brochure_url)}" alt="${prod.title}" class="img-contain" onerror="this.style.display='none'">`;
              }
            }

            if (Array.isArray(prod.features) && prod.features.length > 0) {
              const featBox = existingDynCard.querySelector('.product-features-box ul');
              if (featBox) {
                featBox.innerHTML = prod.features.map(f => `<li><i class="bi bi-shield-check"></i><span>${f}</span></li>`).join('');
              }
            }
            return;
          }

          const col = document.createElement('div');
          col.className = 'col-lg-4 col-md-6 mb-4 dyn-product-col product-item-col';
          col.setAttribute('data-dyn-prod-id', prod.id);
          col.setAttribute('data-category', prod.category || 'general');

          // Card banner: image if available, icon placeholder if not
          const iconClass = prod.icon_class || 'bi-shield-check';
          const cardBanner = prod.brochure_url
            ? `<img src="${resolveImageUrl(prod.brochure_url)}" alt="${prod.title}" class="img-contain"
                    onerror="this.style.display='none';this.parentElement.insertAdjacentHTML('beforeend','<i class=\\'bi ${iconClass} text-navy\\' style=\\'font-size:4rem;opacity:0.25;\\'></i>')">`
            : `<i class="bi ${iconClass} text-navy" style="font-size: 4rem; opacity: 0.25;"></i>`;

          col.innerHTML = `
            <div class="product-card-modern">
              <div class="product-card-banner">
                ${cardBanner}
              </div>
              <div class="product-card-content">
                <h3 class="product-card-title">${prod.title}</h3>
                <p class="product-card-desc">${prod.short_description}</p>
                ${Array.isArray(prod.features) && prod.features.length > 0 ? `
                  <div class="product-features-box">
                    <small class="fw-bold text-navy d-block mb-2">Key Coverage & Benefits:</small>
                    <ul>
                      ${prod.features.map(f => `<li><i class="bi bi-shield-check"></i><span>${f}</span></li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div class="product-card-actions">
                  <button class="btn btn-outline-lemon rounded-pill px-3 py-1 btn-sm fw-semibold" data-bs-toggle="modal" data-bs-target="#${modalId}">
                    Learn More
                  </button>
                  <a href="https://wa.me/2349076824451?text=Hello%20Hilal%20Takaful%2C%20I%20would%20like%20to%20get%20a%20quote%20for%20${encodeURIComponent(prod.title)}" target="_blank" rel="noopener noreferrer" class="btn btn-lemon rounded-pill px-3 py-1 btn-sm fw-semibold d-inline-flex align-items-center gap-1">
                    <i class="bi bi-whatsapp"></i>Get Quote
                  </a>
                </div>
              </div>
            </div>
          `;
          gridContainer.appendChild(col);

          if (!document.getElementById(modalId)) {
            const modalDiv = document.createElement('div');
            modalDiv.className = 'modal fade';
            modalDiv.id = modalId;
            modalDiv.tabIndex = -1;
            modalDiv.setAttribute('aria-hidden', 'true');

            // Map category to readable badge label
            const catLabel = prod.category === 'family' ? 'Family Takaful'
                           : prod.category === 'general' ? 'General Takaful'
                           : (prod.category || 'Takaful');

            // Shariah model — use stored value, fall back to Al-Tabarru
            const shariahModel = prod.shariah_model || (prod.category === 'family' ? 'Al-Tabarru / Takaful' : 'Al-Tabarru');

            // Features list — use check-circle style matching static modals
            const featuresList = Array.isArray(prod.features) && prod.features.length > 0
              ? `<h5 class="fw-bold text-navy mb-2">Scope of Protection</h5>
                 <ul class="list-unstyled d-flex flex-column gap-2 text-muted small mb-0">
                   ${prod.features.map(f => `<li><i class="bi bi-check-circle-fill text-lemon me-2"></i>${f}</li>`).join('')}
                 </ul>`
              : '';

            // Full description paragraphs
            const fullDescHtml = prod.full_description
              ? prod.full_description.split(/\n\n+/).filter(p => p.trim()).map(p => `<p class="text-muted lh-lg mb-3">${p}</p>`).join('')
              : `<p class="text-muted lh-lg mb-3">${prod.short_description}</p>`;

            // Product image — icon placeholder if no image uploaded
            const iconClass = prod.icon_class || 'bi-shield-check';
            const modalImageContent = prod.brochure_url
              ? `<img src="${resolveImageUrl(prod.brochure_url)}" alt="${prod.title}" class="img-fluid"
                      style="max-height: 180px; object-fit: contain;"
                      onerror="this.style.display='none';this.parentElement.insertAdjacentHTML('beforeend','<i class=\\'bi ${iconClass} text-navy\\' style=\\'font-size:5rem;opacity:0.2;\\'></i>')">`
              : `<i class="bi ${iconClass} text-navy" style="font-size: 5rem; opacity: 0.2;"></i>`;

            modalDiv.innerHTML = `
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                  <div class="modal-team-header-bar d-flex justify-content-between align-items-center">
                    <div>
                      <span class="badge bg-white text-navy px-3 py-1 rounded-pill small mb-1">${catLabel}</span>
                      <h4 class="text-white fw-bold mb-0">${prod.title}</h4>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>

                  <div class="modal-body p-4 p-md-5">
                    <div class="row g-4 mb-4">
                      <div class="col-md-5 text-center">
                        <div class="p-3 bg-light-soft rounded-4 border mb-3">
                          ${modalImageContent}
                        </div>
                        <span class="badge bg-lemon text-white px-3 py-2 rounded-pill fw-semibold w-100 mb-2">
                          Shariah Model: ${shariahModel}
                        </span>
                        <small class="text-muted d-block">Eligible for Annual Surplus Dividend Pool</small>
                      </div>

                      <div class="col-md-7">
                        <h5 class="fw-bold text-navy mb-2">Plan Overview</h5>
                        ${fullDescHtml}
                        ${featuresList}
                      </div>
                    </div>

                    <div class="p-3 bg-light-soft rounded-3 border mb-4">
                      <div class="row text-center g-2">
                        <div class="col-4">
                          <small class="text-muted d-block">Regulatory Code</small>
                          <span class="fw-bold text-navy small">NAICOM Approved</span>
                        </div>
                        <div class="col-4 border-start border-end">
                          <small class="text-muted d-block">Contract Principle</small>
                          <span class="fw-bold text-navy small">${shariahModel}</span>
                        </div>
                        <div class="col-4">
                          <small class="text-muted d-block">Claims Turnaround</small>
                          <span class="fw-bold text-lemon small">Fast-Track Settlement</span>
                        </div>
                      </div>
                    </div>

                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 border-top">
                      <button type="button" class="btn btn-outline-secondary rounded-pill px-4 btn-sm" data-bs-dismiss="modal">Close</button>
                      <div class="d-flex flex-wrap gap-2">
                        <a href="contactus.html" class="btn btn-outline-navy rounded-pill px-3 btn-sm fw-semibold d-inline-flex align-items-center gap-1">
                          <i class="bi bi-envelope"></i>Contact Us
                        </a>
                        <a href="https://wa.me/2349076824451?text=Hello%20Hilal%20Takaful%2C%20I%20would%20like%20to%20get%20a%20quote%20for%20${encodeURIComponent(prod.title)}"
                           target="_blank" rel="noopener noreferrer"
                           class="btn btn-lemon rounded-pill px-4 btn-sm fw-bold d-inline-flex align-items-center gap-2">
                          <i class="bi bi-whatsapp"></i>Get Quote via WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(modalDiv);
          }
        }
      });
    }
  }

  async function hydrateProducts() {
    const isGeneral = window.location.pathname.includes('general-takaful');
    const isFamily = window.location.pathname.includes('family-takaful');
    if (!isGeneral && !isFamily) return;

    const category = isGeneral ? 'general' : 'family';
    const cacheKey = `products_${category}`;

    const cached = Cache.get(cacheKey);
    if (cached) applyProducts(cached);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/content/products?category=${category}`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          Cache.set(cacheKey, json.data);
          applyProducts(json.data);
        }
      }
    } catch (e) {}
  }

  // Helper for blog category badge classes
  function getBlogCategoryBadgeClass(category) {
    const cat = (category || '').toLowerCase().trim();
    if (cat.includes('top 5') || cat.includes('top5') || cat.includes('warning') || cat.includes('alert')) {
      return 'badge bg-warning bg-opacity-25 text-dark';
    }
    if (cat.includes('myth') || cat.includes('success')) {
      return 'badge bg-success bg-opacity-10 text-success';
    }
    if (cat.includes('family') || cat.includes('life')) {
      return 'badge bg-primary bg-opacity-10 text-primary';
    }
    if (cat.includes('general') || cat.includes('motor') || cat.includes('marine')) {
      return 'badge bg-info bg-opacity-10 text-dark';
    }
    // Default matching Financial / Insights / Shariah
    return 'badge bg-primary bg-opacity-10 text-primary';
  }

  // ---------------------------------------------------------------------------
  // 4. BLOG POSTS FULL RENDER & SYNC
  // ---------------------------------------------------------------------------
  function applyBlogPosts(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return;

    const grid = document.querySelector('.row.g-4') || document.getElementById('blogGrid');
    if (!grid) return;

    const existingCards = Array.from(document.querySelectorAll('.blog-card-ht'));
    const matchedIds = new Set();

    posts.forEach(post => {
      const titles = existingCards.map(c => c.querySelector('.blog-title-ht')).filter(Boolean);
      const matched = titles.find(t => t.textContent.trim().toLowerCase().includes(post.title.toLowerCase()));

      if (matched) {
        matchedIds.add(post.id);
        const card = matched.closest('.blog-card-ht');
        if (card) {
          const excerptEl = card.querySelector('.blog-excerpt-ht');
          if (excerptEl && post.excerpt) excerptEl.textContent = post.excerpt;

          const badgeEl = card.querySelector('.blog-meta-ht .badge');
          if (badgeEl && post.category) {
            badgeEl.className = getBlogCategoryBadgeClass(post.category);
            badgeEl.textContent = post.category;
          }

          if (post.featured_image) {
            const img = card.querySelector('.blog-img-ht img');
            if (img) {
              img.src = resolveImageUrl(post.featured_image);
              bindImageErrorHandler(img);
            }
          }
        }
      }
    });

    // Append newly published articles
    posts.forEach(post => {
      if (!matchedIds.has(post.id)) {
        const safeSlug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const modalId = `modal-dyn-blog-${safeSlug}`;

        if (document.querySelector(`[data-dyn-blog-id="${post.id}"]`)) {
          return;
        }

        const badgeClass = getBlogCategoryBadgeClass(post.category);
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 dyn-blog-col';
        col.setAttribute('data-dyn-blog-id', post.id);
        col.innerHTML = `
          <article class="blog-card-ht">
            <div class="blog-img-ht">
              <img src="${resolveImageUrl(post.featured_image)}" alt="${post.title}" onerror="this.src='assets/images/blog-stability.jpg'">
              <span class="read-time-chip"><i class="bi bi-clock"></i> 4 min</span>
            </div>
            <div class="blog-body-ht">
              <div class="blog-meta-ht">
                <span><i class="bi bi-calendar3 me-1"></i>${new Date(post.published_at || Date.now()).toLocaleDateString()}</span>
                <span class="${badgeClass}">${post.category || 'Insights'}</span>
              </div>
              <h3 class="blog-title-ht">${post.title}</h3>
              <p class="blog-excerpt-ht">${post.excerpt}</p>
              <div class="blog-footer-ht">
                <span class="small text-muted fw-semibold">${post.author_name || 'Hilal Team'}</span>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                        data-bs-toggle="modal" data-bs-target="#${modalId}">Read</button>
              </div>
            </div>
          </article>
        `;
        grid.prepend(col); // Place new article at top

        if (!document.getElementById(modalId)) {
          const modalDiv = document.createElement('div');
          modalDiv.className = 'modal fade blog-modal';
          modalDiv.id = modalId;
          modalDiv.tabIndex = -1;
          modalDiv.setAttribute('aria-hidden', 'true');
          modalDiv.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <div>
                    <span class="badge mb-2" style="background:#A8B400;color:#211a52;font-size:0.75rem;">${post.category || 'Takaful'}</span>
                    <h4 class="modal-title text-white fw-bold">${post.title}</h4>
                  </div>
                  <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  ${post.featured_image && !(post.content_html || '').includes(post.featured_image) ? `
                    <div class="mb-4 rounded-3 overflow-hidden" style="max-height: 380px;">
                      <img src="${resolveImageUrl(post.featured_image)}" alt="${post.title}" class="w-100 h-100" style="object-fit: cover;" onerror="this.style.display='none'">
                    </div>
                  ` : ''}
                  ${post.content_html || `<p>${post.excerpt}</p>`}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modalDiv);
        }
      }
    });
  }

  async function hydrateBlogPosts() {
    if (!window.location.pathname.includes('blog')) return;

    const cached = Cache.get('blog');
    if (cached) applyBlogPosts(cached);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/content/blog`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          Cache.set('blog', json.data);
          applyBlogPosts(json.data);
        }
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 5. GALLERY HYDRATION
  // ---------------------------------------------------------------------------
  function applyGallery(events) {
    if (!Array.isArray(events) || events.length === 0) return;

    const items = document.querySelectorAll('.gal-item');
    events.forEach((evt, idx) => {
      if (items[idx] && evt.cover_image_url) {
        const img = items[idx].querySelector('img');
        if (img) {
          img.src = resolveImageUrl(evt.cover_image_url);
          bindImageErrorHandler(img);
        }
        const title = items[idx].querySelector('.gal-title');
        if (title && evt.title) title.textContent = evt.title;
      }
    });
  }

  async function hydrateGallery() {
    if (!window.location.pathname.includes('gallery')) return;

    const cached = Cache.get('gallery');
    if (cached) applyGallery(cached);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/content/gallery`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          Cache.set('gallery', json.data);
          applyGallery(json.data);
        }
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 6. FINANCIAL REPORTS HYDRATION (investors-relation.html)
  // ---------------------------------------------------------------------------
  function applyFinancialReports(reports) {
    if (!Array.isArray(reports) || reports.length === 0) return;

    const reportCard = document.querySelector('.card.border-0.shadow-sm.rounded-4');
    if (!reportCard) return;

    const latest = reports[0];
    if (latest) {
      const titleEl = reportCard.querySelector('h2.h3');
      if (titleEl && latest.title) titleEl.textContent = latest.title;

      const yearEl = reportCard.querySelector('.text-white-50');
      if (yearEl && latest.year) yearEl.innerHTML = `<i class="bi bi-calendar3 me-1"></i> Year Ended: 31st December ${latest.year}`;

      const linkEl = reportCard.querySelector('a[href*="http"]');
      if (linkEl && latest.file_url) linkEl.href = latest.file_url;
    }
  }

  async function hydrateFinancialReports() {
    if (!window.location.pathname.includes('investors-relation')) return;

    const cached = Cache.get('reports');
    if (cached) applyFinancialReports(cached);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/content/reports`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          Cache.set('reports', json.data);
          applyFinancialReports(json.data);
        }
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 7. LEADS & INQUIRIES INTERCEPTOR
  // ---------------------------------------------------------------------------
  function bindLeadForms() {
    const forms = document.querySelectorAll('form[action*="contact"], form.quote-form, #contactForm');
    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

        const formData = new FormData(form);
        const payload = {
          full_name: formData.get('full_name') || formData.get('name') || '',
          email: formData.get('email') || '',
          phone: formData.get('phone') || '',
          subject: formData.get('subject') || 'Website Inquiry',
          service_type: formData.get('service_type') || formData.get('category') || 'General',
          message: formData.get('message') || formData.get('comments') || ''
        };

        if (!payload.full_name || !payload.email || !payload.message) {
          alert('Please fill in your name, email, and message.');
          return;
        }

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
          }

          const res = await fetch(`${API_BASE}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Failed to submit form');

          form.reset();
          alert(result.message || 'Thank you! Your message has been received by Hilal Takaful.');
        } catch (err) {
          console.error('Submission error:', err);
          alert('Notice: Submission received. Our team will follow up with you.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      });
    });
  }

  function init() {
    hydrateSiteSettings();
    hydrateTeamMembers();
    hydrateProducts();
    hydrateBlogPosts();
    hydrateGallery();
    hydrateFinancialReports();
    bindLeadForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
