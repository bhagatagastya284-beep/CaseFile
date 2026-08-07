export default function ProgressBar({ progress = 0, stage = '' }) {
  return (
    <div>
      {stage && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-slate-300">{stage}</span>
          <span className="text-sm text-slate-500">{progress}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-base-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
