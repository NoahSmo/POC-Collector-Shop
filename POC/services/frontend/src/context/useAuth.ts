import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string | null, role: 'user' | 'admin' | null, name: string | null };
  login: (token: string, id: string, role: 'user' | 'admin', name: string) => void;
  logout: () => void;
}

// Simple Zustand store for POC authentication state management
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('auth_token'),
  user: { 
    id: localStorage.getItem('user_id') || null,
    role: (localStorage.getItem('user_role') as 'user' | 'admin') || null,
    name: localStorage.getItem('user_name') || null
  },
  login: (token, id, role, name) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', id);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', name);
    set({ isAuthenticated: true, user: { id, role, name } });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    set({ isAuthenticated: false, user: { id: null, role: null, name: null } });
  },
}));
