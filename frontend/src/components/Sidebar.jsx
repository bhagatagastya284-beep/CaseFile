import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, FileText, User, Settings as SettingsIcon, FileSearch, X } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/research/new', label: 'New Research', icon: FilePlus2 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: SettingsIcon }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-base-900 border-r border-base-border z-40 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-base-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <FileSearch className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Casefile</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-600/15 text-accent-400 border border-accent-600/30'
                    : 'text-slate-400 hover:bg-base-800 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
