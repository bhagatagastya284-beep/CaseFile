const path = require('path');
const Project = require('../models/Project');
const ResearchPlan = require('../models/ResearchPlan');
const Source = require('../models/Source');
const Evidence = require('../models/Evidence');
const Report = require('../models/Report');
const Document = require('../models/Document');
const Log = require('../models/Log');
const logger = require('../utils/logger');
const env = require('../config/env');

const { generatePlan } = require('../../../ai-engine/planner/planner');
const { runSearch, isConfigured: searchConfigured } = require('../../../ai-engine/search/searchOrchestrator');
const { readWebsite } = require('../../../ai-engine/parser/websiteReader');
const { extractEvidenceSnippets } = require('../../../ai-engine/evidence/evidenceExtractor');
const { summarizeEvidence } = require('../../../ai-engine/summarizer/summarizer');
const { buildCitations } = require('../../../ai-engine/citations/citationGenerator');
const { generateReport } = require('../../../ai-engine/report/reportGenerator');

async function log(projectId, level, stage, message, meta = {}) {
  try {
    await Log.create({ projectId, level, stage, message, meta });
  } catch (err) {
    logger.warn(`Failed to persist log: ${err.message}`);
  }
  logger[level === 'error' ? 'error' : 'info'](`[${projectId}] [${stage}] ${message}`);
}

async function setStage(project, status, stage, progress) {
  project.status = status;
  project.stage = stage;
  project.progress = progress;
  await project.save();
}

/**
 * Runs the full autonomous research pipeline for a project:
 * plan -> search -> read -> extract evidence -> analyze -> cite -> report.
 * Updates the Project document's status/stage/progress as it advances so the
 * frontend can poll for live progress.
 */
async function runPipeline(projectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  try {
    // 1. PLANNING
    await setStage(project, 'planning', 'Generating research plan', 10);
    const planData = await generatePlan(project.title, project.description);
    const plan = await ResearchPlan.findOneAndUpdate(
      { projectId },
      { projectId, mainQuestion: planData.mainQuestion, questions: planData.questions },
      { upsert: true, new: true }
    );
    await log(projectId, 'info', 'planning', `Generated ${plan.questions.length} research questions`);

    // 2. SEARCH
    await setStage(project, 'searching', 'Searching the web', 25);
    let searchResults = [];
    if (searchConfigured()) {
      try {
        searchResults = await runSearch(plan.questions);
      } catch (err) {
        await log(projectId, 'warn', 'searching', `Web search failed: ${err.message}`);
      }
    } else {
      await log(projectId, 'warn', 'searching', 'TAVILY_API_KEY not configured - skipping web search');
    }

    await Source.deleteMany({ projectId });
    const sources = searchResults.length
      ? await Source.insertMany(
          searchResults.slice(0, 15).map((r) => ({
            projectId,
            url: r.url,
            title: r.title,
            domain: r.domain,
            snippet: r.snippet,
            relevanceScore: r.relevanceScore
          }))
        )
      : [];
    await log(projectId, 'info', 'searching', `Collected ${sources.length} sources`);

    // 3 & 4. READ + EXTRACT EVIDENCE
    await setStage(project, 'reading', 'Reading sources and extracting evidence', 50);
    await Evidence.deleteMany({ projectId });

    const keywordSeeds = [project.title, project.description, ...plan.questions.map((q) => q.question)];
    const evidenceDocs = [];

    for (const source of sources) {
      try {
        const page = await readWebsite(source.url);
        if (page.title && !source.title) source.title = page.title;
        if (page.author) source.author = page.author;
        if (page.publishedDate) source.publishedDate = page.publishedDate;
        await source.save();

        const snippets = extractEvidenceSnippets(page.body, keywordSeeds, 3);
        snippets.forEach((snippet) => {
          evidenceDocs.push({
            projectId,
            sourceId: source._id,
            content: snippet,
            url: source.url,
            source: source.title || source.domain,
            confidence: 0.5
          });
        });
      } catch (err) {
        await log(projectId, 'warn', 'reading', `Failed to read ${source.url}: ${err.message}`);
      }
    }

    // Include evidence from uploaded documents
    const documents = await Document.find({ projectId, status: 'parsed' });
    documents.forEach((doc) => {
      const snippets = extractEvidenceSnippets(doc.extractedText, keywordSeeds, 4);
      snippets.forEach((snippet) => {
        evidenceDocs.push({
          projectId,
          sourceId: null,
          content: snippet,
          url: '',
          source: doc.originalName,
          confidence: 0.6
        });
      });
    });

    const evidence = evidenceDocs.length ? await Evidence.insertMany(evidenceDocs) : [];
    await log(projectId, 'info', 'reading', `Extracted ${evidence.length} evidence snippets`);

    // 5. ANALYZE (AI Summarization)
    await setStage(project, 'analyzing', 'Analyzing evidence with AI', 70);
    const summary = await summarizeEvidence(project.title, plan.questions, evidence);

    // 6. CITATIONS
    await setStage(project, 'analyzing', 'Generating citations', 80);
    const sourcesById = new Map(sources.map((s) => [String(s._id), s]));
    const citations = buildCitations(evidence, sourcesById);

    // 7. REPORT
    await setStage(project, 'writing', 'Writing final report', 90);
    const outputDir = path.join(__dirname, '..', '..', env.uploadPath, 'reports');
    require('fs').mkdirSync(outputDir, { recursive: true });

    const { markdown, html, pdfPath } = await generateReport({
      project,
      plan,
      sources,
      evidence,
      citations,
      summary,
      outputDir
    });

    await Report.deleteMany({ projectId });
    await Report.create({
      projectId,
      title: project.title,
      markdown,
      html,
      pdfPath,
      executiveSummary: summary.executiveSummary,
      recommendations: summary.recommendations,
      conclusion: summary.conclusion
    });

    await setStage(project, 'completed', 'Research complete', 100);
    project.error = null;
    await project.save();
    await log(projectId, 'info', 'completed', 'Research pipeline completed successfully');
  } catch (err) {
    project.status = 'failed';
    project.stage = 'Failed';
    project.error = err.message;
    await project.save();
    await log(projectId, 'error', 'pipeline', `Pipeline failed: ${err.message}`);
  }
}

module.exports = { runPipeline };
