/**
 * Groq AI Service
 * Uses Llama 3.3 70B Versatile for natural language responses.
 * Free tier: https://console.groq.com
 */

const Groq = require('groq-sdk');
const weatherData = require('../data/mock_weather.json');
const mandiData = require('../data/mock_mandi.json');
const diseaseData = require('../data/mock_diseases.json');
const seedData = require('../data/mock_seeds.json');

const MODEL = 'llama-3.3-70b-versatile';
const MAX_RESPONSE_CHARS = 250;
const MIN_CLEAN_LENGTH = 10;

let groqClient = null;

function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Get intent-specific data block (only relevant JSON to reduce noise).
 */
function getDataBlockForIntent(intent) {
  const weatherIntents = ['weather_rain', 'weather_general'];
  const mandiIntents = ['mandi_price', 'mandi_status'];
  const cropIntents = ['crop_health'];
  const seedIntents = ['seed_advice'];
  const emergencyIntents = ['emergency'];

  if (weatherIntents.includes(intent)) {
    return `### Weather (today):\n${JSON.stringify(weatherData, null, 2)}`;
  }
  if (mandiIntents.includes(intent)) {
    return `### Mandi prices:\n${JSON.stringify(mandiData, null, 2)}`;
  }
  if (cropIntents.includes(intent)) {
    return `### Crop diseases and treatments:\n${JSON.stringify(diseaseData, null, 2)}`;
  }
  if (seedIntents.includes(intent)) {
    return `### Seed recommendations by region/month:\n${JSON.stringify(seedData, null, 2)}`;
  }
  if (emergencyIntents.includes(intent)) {
    return '';
  }
  // unknown or other: send all data
  return `
### Weather:\n${JSON.stringify(weatherData, null, 2)}
### Mandi:\n${JSON.stringify(mandiData, null, 2)}
### Diseases:\n${JSON.stringify(diseaseData, null, 2)}
### Seeds:\n${JSON.stringify(seedData, null, 2)}`;
}

/**
 * Get one-line intent-specific instruction for the model.
 */
function getIntentInstruction(intent) {
  const instructions = {
    weather_rain: 'The user is asking about rain. Reply only with today\'s rain forecast and advisory from the data.',
    weather_general: 'The user is asking about weather. Reply only with today\'s weather and advisory from the data.',
    mandi_price: 'The user is asking about crop price. Reply only with the price and trend from the data. Use ₹ and kilo or quintal.',
    mandi_status: 'The user is asking if mandi is open. Reply only with mandi status from the data.',
    water_irrigation: 'The user is asking about water or irrigation. Give one short practical tip.',
    crop_health: 'The user is describing a crop problem. Either ask one short clarifying question, or give one short treatment from the data.',
    seed_advice: 'The user is asking what to sow. Reply only with seed recommendations from the data for their region/month.',
    emergency: 'The user seems in urgent need. Say you can connect them to an expert and ask if they want that. No data needed.'
  };
  return instructions[intent] || 'Answer in 1-2 short sentences using only the data below.';
}

/**
 * Build strict system prompt with intent-specific data only.
 */
function buildSystemPrompt(language, intent) {
  const langNote = language === 'en-IN'
    ? 'Reply in English only, in a way that can be read aloud by TTS.'
    : 'Reply in Hindi only (Roman or Devanagari), in a way that can be read aloud by TTS.';

  const dataBlock = getDataBlockForIntent(intent);
  const intentLine = getIntentInstruction(intent);

  return `You are BHUMI, a voice assistant for Indian farmers. The caller will ask about weather, mandi prices, crop problems, or seeds.

## Rules
- Answer in 1-2 short sentences only. Use ONLY the facts and numbers from the data below. Do not invent any price, weather, or treatment.
- Do not say hello again. Do not say "as per the data". Just state the answer.
- Do NOT include "Kya main SMS bhejoon?" in your reply; that is asked separately.
- Output plain text only: no markdown, no bullet points, no labels.

${langNote}

## This turn
${intentLine}

${dataBlock ? `## Data\n${dataBlock}` : ''}`;
}

/**
 * Stricter cleaning for TTS: strip markdown, fix XML-unsafe chars, cap length.
 */
function cleanAIOutput(content) {
  if (!content || typeof content !== 'string') return '';
  let out = content
    .replace(/#+/g, ' ')
    .replace(/\*+/g, ' ')
    .replace(/[-•·]\s*/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/</g, ' ')
    .replace(/>/g, ' ')
    .trim();
  return out.slice(0, MAX_RESPONSE_CHARS);
}

/**
 * Get AI response from Groq Llama 3.3 70B Versatile.
 * @param {string} userMessage - What the farmer said (transcribed speech)
 * @param {string} language - 'hi-IN' or 'en-IN'
 * @param {Array} transcript - Recent conversation [{ role, text }, ...]
 * @param {string} intent - Recognized intent for focused data and instruction
 * @returns {Promise<string|null>} - Response text or null on error/disabled/unusable
 */
async function getAIResponse(userMessage, language = 'hi-IN', transcript = [], intent = 'unknown') {
  const client = getClient();
  if (!client) return null;

  const systemPrompt = buildSystemPrompt(language, intent);

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  const recent = transcript.slice(-4);
  for (const entry of recent) {
    messages.push({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: entry.text
    });
  }

  const userContent = `${userMessage}\n\nReply in 1-2 short sentences only. No preamble.`;
  messages.push({ role: 'user', content: userContent });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 150,
      temperature: 0.1
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') return null;

    const cleaned = cleanAIOutput(content);
    if (cleaned.length < MIN_CLEAN_LENGTH) return null;

    return cleaned;
  } catch (err) {
    console.error('[Groq] Error:', err.message);
    return null;
  }
}

function isEnabled() {
  return Boolean(process.env.GROQ_API_KEY);
}

module.exports = {
  getAIResponse,
  isEnabled,
  MODEL
};
