import { Quote } from 'lucide-react';

export default function EvidenceCard({ evidence }) {
  return (
    <div className="card p-4 flex gap-3">
      <Quote className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm text-slate-300 leading-relaxed">{evidence.content}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="truncate">{evidence.source || 'Uploaded document'}</span>
          <span>&middot;</span>
          <span>confidence {Math.round((evidence.confidence || 0) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
