import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownViewer({ content }) {
  if (!content) return <p className="text-slate-500 text-sm">No report content yet.</p>;

  return (
    <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-accent-400 prose-strong:text-slate-100 prose-blockquote:text-slate-400 prose-blockquote:border-accent-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
