const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    extractedText: { type: String, default: '' },
    status: { type: String, enum: ['uploaded', 'parsed', 'failed'], default: 'uploaded' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
