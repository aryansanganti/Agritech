# BHUMI Voice Assistant - Product Requirements Document (PRD)

## Executive Summary

**Product Name:** BHUMI (Bharat Unified Mandi Intelligence)  
**Version:** 1.0  
**Date:** February 6, 2026  
**Owner:** Agriculture Tech Team

**Mission:** Enable offline-capable voice-based agricultural assistance for Indian farmers using phone calls, providing weather, mandi prices, crop health diagnostics, and emergency support in regional languages.

---

## 1. Problem Statement

### Current Challenges
- Farmers lack internet connectivity in rural areas
- Low digital literacy makes app usage difficult
- Time-sensitive agricultural decisions (weather, pest control, market prices)
- Language barriers prevent effective information access
- Need for immediate expert consultation during crop emergencies

### Solution
A voice-first AI assistant accessible via regular phone calls (no smartphone/internet required on farmer's end) that provides:
- Daily agricultural information (weather, mandi prices)
- Crop health diagnostics through conversational Q&A
- Seed/sowing recommendations
- Emergency routing to human experts

---

## 2. System Architecture Overview

```
┌─────────────────┐
│  Farmer's Phone │ (No Internet Required)
│  (Basic Mobile) │
└────────┬────────┘
         │
         │ Voice Call (Regular Telecom)
         │
         ▼
┌─────────────────────────────────────────┐
│         Twilio Voice Gateway            │
│  (Phone Number: +91-XXXX-XXXXXX)        │
│                                         │
│  • Receives incoming calls              │
│  • Converts Speech-to-Text (STT)       │
│  • Converts Text-to-Speech (TTS)       │
│  • Handles Hindi/English/Regional      │
└────────┬────────────────────────────────┘
         │
         │ WebSocket Connection
         │
         ▼
┌─────────────────────────────────────────┐
│      Express.js Backend Server          │
│         (Running on ngrok)              │
│                                         │
│  • WebSocket Handler                    │
│  • Intent Recognition Engine            │
│  • Mock Database Layer                  │
│  • Response Generator                   │
└────────┬────────────────────────────────┘
         │
         │ REST API / WebSocket
         │
         ▼
┌─────────────────────────────────────────┐
│       React Admin Dashboard             │
│                                         │
│  • Real-time Call Monitoring            │
│  • Conversation Logs                    │
│  • Analytics & Metrics                  │
│  • Manual Agent Takeover                │
└─────────────────────────────────────────┘
```

---

## 3. Technical Stack (FREE/FREEMIUM TOOLS)

### 3.1 Backend
- **Node.js + Express.js**: API server
- **Twilio Free Trial**: Voice calling ($15 credit - ~450 minutes)
  - Programmable Voice API
  - Built-in TTS (Amazon Polly / Google TTS)
  - Built-in STT (Google Speech Recognition)
  - Media Streams (WebSocket)
- **ngrok Free**: Public URL for local development
- **WebSocket (ws library)**: Real-time bidirectional communication
- **Mock Database**: JSON files (no real DB for POC)

### 3.2 Frontend
- **React 18**: UI framework
- **Vite**: Build tool (fast dev experience)
- **Tailwind CSS**: Styling
- **WebSocket Client**: Real-time updates

### 3.3 Language & AI
- **Mock Intent Engine**: Simple keyword matching (no AI costs)
- **Hardcoded Response Templates**: For each intent

---

## 4. Core Features & User Flows

### 4.1 Call Flow Architecture

```
Call Initiated → Language Detection → Intent Recognition → Response → Follow-up
```

#### **Step 1: Call Initiated**
```
Farmer dials: +91-XXXX-XXXXXX
├─ Twilio receives call
├─ Establishes WebSocket to Node.js backend
└─ TTS speaks greeting
```

**Bot (TTS):**  
> "Namaste! Welcome to BHUMI. Aap Hindi mein baat karna chahenge ya English mein?"

**Expected Response:**
- "Hindi" → Set language = 'hi'
- "English" → Set language = 'en'

---

#### **Step 2: Main Menu**

**Bot:**  
> "Namaste! BHUMI mein aapka swagat hai. Kya aap janna chahte hain:
> - AJ KA MAUSAM (Today's Weather)
> - MANDI KI KIMMAT (Mandi Prices)
> - FASAL KI SAMASYA (Crop Problem)
> - BEEJ KI SALAH (Seed Advice)"

---

### 4.2 Intent Categories & Responses

#### **Intent 1: Daily Routine Questions**

| Farmer Question | Keywords Detected | Mock Response | Response Time |
|----------------|-------------------|---------------|---------------|
| "Kya aaj barish hogi?" | rain, barish, baarish | "Haan, dopahar 4 baje bhaari barish hone ki sambhavna hai. Aaj dawai na chidkein." | <5s |
| "Pani de sakta hoon?" | water, pani, sinchai | "Mitti mein nami theek hai. Do din baad pani dijiye." | <5s |
| "Tamatar ki keemat kya hai?" | price, keemat, [crop name] | "Nashik Mandi mein Tamatar ₹25 kilo hai. Paas ke shahar mein ₹28 kilo." | <5s |
| "Mandi khuli hai kya?" | mandi, open, khuli | "Haan, Nashik Mandi aaj shaam 6 baje tak khuli hai." | <5s |

**Implementation:**
```javascript
// Mock response function
function getDailyRoutineResponse(intent, entities) {
  const responses = {
    weather_rain: {
      hi: "Haan, dopahar 4 baje bhaari barish. Dawai na chidkein.",
      en: "Yes, heavy rain at 4 PM. Don't spray pesticides today."
    },
    crop_price: {
      hi: `${entities.city} Mandi mein ${entities.crop} ₹${entities.price} kilo hai.`,
      en: `In ${entities.city} Mandi, ${entities.crop} is ₹${entities.price}/kg.`
    }
  }
  return responses[intent][language];
}
```

---

#### **Intent 2: Crop Health (Doctor Mode)**

**Conversational Diagnosis Flow:**

```
Farmer: "Mere patte peele ho rahe hain"
  ↓
Bot: "Patti ka kinara peela hai ya beech mein dhabbe?"
  ↓
Farmer: "Beech mein dhabbe"
  ↓
Bot: (Pattern match: Yellow + Spots → Early Blight)
Bot: "Agar dhabbe bhoore hain, to yeh Early Blight ho sakta hai. 
     Kya main dawai ka naam aapke phone par bhejoon?"
  ↓
Farmer: "Haan"
  ↓
Bot: "Mancozeb dawai ka spray karein. WhatsApp par details bheji gayi."
```

**Clarifying Questions Database:**

| Symptom | Follow-up Questions | Disease Match |
|---------|---------------------|---------------|
| Yellow leaves | "Tip or middle spots?" | → Nitrogen deficiency / Blight |
| Fruit dropping | "Before or after flowering?" | → Pollination issue / Borer |
| Root rotting | "Is soil waterlogged?" | → Fungal infection |

---

#### **Intent 3: Seed/Sowing Planner**

**Context-Aware Recommendations:**

```
Farmer: "Abhi kya bo sakta hoon?"
  ↓
Bot fetches: User location = "Nashik" + Current month = "June"
  ↓
Database Query: Geography(Western Ghats) + Season(Monsoon) + Soil(Red)
  ↓
Bot: "Aap Western Ghats mein hain aur June mahina hai. 
     Black Pepper ya Dhan sabse achha hoga. Beej chahiye?"
```

**Mock Database Schema:**
```json
{
  "region": "Western_Ghats",
  "month": "June",
  "recommended_crops": [
    {
      "name": "Black Pepper",
      "variety": "Panniyur 1",
      "water_need": "High",
      "duration": "3 years"
    },
    {
      "name": "Paddy",
      "variety": "Pratap",
      "water_need": "Low (-30%)",
      "duration": "120 days"
    }
  ]
}
```

---

#### **Intent 4: Emergency Escalation**

**Trigger Keywords:** "urgent", "emergency", "destroy", "fire", "hailstorm", "talk to person"

```
Farmer: "Meri fasal barbad ho gayi hai"
  ↓
Bot: "Yeh urgent hai. Kya aap insurance helpline number chahte hain?"
  ↓
Farmer: "Haan" / "Kisi se baat karni hai"
  ↓
Bot: "Ek minute. Main aapko Krishi Mitra expert se jod raha hoon."
  ↓
[System transfers call to human agent via Twilio Queue]
```

---

### 4.3 "Easy Mode" Features

#### **Feature 1: Barge-In (Interrupt Handling)**

**Problem:** Bot is listing 10 mandi prices, farmer wants to stop.

**Solution:** Twilio's `interruptible` TTS parameter

```xml
<!-- TwiML Example -->
<Say voice="alice" language="hi-IN" interruptible="true">
  Mumbai mein ₹25, Delhi mein ₹30, Nashik mein ₹28...
</Say>
<Gather input="speech" hints="ruko, stop, bas">
```

**Implementation:**
- If farmer says "Ruko", "Stop", "Bas" → Stop TTS immediately
- Resume from last confirmed action

---

#### **Feature 2: SMS/WhatsApp Takeaway**

**After Every Response:**
```
Bot: "Kya main yeh jaankari aapke WhatsApp par bhejoon?"
```

**Twilio Integration:**
```javascript
// Send WhatsApp message via Twilio API
await twilioClient.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:+91${farmerPhone}`,
  body: `BHUMI Alert:
  
🌦️ Weather: Heavy rain at 4 PM
🚫 Action: Do not spray pesticides
📅 Next Update: Tomorrow 6 AM
  
Reply HELP for support`
});
```

---

#### **Feature 3: Automatic Language Detection**

**Method 1: Greeting Response**
```
Bot: "Namaste! Aap Hindi mein baat karna chahenge ya English mein?"
[STT listens for: "Hindi" / "English" / "Marathi"]
```

**Method 2: First Sentence Analysis**
```javascript
function detectLanguage(speechText) {
  const hindiPatterns = /क्या|है|मैं|आप/;
  const marathiPatterns = /काय|आहे|मी|तुम्ही/;
  
  if (hindiPatterns.test(speechText)) return 'hi-IN';
  if (marathiPatterns.test(speechText)) return 'mr-IN';
  return 'en-IN';
}
```

---

## 5. Mock Data Structure

### 5.1 Weather Data (`mock_weather.json`)
```json
{
  "Nashik": {
    "date": "2026-02-06",
    "forecast": {
      "morning": "Clear",
      "afternoon": "Heavy Rain at 4 PM",
      "temperature": "28°C",
      "humidity": "75%",
      "advisory": "Do not spray pesticides after 2 PM"
    }
  },
  "Mumbai": {
    "date": "2026-02-06",
    "forecast": {
      "morning": "Cloudy",
      "afternoon": "Light drizzle",
      "temperature": "30°C"
    }
  }
}
```

### 5.2 Mandi Prices (`mock_mandi.json`)
```json
{
  "Nashik": {
    "date": "2026-02-06",
    "crops": {
      "Tomato": { "price": 25, "unit": "kg", "trend": "stable" },
      "Onion": { "price": 40, "unit": "kg", "trend": "up" },
      "Grapes": { "price": 80, "unit": "kg", "trend": "down" }
    },
    "status": "Open until 6 PM"
  }
}
```

### 5.3 Crop Disease Database (`mock_diseases.json`)
```json
{
  "early_blight": {
    "symptoms": ["yellow_leaves", "brown_spots", "concentric_rings"],
    "crops": ["Tomato", "Potato"],
    "questions": [
      "Are the spots on leaf tips or middle?",
      "Are the spots brown or black?"
    ],
    "treatment": {
      "medicine": "Mancozeb",
      "dosage": "2g per liter",
      "frequency": "Every 10 days"
    }
  },
  "woolly_aphid": {
    "symptoms": ["white_insects", "sticky_powder", "sugarcane"],
    "questions": [
      "Are they leaving sticky powder on leaves?"
    ],
    "treatment": {
      "medicine": "Acephate",
      "dosage": "1.5g per liter"
    }
  }
}
```

### 5.4 Seed Recommendations (`mock_seeds.json`)
```json
{
  "regions": {
    "Western_Ghats": {
      "June": {
        "crops": [
          {
            "name": "Black Pepper",
            "variety": "Panniyur 1",
            "water_requirement": "High",
            "duration": "3 years",
            "profit_margin": "High"
          },
          {
            "name": "Paddy",
            "variety": "Pratap",
            "water_requirement": "Low",
            "water_saving": "30%",
            "duration": "120 days"
          }
        ]
      }
    }
  }
}
```

---

## 6. Technical Implementation Details

### 6.1 Twilio Setup (Step-by-Step)

#### **Step 1: Create Twilio Account**
1. Go to https://www.twilio.com/try-twilio
2. Sign up (Get $15 free credit)
3. Verify your phone number

#### **Step 2: Get a Phone Number**
```bash
# In Twilio Console:
Phone Numbers → Buy a Number → India (+91) → Voice Capable
```

#### **Step 3: Configure Voice Webhook**
```
Phone Number Settings:
├─ Voice & Fax
│  ├─ A CALL COMES IN: Webhook
│  └─ URL: https://YOUR_NGROK_URL.ngrok.io/voice
```

---

### 6.2 Backend Architecture

#### **File Structure**
```
bhumi-voice-backend/
├── server.js                 # Express + WebSocket server
├── routes/
│   ├── voice.js             # Twilio voice webhook handler
│   ├── websocket.js         # WebSocket connection handler
│   └── admin.js             # Admin dashboard APIs
├── services/
│   ├── intentRecognition.js # Keyword-based intent matching
│   ├── responseGenerator.js # Template-based responses
│   └── twilioService.js     # Twilio API wrapper
├── data/
│   ├── mock_weather.json
│   ├── mock_mandi.json
│   ├── mock_diseases.json
│   └── mock_seeds.json
├── utils/
│   ├── logger.js            # Call logs
│   └── helpers.js
└── package.json
```

#### **Core Server Code (`server.js`)**
```javascript
const express = require('express');
const WebSocket = require('ws');
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket connections storage
const activeCalls = new Map();

