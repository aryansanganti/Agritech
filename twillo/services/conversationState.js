/**
 * Conversation State Management
 * Tracks call state, context, and transcripts
 */

// In-memory storage for active calls
const activeCalls = new Map();

/**
 * Get call state for a given call SID
 * @param {string} callSid - Twilio Call SID
 * @returns {Object|null} - Call state object or null if not found
 */
function getCallState(callSid) {
  if (!callSid) return null;
  return activeCalls.get(callSid) || null;
}

/**
 * Initialize call state
 * @param {string} callSid - Twilio Call SID
 * @param {Object} initialState - Initial state object
 * @returns {Object} - Created call state
 */
function initCallState(callSid, initialState = {}) {
  const defaultState = {
    language: 'hi-IN',
    context: {},
    currentIntent: null,
    transcript: [],
    startTime: new Date(),
    pendingAction: null,
    questionAsked: false
  };

  const state = { ...defaultState, ...initialState };
  activeCalls.set(callSid, state);
  return state;
}

/**
 * Update call state
 * @param {string} callSid - Twilio Call SID
 * @param {Object} updates - Updates to apply
 * @returns {Object} - Updated call state
 */
function updateCallState(callSid, updates) {
  const currentState = getCallState(callSid);
  if (!currentState) {
    return initCallState(callSid, updates);
  }

  const updatedState = {
    ...currentState,
    ...updates,
    context: {
      ...currentState.context,
      ...(updates.context || {})
    }
  };

  activeCalls.set(callSid, updatedState);
  return updatedState;
}

/**
 * Add entry to conversation transcript
 * @param {string} callSid - Twilio Call SID
 * @param {string} role - 'user' or 'bot'
 * @param {string} text - Transcript text
 */
function addToTranscript(callSid, role, text) {
  const state = getCallState(callSid);
  if (!state) {
    initCallState(callSid);
  }

  const updatedState = updateCallState(callSid, {
    transcript: [
      ...(state?.transcript || []),
      {
        role,
        text,
        timestamp: new Date().toISOString()
      }
    ]
  });

  return updatedState;
}

/**
 * Set pending action (SMS, transfer, etc.)
 * @param {string} callSid - Twilio Call SID
 * @param {string} action - Action type ('sms', 'transfer', etc.)
 */
function setPendingAction(callSid, action) {
  return updateCallState(callSid, { pendingAction: action });
}

/**
 * Clear pending action
 * @param {string} callSid - Twilio Call SID
 */
function clearPendingAction(callSid) {
  return updateCallState(callSid, { pendingAction: null });
}

/**
 * Update conversation context
 * @param {string} callSid - Twilio Call SID
 * @param {Object} contextUpdates - Context updates
 */
function updateContext(callSid, contextUpdates) {
  const state = getCallState(callSid);
  if (!state) {
    initCallState(callSid);
  }

  return updateCallState(callSid, {
    context: {
      ...(state?.context || {}),
      ...contextUpdates
    }
  });
}

/**
 * Set question asked flag
 * @param {string} callSid - Twilio Call SID
 * @param {boolean} asked - Whether question was asked
 */
function setQuestionAsked(callSid, asked = true) {
  return updateCallState(callSid, { questionAsked: asked });
}

/**
 * Clear call state (when call ends)
 * @param {string} callSid - Twilio Call SID
 */
function clearCallState(callSid) {
  if (callSid) {
    activeCalls.delete(callSid);
  }
}

/**
 * Get all active calls (for monitoring)
 * @returns {Array} - Array of active call states
 */
function getAllActiveCalls() {
  return Array.from(activeCalls.entries()).map(([callSid, state]) => ({
    callSid,
    ...state,
    duration: Math.floor((new Date() - state.startTime) / 1000) // seconds
  }));
}

/**
 * Cleanup old calls (older than specified minutes)
 * @param {number} maxAgeMinutes - Maximum age in minutes (default: 60)
 */
function cleanupOldCalls(maxAgeMinutes = 60) {
  const now = new Date();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

  for (const [callSid, state] of activeCalls.entries()) {
    const age = now - state.startTime;
    if (age > maxAge) {
      activeCalls.delete(callSid);
    }
  }
}

// Cleanup old calls every 10 minutes
setInterval(() => {
  cleanupOldCalls();
}, 10 * 60 * 1000);

module.exports = {
  getCallState,
  initCallState,
  updateCallState,
  addToTranscript,
  setPendingAction,
  clearPendingAction,
  updateContext,
  setQuestionAsked,
  clearCallState,
  getAllActiveCalls,
  cleanupOldCalls
};
