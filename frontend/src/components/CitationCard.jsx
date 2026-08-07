import { BadgeCheck } from 'lucide-react';

export default function CitationCard({ citation, index }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-base-border last:border-0">
      <span className="text-xs text-slate-500 mt-0.5 w-5 shrink-0">[{index + 1}]</span>
      <div className="min-w-0 flex-1">
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent-400 hover:underline break-words"
        >
          {citation.source}
        </a>
        <p className="text-xs text-slate-500 mt-0.5">Retrieved {citation.retrievedDate?.slice(0, 10)}</p>
      </div>
      <span className="flex items-center gap-1 text-xs text-emerald-400 shrink-0">
        <BadgeCheck className="h-3.5 w-3.5" />
        {Math.round((citation.confidence || 0) * 100)}%
      </span>
    </div>
  );
}
