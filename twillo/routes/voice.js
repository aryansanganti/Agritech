/**
 * Twilio Voice Webhook Routes
 * Handles incoming voice calls and speech processing
 */

const express = require('express');
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const { recognizeIntent, extractEntities, detectLanguage } = require('../services/intentRecognition');
const { generateResponse, getFollowUpQuestion, getMainMenu } = require('../services/responseGenerator');
const { 
  initCallState, 
  updateCallState, 
  addToTranscript, 
  getCallState,
  setPendingAction,
  clearPendingAction,
  updateContext,
  setQuestionAsked
} = require('../services/conversationState');
const { logCall, logTranscript, logError, logIntentRecognition, logResponse } = require('../utils/logger');

const router = express.Router();

// Middleware to parse Twilio webhook data
router.use(express.urlencoded({ extended: true }));

/**
 * POST /voice - Initial call handler
 * Greets caller and asks for language preference
 */
router.post('/', (req, res) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  
  // Initialize call state
  initCallState(callSid, {
    callerNumber: from
  });

  logCall(callSid, 'call_started', { from });

  const response = new VoiceResponse();
  
  // Greeting and language selection
  response.say({
    voice: 'alice',
    language: 'hi-IN'
  }, 'Namaste! BHUMI mein aapka swagat hai. Aap Hindi mein baat karna chahenge ya English mein?');

  // Gather speech input for language selection
  const gather = response.gather({
    input: 'speech',
    timeout: 5,
    language: 'hi-IN',
    speechTimeout: 'auto',
    action: '/voice/process-language',
    method: 'POST'
  });

  // If no input, repeat
  response.say({
    voice: 'alice',
    language: 'hi-IN'
  }, 'Kripya Hindi ya English boliye.');

  response.redirect('/voice/process-language');

  res.type('text/xml');
  res.send(response.toString());
});

/**
 * POST /voice/process-language - Process language selection
 */
router.post('/process-language', (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult || '';
  
  logTranscript(callSid, 'user', speechResult);

  // Detect language from user response
  const language = detectLanguage(speechResult);
  
  // Update call state with language
  updateCallState(callSid, { language });
  
  logCall(callSid, 'language_selected', { language, speechResult });

  const response = new VoiceResponse();
  
  // Present main menu
  const mainMenuText = getMainMenu(language);
  response.say({
    voice: 'alice',
    language: language
  }, mainMenuText);

  addToTranscript(callSid, 'bot', mainMenuText);

  // Gather speech input for main menu selection
  const gather = response.gather({
    input: 'speech',
    timeout: 8,
    language: language,
    speechTimeout: 'auto',
    action: '/voice/process-speech',
    method: 'POST'
  });

  // If no input, ask again
  response.say({
    voice: 'alice',
    language: language
  }, language === 'hi-IN' 
    ? 'Kripya dobara boliye.' 
    : 'Please say again.');

  response.redirect('/voice/process-speech');

  res.type('text/xml');
  res.send(response.toString());
});

/**
 * POST /voice/process-speech - Process user speech and generate response
 */
router.post('/process-speech', (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult || '';
  
  if (!speechResult) {
    // No speech detected, ask to repeat
    const state = getCallState(callSid);
    const language = state?.language || 'hi-IN';
    
    const response = new VoiceResponse();
    response.say({
      voice: 'alice',
      language: language
    }, language === 'hi-IN' 
      ? 'Kshama karein, main aapki awaaz nahi sun sakta. Kripya dobara boliye.' 
      : 'Sorry, I could not hear you. Please say again.');
    
    const gather = response.gather({
      input: 'speech',
      timeout: 8,
      language: language,
      speechTimeout: 'auto',
      action: '/voice/process-speech',
      method: 'POST'
    });
    
    res.type('text/xml');
    res.send(response.toString());
    return;
  }

  logTranscript(callSid, 'user', speechResult);

  const state = getCallState(callSid);
  const language = state?.language || 'hi-IN';

  // Recognize intent
  const intentResult = recognizeIntent(speechResult);
  const entities = extractEntities(speechResult);

  logIntentRecognition(callSid, speechResult, intentResult, entities);

  // Update context
  updateContext(callSid, {
    previousIntent: state?.currentIntent,
    lastEntities: entities
  });

  updateCallState(callSid, {
    currentIntent: intentResult.intent
  });

  // Generate response
  const context = {
    previousIntent: state?.currentIntent,
    questionAsked: state?.questionAsked || false
  };

  let responseText = generateResponse(intentResult.intent, entities, language, context);

  // Handle special cases
  if (intentResult.intent === 'crop_health' && !state?.questionAsked) {
    setQuestionAsked(callSid, true);
  }

  logResponse(callSid, intentResult.intent, responseText, language);
  addToTranscript(callSid, 'bot', responseText);

  const response = new VoiceResponse();
  
  // Speak the response
  response.say({
    voice: 'alice',
    language: language,
    interruptible: true
  }, responseText);

  // Ask follow-up question
  const followUp = getFollowUpQuestion(language);
  response.say({
    voice: 'alice',
    language: language
  }, followUp);

  addToTranscript(callSid, 'bot', followUp);

  // Set pending action for SMS
  setPendingAction(callSid, 'sms');

  // Gather response for follow-up
  const gather = response.gather({
    input: 'speech',
    timeout: 5,
    language: language,
    speechTimeout: 'auto',
    action: '/voice/handle-followup',
    method: 'POST'
  });

  // If no response, continue
  response.say({
    voice: 'alice',
    language: language
  }, language === 'hi-IN' 
    ? 'Kya main aur kuch bata sakta hoon?' 
    : 'Can I help with anything else?');

  response.redirect('/voice/process-speech');

  res.type('text/xml');
  res.send(response.toString());
});

