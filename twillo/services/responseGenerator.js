/**
 * Response Generator Service
 * Hardcoded response templates based on intents
 */

const weatherData = require('../data/mock_weather.json');
const mandiData = require('../data/mock_mandi.json');
const diseaseData = require('../data/mock_diseases.json');
const seedData = require('../data/mock_seeds.json');

/**
 * Generate response based on intent, entities, and language
 * @param {string} intent - The recognized intent
 * @param {Object} entities - Extracted entities (crop, location, symptom)
 * @param {string} language - Language code ('hi-IN' or 'en-IN')
 * @param {Object} context - Conversation context (optional)
 * @returns {string} - Response text
 */
function generateResponse(intent, entities = {}, language = 'hi-IN', context = {}) {
  const responses = {
    weather_rain: {
      'hi-IN': () => {
        const location = entities.location || 'Nashik';
        const weather = weatherData[location] || weatherData['Nashik'];
        return `Haan, ${weather.forecast.afternoon.toLowerCase()}. ${weather.forecast.advisory}.`;
      },
      'en-IN': () => {
        const location = entities.location || 'Nashik';
        const weather = weatherData[location] || weatherData['Nashik'];
        return `Yes, ${weather.forecast.afternoon}. ${weather.forecast.advisory}.`;
      }
    },
    
    weather_general: {
      'hi-IN': () => {
        const location = entities.location || 'Nashik';
        const weather = weatherData[location] || weatherData['Nashik'];
        return `Aaj ka mausam ${location} mein: Subah ${weather.forecast.morning.toLowerCase()}, dopahar mein ${weather.forecast.afternoon.toLowerCase()}. Temperature ${weather.forecast.temperature} hai. ${weather.forecast.advisory}.`;
      },
      'en-IN': () => {
        const location = entities.location || 'Nashik';
        const weather = weatherData[location] || weatherData['Nashik'];
        return `Today's weather in ${location}: Morning ${weather.forecast.morning}, afternoon ${weather.forecast.afternoon}. Temperature is ${weather.forecast.temperature}. ${weather.forecast.advisory}.`;
      }
    },
    
    mandi_price: {
      'hi-IN': () => {
        const location = entities.location || 'Nashik';
        const crop = entities.crop || 'Tomato';
        const mandi = mandiData[location] || mandiData['Nashik'];
        
        // Try to find crop in mandi data (check both English and Hindi names)
        let cropData = mandi.crops[crop];
        if (!cropData) {
          // Try alternative names
          const cropAlternatives = {
            'Tomato': ['Tamatar'],
            'Onion': ['Pyaz'],
            'Grapes': ['Angur'],
            'Sugarcane': ['Ganna']
          };
          const alternatives = cropAlternatives[crop] || [];
          for (const alt of alternatives) {
            if (mandi.crops[alt]) {
              cropData = mandi.crops[alt];
              break;
            }
          }
        }
        
        if (!cropData) {
          return `${location} Mandi mein ${crop} ki keemat abhi available nahi hai. Kripya kisi aur crop ka naam bataiye.`;
        }
        
        const price = cropData.price;
        const unit = cropData.unit;
        const trend = cropData.trend === 'up' ? 'badh rahi hai' : cropData.trend === 'down' ? 'ghat rahi hai' : 'stable hai';
        
        return `${location} Mandi mein ${crop} ₹${price} per ${unit} hai. Keemat ${trend}. Mandi ${mandi.status}.`;
      },
      'en-IN': () => {
        const location = entities.location || 'Nashik';
        const crop = entities.crop || 'Tomato';
        const mandi = mandiData[location] || mandiData['Nashik'];
        
        let cropData = mandi.crops[crop];
        if (!cropData) {
          const cropAlternatives = {
            'Tomato': ['Tamatar'],
            'Onion': ['Pyaz'],
            'Grapes': ['Angur'],
            'Sugarcane': ['Ganna']
          };
          const alternatives = cropAlternatives[crop] || [];
          for (const alt of alternatives) {
            if (mandi.crops[alt]) {
              cropData = mandi.crops[alt];
              break;
            }
          }
        }
        
        if (!cropData) {
          return `Price for ${crop} in ${location} Mandi is not available right now. Please tell me another crop name.`;
        }
        
        const price = cropData.price;
        const unit = cropData.unit;
        const trend = cropData.trend === 'up' ? 'increasing' : cropData.trend === 'down' ? 'decreasing' : 'stable';
        
        return `In ${location} Mandi, ${crop} is ₹${price} per ${unit}. Price is ${trend}. Mandi ${mandi.status}.`;
      }
    },
    
    mandi_status: {
      'hi-IN': () => {
        const location = entities.location || 'Nashik';
        const mandi = mandiData[location] || mandiData['Nashik'];
        return `Haan, ${location} Mandi ${mandi.status}.`;
      },
      'en-IN': () => {
        const location = entities.location || 'Nashik';
        const mandi = mandiData[location] || mandiData['Nashik'];
        return `Yes, ${location} Mandi ${mandi.status}.`;
      }
    },
    
    water_irrigation: {
      'hi-IN': () => {
        return "Mitti mein nami theek hai. Do din baad pani dijiye. Agar mitti sukhi lag rahi hai, to kal subah pani de sakte hain.";
      },
      'en-IN': () => {
        return "Soil moisture is good. Water after two days. If soil feels dry, you can water tomorrow morning.";
      }
    },
    
    crop_health: {
      'hi-IN': () => {
        if (context.previousIntent === 'crop_health' && context.questionAsked) {
          // Follow-up question was asked, provide diagnosis
          if (entities.symptom) {
            if (entities.symptom.includes('yellow') || entities.symptom.includes('peela')) {
              return "Yeh Early Blight ya Nitrogen deficiency ho sakta hai. Mancozeb dawai ka spray karein, 2 gram per liter. Agar patti ke beech mein dhabbe hain, to Early Blight hai. Kya main detailed jaankari SMS par bhejoon?";
            } else if (entities.symptom.includes('rot')) {
              return "Yeh root rot lag raha hai. Soil mein pani jam raha hai kya? Trichoderma dawai use karein, 5 gram per liter. Kya main detailed jaankari SMS par bhejoon?";
            }
          }
          return "Mujhe aur details chahiye. Kya patti peela hai ya fruit mein problem hai?";
        }
        return "Mujhe bataiye, patti ka kinara peela hai ya beech mein dhabbe? Kya koi keeda dikh raha hai?";
      },
      'en-IN': () => {
        if (context.previousIntent === 'crop_health' && context.questionAsked) {
          if (entities.symptom) {
            if (entities.symptom.includes('yellow') || entities.symptom.includes('peela')) {
              return "This could be Early Blight or Nitrogen deficiency. Spray Mancozeb medicine, 2 grams per liter. If there are spots in the middle of leaves, it's Early Blight. Should I send detailed information via SMS?";
            } else if (entities.symptom.includes('rot')) {
              return "This looks like root rot. Is water logging in the soil? Use Trichoderma medicine, 5 grams per liter. Should I send detailed information via SMS?";
            }
          }
          return "I need more details. Are the leaves yellow or is there a problem with the fruit?";
        }
        return "Please tell me, are the leaf edges yellow or are there spots in the middle? Do you see any insects?";
      }
    },
    
    seed_advice: {
      'hi-IN': () => {
        const location = entities.location || 'Nashik';
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
        
        // Map location to region
        let region = 'Nashik';
        if (location === 'Mumbai' || location === 'Pune') {
          region = 'Western_Ghats';
        }
        
        // Get seed recommendations (simplified - using February for now)
        const monthKey = currentMonth === 'June' ? 'June' : 'February';
        const regionData = seedData.regions[region] || seedData.regions['Nashik'];
        const monthData = regionData[monthKey] || regionData['February'];
        
        if (monthData && monthData.crops.length > 0) {
          const crops = monthData.crops.slice(0, 2).map(c => c.name).join(' ya ');
          return `Aap ${location} mein hain aur ${monthKey} mahina hai. ${crops} sabse achha hoga. Beej chahiye?`;
        }
        
        return `Aap ${location} mein hain. Kripya bataiye ki aap kya ugana chahte hain, main aapko beej ki salah dunga.`;
      },
      'en-IN': () => {
        const location = entities.location || 'Nashik';
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
        
        let region = 'Nashik';
        if (location === 'Mumbai' || location === 'Pune') {
          region = 'Western_Ghats';
        }
        
        const monthKey = currentMonth === 'June' ? 'June' : 'February';
        const regionData = seedData.regions[region] || seedData.regions['Nashik'];
        const monthData = regionData[monthKey] || regionData['February'];
        
        if (monthData && monthData.crops.length > 0) {
          const crops = monthData.crops.slice(0, 2).map(c => c.name).join(' or ');
          return `You are in ${location} and it's ${monthKey} month. ${crops} would be best. Do you need seeds?`;
        }
        
        return `You are in ${location}. Please tell me what you want to grow, I will give you seed advice.`;
      }
    },
    
    emergency: {
      'hi-IN': () => {
        return "Yeh urgent lag raha hai. Kya main aapko Krishi Mitra expert se jod doon? Haan bolne par main aapko transfer kar dunga.";
      },
      'en-IN': () => {
        return "This seems urgent. Should I connect you to a Krishi Mitra expert? Say yes and I will transfer you.";
      }
    },
    
    yes_response: {
      'hi-IN': () => {
        if (context.pendingAction === 'sms') {
          return "Theek hai, main aapko SMS bhej raha hoon. Kya main aur kuch bata sakta hoon?";
        }
        if (context.pendingAction === 'transfer') {
          return "Ek minute, main aapko expert se jod raha hoon.";
        }
        return "Theek hai. Kya main aur kuch bata sakta hoon?";
      },
      'en-IN': () => {
        if (context.pendingAction === 'sms') {
          return "Okay, I'm sending you an SMS. Can I help with anything else?";
        }
        if (context.pendingAction === 'transfer') {
          return "One minute, I'm connecting you to an expert.";
        }
        return "Okay. Can I help with anything else?";
      }
    },
    
    no_response: {
      'hi-IN': () => {
        return "Theek hai. Kya main aur kuch bata sakta hoon?";
      },
      'en-IN': () => {
        return "Okay. Can I help with anything else?";
      }
    },
    
    unknown: {
      'hi-IN': () => {
        return "Kshama karein, main samajh nahi paya. Kya aap janna chahte hain: Aaj ka mausam, Mandi ki keemat, Fasal ki samasya, ya Beej ki salah?";
      },
      'en-IN': () => {
        return "Sorry, I didn't understand. What would you like to know: Today's weather, Mandi prices, Crop problem, or Seed advice?";
      }
    }
  };

  const handler = responses[intent]?.[language];
  if (handler) {
    return handler();
  }

  // Fallback
  return responses.unknown[language]();
}

/**
 * Get follow-up question for SMS
 * @param {string} language - Language code
 * @returns {string} - Follow-up question
 */
function getFollowUpQuestion(language = 'hi-IN') {
  const questions = {
    'hi-IN': "Kya main yeh jaankari aapke phone par SMS bhejoon?",
    'en-IN': "Should I send this information to your phone via SMS?"
  };
  return questions[language] || questions['hi-IN'];
}

/**
 * Get main menu prompt
 * @param {string} language - Language code
 * @returns {string} - Main menu text
 */
function getMainMenu(language = 'hi-IN') {
  const menus = {
    'hi-IN': "Namaste! Bhumi mein aapka swagat hai. Kya aap janna chahte hain: Aaj ka mausam, Mandi ki keemat, Fasal ki samasya, ya Beej ki salah?",
    'en-IN': "Namaste! Welcome to Bhumi. What would you like to know: Today's weather, Mandi prices, Crop problem, or Seed advice?"
  };
  return menus[language] || menus['hi-IN'];
}

module.exports = {
  generateResponse,
  getFollowUpQuestion,
  getMainMenu
};
