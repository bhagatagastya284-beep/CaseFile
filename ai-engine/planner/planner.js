const fs = require('fs');
const path = require('path');
const { completeJSON, isConfigured } = require('../openaiClient');

const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'planner.md'), 'utf-8');

const FALLBACK_CATEGORIES = ['Overview', 'Key Drivers', 'Competitive Landscape', 'Risks & Challenges', 'Future Outlook'];

function fallbackPlan(topic) {
  return {
    mainQuestion: topic,
    questions: FALLBACK_CATEGORIES.map((category, i) => ({
      question: `What is the ${category.toLowerCase()} relevant to: ${topic}?`,
      category,
      order: i + 1
    }))
  };
}

async function generatePlan(topic, description = '') {
  if (!isConfigured()) {
    return fallbackPlan(topic);
  }

  try {
    const user = `Research topic: ${topic}\nDescription: ${description || 'N/A'}`;
    const result = await completeJSON({ system: SYSTEM_PROMPT, user });

    if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
      return fallbackPlan(topic);
    }
    return {
      mainQuestion: result.mainQuestion || topic,
      questions: result.questions.map((q, i) => ({
        question: q.question,
        category: q.category || 'General',
        order: q.order || i + 1
      }))
    };
  } catch (err) {
    return fallbackPlan(topic);
  }
}

module.exports = { generatePlan };