// Twilio Voice Webhook
app.post('/voice', (req, res) => {
  const response = new VoiceResponse();
  
  // Start with greeting
  response.say({
    voice: 'alice',
    language: 'hi-IN'
  }, 'Namaste! BHUMI mein aapka swagat hai. Aap Hindi mein baat karna chahenge ya English mein?');
  
  // Gather speech input
  const gather = response.gather({
    input: 'speech',
    timeout: 5,
    language: 'hi-IN',
    speechTimeout: 'auto',
    action: '/process-speech'
  });
  
  // Start WebSocket connection for real-time streaming
  response.connect()
    .stream({
      url: `wss://${req.headers.host}/media-stream`
    });
  
  res.type('text/xml');
  res.send(response.toString());
});

// WebSocket Handler for Media Streams
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  let callSid = null;
  let streamSid = null;
  
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    
    switch(msg.event) {
      case 'start':
        callSid = msg.start.callSid;
        streamSid = msg.start.streamSid;
        activeCalls.set(callSid, { ws, language: 'hi-IN', context: {} });
        break;
        
      case 'media':
        // Audio payload (base64 encoded)
        // This is where you'd process real-time audio
        break;
        
      case 'stop':
        activeCalls.delete(callSid);
        break;
    }
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

### 6.3 Intent Recognition Engine

