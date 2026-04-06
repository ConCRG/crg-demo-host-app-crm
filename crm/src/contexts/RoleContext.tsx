import { create } from 'zustand';

export type UserRole = 'sales_rep' | 'sales_manager' | 'admin';

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: 'admin',
  setRole: (role) => set({ role }),
}));

export function useRole() {
  return useRoleStore((s) => s.role);
}

export function useSetRole() {
  return useRoleStore((s) => s.setRole);
}

export function useCanDelete() {
  const role = useRole();
  return role === 'admin';
}

export function useCanExport() {
  const role = useRole();
  return role === 'admin' || role === 'sales_manager';
}

export function useCanViewReports() {
  const role = useRole();
  return role === 'admin' || role === 'sales_manager';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  sales_rep: 'Sales Rep',
  sales_manager: 'Sales Manager',
  admin: 'Admin',
};
