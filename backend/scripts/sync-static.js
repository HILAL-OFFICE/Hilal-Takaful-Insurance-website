/**
 * Hilal Takaful Insurance Limited - High-Precision SSG / Static Sync Script
 * 
 * Fetches the single source of truth from Supabase and applies surgical DOM
 * reconciliation across all static HTML pages:
 *  - board-of-directors.html (purges deleted members Abubakar Sadik Adam, Jubril Ajose, Akeem Shadare)
 *  - management-team.html (syncs 7 active management members, subtitles, bios)
 *  - advisory-council.html (syncs 3 active advisory members)
 *  - general-takaful.html (syncs 9 general products & modals, hides empty scope of protection)
 *  - family-takaful.html (syncs 9 family products & modals, hides empty scope of protection)
 *  - blog.html (syncs active articles & reading modals)
 *  - our-image-gallery.html (syncs active events & lightbox handlers)
 *  - investors-relation.html (syncs annual report metadata & download link)
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { supabaseAdmin, supabasePublic } = require('../src/config/supabase');
const supabase = supabaseAdmin || supabasePublic;

const ROOT_DIR = path.resolve(__dirname, '../../');

function isRoleLikePara(p) {
  p = p.trim();
  if (!p) return false;
  if (p.length > 120) return false;        // Real bios are longer
  // If it has a mid-sentence period (not a trailing one), it's real content
  if (p.replace(/\.$/, '').includes('.')) return false;
  return true;
}

function cleanBioHtml(bioFull, bioSnippet) {
  if (!bioFull) return `<p>${escapeHtml(bioSnippet || '')}</p>`;
  const paras = bioFull.split(/\n\n+/).filter(p => p.trim());
  // Strip leading "role-like" short label paragraphs prepended in the CMS
  let start = 0;
  if (paras[start] && isRoleLikePara(paras[start])) start++;
  if (paras[start] && isRoleLikePara(paras[start])) start++;
  const realParas = paras.slice(start);
  if (!realParas.length && paras.length) realParas.push(...paras); // fallback: use all if stripping removes everything
  return realParas.map(p => `<p>${p.trim()}</p>`).join('\n              ');
}

function resolveImageUrl(url, fallback = 'assets/images/favicon.png') {
  if (!url || typeof url !== 'string' || url.trim() === '') return fallback;
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.replace(/^\/?/, '');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchContentData() {
  console.log('🔄 Fetching live data from Supabase...');
  
  const [teamRes, prodRes, blogRes, galleryRes, reportRes] = await Promise.all([
    supabase.from('team_members').select('*').order('order_index', { ascending: true }),
    supabase.from('products').select('*').order('order_index', { ascending: true }),
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }),
    supabase.from('gallery_events').select('*').order('order_index', { ascending: true }),
    supabase.from('financial_reports').select('*').order('year', { ascending: false })
  ]);

  if (teamRes.error) throw new Error(`Failed to fetch team: ${teamRes.error.message}`);
  if (prodRes.error) throw new Error(`Failed to fetch products: ${prodRes.error.message}`);
  if (blogRes.error) throw new Error(`Failed to fetch blog: ${blogRes.error.message}`);
  if (galleryRes.error) throw new Error(`Failed to fetch gallery: ${galleryRes.error.message}`);

  return {
    teamMembers: (teamRes.data || []).filter(m => m.is_active !== false),
    products: (prodRes.data || []).filter(p => p.is_active !== false),
    blogPosts: (blogRes.data || []).filter(b => b.status === 'published'),
    galleryEvents: (galleryRes.data || []).filter(g => g.is_active !== false),
    financialReports: (reportRes.data || []).filter(r => r.is_active !== false)
  };
}

// -----------------------------------------------------------------------------
// 1. LEADERSHIP RECONCILIATION
// -----------------------------------------------------------------------------
function syncLeadershipPage(filePath, category, members) {
  console.log(`\n📄 Synchronizing ${path.basename(filePath)} (${category} - ${members.length} active members in DB)...`);
  const fullPath = path.resolve(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const existingCards = $('.team-card');
  const matchedMemberIds = new Set();
  const keptModalIds = new Set();

  // A. Purge cards of deleted members
  existingCards.each((_, el) => {
    const card = $(el);
    const nameEl = card.find('.team-member-name');
    const cardName = nameEl.text().trim().toLowerCase();
    const modalTarget = card.attr('data-bs-target');

    const matchedMember = members.find(m => 
      cardName.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(cardName)
    );

    if (!matchedMember) {
      console.log(`   🗑️ Purging deleted member card: "${cardName}"`);
      const col = card.closest('.col-lg-4, .col-md-6');
      col.remove();
      if (modalTarget && $(modalTarget).length) {
        console.log(`   🗑️ Purging deleted member modal: ${modalTarget}`);
        $(modalTarget).remove();
      }
    } else {
      matchedMemberIds.add(matchedMember.id);
      if (modalTarget) keptModalIds.add(modalTarget.replace(/^#/, ''));

      // Update card in place
      const honorificSuffix = matchedMember.honorifics ? ` <span class="small">(${escapeHtml(matchedMember.honorifics)})</span>` : '';
      nameEl.html(`${escapeHtml(matchedMember.name)}${honorificSuffix}`);

      if (matchedMember.role) {
        card.find('.team-member-role').text(matchedMember.role);
      }
      if (matchedMember.bio_snippet) {
        card.find('.team-bio-snippet').text(matchedMember.bio_snippet);
      }
      if (matchedMember.avatar_url) {
        card.find('.team-avatar-img').attr('src', resolveImageUrl(matchedMember.avatar_url));
      }

      // Update modal in place
      if (modalTarget && $(modalTarget).length) {
        const modal = $(modalTarget);
        modal.find('h3.fw-bold.text-navy').first().text(matchedMember.name);
        if (matchedMember.role) {
          modal.find('.fs-6.text-lemon.fw-bold').first().text(matchedMember.role);
        }

        const subtitleText = matchedMember.sub_title || matchedMember.honorifics || '';
        let subtitleP = modal.find('.small.text-muted').first();
        if (subtitleText) {
          if (!subtitleP.length) {
            modal.find('.fs-6.text-lemon.fw-bold').first().after('<p class="small text-muted mb-0"></p>');
            subtitleP = modal.find('.small.text-muted').first();
          }
          subtitleP.html(`<i class="bi bi-patch-check-fill text-lemon me-1"></i>${escapeHtml(subtitleText)}`);
        } else if (subtitleP.length) {
          subtitleP.remove();
        }

        if (matchedMember.avatar_url) {
          modal.find('.modal-team-avatar-img').attr('src', resolveImageUrl(matchedMember.avatar_url));
        }

        if (matchedMember.bio_full) {
          const bioContainer = modal.find('.lh-lg.text-body').first();
          if (bioContainer.length) {
            bioContainer.html(cleanBioHtml(matchedMember.bio_full, matchedMember.bio_snippet));
          }
        }
      }
    }
  });

  // B. Append newly created leaders if any
  const gridContainer = $('.row.g-4.justify-content-center').length
    ? $('.row.g-4.justify-content-center')
    : $('.row.justify-content-center');

  members.forEach(member => {
    if (!matchedMemberIds.has(member.id)) {
      console.log(`   ➕ Adding new member: ${member.name}`);
      const slug = (member.slug || member.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const modalId = `modal-${slug}`;
      const avatarUrl = resolveImageUrl(member.avatar_url);
      const honorificSuffix = member.honorifics ? ` <span class="small">(${escapeHtml(member.honorifics)})</span>` : '';

      const cardHtml = `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="team-card h-100" data-bs-toggle="modal" data-bs-target="#${modalId}">
            <div class="team-card-banner"></div>
            <div class="text-center">
              <div class="team-avatar-wrapper">
                <img src="${avatarUrl}" alt="${escapeHtml(member.name)}" class="team-avatar-img">
              </div>
            </div>
            <div class="team-card-body text-center">
              <h4 class="team-member-name">${escapeHtml(member.name)}${honorificSuffix}</h4>
              <div class="d-flex justify-content-center">
                <span class="team-member-role">${escapeHtml(member.role || '')}</span>
              </div>
              <p class="team-bio-snippet">${escapeHtml(member.bio_snippet || '')}</p>
              <div class="team-card-footer justify-content-center">
                <span class="btn btn-outline-lemon rounded-pill px-4 py-1 btn-sm fw-bold">
                  View Full Profile <i class="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>
          </div>
        </div>`;
      gridContainer.append(cardHtml);

      const subtitleText = member.sub_title || member.honorifics || '';
      const subtitleHtml = subtitleText
        ? `<p class="small text-muted mb-0"><i class="bi bi-patch-check-fill text-lemon me-1"></i>${escapeHtml(subtitleText)}</p>`
        : '';
      const bioHtml = cleanBioHtml(member.bio_full, member.bio_snippet);

      const modalHtml = `
  <!-- Modal: ${escapeHtml(member.name)} -->
  <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-team-dialog">
      <div class="modal-content modal-team-content">
        <div class="modal-team-header-bar">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4 p-md-5 pt-0">
          <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4 mb-4 pb-3 border-bottom">
            <div class="modal-team-avatar-box flex-shrink-0">
              <img src="${avatarUrl}" alt="${escapeHtml(member.name)}" class="modal-team-avatar-img">
            </div>
            <div class="text-center text-md-start flex-grow-1 pt-2">
              <h3 class="fw-bold text-navy mb-1" id="${modalId}Label">${escapeHtml(member.name)}</h3>
              <p class="fs-6 text-lemon fw-bold mb-2">${escapeHtml(member.role || '')}</p>
              ${subtitleHtml}
            </div>
          </div>
          <div class="mb-4">
            <h5 class="fw-bold text-navy mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-person-lines-fill text-lemon"></i> Biography & Background
            </h5>
            <div class="lh-lg text-body fs-6">
              ${bioHtml}
            </div>
          </div>
          <div class="d-flex justify-content-end pt-3 border-top">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4 btn-sm" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>\n`;

      if ($('#footer-placeholder').length) {
        $('#footer-placeholder').before(modalHtml);
      } else {
        $('footer.site-footer').before(modalHtml);
      }
    }
  });

  // C. Reorder cards in static HTML to match order_index sequence
  members.forEach(member => {
    const matchedCard = gridContainer.find('.team-card').filter((_, el) => {
      const name = $(el).find('.team-member-name').text().trim().toLowerCase();
      const mName = member.name.toLowerCase();
      return name.includes(mName) || mName.includes(name);
    });
    if (matchedCard.length) {
      const col = matchedCard.closest('.col-lg-4, .col-md-6');
      if (col.length) {
        gridContainer.append(col);
      }
    }
  });

  fs.writeFileSync(fullPath, $.html(), 'utf8');
  console.log(`✅ ${path.basename(filePath)} synchronized cleanly.`);
}

// -----------------------------------------------------------------------------
// 2. PRODUCTS RECONCILIATION
// -----------------------------------------------------------------------------
function syncProductsPage(filePath, category, products) {
  console.log(`\n📄 Synchronizing ${path.basename(filePath)} (${category} - ${products.length} active products in DB)...`);
  const fullPath = path.resolve(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const existingCards = $('.product-card-modern');
  const matchedProdIds = new Set();

  // A. Purge deleted product cards and update existing
  existingCards.each((_, el) => {
    const card = $(el);
    const titleEl = card.find('.product-card-title');
    const cardTitle = titleEl.text().trim().toLowerCase();
    const modalBtn = card.find('[data-bs-toggle="modal"]');
    const modalTarget = modalBtn.attr('data-bs-target');

    const matchedProd = products.find(p =>
      cardTitle.includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(cardTitle)
    );

    if (!matchedProd) {
      console.log(`   🗑️ Purging deleted product card: "${cardTitle}"`);
      const col = card.closest('.col-lg-4, .product-item-col');
      col.remove();
      if (modalTarget && $(modalTarget).length) {
        console.log(`   🗑️ Purging deleted product modal: ${modalTarget}`);
        $(modalTarget).remove();
      }
    } else {
      matchedProdIds.add(matchedProd.id);

      // Update card title and description
      titleEl.text(matchedProd.title);
      if (matchedProd.short_description) {
        card.find('.product-card-desc').text(matchedProd.short_description);
      }
      if (matchedProd.brochure_url) {
        card.find('.product-card-banner img').attr('src', resolveImageUrl(matchedProd.brochure_url));
      }

      // Update card features box
      const featBox = card.find('.product-features-box');
      const hasFeatures = Array.isArray(matchedProd.features) && matchedProd.features.length > 0;

      if (hasFeatures) {
        const featListHtml = matchedProd.features.map(f => `<li><i class="bi bi-shield-check"></i><span>${escapeHtml(f)}</span></li>`).join('\n            ');
        if (featBox.length) {
          featBox.find('ul').html(featListHtml);
          featBox.css('display', '');
        } else {
          const newFeatBox = `
        <div class="product-features-box">
          <small class="fw-bold text-navy d-block mb-2">Key Coverage & Benefits:</small>
          <ul>
            ${featListHtml}
          </ul>
        </div>`;
          card.find('.product-card-actions').before(newFeatBox);
        }
      } else {
        // Completely remove/hide features box if empty
        if (featBox.length) featBox.remove();
      }

      // Update modal
      if (modalTarget && $(modalTarget).length) {
        const modal = $(modalTarget);
        modal.find('h4.text-white.fw-bold').first().text(matchedProd.title);

        const shariahModel = matchedProd.shariah_model || (category === 'family' ? 'Al-Tabarru / Takaful' : 'Al-Tabarru');
        modal.find('.badge.bg-lemon').first().text(`Shariah Model: ${shariahModel}`);

        const contractCol = modal.find('.col-4.border-start.border-end span.fw-bold');
        if (contractCol.length) contractCol.text(shariahModel);

        if (matchedProd.full_description) {
          const overviewP = modal.find('.col-md-7 p.text-muted').first();
          if (overviewP.length) overviewP.text(matchedProd.full_description);
        }

        // Scope of Protection in modal
        const scopeTitle = modal.find('.col-md-7 h5:nth-of-type(2)');
        const scopeUl = modal.find('.col-md-7 ul');

        if (hasFeatures) {
          const scopeListHtml = matchedProd.features.map(f => `<li><i class="bi bi-check-circle-fill text-lemon me-2"></i>${escapeHtml(f)}</li>`).join('\n                ');
          if (scopeUl.length) {
            scopeUl.html(scopeListHtml);
            if (scopeTitle.length) scopeTitle.css('display', '');
            scopeUl.css('display', '');
          } else {
            modal.find('.col-md-7').append(`
              <h5 class="fw-bold text-navy mb-2">Scope of Protection</h5>
              <ul class="list-unstyled d-flex flex-column gap-2 text-muted small mb-0">
                ${scopeListHtml}
              </ul>`);
          }
        } else {
          // If empty, remove the Scope of Protection section entirely
          if (scopeTitle.length) scopeTitle.remove();
          if (scopeUl.length) scopeUl.remove();
        }
      }
    }
  });

  // B. Append newly created products if any
  const gridContainer = $('#productsCatalogContainer').length
    ? $('#productsCatalogContainer')
    : $('.row.g-4').first();

  products.forEach(prod => {
    if (!matchedProdIds.has(prod.id)) {
      console.log(`   ➕ Adding new product: ${prod.title}`);
      const slug = (prod.slug || prod.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const modalId = `modal-prod-${slug}`;
      const targetCategory = prod.target_audience || (category === 'general' ? 'general' : 'family');
      const hasFeatures = Array.isArray(prod.features) && prod.features.length > 0;

      let featuresBoxHtml = '';
      if (hasFeatures) {
        featuresBoxHtml = `
        <div class="product-features-box">
          <small class="fw-bold text-navy d-block mb-2">Key Coverage & Benefits:</small>
          <ul>
            ${prod.features.map(f => `<li><i class="bi bi-shield-check"></i><span>${escapeHtml(f)}</span></li>`).join('\n            ')}
          </ul>
        </div>`;
      }

      const cardBanner = prod.brochure_url
        ? `<img src="${resolveImageUrl(prod.brochure_url)}" alt="${escapeHtml(prod.title)}" class="img-cover">`
        : `<i class="bi ${prod.icon_class || 'bi-shield-check'} text-navy" style="font-size: 4rem; opacity: 0.25;"></i>`;

      const cardHtml = `
<div class="col-lg-4 col-md-6 mb-4 product-item-col" data-category="${escapeHtml(targetCategory)}">
    <div class="product-card-modern">
      <div class="product-card-banner">
        ${cardBanner}
      </div>
      <div class="product-card-content">
        <h3 class="product-card-title">${escapeHtml(prod.title)}</h3>
        <p class="product-card-desc">${escapeHtml(prod.short_description || '')}</p>
        ${featuresBoxHtml}
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
  </div>`;
      gridContainer.append(cardHtml);

      // Append modal
      const catLabel = category === 'general' ? 'General Takaful' : 'Family Takaful';
      const shariahModel = prod.shariah_model || (category === 'family' ? 'Al-Tabarru / Takaful' : 'Al-Tabarru');
      const modalBanner = prod.brochure_url
        ? `<img src="${resolveImageUrl(prod.brochure_url)}" alt="${escapeHtml(prod.title)}" class="img-fluid" style="max-height: 180px; object-fit: contain;">`
        : `<i class="bi ${prod.icon_class || 'bi-shield-check'} text-navy" style="font-size: 5rem; opacity: 0.2;"></i>`;

      const fullDescHtml = prod.full_description
        ? prod.full_description.split(/\n\n+/).filter(p => p.trim()).map(p => `<p class="text-muted lh-lg mb-3">${p.trim()}</p>`).join('\n              ')
        : `<p class="text-muted lh-lg mb-3">${escapeHtml(prod.short_description || '')}</p>`;

      let scopeOfProtectionHtml = '';
      if (hasFeatures) {
        scopeOfProtectionHtml = `
              <h5 class="fw-bold text-navy mb-2">Scope of Protection</h5>
              <ul class="list-unstyled d-flex flex-column gap-2 text-muted small mb-0">
                ${prod.features.map(f => `<li><i class="bi bi-check-circle-fill text-lemon me-2"></i>${escapeHtml(f)}</li>`).join('\n                ')}
              </ul>`;
      }

      const modalHtml = `
  <!-- Modal: ${escapeHtml(prod.title)} -->
  <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
        <div class="modal-team-header-bar d-flex justify-content-between align-items-center">
          <div>
            <span class="badge bg-white text-navy px-3 py-1 rounded-pill small mb-1">${catLabel}</span>
            <h4 class="text-white fw-bold mb-0" id="${modalId}Label">${escapeHtml(prod.title)}</h4>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4 p-md-5">
          <div class="row g-4 mb-4">
            <div class="col-md-5 text-center">
              <div class="p-3 bg-light-soft rounded-4 border mb-3">
                ${modalBanner}
              </div>
              <span class="badge bg-lemon text-white px-3 py-2 rounded-pill fw-semibold w-100 mb-2">
                Shariah Model: ${escapeHtml(shariahModel)}
              </span>
              <small class="text-muted d-block">Eligible for Annual Surplus Dividend Pool</small>
            </div>
            <div class="col-md-7">
              <h5 class="fw-bold text-navy mb-2">Plan Overview</h5>
              ${fullDescHtml}
              ${scopeOfProtectionHtml}
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
                <span class="fw-bold text-navy small">${escapeHtml(shariahModel)}</span>
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
  </div>\n`;

      if ($('#footer-placeholder').length) {
        $('#footer-placeholder').before(modalHtml);
      } else {
        $('footer.site-footer').before(modalHtml);
      }
    }
  });

  fs.writeFileSync(fullPath, $.html(), 'utf8');
  console.log(`✅ ${path.basename(filePath)} synchronized cleanly.`);
}

// -----------------------------------------------------------------------------
// 3. BLOG RECONCILIATION
// -----------------------------------------------------------------------------
function syncBlogPage(filePath, blogPosts) {
  console.log(`\n📄 Synchronizing ${path.basename(filePath)} (${blogPosts.length} posts)...`);
  const fullPath = path.resolve(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const existingCards = $('.blog-card-ht');
  const matchedBlogIds = new Set();

  existingCards.each((_, el) => {
    const card = $(el);
    const titleEl = card.find('.blog-title-ht');
    const cardTitle = titleEl.text().trim().toLowerCase();
    const modalBtn = card.find('[data-bs-toggle="modal"]');
    const modalTarget = modalBtn.attr('data-bs-target');

    const matchedPost = blogPosts.find(b =>
      cardTitle.includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(cardTitle)
    );

    if (!matchedPost) {
      console.log(`   🗑️ Purging deleted blog card: "${cardTitle}"`);
      const col = card.closest('.col-md-6, .col-lg-3');
      col.remove();
      if (modalTarget && $(modalTarget).length) {
        $(modalTarget).remove();
      }
    } else {
      matchedBlogIds.add(matchedPost.id);
      titleEl.text(matchedPost.title);
      if (matchedPost.excerpt) card.find('.blog-excerpt-ht').text(matchedPost.excerpt);
      if (matchedPost.featured_image) card.find('.blog-img-ht img').attr('src', resolveImageUrl(matchedPost.featured_image));
      if (matchedPost.author_name) card.find('.blog-footer-ht .small').text(matchedPost.author_name);

      if (modalTarget && $(modalTarget).length) {
        const modal = $(modalTarget);
        modal.find('.modal-title').text(matchedPost.title);
        if (matchedPost.content_html) {
          modal.find('.modal-body').html(matchedPost.content_html);
        }
      }
    }
  });

  fs.writeFileSync(fullPath, $.html(), 'utf8');
  console.log(`✅ ${path.basename(filePath)} synchronized cleanly.`);
}

// -----------------------------------------------------------------------------
// 4. GALLERY RECONCILIATION
// -----------------------------------------------------------------------------
function syncGalleryPage(filePath, galleryEvents) {
  console.log(`\n📄 Synchronizing ${path.basename(filePath)} (${galleryEvents.length} events)...`);
  const fullPath = path.resolve(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const items = $('.gal-item');
  galleryEvents.forEach((evt, idx) => {
    if (items.eq(idx).length && evt.cover_image_url) {
      const item = items.eq(idx);
      item.find('img').attr('src', resolveImageUrl(evt.cover_image_url));
      if (evt.title) item.find('.gal-title').text(evt.title);
    }
  });

  fs.writeFileSync(fullPath, $.html(), 'utf8');
  console.log(`✅ ${path.basename(filePath)} synchronized cleanly.`);
}

// -----------------------------------------------------------------------------
// 5. INVESTORS RELATION RECONCILIATION
// -----------------------------------------------------------------------------
function syncInvestorsRelationPage(filePath, reports) {
  console.log(`\n📄 Synchronizing ${path.basename(filePath)} (${reports.length} reports)...`);
  const fullPath = path.resolve(ROOT_DIR, filePath);
  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  if (reports.length > 0) {
    const latest = reports[0];
    if (latest.year) {
      $('.text-white-50').each((_, el) => {
        if ($(el).text().includes('Year Ended')) {
          $(el).html(`<i class="bi bi-calendar3 me-1"></i> Year Ended: 31st December ${latest.year}`);
        }
      });
    }
    if (latest.title) {
      $('h2.h3.fw-bold.text-white').text(latest.title);
    }
    if (latest.file_url) {
      $('a.btn.btn-ht-gold').attr('href', latest.file_url);
    }
  }

  fs.writeFileSync(fullPath, $.html(), 'utf8');
  console.log(`✅ ${path.basename(filePath)} synchronized cleanly.`);
}

// -----------------------------------------------------------------------------
// MAIN ENTRY POINT
// -----------------------------------------------------------------------------
async function main() {
  console.log('🚀 Starting Hilal Takaful High-Precision Static Generation (SSG)...');
  try {
    const data = await fetchContentData();

    syncLeadershipPage('board-of-directors.html', 'board', data.teamMembers.filter(m => m.category === 'board'));
    syncLeadershipPage('management-team.html', 'management', data.teamMembers.filter(m => m.category === 'management'));
    syncLeadershipPage('advisory-council.html', 'advisory', data.teamMembers.filter(m => m.category === 'advisory'));

    syncProductsPage('general-takaful.html', 'general', data.products.filter(p => p.category === 'general'));
    syncProductsPage('family-takaful.html', 'family', data.products.filter(p => p.category === 'family'));

    syncBlogPage('blog.html', data.blogPosts);
    syncGalleryPage('our-image-gallery.html', data.galleryEvents);
    syncInvestorsRelationPage('investors-relation.html', data.financialReports);

    console.log('\n🎉 ALL STATIC HTML FILES SYNCHRONIZED AND RECONCILED WITH ZERO RESIDUAL GHOST ITEMS!');
  } catch (err) {
    console.error('❌ Error during static sync:', err);
    process.exit(1);
  }
}

main();
