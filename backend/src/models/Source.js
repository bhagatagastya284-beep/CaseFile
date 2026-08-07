const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    url: { type: String, required: true },
    title: { type: String, default: '' },
    author: { type: String, default: '' },
    publishedDate: { type: String, default: '' },
    domain: { type: String, default: '' },
    snippet: { type: String, default: '' },
    relevanceScore: { type: Number, default: 0 },
    fetchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Source', sourceSchema);
