/**
 * Backend API base URL (no trailing slash).
 * In production (Vercel), set VITE_API_URL to your Render backend, e.g. https://treck-sathi.onrender.com
 * Leave unset in dev so Vite proxy is used.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/** API path prefix for routes (e.g. /api). */
export const API_BASE = '/api';

/**
 * Full URL for backend-hosted assets (e.g. /uploads/...).
 * Use this for cover images, profile photos from backend, etc.
 */
export function getBackendAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : `${typeof window !== 'undefined' ? window.location.origin : ''}${p}`;
}
