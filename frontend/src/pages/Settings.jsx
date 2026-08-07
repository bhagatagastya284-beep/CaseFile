import { Info } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 text-sm">Application preferences</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-start gap-3 text-sm text-slate-400">
          <Info className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />
          <p>
            Casefile's AI research capabilities (search, summarization, citations) are configured
            via environment variables on the backend (<code className="text-accent-400">OPENAI_API_KEY</code>,{' '}
            <code className="text-accent-400">TAVILY_API_KEY</code>). Contact your administrator to
            update these keys.
          </p>
        </div>
      </div>
    </div>
  );
}
