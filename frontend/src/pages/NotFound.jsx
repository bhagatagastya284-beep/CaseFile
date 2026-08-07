import { Link } from 'react-router-dom';
import { FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-950 text-center px-4">
      <FileSearch className="h-14 w-14 text-accent-500 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-slate-500 mb-6">This page could not be found.</p>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
