// Base URL helper for API calls
// Uses VITE_API_BASE_URL environment variable if provided, otherwise falls back to relative '/api'
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return BASE_URL ? `${BASE_URL}${cleanPath}` : cleanPath;
}
