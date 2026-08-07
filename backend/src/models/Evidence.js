const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source', default: null },
    content: { type: String, required: true },
    url: { type: String, default: '' },
    source: { type: String, default: '' },
    confidence: { type: Number, default: 0.5, min: 0, max: 1 },
    retrievedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evidence', evidenceSchema);
