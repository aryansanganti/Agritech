/**
 * TwiML helpers: sanitize text for use in Twilio Say verb (XML/TTS-safe).
 */

const MIN_LENGTH = 10;

/**
 * Sanitize text for TwiML Say verb so it is valid XML and TTS-friendly.
 * @param {string} text - Raw text (from AI or response generator)
 * @param {string} language - 'hi-IN' or 'en-IN' for fallback phrase
 * @returns {string} - Non-empty, XML-safe string safe to pass to response.say()
 */
function sanitizeForTwiML(text, language = 'hi-IN') {
  if (text == null || typeof text !== 'string') {
    return getFallbackPhrase(language);
  }

  let out = text
    .replace(/&/g, ' and ')
    .replace(/</g, ' ')
    .replace(/>/g, ' ')
    .replace(/"/g, ' ')
    .replace(/'/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (out.length < MIN_LENGTH) {
    return getFallbackPhrase(language);
  }

  return out;
}

function getFallbackPhrase(language) {
  return language === 'hi-IN'
    ? 'Kripya dobara boliye.'
    : 'Please say again.';
}

module.exports = {
  sanitizeForTwiML,
  getFallbackPhrase
};