#### **Simple Keyword Matching (No AI Costs)**

```javascript
// services/intentRecognition.js

const intentPatterns = {
  weather_rain: {
    keywords: ['rain', 'barish', 'baarish', 'barsaat'],
    confidence: 0.8
  },
  weather_general: {
    keywords: ['weather', 'mausam', 'climate'],
    confidence: 0.7
  },
  mandi_price: {
    keywords: ['price', 'rate', 'keemat', 'bhav', 'tomato', 'onion'],
    confidence: 0.9
  },
  crop_health: {
    keywords: ['disease', 'bimari', 'yellow', 'peela', 'insect', 'keeda'],
    confidence: 0.85
  },
  seed_advice: {
    keywords: ['seed', 'beej', 'sow', 'bona', 'variety'],
    confidence: 0.8
  },
  emergency: {
    keywords: ['urgent', 'emergency', 'help', 'madad', 'barbad', 'destroy'],
    confidence: 1.0
  }
};

function recognizeIntent(speechText) {
  const text = speechText.toLowerCase();
  let bestMatch = { intent: 'unknown', confidence: 0 };
  
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    const matchCount = pattern.keywords.filter(keyword => 
      text.includes(keyword)
    ).length;
    
    const confidence = (matchCount / pattern.keywords.length) * pattern.confidence;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence };
    }
  }
  
  return bestMatch;
}

// Extract entities (crop names, locations)
function extractEntities(speechText) {
  const entities = {
    crop: null,
    location: null,
    symptom: null
  };
  
  const crops = ['tomato', 'tamatar', 'onion', 'pyaz', 'sugarcane', 'ganna'];
  const locations = ['nashik', 'mumbai', 'pune'];
  
  crops.forEach(crop => {
    if (speechText.toLowerCase().includes(crop)) {
      entities.crop = crop;
    }
  });
  
  locations.forEach(loc => {
    if (speechText.toLowerCase().includes(loc)) {
      entities.location = loc;
    }
  });
  
  return entities;
}

module.exports = { recognizeIntent, extractEntities };
```

