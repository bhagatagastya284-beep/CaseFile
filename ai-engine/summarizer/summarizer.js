const fs = require('fs');
const path = require('path');
const { completeJSON, isConfigured } = require('../openaiClient');

const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'summarizer.md'), 'utf-8');

function fallbackSummary(topic, evidence) {
  const count = evidence.length;
  return {
    executiveSummary: count
      ? `Collected ${count} pieces of evidence on "${topic}" from the web search stage. Configure OPENAI_API_KEY to enable AI-generated synthesis.`
      : `No evidence was collected for "${topic}". Configure TAVILY_API_KEY and OPENAI_API_KEY to enable full autonomous research.`,
    findings: evidence.slice(0, 8).map((e, i) => ({
      heading: `Evidence ${i + 1} (${e.source || e.url || 'unknown source'})`,
      body: e.content.slice(0, 500)
    })),
    conclusion: 'Enable the AI engine (OPENAI_API_KEY) for an AI-synthesized conclusion.',
    recommendations: 'Enable the AI engine (OPENAI_API_KEY) for AI-generated recommendations.'
  };
}

async function summarizeEvidence(topic, questions, evidence) {
  if (!isConfigured() || evidence.length === 0) {
    return fallbackSummary(topic, evidence);
  }

  try {
    const evidenceBlock = evidence
      .slice(0, 40)
      .map((e, i) => `[${i + 1}] (${e.source || e.url}) ${e.content.slice(0, 800)}`)
      .join('\n\n');

    const user = [
      `Research topic: ${topic}`,
      `Research questions: ${questions.map((q) => q.question).join('; ')}`,
      `Evidence:\n${evidenceBlock}`
    ].join('\n\n');

    const result = await completeJSON({ system: SYSTEM_PROMPT, user });

    return {
      executiveSummary: result.executiveSummary || '',
      findings: Array.isArray(result.findings) ? result.findings : [],
      conclusion: result.conclusion || '',
      recommendations: result.recommendations || ''
    };
  } catch (err) {
    return fallbackSummary(topic, evidence);
  }
}

module.exports = { summarizeEvidence };
