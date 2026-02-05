/**
 * Intent Recognition Service
 * Keyword-based intent matching (no AI)
 */

const intentPatterns = {
  weather_rain: {
    keywords: ['rain', 'barish', 'baarish', 'barsaat', 'rainfall'],
    confidence: 0.8
  },
  weather_general: {
    keywords: ['weather', 'mausam', 'climate', 'temperature', 'temp'],
    confidence: 0.7
  },
  mandi_price: {
    keywords: ['price', 'rate', 'keemat', 'bhav', 'tomato', 'onion', 'tamatar', 'pyaz', 'grapes', 'angur', 'sugarcane', 'ganna', 'cost', 'kitna'],
    confidence: 0.9
  },
  mandi_status: {
    keywords: ['mandi', 'open', 'khuli', 'band', 'closed', 'timing', 'kab'],
    confidence: 0.85
  },
  water_irrigation: {
    keywords: ['water', 'pani', 'sinchai', 'irrigation', 'de sakta', 'de sakte', 'dijiye'],
    confidence: 0.8
  },
  crop_health: {
    keywords: ['disease', 'bimari', 'yellow', 'peela', 'insect', 'keeda', 'patte', 'dhabbe', 'problem', 'samasya', 'fasal'],
    confidence: 0.85
  },
  seed_advice: {
    keywords: ['seed', 'beej', 'sow', 'bona', 'variety', 'abhi kya bo', 'kya bo', 'sowing', 'planting'],
    confidence: 0.8
  },
  emergency: {
    keywords: ['urgent', 'emergency', 'help', 'madad', 'barbad', 'destroy', 'jala', 'fire', 'crisis'],
    confidence: 1.0
  },
  language_selection: {
    keywords: ['hindi', 'english', 'marathi', 'gujarati'],
    confidence: 0.9
  },
  yes_response: {
    keywords: ['yes', 'haan', 'hain', 'ok', 'theek', 'sahi', 'bilkul'],
    confidence: 0.9
  },
  no_response: {
    keywords: ['no', 'nahi', 'na', 'nope', 'mat'],
    confidence: 0.9
  }
};

/**
 * Recognize intent from speech text using keyword matching
 * @param {string} speechText - The transcribed speech text
 * @returns {Object} - { intent: string, confidence: number }
 */
function recognizeIntent(speechText) {
  if (!speechText || typeof speechText !== 'string') {
    return { intent: 'unknown', confidence: 0 };
  }

  const text = speechText.toLowerCase().trim();
  let bestMatch = { intent: 'unknown', confidence: 0 };

  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    const matchedKeywords = pattern.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const confidence = (matchedKeywords.length / pattern.keywords.length) * pattern.confidence;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence };
      }
    }
  }

  // If confidence is too low, return unknown
  if (bestMatch.confidence < 0.3) {
    return { intent: 'unknown', confidence: 0 };
  }

  return bestMatch;
}

/**
 * Extract entities (crop names, locations, symptoms) from speech text
 * @param {string} speechText - The transcribed speech text
 * @returns {Object} - { crop: string|null, location: string|null, symptom: string|null }
 */
function extractEntities(speechText) {
  if (!speechText || typeof speechText !== 'string') {
    return { crop: null, location: null, symptom: null };
  }

  const text = speechText.toLowerCase();
  const entities = {
    crop: null,
    location: null,
    symptom: null
  };

  // Crop names mapping (English -> Hindi)
  const cropMap = {
    'tomato': 'Tomato',
    'tamatar': 'Tomato',
    'onion': 'Onion',
    'pyaz': 'Onion',
    'sugarcane': 'Sugarcane',
    'ganna': 'Sugarcane',
    'grapes': 'Grapes',
    'angur': 'Grapes',
    'potato': 'Potato',
    'aloo': 'Potato',
    'paddy': 'Paddy',
    'dhan': 'Paddy',
    'rice': 'Paddy'
  };

  // Location names
  const locations = ['nashik', 'mumbai', 'pune', 'delhi', 'bangalore', 'hyderabad'];

  // Symptoms
  const symptoms = ['yellow', 'peela', 'dhabbe', 'spots', 'rot', 'sad', 'mara', 'dead', 'insect', 'keeda'];

  // Extract crop
  for (const [key, value] of Object.entries(cropMap)) {
    if (text.includes(key)) {
      entities.crop = value;
      break;
    }
  }

  // Extract location
  for (const loc of locations) {
    if (text.includes(loc)) {
      entities.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // Extract symptom
  for (const symptom of symptoms) {
    if (text.includes(symptom)) {
      entities.symptom = symptom;
      break;
    }
  }

  return entities;
}

/**
 * Detect language from speech text
 * @param {string} speechText - The transcribed speech text
 * @returns {string} - Language code ('hi-IN' or 'en-IN')
 */
function detectLanguage(speechText) {
  if (!speechText) return 'hi-IN';

  const text = speechText.toLowerCase();
  
  // Hindi patterns
  const hindiPatterns = ['hindi', 'हिंदी', 'hindi mein'];
  // English patterns
  const englishPatterns = ['english', 'angrezi', 'english mein'];

  for (const pattern of hindiPatterns) {
    if (text.includes(pattern)) {
      return 'hi-IN';
    }
  }

  for (const pattern of englishPatterns) {
    if (text.includes(pattern)) {
      return 'en-IN';
    }
  }

  // Default to Hindi
  return 'hi-IN';
}

module.exports = {
  recognizeIntent,
  extractEntities,
  detectLanguage,
  intentPatterns
};
