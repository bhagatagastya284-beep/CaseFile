const OpenAI = require('openai');
const { detectPromptInjection } = require('./security/promptInjectionGuard');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.2');

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

async function withRetry(fn, retries = 2, delayMs = 800) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

/**
 * Calls the chat model and returns parsed JSON.
 * Throws if OPENAI_API_KEY is not configured - callers should catch and fall back gracefully.
 */
async function completeJSON({ system, user, temperature }) {
  if (!client) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
 const injectionCheck = detectPromptInjection(user);

    if (injectionCheck.detected) {
        throw new Error(injectionCheck.reason);
    }

  return withRetry(async () => {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: temperature !== undefined ? temperature : OPENAI_TEMPERATURE,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });

    const raw = response.choices[0].message.content;
    return JSON.parse(raw);
  });
}

async function completeText({ system, user, temperature }) {
  if (!client) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  const injectionCheck = detectPromptInjection(user);
  if (injectionCheck.detected) {
        throw new Error(injectionCheck.reason);
    }

  return withRetry(async () => {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: temperature !== undefined ? temperature : OPENAI_TEMPERATURE,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });

    return response.choices[0].message.content;
  });
}

module.exports = { completeJSON, completeText, isConfigured: () => Boolean(client) };
