const fs = require('fs');
const Project = require('../models/Project');
const Evidence = require('../models/Evidence');
const Source = require('../models/Source');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const { runPipeline } = require('../services/researchOrchestrator');
const { buildCitations } = require('../../../ai-engine/citations/citationGenerator');

const RUNNING_STATES = new Set(['planning', 'searching', 'reading', 'analyzing', 'writing']);

const startResearch = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw new ApiError(404, 'Project not found');

  if (RUNNING_STATES.has(project.status)) {
    throw new ApiError(409, 'Research is already in progress for this project');
  }

  project.status = 'planning';
  project.stage = 'Queued';
  project.progress = 5;
  project.error = null;
  await project.save();

  // Fire-and-forget: pipeline updates the Project doc as it advances so the
  // client can poll GET /api/projects/:id for live status.
  runPipeline(project._id).catch((err) => logger.error(`Pipeline error: ${err.message}`));

  res.status(202).json({ success: true, message: 'Research started', data: project });
});

const getCitations = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw new ApiError(404, 'Project not found');

  const [evidence, sources] = await Promise.all([
    Evidence.find({ projectId: project._id }),
    Source.find({ projectId: project._id })
  ]);
  const sourcesById = new Map(sources.map((s) => [String(s._id), s]));
  const citations = buildCitations(evidence, sourcesById);

  res.json({ success: true, data: citations });
});

const exportReport = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw new ApiError(404, 'Project not found');

  const report = await Report.findOne({ projectId: project._id }).sort({ createdAt: -1 });
  if (!report) throw new ApiError(404, 'No report has been generated for this project yet');

  const format = (req.query.format || 'md').toLowerCase();

  if (format === 'pdf') {
    if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
      throw new ApiError(404, 'PDF report file not found');
    }
    return res.download(report.pdfPath, `${project.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  }

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.md"`);
  res.send(report.markdown);
});

module.exports = { startResearch, getCitations, exportReport };
