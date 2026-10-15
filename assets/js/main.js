/**
 * HILAL TAKAFUL NIGERIA LIMITED - MAIN APPLICATION JAVASCRIPT
 * Handles Quote Calculator, Claims Reporting Wizard, Product Filters,
 * Modals, Toast Notifications, and Smooth UI Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initQuoteCalculator();
  initClaimsWizard();
  initProductSearchAndFilter();
  initFormsAndModals();
});

/* ==========================================================================
   1. NAVBAR SCROLL EFFECT
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.main-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. INTERACTIVE TAKAFUL QUOTE CALCULATOR
   ========================================================================== */
function initQuoteCalculator() {
  // Motor Quote Elements
  const motorTypeSelect = document.getElementById('motorCoverType');
  const vehicleValueInput = document.getElementById('vehicleValue');
  const motorContributionDisplay = document.getElementById('motorEstimatedContribution');
  const motorSurplusDisplay = document.getElementById('motorEstimatedSurplus');

  // Esusu Quote Elements
  const esusuFrequencySelect = document.getElementById('esusuFrequency');
  const esusuAmountInput = document.getElementById('esusuAmount');
  const esusuTenorSelect = document.getElementById('esusuTenor');
  const esusuTotalSavingsDisplay = document.getElementById('esusuTotalSavings');
  const esusuEstimatedProfitDisplay = document.getElementById('esusuEstimatedProfit');

  // Calculation for Motor
  function calculateMotor() {
    if (!motorTypeSelect || !vehicleValueInput) return;
    const coverType = motorTypeSelect.value;
    const value = parseFloat(vehicleValueInput.value) || 0;

    let contribution = 0;
    let surplusEligible = 0;

    if (coverType === 'third_party') {
      contribution = 15000; // Standard NAICOM rate
      surplusEligible = 1500;
    } else if (coverType === 'third_party_fire_theft') {
      contribution = Math.max(25000, value * 0.025);
      surplusEligible = contribution * 0.12;
    } else {
      // Comprehensive Motor (approx 3.5% with Shariah discount)
      contribution = Math.max(35000, value * 0.035);
      surplusEligible = contribution * 0.15; // Estimated 15% surplus pool return
    }

    if (motorContributionDisplay) {
      motorContributionDisplay.innerText = formatNaira(contribution);
    }
    if (motorSurplusDisplay) {
      motorSurplusDisplay.innerText = formatNaira(surplusEligible);
    }
  }

  // Calculation for Esusu
  function calculateEsusu() {
    if (!esusuFrequencySelect || !esusuAmountInput || !esusuTenorSelect) return;
    const freq = esusuFrequencySelect.value;
    const amount = parseFloat(esusuAmountInput.value) || 0;
    const years = parseInt(esusuTenorSelect.value) || 2;

    let annualMultiplier = 12;
    if (freq === 'daily') annualMultiplier = 365;
    else if (freq === 'weekly') annualMultiplier = 52;
    else if (freq === 'monthly') annualMultiplier = 12;
    else if (freq === 'quarterly') annualMultiplier = 4;
    else if (freq === 'annually') annualMultiplier = 1;

    const totalContribution = amount * annualMultiplier * years;
    // 99% goes to Participant Investment Fund (Mudarabah), 1% Tabarru (Donation pool)
    const investmentPortion = totalContribution * 0.99;
    // Estimated annual halal return benchmark of 9.5% compounded
    const estimatedProfit = investmentPortion * (Math.pow(1 + 0.095, years) - 1);

    if (esusuTotalSavingsDisplay) {
      esusuTotalSavingsDisplay.innerText = formatNaira(investmentPortion);
    }
    if (esusuEstimatedProfitDisplay) {
      esusuEstimatedProfitDisplay.innerText = formatNaira(estimatedProfit);
    }
  }

  // Event Listeners
  if (motorTypeSelect) motorTypeSelect.addEventListener('change', calculateMotor);
  if (vehicleValueInput) vehicleValueInput.addEventListener('input', calculateMotor);

  if (esusuFrequencySelect) esusuFrequencySelect.addEventListener('change', calculateEsusu);
  if (esusuAmountInput) esusuAmountInput.addEventListener('input', calculateEsusu);
  if (esusuTenorSelect) esusuTenorSelect.addEventListener('change', calculateEsusu);

  // Initial calculation runs
  calculateMotor();
  calculateEsusu();
}

