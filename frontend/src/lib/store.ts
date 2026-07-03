import { create } from 'zustand';
import API from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'member';
  photo: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  profile: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<boolean>;
  signup: (formData: FormData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (formData: FormData) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post('/auth/login', credentials);
      const { token, user } = res.data;

      localStorage.setItem('gym_auth_token', token);
      localStorage.setItem('gym_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });

      // Fetch full profile info
      await get().checkAuth();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  signup: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { token, user } = res.data;

      localStorage.setItem('gym_auth_token', token);
      localStorage.setItem('gym_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });

      await get().checkAuth();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Sign up failed. Please check details.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('gym_auth_token');
    localStorage.removeItem('gym_user');
    set({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('gym_auth_token');
    const storedUser = localStorage.getItem('gym_user');

    if (!token || !storedUser) {
      set({ loading: false, isAuthenticated: false, user: null, profile: null });
      return;
    }

    try {
      const res = await API.get('/auth/me');
      set({
        user: res.data.user,
        profile: res.data.profile,
        token,
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      get().logout();
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await API.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { user, profile } = res.data;
      
      localStorage.setItem('gym_user', JSON.stringify(user));
      set({
        user,
        profile,
        loading: false
      });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Profile update failed.';
      set({ error: errMsg, loading: false });
      return false;
    }
  }
}));
