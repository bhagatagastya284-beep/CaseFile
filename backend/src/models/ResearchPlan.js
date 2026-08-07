const mongoose = require('mongoose');

const researchPlanSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    mainQuestion: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        category: { type: String, default: 'General' },
        order: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResearchPlan', researchPlanSchema);