---

### 6.4 Response Generator

```javascript
// services/responseGenerator.js

const weatherData = require('../data/mock_weather.json');
const mandiData = require('../data/mock_mandi.json');
const diseaseData = require('../data/mock_diseases.json');

function generateResponse(intent, entities, language = 'hi-IN') {
  const responses = {
    weather_rain: {
      'hi-IN': () => {
        const weather = weatherData[entities.location || 'Nashik'];
        return `Haan, ${weather.forecast.afternoon}. ${weather.forecast.advisory}`;
      },
      'en-IN': () => {
        const weather = weatherData[entities.location || 'Nashik'];
        return `Yes, ${weather.forecast.afternoon}. ${weather.forecast.advisory}`;
      }
    },
    
    mandi_price: {
      'hi-IN': () => {
        const location = entities.location || 'Nashik';
        const crop = entities.crop || 'Tomato';
        const mandi = mandiData[location];
        const price = mandi.crops[crop].price;
        
        return `${location} Mandi mein ${crop} ₹${price} kilo hai. Mandi ${mandi.status}.`;
      }
    },
    
    crop_health: {
      'hi-IN': () => {
        return "Mujhe bataiye, patti ka kinara peela hai ya beech mein dhabbe?";
      }
    },
    
    emergency: {
      'hi-IN': () => {
        return "Yeh urgent lag raha hai. Kya main aapko Krishi Mitra expert se jod doon?";
      }
    }
  };
  
  const handler = responses[intent]?.[language];
  return handler ? handler() : "Kshama karein, main samajh nahi paya. Kripya dobara kahiye.";
}

module.exports = { generateResponse };
```

