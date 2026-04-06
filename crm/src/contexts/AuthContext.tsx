import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from './RoleContext';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface DemoAccount {
  user: AuthUser;
  password: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    user: {
      id: 'user-admin',
      name: 'Alex Carter',
      email: 'admin@demo.com',
      role: 'admin',
      initials: 'AC',
    },
    password: 'admin123',
    description: 'Full access — delete records, export data, view reports',
  },
  {
    user: {
      id: 'user-manager',
      name: 'Sarah Johnson',
      email: 'manager@demo.com',
      role: 'sales_manager',
      initials: 'SJ',
    },
    password: 'manager123',
    description: 'Export data and access analytics reports',
  },
  {
    user: {
      id: 'user-rep',
      name: 'Mike Chen',
      email: 'rep@demo.com',
      role: 'sales_rep',
      initials: 'MC',
    },
    password: 'rep123',
    description: 'Standard sales access — manage contacts, deals and activities',
  },
];

interface AuthState {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'crm-auth' }
  )
);

export function useAuth() {
  return useAuthStore((s) => s.user);
}

export function useAuthActions() {
  return useAuthStore((s) => ({ login: s.login, logout: s.logout }));
}
