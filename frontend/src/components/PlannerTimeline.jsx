import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STAGES = [
  { key: 'planning', label: 'Planning' },
  { key: 'searching', label: 'Searching' },
  { key: 'reading', label: 'Reading' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'writing', label: 'Writing' },
  { key: 'completed', label: 'Complete' }
];

export default function PlannerTimeline({ status }) {
  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center w-full overflow-x-auto pb-1">
      {STAGES.map((stage, i) => {
        const done = status === 'completed' ? true : i < currentIndex;
        const active = i === currentIndex && status !== 'completed';
        return (
          <div key={stage.key} className="flex items-center flex-1 min-w-[110px] last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : active ? (
                <Loader2 className="h-5 w-5 text-accent-400 animate-spin" />
              ) : (
                <Circle className="h-5 w-5 text-slate-600" />
              )}
              <span
                className={`text-xs whitespace-nowrap ${
                  done || active ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-px flex-1 mx-2 ${done ? 'bg-emerald-400/50' : 'bg-base-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
