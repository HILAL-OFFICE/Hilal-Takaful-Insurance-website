/**
 * Hilal Takaful CMS - Supabase Client & API Helper
 * With Client-Side Canvas Image Compression
 */

// Global configuration - fallback to local environment if not customized
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

window.CMS_CONFIG = {
  SUPABASE_URL: 'https://zgtjizjulvkhicjsydtg.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_e4UzLdAlRuTwmIltDfc91Q_dMkKqIzH',
  API_BASE_URL: isLocalhost ? 'http://localhost:5000/api' : 'https://hilal-takaful-insurance-website.onrender.com/api'
};

// Initialize Supabase client
window._sb = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(window.CMS_CONFIG.SUPABASE_URL, window.CMS_CONFIG.SUPABASE_ANON_KEY)
  : (typeof createClient === 'function' ? createClient(window.CMS_CONFIG.SUPABASE_URL, window.CMS_CONFIG.SUPABASE_ANON_KEY) : null);

console.log('Supabase Initialized successfully:', !!window._sb);

/**
 * Make an authenticated API request to the backend
 */
async function apiRequest(endpoint, options = {}) {
  const session = await getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${window.CMS_CONFIG.API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Client-side Image Compressor
 * Automatically resizes large camera/phone photos to optimal dimensions and converts to JPEG/WebP
 */
async function compressImage(file, maxDimension = 1200, quality = 0.85) {
  // If not an image (or svg), return original
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved downscaling
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to raw file if blob creation fails
              return;
            }
            // Retain original name, append extension if needed
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            console.log(`Image compressed: ${(file.size / 1024).toFixed(1)} KB -> ${(compressedFile.size / 1024).toFixed(1)} KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Upload a file to Supabase Storage via backend upload route
 * Compresses images automatically before sending over the wire
 */
async function uploadFile(file, bucket = 'team-avatars') {
  const session = await getSession();
  const token = session?.access_token;

  // Decide maximum resolution based on bucket category
  const maxDim = bucket === 'team-avatars' ? 800 : 1400;
  const processedFile = await compressImage(file, maxDim, 0.86);

  const formData = new FormData();
  formData.append('file', processedFile);
  formData.append('bucket', bucket);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${window.CMS_CONFIG.API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload file');
  }

  return data.url;
}

/**
 * Get current authenticated session from Supabase
 */
async function getSession() {
  if (!window._sb) return null;
  const { data: { session } } = await window._sb.auth.getSession();
  return session;
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toastEl || !toastMsg) return;

  toastMsg.textContent = message;
  toastEl.className = `toast align-items-center text-white border-0 ${type === 'error' ? 'bg-danger' : 'bg-dark'}`;

  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
  bsToast.show();
}
