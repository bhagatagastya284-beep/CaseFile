/**
 * Deterministic citation builder. Confidence is a heuristic blend of the
 * source's search relevance score and how much evidence text was extracted,
 * so citations remain stable and reproducible across runs.
 */
function buildCitations(evidenceList, sourcesById) {
  return evidenceList.map((evidence) => {
    const source = sourcesById.get(String(evidence.sourceId)) || null;
    const relevance = source?.relevanceScore || 0;
    const lengthBoost = Math.min(evidence.content.length / 1000, 0.2);
    const confidence = Math.min(0.5 + relevance * 0.4 + lengthBoost, 0.99);

    return {
      source: source?.title || evidence.source || 'Unknown source',
      url: evidence.url || source?.url || '',
      retrievedDate: (evidence.retrievedDate || evidence.createdAt || new Date()).toISOString
        ? (evidence.retrievedDate || evidence.createdAt || new Date()).toISOString()
        : new Date().toISOString(),
      confidence: Math.round(confidence * 100) / 100
    };
  });
}

module.exports = { buildCitations };
