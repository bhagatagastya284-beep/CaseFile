const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, default: '' },
    markdown: { type: String, default: '' },
    html: { type: String, default: '' },
    pdfPath: { type: String, default: '' },
    executiveSummary: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    conclusion: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
