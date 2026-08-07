const axios = require('axios');
const cheerio = require('cheerio');

const STRIP_SELECTORS = [
  'nav', 'header', 'footer', 'script', 'style', 'noscript', 'iframe', 'svg',
  '.ad', '.ads', '.advertisement', '.comments', '#comments', '.comment',
  '.sidebar', '.nav', '.menu', '.cookie', '.newsletter', '.popup'
];

async function readWebsite(url) {
  const response = await axios.get(url, {
    timeout: 15000,
    maxContentLength: 5 * 1024 * 1024,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CasefileBot/1.0; +research-agent)' }
  });

  const $ = cheerio.load(response.data);

  STRIP_SELECTORS.forEach((sel) => $(sel).remove());

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').first().text() ||
    $('h1').first().text() ||
    '';

  const author =
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    '';

  const publishedDate =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    $('time').first().attr('datetime') ||
    '';

  const bodyCandidates = ['article', 'main', '[role="main"]', 'body'];
  let bodyText = '';
  for (const sel of bodyCandidates) {
    const text = $(sel).first().text().replace(/\s+/g, ' ').trim();
    if (text.length > bodyText.length) bodyText = text;
  }

  const links = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('http') && links.length < 25) links.push(href);
  });

  return {
    title: title.trim(),
    author: author.trim(),
    publishedDate: publishedDate.trim(),
    body: bodyText.slice(0, 20000),
    links
  };
}

module.exports = { readWebsite };
