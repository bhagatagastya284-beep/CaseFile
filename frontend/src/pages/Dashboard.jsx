import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckCircle2, Loader2, FileText, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { projectService } from '../services/projectService';
import ResearchCard from '../components/ResearchCard';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService
      .dashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-accent-500" />
      </div>
    );
  }

  const chartData = [
    { name: 'Completed', value: stats?.completed || 0 },
    { name: 'In Progress', value: stats?.inProgress || 0 },
    { name: 'Reports', value: stats?.reports || 0 }
  ];
  const hasChartData = chartData.some((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500 text-sm">Your research overview and recent activity</p>
        </div>
        <Link to="/research/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Research
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.total || 0} color="text-accent-400" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.completed || 0} color="text-emerald-400" />
        <StatCard icon={FileText} label="Reports Generated" value={stats?.reports || 0} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Recent Research</h2>
          {stats?.recent?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.recent.map((p) => (
                <ResearchCard key={p._id} project={p} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-slate-500 text-sm">
              No research projects yet.{' '}
              <Link to="/research/new" className="text-accent-400 hover:underline">
                Start your first one
              </Link>
              .
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-3">AI Usage Snapshot</h2>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid #232c44', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 text-center py-10">No activity yet</p>
          )}
          <div className="space-y-2 mt-2">
            {chartData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  {d.name}
                </span>
                <span className="text-slate-200 font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg bg-base-800 flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
