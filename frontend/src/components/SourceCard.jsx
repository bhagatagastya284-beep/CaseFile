import { Globe, ExternalLink } from 'lucide-react';

export default function SourceCard({ source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-4 flex flex-col gap-2 hover:border-accent-600/50 transition-colors"
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Globe className="h-3.5 w-3.5" />
        <span className="truncate">{source.domain}</span>
      </div>
      <h4 className="text-sm font-medium text-slate-200 line-clamp-2">{source.title || source.url}</h4>
      {source.snippet && <p className="text-xs text-slate-500 line-clamp-3">{source.snippet}</p>}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-accent-400">
          Relevance {Math.round((source.relevanceScore || 0) * 100)}%
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
      </div>
    </a>
  );
}
