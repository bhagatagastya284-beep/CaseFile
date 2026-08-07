import { Loader2 } from 'lucide-react';

export default function SearchLoader({ label = 'Working...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin text-accent-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
