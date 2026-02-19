import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  HandshakeIcon,
  Activity,
  Settings,
  ChevronDown,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Deals', href: '/deals', icon: HandshakeIcon },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const crgMode = import.meta.env.VITE_CRG_MODE ?? 'train';
const appTitle = crgMode === 'assist' ? 'CRM Demo' : 'CRM Dev';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <span className="text-xl font-bold">{appTitle}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <span className="text-sm font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-slate-400 truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            {/* Search or breadcrumbs can go here */}
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu */}
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">JD</span>
              </div>
              <span>John Doe</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
