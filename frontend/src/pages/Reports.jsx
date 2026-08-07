import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService
      .list({ limit: 50 })
      .then(({ data }) => setProjects(data.filter((p) => p.status === 'completed')))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-slate-500 text-sm">All completed research reports</p>
      </div>

      {projects.length === 0 ? (
        <div className="card p-10 text-center text-slate-500 text-sm">No completed reports yet.</div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p._id}
              to={`/research/${p._id}`}
              className="card p-4 flex items-center justify-between gap-4 hover:border-accent-600/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-accent-600/15 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-accent-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-100 truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    Completed {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
