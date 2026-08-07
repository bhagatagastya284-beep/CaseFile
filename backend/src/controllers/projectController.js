const Project = require('../models/Project');
const ResearchPlan = require('../models/ResearchPlan');
const Source = require('../models/Source');
const Evidence = require('../models/Evidence');
const Report = require('../models/Report');
const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    throw new ApiError(400, 'Research topic (title) is required');
  }

  const project = await Project.create({
    title: title.trim(),
    description: (description || '').trim(),
    owner: req.user._id,
    status: 'draft',
    stage: 'Created',
    progress: 0
  });

  res.status(201).json({ success: true, data: project });
});

const listProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);

  const filter = { owner: req.user._id };
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: projects,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw new ApiError(404, 'Project not found');

  const [plan, sources, evidence, report, documents] = await Promise.all([
    ResearchPlan.findOne({ projectId: project._id }),
    Source.find({ projectId: project._id }).sort({ relevanceScore: -1 }),
    Evidence.find({ projectId: project._id }).sort({ createdAt: 1 }),
    Report.findOne({ projectId: project._id }).sort({ createdAt: -1 }),
    Document.find({ projectId: project._id }).sort({ createdAt: -1 })
  ]);

  res.json({ success: true, data: { project, plan, sources, evidence, report, documents } });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw new ApiError(404, 'Project not found');

  const { title, description } = req.body;
  if (title !== undefined) project.title = title.trim();
  if (description !== undefined) project.description = description.trim();

  await project.save();
  res.json({ success: true, data: project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw new ApiError(404, 'Project not found');

  await Promise.all([
    ResearchPlan.deleteMany({ projectId: project._id }),
    Source.deleteMany({ projectId: project._id }),
    Evidence.deleteMany({ projectId: project._id }),
    Report.deleteMany({ projectId: project._id }),
    Document.deleteMany({ projectId: project._id }),
    project.deleteOne()
  ]);

  res.json({ success: true, message: 'Project and related data deleted' });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const [total, completed, inProgress, reports] = await Promise.all([
    Project.countDocuments({ owner }),
    Project.countDocuments({ owner, status: 'completed' }),
    Project.countDocuments({ owner, status: { $nin: ['completed', 'failed', 'draft'] } }),
    Report.countDocuments({ projectId: { $in: await Project.find({ owner }).distinct('_id') } })
  ]);
  const recent = await Project.find({ owner }).sort({ updatedAt: -1 }).limit(5);

  res.json({
    success: true,
    data: { total, completed, inProgress, reports, recent }
  });
});

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  getDashboardStats
};