---

### 6.5 Twilio TwiML Response Example

```javascript
// routes/voice.js

app.post('/process-speech', (req, res) => {
  const speechResult = req.body.SpeechResult;
  const callSid = req.body.CallSid;
  
  // Recognize intent
  const { intent, confidence } = recognizeIntent(speechResult);
  const entities = extractEntities(speechResult);
  
  // Generate response
  const responseText = generateResponse(intent, entities, 'hi-IN');
  
  // Create TwiML
  const response = new VoiceResponse();
  
  response.say({
    voice: 'alice',
    language: 'hi-IN'
  }, responseText);
  
  // Ask follow-up
  response.say({
    voice: 'alice',
    language: 'hi-IN'
  }, 'Kya main yeh jaankari aapke WhatsApp par bhejoon?');
  
  const gather = response.gather({
    input: 'speech',
    timeout: 3,
    action: '/handle-followup'
  });
  
  res.type('text/xml');
  res.send(response.toString());
});
```

---

## 7. React Dashboard Implementation

### 7.1 Component Structure

```
bhumi-dashboard/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── LiveCallMonitor.jsx    # Real-time active calls
│   │   ├── CallHistory.jsx        # Past conversation logs
│   │   ├── Analytics.jsx          # Metrics & graphs
│   │   └── ManualTakeover.jsx     # Agent intervention
│   ├── hooks/
│   │   └── useWebSocket.js        # WebSocket connection hook
│   ├── utils/
│   │   └── api.js
│   └── main.jsx
```

