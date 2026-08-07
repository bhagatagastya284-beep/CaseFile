import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { projectService } from '../services/projectService';
import UploadBox from '../components/UploadBox';

export default function Research() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a research topic');
      return;
    }
    setLoading(true);
    try {
      const { data: project } = await projectService.create({ title, description });

      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        await projectService.uploadFile(project._id, file).catch(() => {
          toast.error(`Failed to upload ${file.name}`);
        });
      }

      await projectService.startResearch(project._id);
      toast.success('Research started');
      navigate(`/research/${project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start research');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">New Research</h1>
      <p className="text-slate-500 text-sm mb-8">
        Describe what you want investigated. Casefile will plan, search, read, and write a
        cited report autonomously.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label-text">Research Topic</label>
          <input
            className="input-field"
            placeholder="e.g. The impact of AI in Healthcare"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-text">Description (optional)</label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            placeholder="Add context, scope, or specific angles you want covered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="label-text">Reference Documents (optional)</label>
          <UploadBox
            files={files}
            onAdd={(f) => setFiles((prev) => [...prev, f])}
            onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <Sparkles className="h-4 w-4" />
          {loading ? 'Starting research...' : 'Start Research'}
        </button>
      </form>
    </div>
  );
}
