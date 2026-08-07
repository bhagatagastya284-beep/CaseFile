const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
    stage: { type: String, default: '' },
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
