import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-base-border bg-base-950/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400">
        <Menu className="h-6 w-6" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-500 leading-tight">{user?.email}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-accent-600/20 border border-accent-600/40 flex items-center justify-center text-accent-400 font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
