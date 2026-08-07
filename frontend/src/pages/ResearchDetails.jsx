import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, RotateCcw, ListTree, Globe2, Quote, FileText, BookMarked, AlertTriangle } from 'lucide-react';
import { projectService } from '../services/projectService';
import PlannerTimeline from '../components/PlannerTimeline';
import ProgressBar from '../components/ProgressBar';
import SourceCard from '../components/SourceCard';
import EvidenceCard from '../components/EvidenceCard';
import CitationCard from '../components/CitationCard';
import ReportPreview from '../components/ReportPreview';
import UploadBox from '../components/UploadBox';

const RUNNING = new Set(['planning', 'searching', 'reading', 'analyzing', 'writing']);
const TABS = [
  { key: 'plan', label: 'Plan', icon: ListTree },
  { key: 'sources', label: 'Sources', icon: Globe2 },
  { key: 'evidence', label: 'Evidence', icon: Quote },
  { key: 'report', label: 'Report', icon: FileText },
  { key: 'citations', label: 'Citations', icon: BookMarked }
];

export default function ResearchDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('plan');
  const [extraFiles, setExtraFiles] = useState([]);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data: payload } = await projectService.get(id);
      setData(payload);
      return payload.project.status;
    } catch (err) {
      toast.error('Failed to load research');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    return () => clearInterval(pollRef.current);
  }, [load]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (data && RUNNING.has(data.project.status)) {
      pollRef.current = setInterval(load, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [data?.project.status, load]);

  useEffect(() => {
    if (data?.project.status === 'completed') {
      projectService.getCitations(id).then(({ data: c }) => setCitations(c)).catch(() => {});
    }
  }, [data?.project.status, id]);

  const handleRerun = async () => {
    try {
      for (const file of extraFiles) {
        // eslint-disable-next-line no-await-in-loop
        await projectService.uploadFile(id, file).catch(() => {});
      }
      await projectService.startResearch(id);
      setExtraFiles([]);
      toast.success('Research (re)started');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start research');
    }
  };

  const handleExport = async (format) => {
    try {
      const blob = await projectService.exportReport(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.project.title.replace(/[^a-z0-9]/gi, '_')}.${format === 'pdf' ? 'pdf' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Report not available yet');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!data) return null;
  const { project, plan, sources, evidence, report, documents } = data;
  const isRunning = RUNNING.has(project.status);
  const canRun = !isRunning;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && <p className="text-slate-500 text-sm mt-1 max-w-2xl">{project.description}</p>}
        </div>
        <button onClick={handleRerun} disabled={!canRun} className="btn-secondary">
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          {project.status === 'draft' ? 'Start Research' : isRunning ? 'Running...' : 'Re-run Research'}
        </button>
      </div>

      <div className="card p-5">
        <PlannerTimeline status={project.status} />
        {isRunning && <div className="mt-4"><ProgressBar progress={project.progress} stage={project.stage} /></div>}
        {project.status === 'failed' && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {project.error || 'Research failed. Please try again.'}
          </div>
        )}
      </div>

      {project.status === 'draft' && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Add reference documents before starting</h3>
          <UploadBox
            files={extraFiles}
            onAdd={(f) => setExtraFiles((prev) => [...prev, f])}
            onRemove={(i) => setExtraFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </div>
      )}

      {documents?.length > 0 && (
        <div className="text-xs text-slate-500">
          {documents.length} document{documents.length > 1 ? 's' : ''} attached
        </div>
      )}

      <div className="flex gap-1 border-b border-base-border overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === key ? 'border-accent-500 text-accent-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'plan' && (
          <div className="space-y-3">
            {plan?.questions?.length ? (
              plan.questions.map((q, i) => (
                <div key={i} className="card p-4 flex items-start gap-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-accent-600/15 text-accent-400 shrink-0">
                    {q.category}
                  </span>
                  <p className="text-sm text-slate-300">{q.question}</p>
                </div>
              ))
            ) : (
              <EmptyState text="No research plan yet." />
            )}
          </div>
        )}

        {tab === 'sources' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources?.length ? sources.map((s) => <SourceCard key={s._id} source={s} />) : <EmptyState text="No sources collected yet." />}
          </div>
        )}

        {tab === 'evidence' && (
          <div className="space-y-3">
            {evidence?.length ? evidence.map((e) => <EvidenceCard key={e._id} evidence={e} />) : <EmptyState text="No evidence extracted yet." />}
          </div>
        )}

        {tab === 'report' && <ReportPreview report={report} onExport={handleExport} />}

        {tab === 'citations' && (
          <div className="card p-5">
            {citations.length ? (
              citations.map((c, i) => <CitationCard key={i} citation={c} index={i} />)
            ) : (
              <EmptyState text="Citations appear once research completes." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="card p-8 text-center text-slate-500 text-sm">{text}</div>;
}