### 7.2 Live Call Monitor Component

```jsx
// components/LiveCallMonitor.jsx

import { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

export default function LiveCallMonitor() {
  const [activeCalls, setActiveCalls] = useState([]);
  const { messages, sendMessage } = useWebSocket('ws://localhost:3000');
  
  useEffect(() => {
    // Listen for new call events
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.type === 'call_update') {
      setActiveCalls(latestMessage.data);
    }
  }, [messages]);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Live Calls</h2>
      
      {activeCalls.map(call => (
        <div key={call.callSid} className="border-b py-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">
                Caller: {call.from}
              </p>
              <p className="text-sm text-gray-600">
                Language: {call.language} | Intent: {call.currentIntent}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Duration: {call.duration}s
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                onClick={() => sendMessage({ 
                  action: 'takeover', 
                  callSid: call.callSid 
                })}
              >
                Take Over
              </button>
              
              <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                End Call
              </button>
            </div>
          </div>
          
          {/* Conversation Transcript */}
          <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
            <h4 className="font-semibold mb-2">Transcript:</h4>
            {call.transcript.map((msg, i) => (
              <p key={i} className={msg.role === 'bot' ? 'text-blue-600' : 'text-gray-800'}>
                <strong>{msg.role}:</strong> {msg.text}
              </p>
            ))}
          </div>
        </div>
      ))}
      
      {activeCalls.length === 0 && (
        <p className="text-gray-500 text-center py-8">No active calls</p>
      )}
    </div>
  );
}
```

---

## 8. ngrok Setup

### 8.1 Installation & Configuration

```bash
# Install ngrok
npm install -g ngrok

# Start your Express server
node server.js

# In another terminal, expose port 3000
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

### 8.2 Update Twilio Webhook

```
Twilio Console → Phone Numbers → Your Number
├─ Voice Configuration
│  ├─ A CALL COMES IN
│  └─ Webhook: https://abc123.ngrok.io/voice
```

---

## 9. Critical Corrections & Recommendations

### ⚠️ **Issue #1: "Offline Calls - No Internet User Side"**

**Your Requirement:** Farmers don't have internet.

**✅ CORRECT APPROACH:**  
Farmers use **regular phone calls** (2G/3G voice network). Only YOUR backend needs internet.

```
Farmer's End:        Backend:
┌──────────┐        ┌──────────┐
│ No Data  │───────▶│ Internet │
│ Voice OK │  Call  │ Required │
└──────────┘        └──────────┘
```

**What Twilio Does:**
- Converts farmer's voice → text (STT on Twilio's servers)
- Your backend processes text
- Converts response text → voice (TTS on Twilio's servers)
- Sends voice back to farmer

**Cost:** ~$0.03/minute (India rates)

---

### ⚠️ **Issue #2: Free Tier Limitations**

**Twilio Free Trial Constraints:**
- ✅ $15 credit (~450 minutes)
- ⚠️ Can only call **verified numbers** (you must manually verify each farmer's number)
- ⚠️ TTS will say "This is a test call" prefix

**Recommendation:**
- For POC: Verify 5-10 test numbers
- For Production: Upgrade to paid (₹1.5/min in India)

**Alternative for FREE unlimited testing:**
```javascript
// Use Twilio's TwiML Bins (free forever)
// OR use Plivo's free tier (₹500 credit)
// OR use Exotel (India-specific, better rates)
```

---

### ⚠️ **Issue #3: STT/TTS Language Support**

**Twilio's Built-in STT:**
- ✅ Supports Hindi (`hi-IN`)
- ✅ Supports English (`en-IN`)
- ❌ Limited support for Marathi, Gujarati, Tamil

**Recommendation:**
```javascript
// For Hindi/English: Use Twilio built-in
gather.language = 'hi-IN';