/**
 * POST /voice/handle-followup - Handle follow-up questions (SMS, continue, etc.)
 */
router.post('/handle-followup', (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult || '';
  
  logTranscript(callSid, 'user', speechResult);

  const state = getCallState(callSid);
  const language = state?.language || 'hi-IN';

  // Recognize yes/no
  const intentResult = recognizeIntent(speechResult);
  
  const response = new VoiceResponse();

  if (intentResult.intent === 'yes_response') {
    // User said yes to SMS
    if (state?.pendingAction === 'sms') {
      logCall(callSid, 'sms_requested', {});
      // TODO: Implement actual SMS sending via Twilio
      // For now, just log it
      
      response.say({
        voice: 'alice',
        language: language
      }, language === 'hi-IN' 
        ? 'Theek hai, main aapko SMS bhej raha hoon. Kya main aur kuch bata sakta hoon?' 
        : 'Okay, I am sending you an SMS. Can I help with anything else?');
      
      clearPendingAction(callSid);
      addToTranscript(callSid, 'bot', language === 'hi-IN' 
        ? 'Theek hai, main aapko SMS bhej raha hoon.' 
        : 'Okay, I am sending you an SMS.');
    } else if (state?.pendingAction === 'transfer') {
      // Transfer to expert (for emergency cases)
      logCall(callSid, 'transfer_requested', {});
      response.say({
        voice: 'alice',
        language: language
      }, language === 'hi-IN' 
        ? 'Ek minute, main aapko expert se jod raha hoon.' 
        : 'One minute, I am connecting you to an expert.');
      
      // TODO: Implement actual call transfer via Twilio
      // response.dial({ callerId: state.callerNumber }, '+91XXXXXXXXXX');
      
      clearPendingAction(callSid);
    } else {
      // Generic yes response
      response.say({
        voice: 'alice',
        language: language
      }, language === 'hi-IN' 
        ? 'Theek hai. Kya main aur kuch bata sakta hoon?' 
        : 'Okay. Can I help with anything else?');
    }
  } else if (intentResult.intent === 'no_response') {
    // User said no
    clearPendingAction(callSid);
    response.say({
      voice: 'alice',
      language: language
    }, language === 'hi-IN' 
      ? 'Theek hai. Kya main aur kuch bata sakta hoon?' 
      : 'Okay. Can I help with anything else?');
  } else {
    // Unclear response
    response.say({
      voice: 'alice',
      language: language
    }, language === 'hi-IN' 
      ? 'Kya main aur kuch bata sakta hoon?' 
      : 'Can I help with anything else?');
  }

  // Continue conversation
  const gather = response.gather({
    input: 'speech',
    timeout: 8,
    language: language,
    speechTimeout: 'auto',
    action: '/voice/process-speech',
    method: 'POST'
  });

  // If no response, end call gracefully
  response.say({
    voice: 'alice',
    language: language
  }, language === 'hi-IN' 
    ? 'Dhanyawad! BHUMI aapki seva mein hamesha tayar hai. Namaste!' 
    : 'Thank you! BHUMI is always ready to serve you. Goodbye!');

  response.hangup();

  res.type('text/xml');
  res.send(response.toString());
});

/**
 * POST /voice/call-status - Handle call status updates
 */
router.post('/call-status', (req, res) => {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;

  logCall(callSid, 'call_status_update', { status: callStatus });

  if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer') {
    // Clean up call state
    const { clearCallState } = require('../services/conversationState');
    clearCallState(callSid);
    logCall(callSid, 'call_ended', { status: callStatus });
  }

  res.status(200).send('OK');
});

module.exports = router;
