const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: '', maxlength: 5000 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'planning', 'searching', 'reading', 'analyzing', 'writing', 'completed', 'failed'],
      default: 'draft'
    },
    stage: { type: String, default: 'Not started' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    error: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