// For other languages: Use Google Cloud Speech API (free tier: 60 min/month)
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
```

---

### ⚠️ **Issue #4: Intent Recognition**

**Your Plan:** Simple keyword matching

**✅ Good for MVP**, but limitations:
- "Mera tamatar ka patta peela hai" → Needs to extract:
  - Crop = Tomato
  - Symptom = Yellow leaf
  
**Recommendation:**
```javascript
// Phase 1 (Free): Regex + Keywords
// Phase 2 (Paid): OpenAI GPT-4 API ($0.03/1k tokens)
// Phase 3 (Best): Fine-tuned model on agricultural corpus

// Example GPT-4 integration:
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are BHUMI agricultural assistant...' },
    { role: 'user', content: speechResult }
  ]
});
```

---

### ⚠️ **Issue #5: WhatsApp Integration**

**Twilio WhatsApp Sandbox:**
- ✅ Free for testing
- ⚠️ Requires farmer to send "join <code>" first

**Recommendation:**
```javascript
// For POC: Use SMS instead (more reliable)
twilioClient.messages.create({
  from: '+91XXXXXXXXXX', // Your Twilio number
  to: farmerPhone,
  body: 'BHUMI: Heavy rain at 4 PM. Do not spray pesticides.'
});

// Cost: ₹0.50/SMS in India
```

---

## 10. Complete Implementation Checklist

### Phase 1: Setup (Day 1-2)

- [ ] Create Twilio account
- [ ] Buy India phone number (+91)
- [ ] Install ngrok
- [ ] Set up Node.js project
- [ ] Install dependencies: `express`, `twilio`, `ws`, `dotenv`
- [ ] Create mock JSON data files
- [ ] Test basic TwiML response

### Phase 2: Backend (Day 3-5)

- [ ] Implement `/voice` webhook
- [ ] Build intent recognition engine
- [ ] Create response generator
- [ ] Add WebSocket server
- [ ] Implement conversation state management
- [ ] Add logging system

### Phase 3: Frontend Dashboard (Day 6-7)

- [ ] Set up React + Vite
- [ ] Build LiveCallMonitor component
- [ ] Implement WebSocket connection
- [ ] Add call history view
- [ ] Create analytics dashboard

### Phase 4: Testing (Day 8-9)

- [ ] Test Hindi conversation flow
- [ ] Test English conversation flow
- [ ] Test intent recognition accuracy
- [ ] Test barge-in functionality
- [ ] Test SMS delivery

### Phase 5: Refinement (Day 10)

- [ ] Add error handling
- [ ] Improve response templates
- [ ] Optimize conversation flow
- [ ] Add manual takeover feature

---

## 11. Cost Breakdown (Monthly)

| Service | Free Tier | Paid (100 farmers, 5 min/call/day) |
|---------|-----------|-------------------------------------|
| Twilio Voice | $15 credit (~450 min) | $450/month |
| Twilio SMS | 0 | $75/month (150 SMS/day) |
| ngrok | Free (1 tunnel) | $0 |
| OpenAI API (optional) | $0 (if using keywords) | $50/month |
| **Total** | **FREE** | **$575/month** |

**Cost Optimization:**
- Use Exotel (India): ₹0.30/min = ₹4,500/month (10x cheaper!)
- Use on-premise Whisper for STT: FREE
- Cache common responses: Reduce API calls

---

## 12. System Prompt for Voice Bot

```markdown
# BHUMI Voice Assistant - System Prompt

You are BHUMI (Bharat Unified Mandi Intelligence), a helpful agricultural assistant for Indian farmers who call in via phone.

## Core Personality
- **Tone:** Warm, respectful, patient (like talking to an elder family member)
- **Language:** Primarily Hindi, switch to English if requested
- **Speed:** Speak slowly and clearly (farmers may have poor network)
- **Brevity:** Keep responses under 15 seconds for routine questions

## Conversation Rules

### 1. Always Start With
"Namaste! BHUMI mein aapka swagat hai. Kya aap janna chahte hain:
- Aaj ka mausam
- Mandi ki keemat  
- Fasal ki samasya
- Beej ki salah"

