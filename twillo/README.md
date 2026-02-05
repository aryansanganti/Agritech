# BHUMI Voice Assistant - Offline Twilio Backend

A voice-first agricultural assistant accessible via regular phone calls. This backend handles incoming Twilio voice calls, uses keyword-based intent recognition (no AI), and returns hardcoded responses from mock data files.

## Features

- **Offline-First**: No AI dependencies, pure keyword matching
- **Hardcoded Responses**: All responses from templates and mock data
- **Multi-language**: Hindi (primary) and English support
- **Conversation Flow**: State management for multi-turn conversations
- **Extensible**: Easy to add new intents and responses

## Architecture

```
Farmer's Phone (Voice Call)
    ↓
Twilio Voice Gateway (STT/TTS)
    ↓
Express.js Backend (Keyword Matching + Hardcoded Responses)
    ↓
Mock Data Files (Weather, Mandi, Diseases, Seeds)
```

## Prerequisites

- Node.js 14+ and npm
- Twilio account with a phone number
- ngrok (for local development)

## Setup

### 1. Install Dependencies

```bash
cd twillo
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Twilio credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3001
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
NGROK_URL=https://your-ngrok-url.ngrok.io
```

### 3. Get Twilio Credentials

1. Sign up at https://www.twilio.com/try-twilio (get $15 free credit)
2. Get Account SID and Auth Token from Twilio Console
3. Buy a phone number (India +91) with Voice capability

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Expose Server via ngrok

In a separate terminal:

```bash
ngrok http 3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 6. Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers → Your Number
2. Under "Voice & Fax" → "A CALL COMES IN"
3. Set Webhook URL: `https://your-ngrok-url.ngrok.io/voice`
4. Set HTTP method: `POST`
5. Save

## Testing

### Make a Test Call

1. Call your Twilio phone number from a verified number
2. The bot will greet you and ask for language preference
3. Say "Hindi" or "English"
4. The bot will present the main menu
5. Try these sample queries:
   - **Weather**: "Kya aaj barish hogi?" (Will it rain today?)
   - **Mandi Price**: "Tamatar ki keemat kya hai?" (What is the price of tomato?)
   - **Crop Health**: "Mere patte peele ho rahe hain" (My leaves are turning yellow)
   - **Seed Advice**: "Abhi kya bo sakta hoon?" (What can I sow now?)

### Monitor Active Calls

Visit `http://localhost:3001/admin/active-calls` to see all active calls and their transcripts.

## Project Structure

```
twillo/
├── server.js                 # Main Express server
├── routes/
│   └── voice.js             # Twilio webhook handlers
├── services/
│   ├── intentRecognition.js # Keyword matching engine
│   ├── responseGenerator.js # Hardcoded response templates
│   └── conversationState.js # Call state management
├── data/
│   ├── mock_weather.json    # Weather data
│   ├── mock_mandi.json      # Mandi prices
│   ├── mock_diseases.json   # Crop disease info
│   └── mock_seeds.json      # Seed recommendations
├── utils/
│   └── logger.js            # Call logging
├── package.json
├── .env.example
└── README.md
```

## Intent Categories

The system recognizes the following intents through keyword matching:

1. **weather_rain**: Rain-related queries
2. **weather_general**: General weather queries
3. **mandi_price**: Crop price queries
4. **mandi_status**: Mandi open/closed status
5. **water_irrigation**: Water/irrigation advice
6. **crop_health**: Crop disease/problems
7. **seed_advice**: Seed/sowing recommendations
8. **emergency**: Urgent situations

## Adding New Intents

### 1. Add Keywords

Edit `services/intentRecognition.js`:

```javascript
const intentPatterns = {
  your_new_intent: {
    keywords: ['keyword1', 'keyword2', 'hindi_keyword'],
    confidence: 0.8
  }
};
```

### 2. Add Response Template

Edit `services/responseGenerator.js`:

```javascript
const responses = {
  your_new_intent: {
    'hi-IN': () => {
      return "Your Hindi response here";
    },
    'en-IN': () => {
      return "Your English response here";
    }
  }
};
```

## Mock Data

All responses are generated from mock data files in `data/`:

- **mock_weather.json**: Weather forecasts by city
- **mock_mandi.json**: Mandi prices by city and crop
- **mock_diseases.json**: Disease information and treatments
- **mock_seeds.json**: Seed recommendations by region and month

Edit these files to customize responses.

## API Endpoints

- `POST /voice` - Initial call handler
- `POST /voice/process-language` - Language selection
- `POST /voice/process-speech` - Speech processing
- `POST /voice/handle-followup` - Follow-up handling
- `GET /health` - Health check
- `GET /admin/active-calls` - View active calls

## Troubleshooting

### Call not connecting

1. Check ngrok is running and URL is correct
2. Verify Twilio webhook URL is set correctly
3. Check server logs for errors

### Speech not recognized

1. Ensure you're speaking clearly
2. Check Twilio STT language settings match your speech
3. Verify keywords are in the intent recognition patterns

### Responses not matching

1. Check mock data files have the required data
2. Verify entity extraction is working (crop names, locations)
3. Review server logs for intent recognition results

## Future Enhancements

- [ ] Add SMS sending via Twilio
- [ ] Implement call transfer to human agents
- [ ] Add more regional languages (Marathi, Gujarati)
- [ ] Database integration for call logs
- [ ] Admin dashboard for monitoring
- [ ] WebSocket support for real-time updates

## License

ISC

## Support

For issues or questions, refer to the main PRD document (`prd.md`).
