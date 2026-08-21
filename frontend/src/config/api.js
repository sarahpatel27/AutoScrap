// Base URL helper for API calls
// Uses VITE_API_BASE_URL environment variable if provided, otherwise falls back to relative '/api'
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}
