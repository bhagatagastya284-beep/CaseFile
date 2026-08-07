import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

const STATUS_STYLES = {
  draft: 'bg-slate-500/15 text-slate-400',
  planning: 'bg-amber-500/15 text-amber-400',
  searching: 'bg-amber-500/15 text-amber-400',
  reading: 'bg-amber-500/15 text-amber-400',
  analyzing: 'bg-amber-500/15 text-amber-400',
  writing: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-emerald-500/15 text-emerald-400',
  failed: 'bg-red-500/15 text-red-400'
};

export default function ResearchCard({ project }) {
  return (
    <Link
      to={`/research/${project._id}`}
      className="card p-5 flex flex-col gap-3 hover:border-accent-600/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-100 line-clamp-2">{project.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
            STATUS_STYLES[project.status] || STATUS_STYLES.draft
          }`}
        >
          {project.status}
        </span>
      </div>
      {project.description && (
        <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1 text-accent-400 group-hover:gap-2 transition-all">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
