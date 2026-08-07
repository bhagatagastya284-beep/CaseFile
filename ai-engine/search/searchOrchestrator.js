const axios = require('axios');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const TAVILY_URL = 'https://api.tavily.com/search';

function isConfigured() {
  return Boolean(TAVILY_API_KEY);
}

async function searchOne(query) {
  const response = await axios.post(
    TAVILY_URL,
    {
      api_key: TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: 6,
      include_answer: false
    },
    { timeout: 20000 }
  );

  return (response.data.results || []).map((r) => ({
    url: r.url,
    title: r.title || '',
    snippet: r.content || '',
    relevanceScore: r.score || 0
  }));
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Runs one search per research question, merges results, removes duplicate
 * URLs, and ranks by relevance score.
 */
async function runSearch(questions) {
  if (!isConfigured()) {
    const err = new Error('TAVILY_API_KEY is not configured - web search is unavailable');
    err.code = 'SEARCH_NOT_CONFIGURED';
    throw err;
  }

  const allResults = [];
  for (const q of questions) {
    try {
      const results = await searchOne(q.question || q);
      allResults.push(...results);
    } catch (err) {
      // Continue with remaining questions even if one search fails
      // eslint-disable-next-line no-continue
      continue;
    }
  }

  const seen = new Map();
  for (const r of allResults) {
    if (!r.url) continue;
    const existing = seen.get(r.url);
    if (!existing || r.relevanceScore > existing.relevanceScore) {
      seen.set(r.url, { ...r, domain: domainOf(r.url) });
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

module.exports = { runSearch, isConfigured };