### 2. Response Guidelines
- ✅ Direct answers (no "I think", "Maybe")
- ✅ Action-oriented ("Yeh karein" not "Yeh kar sakte hain")
- ✅ Use local units (₹/kilo, not $/kg)
- ❌ Never say "I don't know" → Instead: "Yeh jaankari abhi nahi hai. Kya main aapko expert se jod doon?"

### 3. Follow-Up Questions
After EVERY response, ask:
"Kya main yeh jaankari aapke phone par SMS bhejoon?"

### 4. Clarifying Questions (for Crop Health)
If symptom is vague:
- "Patti ka kinara peela hai ya beech mein?"
- "Yeh kab se hai?"
- "Koi keeda dikha?"

### 5. Emergency Protocol
If keywords detected: "barbad", "urgent", "help", "jala"
→ Immediately say: "Yeh urgent hai. Main aapko Krishi Mitra se jod raha hoon."
→ Transfer to human agent queue

### 6. Barge-In Handling
If user says "Ruko", "Bas", "Stop":
→ Stop immediately
→ Ask: "Kya main kuch aur bata sakta hoon?"

## Example Conversations

### Weather Query
User: "Kya aaj barish hogi?"
Bot: "Haan, dopahar 4 baje bhaari barish. Dawai chidakne ka kaam na karein. Kya main yeh SMS bhejoon?"

### Mandi Price
User: "Tamatar ki keemat?"
Bot: "Nashik Mandi mein tamatar ₹25 kilo. Paas ke Pune mein ₹28. Kya SMS bhejoon?"

### Crop Health
User: "Mere patte peele ho rahe hain"
Bot: "Patti ka kinara peela hai ya beech mein dhabbe?"
User: "Beech mein"
Bot: "Agar dhabbe bhoore hain, to Early Blight ho sakta hai. Mancozeb dawai dal sakte hain. Kya detailed jaankari SMS par chahiye?"

## Error Handling
- Network issues: "Aapki awaaz theek se nahi aa rahi. Ek baar aur kahiye?"
- Unclear intent: "Main samajh nahi paya. Kya aap weather, mandi price, ya fasal ki samasya ke baare mein jaanna chahte hain?"
- No response: After 5 seconds, prompt: "Kya main kuch aur bata sakta hoon?"

## Never Do
- ❌ Use technical jargon (Say "keeda" not "pest")
- ❌ Give uncertain advice on crop health
- ❌ Refuse to transfer to human (always offer escalation)
- ❌ Speak too fast (farmers may have low literacy)
```

---

## 13. Next Steps & Recommendations

### ✅ What You Got Right
1. **Voice-first approach** for low-literacy users
2. **Conversation flow** is well thought-out
3. **Emergency escalation** shows good UX thinking
4. **SMS takeaway** solves retention problem

### ⚠️ What Needs Adjustment
1. **"Offline calls"** → Correct term: "Voice calls over cellular network"
2. **Free tier limits** → Can't scale beyond 10-15 test users
3. **STT accuracy** → Hindi recognition ~85% accurate (expect errors)
4. **Intent matching** → Keyword-based will miss nuanced queries

### 🚀 Recommended MVP Scope
**Week 1-2 Goal:**
- ✅ Single working flow: Weather + Mandi Price
- ✅ 5 verified test numbers
- ✅ Basic dashboard showing live calls
- ✅ SMS delivery working

**NOT in MVP:**
- ❌ Multi-language (stick to Hindi only)
- ❌ Complex disease diagnosis (too error-prone)
- ❌ WhatsApp integration (use SMS)

### 🎯 Production Roadmap
1. **Month 1-2:** MVP with 10 farmers (Twilio trial)
2. **Month 3:** Switch to Exotel (cheaper for India)
3. **Month 4:** Add GPT-4 for better intent recognition
4. **Month 6:** Train custom STT model on agricultural Hindi corpus

---

## 14. File Deliverables

I will now create the complete project structure with all files:

1. ✅ **Backend:** Node.js + Express + Twilio
2. ✅ **Frontend:** React dashboard
3. ✅ **Mock Data:** JSON files
4. ✅ **Documentation:** Setup guide, API docs
5. ✅ **Testing Scripts:** Sample curl commands

Would you like me to proceed with creating all the code files now?