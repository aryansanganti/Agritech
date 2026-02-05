/**
 * Logger Utility
 * Logs call events and transcripts
 */

/**
 * Log a call event
 * @param {string} callSid - Twilio Call SID
 * @param {string} event - Event type (e.g., 'call_started', 'intent_recognized', 'call_ended')
 * @param {Object} data - Additional event data
 */
function logCall(callSid, event, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    callSid,
    event,
    ...data
  };

  console.log(`[CALL LOG] ${timestamp} | ${callSid} | ${event}`, JSON.stringify(data, null, 2));
  
  // TODO: In future, can extend to write to file or database
  // Example: fs.appendFileSync('logs/calls.log', JSON.stringify(logEntry) + '\n');
}

/**
 * Log conversation transcript entry
 * @param {string} callSid - Twilio Call SID
 * @param {string} role - 'user' or 'bot'
 * @param {string} text - Transcript text
 */
function logTranscript(callSid, role, text) {
  const timestamp = new Date().toISOString();
  console.log(`[TRANSCRIPT] ${timestamp} | ${callSid} | ${role.toUpperCase()}: ${text}`);
  
  // TODO: In future, can extend to write to file or database
}

/**
 * Log error
 * @param {string} callSid - Twilio Call SID (optional)
 * @param {string} error - Error message
 * @param {Error} err - Error object (optional)
 */
function logError(callSid, error, err = null) {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] ${timestamp} | ${callSid || 'SYSTEM'} | ${error}`);
  if (err) {
    console.error(err.stack);
  }
}

/**
 * Log intent recognition
 * @param {string} callSid - Twilio Call SID
 * @param {string} speechText - User's speech text
 * @param {Object} intentResult - Intent recognition result
 * @param {Object} entities - Extracted entities
 */
function logIntentRecognition(callSid, speechText, intentResult, entities) {
  logCall(callSid, 'intent_recognized', {
    speechText,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities
  });
}

/**
 * Log response generation
 * @param {string} callSid - Twilio Call SID
 * @param {string} intent - Recognized intent
 * @param {string} response - Generated response
 * @param {string} language - Language code
 */
function logResponse(callSid, intent, response, language) {
  logCall(callSid, 'response_generated', {
    intent,
    response,
    language,
    responseLength: response.length
  });
}

module.exports = {
  logCall,
  logTranscript,
  logError,
  logIntentRecognition,
  logResponse
};
