import { Outlet, Navigate } from 'react-router-dom';
import { FileSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-accent-600 flex items-center justify-center">
            <FileSearch className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Casefile</span>
        </div>
        <div className="card p-8 shadow-2xl">
          <Outlet />
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">
          AI-Powered Self-Evolving Autonomous Research Agent
        </p>
      </div>
    </div>
  );
}
