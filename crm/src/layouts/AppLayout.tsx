import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  Activity,
  Settings,
  BarChart3,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRole, useSetRole, useCanViewReports, ROLE_LABELS, type UserRole } from '@/contexts/RoleContext';
import { useAuthStore } from '@/contexts/AuthContext';
import { useThemeStore } from '@/contexts/ThemeContext';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
  { name: 'Contacts', href: '/contacts', icon: Users, end: false },
  { name: 'Companies', href: '/companies', icon: Building2, end: false },
  { name: 'Deals', href: '/deals', icon: Handshake, end: false },
  { name: 'Activities', href: '/activities', icon: Activity, end: false },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings, end: false },
];

const roleBadgeClass: Record<UserRole, string> = {
  admin: 'bg-muted text-foreground border-border hover:bg-muted',
  sales_manager: 'bg-muted text-foreground border-border hover:bg-muted',
  sales_rep: 'bg-muted text-foreground border-border hover:bg-muted',
};

export default function AppLayout() {
  const navigate = useNavigate();
  const role = useRole();
  const setRole = useSetRole();
  const canViewReports = useCanViewReports();
  const user = useAuthStore((s) => s.user);
  const logoutAuth = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const handleLogout = () => {
    logoutAuth();
    navigate('/login');
  };

  const initials = user?.initials ?? '??';
  const displayName = user?.name ?? 'User';
  const displayEmail = user?.email ?? '';

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-background border-r border-border flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 64 64" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M 44 20 A 17 17 0 1 0 44 44" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-foreground tracking-tight block">Curo</span>
              <span className="text-xs text-muted-foreground tracking-tight block">PeopleOS</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {mainNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}

            {/* Reports — only visible to Manager and Admin */}
            {canViewReports && (
              <li>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span>Reports</span>
                </NavLink>
              </li>
            )}
          </ul>

          <Separator className="my-3" />

          <ul className="space-y-0.5">
            {bottomNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent transition-colors text-left">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div />
          {/* Role switcher */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge className={cn('text-xs border', roleBadgeClass[role])}>
                    {ROLE_LABELS[role]}
                  </Badge>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['admin', 'sales_manager', 'sales_rep'] as UserRole[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn('text-sm', role === r && 'font-medium')}
                  >
                    {ROLE_LABELS[r]}
                    {role === r && <span className="ml-auto text-primary text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
