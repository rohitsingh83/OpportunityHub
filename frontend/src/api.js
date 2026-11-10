// Tiny API helper with automatic admin key injection and fallback domains.
// All requests go to relative /api URLs; Vite dev server proxies them to Express.

export function getAdminKey() {
  try {
    return localStorage.getItem('adminKey') || '';
  } catch {
    return '';
  }
}

export function setAdminKey(key) {
  try {
    if (key) {
      localStorage.setItem('adminKey', key.trim());
    } else {
      localStorage.removeItem('adminKey');
    }
  } catch {}
}

// Saved / Bookmarked opportunities helpers (persisted in localStorage)
export function getSavedOpportunities() {
  try {
    const raw = localStorage.getItem('savedOpportunities');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveOpportunity(id) {
  try {
    const current = getSavedOpportunities();
    const strId = String(id);
    let next;
    if (current.includes(strId)) {
      next = current.filter((item) => item !== strId);
    } else {
      next = [...current, strId];
    }
    localStorage.setItem('savedOpportunities', JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export function isOpportunitySaved(id) {
  const current = getSavedOpportunities();
  return current.includes(String(id));
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const adminKey = getAdminKey();
  if (adminKey && !headers['x-admin-key']) {
    headers['x-admin-key'] = adminKey;
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return body;
}

// Deterministic company avatar colors
export function getCompanyColor(companyName = '') {
  const colors = [
    'linear-gradient(135deg, #4f46e5, #06b6d4)',
    'linear-gradient(135deg, #0ea5e9, #3b82f6)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #ef4444, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #0284c7)',
  ];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Fallback domains offered in the filter dropdown even before the API responds
export const FALLBACK_DOMAINS = [
  'Software Development',
  'Data Science',
  'Design',
  'Marketing',
  'Finance',
  'Human Resources',
  'Cybersecurity',
  'Product Management',
];
