const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const PDFDocument = require('pdfkit');

const md = new MarkdownIt();

function buildMarkdown({ project, plan, sources, evidence, citations, summary }) {
  const lines = [];

  lines.push(`# ${project.title}`, '');
  lines.push('## Introduction', '', project.description || '_No description provided._', '');

  lines.push('## Research Questions', '');
  (plan?.questions || []).forEach((q) => {
    lines.push(`- **[${q.category}]** ${q.question}`);
  });
  lines.push('');

  lines.push('## Executive Summary', '', summary.executiveSummary || '_Not available._', '');

  lines.push('## Findings', '');
  (summary.findings || []).forEach((f) => {
    lines.push(`### ${f.heading}`, '', f.body, '');
  });

  lines.push('## Sources', '');
  sources.forEach((s, i) => {
    lines.push(`${i + 1}. [${s.title || s.url}](${s.url}) — ${s.domain || ''}`);
  });
  lines.push('');

  lines.push('## Evidence', '');
  evidence.forEach((e, i) => {
    lines.push(`> ${e.content}`, '', `— *${e.source || e.url}*`, '');
  });

  lines.push('## Recommendations', '', summary.recommendations || '_Not available._', '');
  lines.push('## Conclusion', '', summary.conclusion || '_Not available._', '');

  lines.push('## References', '');
  citations.forEach((c, i) => {
    lines.push(
      `${i + 1}. ${c.source} — ${c.url} (retrieved ${c.retrievedDate.slice(0, 10)}, confidence ${c.confidence})`
    );
  });

  return lines.join('\n');
}

function markdownToHtml(markdown) {
  return md.render(markdown);
}

function markdownToPdf(markdown, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    markdown.split('\n').forEach((line) => {
      if (line.startsWith('# ')) {
        doc.fontSize(22).font('Helvetica-Bold').text(line.replace(/^# /, ''));
        doc.moveDown(0.5);
      } else if (line.startsWith('## ')) {
        doc.moveDown(0.3);
        doc.fontSize(16).font('Helvetica-Bold').text(line.replace(/^## /, ''));
        doc.moveDown(0.2);
      } else if (line.startsWith('### ')) {
        doc.fontSize(13).font('Helvetica-Bold').text(line.replace(/^### /, ''));
        doc.moveDown(0.1);
      } else if (line.trim() === '') {
        doc.moveDown(0.3);
      } else {
        doc.fontSize(10.5).font('Helvetica').text(line.replace(/^[->*]\s?/, ''));
      }
    });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function generateReport({ project, plan, sources, evidence, citations, summary, outputDir }) {
  const markdown = buildMarkdown({ project, plan, sources, evidence, citations, summary });
  const html = markdownToHtml(markdown);

  const fileBase = `report-${project._id}-${Date.now()}`;
  const pdfPath = path.join(outputDir, `${fileBase}.pdf`);
  await markdownToPdf(markdown, pdfPath);

  return { markdown, html, pdfPath };
}

module.exports = { generateReport, buildMarkdown, markdownToHtml, markdownToPdf };
