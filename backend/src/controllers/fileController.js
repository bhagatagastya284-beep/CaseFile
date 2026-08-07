const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const { parseDocument } = require('../../../ai-engine/parser/documentParser');

const uploadFile = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) throw new ApiError(400, 'projectId is required');
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const project = await Project.findOne({ _id: projectId, owner: req.user._id });
  if (!project) {
    fs.unlink(req.file.path, () => {});
    throw new ApiError(404, 'Project not found');
  }

  const document = await Document.create({
    projectId,
    uploadedBy: req.user._id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    status: 'uploaded'
  });

  parseDocument(req.file.path, req.file.mimetype)
    .then(async ({ text }) => {
      document.extractedText = text.slice(0, 200000);
      document.status = 'parsed';
      await document.save();
    })
    .catch(async (err) => {
      logger.error(`Document parse failed for ${document._id}: ${err.message}`);
      document.status = 'failed';
      await document.save();
    });

  res.status(201).json({ success: true, data: document });
});

const listFiles = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const filter = { uploadedBy: req.user._id };
  if (projectId) filter.projectId = projectId;
  const documents = await Document.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: documents });
});

const deleteFile = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!document) throw new ApiError(404, 'Document not found');

  fs.unlink(document.path, () => {});
  await document.deleteOne();

  res.json({ success: true, message: 'Document deleted' });
});

module.exports = { uploadFile, listFiles, deleteFile };
