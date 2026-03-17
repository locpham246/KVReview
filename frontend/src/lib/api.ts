// API Base URL — sử dụng env var hoặc fallback localhost
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api';

// ─── Token helpers ───────────────────────────────────────────────────────────
export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

export const setAuth = (token: string, refresh: string, role: string, userId: string) => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('role', role);
  localStorage.setItem('user_id', userId);
};

export const clearAuth = () => {
  ['access_token', 'refresh_token', 'role', 'user_id'].forEach(k => localStorage.removeItem(k));
};

export const getRole = () =>
  typeof window !== 'undefined' ? localStorage.getItem('role') : null;

export const getUserId = () =>
  typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

// ─── Fetch wrapper ────────────────────────────────────────────────────────────
interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { auth = false, headers = {}, ...rest } = opts;

  const resolvedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) resolvedHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: resolvedHeaders,
    ...rest,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { const err = await res.json(); message = err.message ?? message; } catch {}
    throw new Error(message);
  }

  // Handle 201 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) =>
    apiFetch<{ accessToken: string; refreshToken: string; role: string; userId: string; expiresAt: string }>(
      '/auth/register', { method: 'POST', body: JSON.stringify(data) }
    ),
  login: (data: object) =>
    apiFetch<{ accessToken: string; refreshToken: string; role: string; userId: string; expiresAt: string }>(
      '/auth/login', { method: 'POST', body: JSON.stringify(data) }
    ),
};

// ─── KOL API ─────────────────────────────────────────────────────────────────
export const kolApi = {
  search: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
    return apiFetch<KolProfile[]>(`/kols?${q.toString()}`, { auth: true });
  },
  getById: (id: string) => apiFetch<KolProfile>(`/kols/${id}`),
  getRanking: () => apiFetch<KolRankingItem[]>('/kols/ranking'),
  updateProfile: (data: object) =>
    apiFetch<KolProfile>('/kols/profile', { method: 'PUT', body: JSON.stringify(data), auth: true }),
};

// ─── Restaurant API ───────────────────────────────────────────────────────────
export const restaurantApi = {
  getMe: () => apiFetch<RestaurantProfile>('/restaurants/me', { auth: true }),
  updateMe: (data: object) =>
    apiFetch<RestaurantProfile>('/restaurants/me', { method: 'PUT', body: JSON.stringify(data), auth: true }),
};

// ─── Booking API ──────────────────────────────────────────────────────────────
export const bookingApi = {
  create: (data: object) =>
    apiFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data), auth: true }),
  getList: () => apiFetch<Booking[]>('/bookings', { auth: true }),
  getById: (id: string) => apiFetch<Booking>(`/bookings/${id}`, { auth: true }),
  updateStatus: (id: string, status: string) =>
    apiFetch<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }), auth: true,
    }),
};

// ─── Review API ───────────────────────────────────────────────────────────────
export const reviewApi = {
  create: (data: object) =>
    apiFetch<Review>('/reviews', { method: 'POST', body: JSON.stringify(data), auth: true }),
  getByKol: (kolId: string) => apiFetch<Review[]>(`/reviews/kol/${kolId}`),
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface KolProfile {
  userId: string;
  displayName: string;
  bio?: string;
  platforms: string[];
  basePrice: number;
  tier?: string;
  avgEngagementRate?: number;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  metrics: KolMetric[];
}

export interface KolMetric {
  platform: string;
  followersCount: number;
  engagementRate: number;
  reach30D?: number;
}

export interface KolRankingItem {
  userId: string;
  displayName: string;
  basePrice: number;
  tier?: string;
  avgEngagementRate?: number;
  totalFollowers: number;
  rank: number;
}

export interface RestaurantProfile {
  userId: string;
  name: string;
  address: string;
  cuisineType?: string;
  avgRating?: number;
  latitude?: number;
  longitude?: number;
}

export interface Booking {
  id: string;
  restaurantId: string;
  restaurantName: string;
  kolId: string;
  kolDisplayName: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  priceOffered: number;
  scheduledDate: string;
  createdAt: string;
  review?: { rating: number; comment?: string };
}

export interface Review {
  id: string;
  bookingId: string;
  restaurantName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