function formatNaira(amount) {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/* ==========================================================================
   3. CLAIMS REPORTING WIZARD & TRACKER
   ========================================================================== */
function initClaimsWizard() {
  const claimForm = document.getElementById('claimReportForm');
  if (!claimForm) return;

  claimForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const policyNo = document.getElementById('claimPolicyNumber')?.value || 'HT-2026-9812';
    const claimRef = 'CLM-' + Math.floor(100000 + Math.random() * 900000);

    const resultAlert = document.getElementById('claimSubmitResult');
    if (resultAlert) {
      resultAlert.innerHTML = `
        <div class="alert alert-success d-flex align-items-center" role="alert">
          <i class="bi bi-check-circle-fill fs-3 me-3 text-success"></i>
          <div>
            <h6 class="mb-1 font-weight-bold">Claim Successfully Filed!</h6>
            <p class="mb-0 small">Tracking Reference: <strong>${claimRef}</strong> for Policy <strong>${policyNo}</strong>. Our Claims officer will contact you within 24 hours.</p>
          </div>
        </div>
      `;
      resultAlert.classList.remove('d-none');
    }

    claimForm.reset();
  });
}

/* ==========================================================================
   4. PRODUCT SEARCH & CATEGORY FILTER
   ========================================================================== */
function initProductSearchAndFilter() {
  const searchInput = document.getElementById('productSearchInput');
  const filterButtons = document.querySelectorAll('.product-filter-btn');
  const productCards = document.querySelectorAll('.product-item-col');

  if (!productCards.length) return;

  function applyFilter() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeCategory = document.querySelector('.product-filter-btn.active')?.dataset.category || 'all';

    productCards.forEach(col => {
      const cardTitle = col.querySelector('.product-card-title')?.innerText.toLowerCase() || '';
      const cardDesc = col.querySelector('.product-card-desc')?.innerText.toLowerCase() || '';
      const category = col.dataset.category || '';

      const matchesSearch = !searchTerm || cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);
      const matchesCategory = (activeCategory === 'all') || (category === activeCategory);

      if (matchesSearch && matchesCategory) {
        col.style.display = '';
        col.classList.remove('d-none');
      } else {
        col.style.display = 'none';
        col.classList.add('d-none');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active', 'btn-ht-primary'));
      btn.classList.add('active', 'btn-ht-primary');
      applyFilter();
    });
  });
}

/* ==========================================================================
   5. FORMS, MODALS & TOAST FEEDBACK
   ========================================================================== */
function initFormsAndModals() {
  // Contact Us Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your inquiry has been received. Our team will contact you shortly.', 'success');
      contactForm.reset();
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Successfully subscribed to Hilal Takaful Insights!', 'success');
      newsletterForm.reset();
    });
  }

  // Portal Login Form
  const loginForm = document.getElementById('portalLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Authenticating with Hilal Takaful Portal...', 'info');
      setTimeout(() => {
        showToast('Demo Mode: In a production environment, you would now be redirected to the Participant Dashboard.', 'success');
      }, 1200);
    });
  }
}

// Utility Toast Function
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('htToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'htToastContainer';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  const bgClass = type === 'success' ? 'bg-success text-white' : type === 'error' ? 'bg-danger text-white' : 'bg-primary text-white';
  const toastId = 'toast_' + Date.now();

  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body font-weight-medium">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastElement = document.getElementById(toastId);
  if (window.bootstrap && window.bootstrap.Toast) {
    const bsToast = new window.bootstrap.Toast(toastElement, { delay: 4500 });
    bsToast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
  } else {
    setTimeout(() => toastElement.remove(), 4000);
  }
}
