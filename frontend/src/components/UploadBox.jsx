import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function UploadBox({ files, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    Array.from(fileList).forEach((file) => onAdd(file));
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-accent-500 bg-accent-600/5' : 'border-base-border hover:border-accent-600/50'
        }`}
      >
        <UploadCloud className="h-7 w-7 mx-auto text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">
          Drag & drop files here, or <span className="text-accent-400">browse</span>
        </p>
        <p className="text-xs text-slate-600 mt-1">PDF, DOCX, TXT — up to 25MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files?.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-base-850 border border-base-border rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-accent-400 shrink-0" />
                <span className="text-sm text-slate-300 truncate">{f.name}</span>
              </div>
              <button onClick={() => onRemove(i)} className="text-slate-500 hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
