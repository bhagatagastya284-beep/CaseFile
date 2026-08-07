/**
 * Lightweight keyword-overlap evidence extractor. Deliberately avoids
 * embeddings/vector search (out of MVP scope) - scores paragraphs by how
 * many distinct topic/question keywords they contain.
 */
function extractKeywords(strings) {
  const stopwords = new Set([
    'the', 'a', 'an', 'of', 'in', 'on', 'for', 'and', 'or', 'to', 'is', 'are',
    'what', 'how', 'why', 'with', 'that', 'this', 'be', 'as', 'by', 'it'
  ]);
  const words = strings
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
  return Array.from(new Set(words));
}

function splitParagraphs(text) {
  return text
    .split(/\n+|(?<=[.!?])\s{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 120 && p.length < 2000);
}

function scoreParagraph(paragraph, keywords) {
  const lower = paragraph.toLowerCase();
  let score = 0;
  keywords.forEach((k) => {
    if (lower.includes(k)) score += 1;
  });
  return score;
}

/**
 * @param {string} text full extracted body text
 * @param {string[]} keywordSeeds topic + question strings to weight relevance
 * @param {number} maxSnippets
 */
function extractEvidenceSnippets(text, keywordSeeds, maxSnippets = 4) {
  if (!text) return [];
  const keywords = extractKeywords(keywordSeeds);
  const paragraphs = splitParagraphs(text);

  if (paragraphs.length === 0) {
    return text.slice(0, 800) ? [text.slice(0, 800)] : [];
  }

  const scored = paragraphs
    .map((p) => ({ text: p, score: scoreParagraph(p, keywords) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).slice(0, maxSnippets);
  const chosen = top.length > 0 ? top : scored.slice(0, Math.min(2, scored.length));

  return chosen.map((s) => s.text.slice(0, 900));
}

module.exports = { extractEvidenceSnippets };
