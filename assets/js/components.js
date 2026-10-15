/**
 * Hilal Takaful Nigeria Limited - Shared Header, Footer & Cookie Consent
 * Compliant with Nigeria Data Protection Act (NDPA 2023) & NAICOM Guidelines.
 */

(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  function getNavbarHtml(activePage) {
    const isHome = activePage === 'index.html' || activePage === '';
    const isProducts = activePage.includes('takaful');
    const isGallery = activePage.includes('gallery') || activePage.includes('event');
    const isAbout = activePage.includes('company-profile') || activePage.includes('board') || 
                    activePage.includes('advisory') || activePage.includes('management') || 
                    activePage.includes('investors');
    const isBlog = activePage.includes('blog');
    const isContact = activePage.includes('contact');

    return `
    <!-- Top Contact & Information Bar -->
    <div class="top-contact-bar d-none d-md-block">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-4">
            <span><i class="bi bi-geo-alt me-1 text-lemon"></i> CBD NECA House, Alausa, Ikeja, Lagos</span>
            <a href="tel:+2349076824451"><i class="bi bi-telephone me-1 text-lemon"></i> +234 907 682 4451</a>
            <a href="mailto:enquiries@hilaltakaful.com.ng"><i class="bi bi-envelope me-1 text-lemon"></i> enquiries@hilaltakaful.com.ng</a>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="small text-muted">Follow us:</span>
            <a href="https://www.facebook.com/HilalTakafulNg" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="https://x.com/hilaltakafulng?s=20" target="_blank" rel="noopener" aria-label="X (Twitter)"><i class="bi bi-twitter-x"></i></a>
            <a href="https://www.instagram.com/hilaltakafulng?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="https://www.linkedin.com/company/hilal-takaful-nigeria" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="navbar navbar-expand-lg main-navbar">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="index.html">
          <img src="assets/images/logo.png" alt="Hilal Takaful Nigeria Limited">
        </a>
        
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li class="nav-item">
              <a class="nav-link ${isHome ? 'active' : ''}" href="index.html">Home</a>
            </li>
            
            <!-- Products Dropdown -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle ${isProducts ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Products
              </a>
              <ul class="dropdown-menu shadow-sm">
                <li><a class="dropdown-item ${activePage === 'general-takaful.html' ? 'active' : ''}" href="general-takaful.html">General Takaful</a></li>
                <li><a class="dropdown-item ${activePage === 'family-takaful.html' ? 'active' : ''}" href="family-takaful.html">Family Takaful</a></li>
              </ul>
            </li>

            <!-- About Us Dropdown with Financial Reports -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle ${isAbout ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                About Us
              </a>
              <ul class="dropdown-menu shadow-sm">
                <li><a class="dropdown-item ${activePage === 'company-profile.html' ? 'active' : ''}" href="company-profile.html">Company Profile</a></li>
                <li><a class="dropdown-item ${activePage === 'board-of-directors.html' ? 'active' : ''}" href="board-of-directors.html">Board of Directors</a></li>
                <li><a class="dropdown-item ${activePage === 'advisory-council.html' ? 'active' : ''}" href="advisory-council.html">Advisory Council</a></li>
                <li><a class="dropdown-item ${activePage === 'management-team.html' ? 'active' : ''}" href="management-team.html">Management Team</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item ${activePage === 'investors-relation.html' ? 'active' : ''}" href="investors-relation.html"><i class="bi bi-file-earmark-bar-graph me-1 text-lemon"></i> Financial Reports</a></li>
              </ul>
            </li>

            <li class="nav-item">
              <a class="nav-link ${isBlog ? 'active' : ''}" href="blog.html">Blog</a>
            </li>

            <!-- Event Gallery -->
            <li class="nav-item">
              <a class="nav-link ${isGallery ? 'active' : ''}" href="our-image-gallery.html">Event Gallery</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${isContact ? 'active' : ''}" href="contactus.html">Contact Us</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    `;
  }

  function getFooterHtml() {
    return `
    <footer class="site-footer">
      <div class="container">
        <!-- Upper Footer Row -->
        <div class="row g-4 justify-content-between pb-4">
          <!-- Col 1: Address -->
          <div class="col-lg-4 col-md-6">
            <h5 class="footer-col-title">Hilal Takaful Nigeria Limited</h5>
            <p class="footer-text mb-0">
              Plot A2, Hakeem Balogun Street,<br>
              Alausa, Ikeja,<br>
              CBD NECA House<br>
              100212 - Lagos.<br>
              Nigeria.
            </p>
          </div>

          <!-- Col 2: Call Us -->
          <div class="col-lg-3 col-md-6">
            <h5 class="footer-col-title">Call us</h5>
            <p class="mb-0">
              <a href="tel:+2349076824451" class="footer-contact-link fw-semibold">
                + 234 907 682 4451
              </a>
            </p>
          </div>

          <!-- Col 3: Send us a message -->
          <div class="col-lg-3 col-md-6">
            <h5 class="footer-col-title">Send us a message</h5>
            <p class="mb-0">
              <a href="mailto:enquiries@hilaltakaful.com.ng" class="footer-contact-link">
                enquiries@hilaltakaful.com.ng
              </a>
            </p>
          </div>

          <!-- Col 4: Follow us -->
          <div class="col-lg-2 col-md-6">
            <h5 class="footer-col-title">Follow us</h5>
            <div class="d-flex gap-2">
              <a href="https://www.facebook.com/HilalTakafulNg" target="_blank" rel="noopener" class="footer-social-link" aria-label="Facebook">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="https://x.com/hilaltakafulng?s=20" target="_blank" rel="noopener" class="footer-social-link" aria-label="X (Twitter)">
                <i class="bi bi-twitter-x"></i>
              </a>
              <a href="https://www.instagram.com/hilaltakafulng?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener" class="footer-social-link" aria-label="Instagram">
                <i class="bi bi-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/company/hilal-takaful-nigeria" target="_blank" rel="noopener" class="footer-social-link" aria-label="LinkedIn">
                <i class="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Middle Footer: Certifications & Quick Links -->
        <div class="footer-middle-wrap py-3 border-top border-light border-opacity-10">
          <div class="row align-items-center g-3">
            <div class="col-lg-6 col-12">
              <div class="footer-cert-list d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 gap-md-4">
                <a href="privacy-policy.html" title="NDP Act 2023 Statutory Audit Compliance Verified" class="d-inline-block">
                  <img src="assets/images/audit-trustmark.jpg" alt="NDP Act 2023 Audit Statutory Filing - Nigeria Data Protection Commission" class="footer-ndpr-seal">
                </a>
                <img src="assets/images/naicom-logo.png" alt="National Insurance Commission NAICOM" class="footer-reg-logo">
                <img src="assets/images/nia-logo.png" alt="Nigeria Insurers Association NIA" class="footer-reg-logo">
              </div>
            </div>
            <div class="col-lg-6 col-12">
              <div class="footer-quick-links d-flex flex-wrap align-items-center justify-content-center justify-content-lg-end gap-2 gap-sm-3 small fw-semibold">
                <a href="index.html" class="footer-nav-link">Home</a>
                <span class="footer-link-dot">•</span>
                <a href="company-profile.html" class="footer-nav-link">About us</a>
                <span class="footer-link-dot">•</span>
                <a href="general-takaful.html" class="footer-nav-link">Products</a>
                <span class="footer-link-dot">•</span>
                <a href="contactus.html" class="footer-nav-link">Contact us</a>
                <span class="footer-link-dot">•</span>
                <a href="privacy-policy.html" class="footer-nav-link">Privacy &amp; NDPR</a>
                <span class="footer-link-dot">•</span>
                <a href="javascript:void(0)" class="footer-nav-link" id="btnManageCookies">Cookie Settings</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Lemon Olive Bar -->
      <div class="footer-bottom-bar">
        <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center text-center text-sm-start gap-2">
          <div>&copy; <span class="current-year">${new Date().getFullYear()}</span> Hilal Takaful Nigeria Limited. All Rights Reserved.</div>
          <div>Licensed &amp; Regulated by NAICOM</div>
        </div>
      </div>
    </footer>
    `;
  }

  function getFloatingWhatsAppHtml() {
    return `
    <a href="https://wa.me/2349076824451?text=Hello%20Hilal%20Takaful,%20I%20would%20like%20to%20make%20an%20enquiry%20or%20request%20a%20quote." 
       class="floating-whatsapp-btn" 
       target="_blank" 
       rel="noopener noreferrer" 
       aria-label="Chat with us on WhatsApp"
       id="globalFloatingWhatsApp">
      <span class="whatsapp-tooltip">Chat with us on WhatsApp</span>
      <i class="bi bi-whatsapp"></i>
    </a>
    `;
  }

  function injectFloatingWhatsApp() {
    if (!document.getElementById('globalFloatingWhatsApp') && document.body) {
      const container = document.createElement('div');
      container.innerHTML = getFloatingWhatsAppHtml();
      document.body.appendChild(container.firstElementChild);
    }
  }

  const CONSENT_KEY = 'hilal_cookie_consent_v1';

  function createCookieBanner() {
    if (document.getElementById('hilalCookieBanner')) return document.getElementById('hilalCookieBanner');

    const banner = document.createElement('div');
    banner.id = 'hilalCookieBanner';
    banner.className = 'hilal-cookie-banner';
    banner.innerHTML = `
      <div class="container">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div class="cookie-content d-flex align-items-start gap-3">
            <div class="cookie-icon-box text-lemon">
              <i class="bi bi-shield-check fs-2"></i>
            </div>
            <div>
              <h6 class="cookie-title mb-1 text-white fw-bold">Data Privacy &amp; Cookie Notice</h6>
              <p class="cookie-desc mb-0 small text-white-50">
                Hilal Takaful uses cookies in accordance with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong> and NAICOM regulations to secure your browsing, support portal access, and enhance your digital experience. Learn more in our <a href="privacy-policy.html" class="text-lemon text-decoration-underline">Privacy Policy &amp; NDPR Notice</a>.
              </p>
            </div>
          </div>
          <div class="cookie-actions d-flex flex-wrap align-items-center gap-2 flex-shrink-0">
            <button type="button" class="btn btn-outline-light btn-sm rounded-pill px-3 py-1" id="btnRejectCookies">
              Essential Only
            </button>
            <button type="button" class="btn btn-lemon btn-sm rounded-pill px-4 py-1 fw-semibold text-navy" id="btnAcceptCookies">
              Accept All
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    const closeBanner = (choice) => {
      try {
        localStorage.setItem(CONSENT_KEY, choice);
      } catch (e) {}
      banner.classList.remove('show');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 420);
    };

    document.getElementById('btnAcceptCookies')?.addEventListener('click', () => closeBanner('all'));
    document.getElementById('btnRejectCookies')?.addEventListener('click', () => closeBanner('essential'));

    return banner;
  }

  function showCookieBanner(force = false) {
    if (!force) {
      try {
        if (localStorage.getItem(CONSENT_KEY)) return;
      } catch (e) {}
    }

    const banner = createCookieBanner();
    if (banner) {
      banner.style.display = 'block';
      setTimeout(() => {
        banner.classList.add('show');
      }, 50);
    }
  }

  function initCookieConsent() {
    showCookieBanner(false);
  }

  // Global triggers
  window.showCookieBanner = function() { showCookieBanner(true); };
  window.resetCookieConsent = function() {
    try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
    showCookieBanner(true);
  };

  document.addEventListener('click', function(e) {
    const trigger = e.target.closest('#btnManageCookies, .open-cookie-banner, [data-open-cookies]');
    if (trigger) {
      e.preventDefault();
      showCookieBanner(true);
    }
  });

  
  function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('.current-year').forEach(function(el) {
      el.textContent = currentYear;
    });
    document.querySelectorAll('footer, .footer-bottom-bar, .site-footer').forEach(function(container) {
      if (container.innerHTML && container.innerHTML.includes('Hilal Takaful Nigeria Limited')) {
        container.innerHTML = container.innerHTML.replace(/(&copy;|©)\s*\d{4}(\s+Hilal Takaful Nigeria Limited)/g, `$1 <span class="current-year">${currentYear}</span>$2`);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateCurrentYear();
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) {
      navPlaceholder.innerHTML = getNavbarHtml(currentPath);
    }
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder && !document.querySelector('footer.site-footer')) {
      footerPlaceholder.innerHTML = getFooterHtml();
    }
    injectFloatingWhatsApp();
    initCookieConsent();
  });

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    updateCurrentYear();
    injectFloatingWhatsApp();
    initCookieConsent();
  }

  window.HilalComponents = {
    getNavbarHtml,
    getFooterHtml,
    getFloatingWhatsAppHtml,
    injectFloatingWhatsApp,
    initCookieConsent
  };
})();
