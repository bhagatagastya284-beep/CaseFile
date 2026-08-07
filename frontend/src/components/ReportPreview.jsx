import { Download, FileDown } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';

export default function ReportPreview({ report, onExport }) {
  if (!report) {
    return (
      <div className="card p-8 text-center text-slate-500 text-sm">
        No report generated yet. Run research to produce one.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="font-semibold text-slate-100">Final Report</h3>
        <div className="flex gap-2">
          <button onClick={() => onExport('md')} className="btn-secondary text-xs px-3 py-2">
            <FileDown className="h-4 w-4" /> Markdown
          </button>
          <button onClick={() => onExport('pdf')} className="btn-primary text-xs px-3 py-2">
            <Download className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto pr-2">
        <MarkdownViewer content={report.markdown} />
      </div>
    </div>
  );
}
