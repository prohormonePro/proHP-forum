import { create } from 'zustand';

const API = import.meta.env.VITE_API_URL || '';

const TIER_LEVELS = { lab_rat: 0, premium: 1, elite: 2, admin: 3 };

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('prohp_at') || null,
  refreshToken: localStorage.getItem('prohp_rt') || null,
  loading: true,
  hasLeadAccess: false,

  isLoggedIn: () => !!get().user,
  hasTier: (tier) => (TIER_LEVELS[get().user?.tier] ?? -1) >= (TIER_LEVELS[tier] ?? 0),
  isAdmin: () => get().user?.tier === 'admin',

  _setTokens(access, refresh) {
    localStorage.setItem('prohp_at', access);
    localStorage.setItem('prohp_rt', refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  _clear() {
    localStorage.removeItem('prohp_at');
    localStorage.removeItem('prohp_rt');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      hasLeadAccess: false,
    });
  },

  async register(email, username, password) {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    get()._setTokens(data.access_token, data.refresh_token);
    set({ user: data.user, loading: false });
    return data.user;
  },

  async login(email, password) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    get()._setTokens(data.access_token, data.refresh_token);
    set({ user: data.user, loading: false });
    return data.user;
  },

  async refresh() {
    const rt = get().refreshToken;
    if (!rt) {
      get()._clear();
      return;
    }
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) {
        get()._clear();
        return;
      }
      const data = await res.json();
      get()._setTokens(data.access_token, data.refresh_token);
      set({ user: data.user, loading: false });
    } catch {
      get()._clear();
    }
  },

  async fetchMe() {
    const token = get().accessToken;
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        await get().refresh();
        return;
      }
      if (!res.ok) {
        get()._clear();
        return;
      }
      const data = await res.json();
      set({ user: data.user, loading: false });
    } catch {
      get()._clear();
    }
  },

  async logout() {
    const token = get().accessToken;
    if (token) {
      fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    get()._clear();
  },

  setHasLeadAccess: (val) => set({ hasLeadAccess: val }),

  checkLeadAccess: async () => {
    try {
      const res = await fetch(`${API}/api/leads/check`, { credentials: 'include' });
      const data = await res.json();
      if (data.hasLeadAccess) {
        set({ hasLeadAccess: true });
      }
    } catch (error) {
      console.error('Failed to check lead access:', error);
    }
  },
}));

export default useAuthStore;
export { TIER_LEVELS };
