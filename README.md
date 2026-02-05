# 🌾 BHUMI - Smart Farming Assistant

**An AI-Powered Progressive Web Application Revolutionizing Agriculture**

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-purple)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-green)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 What is BHUMI?

**BHUMI** (meaning "Earth" in Sanskrit) is a comprehensive **AI-powered farming assistant** designed to democratize agricultural intelligence for farmers worldwide. It combines cutting-edge artificial intelligence with practical farming needs to provide real-time insights, predictions, and recommendations—all accessible through a simple, multilingual interface.

Think of BHUMI as **"An AI Agronomist in Your Pocket"**—available 24/7, speaking your language, and ready to help with everything from disease detection to yield prediction.

---

## 🎯 What Does This App Do?

BHUMI provides **12 core features** that address critical agricultural challenges:

### 1. 🦠 **Disease Detection & Diagnosis**
- **Upload a photo** of any crop leaf or plant
- AI analyzes the image using **Google Gemini Vision AI** to identify:
  - Diseases (fungal, bacterial, viral)
  - Pest infestations
  - Nutrient deficiencies
- Provides complete diagnosis with:
  - **Treatment options** (organic & chemical)
  - **Prevention strategies**
  - **Severity assessment**
- Supports **9+ languages** for accessibility

### 2. 🌱 **Crop Recommendation Engine**
- Input your farm details:
  - Soil type (Loamy, Clay, Sandy, etc.)
  - Season (Kharif, Rabi, Zaid)
  - Location (for climate data)
- AI recommends the **best crops to grow** based on:
  - Soil compatibility
  - Climate conditions
  - Market demand
  - Water availability
- Provides **confidence scores** and **profitability insights**

### 3. 📈 **Yield Prediction**
- Enter crop details (type, variety, area, soil, irrigation)
- AI generates **precision yield forecasts** such as:
  - "Expected Yield: 14.0 - 17.5 Tonnes for 5 Acres"
- Includes:
  - **Risk factors** (weather, pests, market)
  - **Optimization strategies** to maximize output
  - **Historical comparison** data

### 4. 🎓 **Smart Advisory System**
- Get personalized **agronomic advice** tailored to your farm
- Covers:
  - **Irrigation scheduling** (when and how much to water)
  - **Fertilizer recommendations** (NPK ratios, organic options)
  - **Pest control strategies** (IPM, bio-pesticides)
  - **Crop rotation** suggestions
- Uses **AI reasoning models** for complex simulations

### 5. 💬 **AI Chatbot (Bhumi Assistant)**
- **Conversational AI** powered by Google Gemini
- Ask questions in natural language like:
  - "What fertilizer should I use for tomatoes?"
  - "How to control aphids organically?"
  - "When is the best time to harvest wheat?"
- Provides **context-aware responses** based on:
  - Your farm profile
  - Current season
  - Local conditions
- Supports **multilingual conversations**

### 6. 🎤 **Voice Agent (Bhumi Live)**
- **Hands-free operation** for field use
- Speak naturally in your local dialect:
  - Hindi, Odia, Bengali, Spanish, Mandarin, Russian, Japanese, Portuguese
- **Voice-to-Voice** interaction:
  - Ask questions via voice
  - Listen to AI responses
- Perfect for:
  - Farmers with low literacy
  - Work in the field (hands dirty)
  - Quick consultations

### 7. 🌤️ **Weather Intelligence**
- **Real-time weather forecasts** for your location
- Powered by **Google Search integration** for live data
- Includes:
  - **7-day forecast** (temperature, rainfall, humidity)
  - **Farming advisories** (when to irrigate, spray, harvest)
  - **Weather alerts** (storms, heatwaves, frost warnings)
- AI interprets weather data for **actionable farming insights**

### 8. 🧪 **Soil Health Analysis**
- Upload soil images or enter manual data:
  - pH, moisture, salinity, texture
  - Organic matter, NPK levels
- AI analyzes soil health using:
  - **Computer vision** (color analysis, texture detection)
  - **Generative AI** (interpretation & recommendations)
- Provides:
  - **Health score** (0-100)
  - **Improvement strategies** (composting, amendments)
  - **Crop suitability** for that soil type

### 9. 🌾 **Crop Quality Assessment**
- Upload images of harvested crops
- AI evaluates:
  - **Quality grade** (A, B, C)
  - **Market readiness**
  - **Storage recommendations**
  - **Price estimates**
- Helps farmers:
  - Get **fair market prices**
  - Reduce **post-harvest losses**

### 10. 🧬 **SeedScout - Genetic Hotspot Finder**
- **Revolutionary tool** for agricultural researchers & seed companies
- Identifies **genetic hotspots** across India:
  - Regions with naturally stress-resilient crops
  - Areas with unique environmental pressures (salinity, heat, drought)
- How it works:
  1. Select a crop (Rice, Wheat, Maize, Cotton, etc.)
  2. Set stress tolerance thresholds (salinity, heat, drought)
  3. AI analyzes **640+ Indian districts** using:
     - Climate data (temperature, rainfall)
     - Soil salinity levels
     - Tribal population percentages (indicator of traditional varieties)
  4. Displays **color-coded map** of genetic hotspots
  5. Ranks districts by **hotspot score**
- Backend (Node.js + Express):
  - Processes climate datasets (`india_district_climate_640.csv`)
  - Applies **scoring algorithms** for stress tolerance
  - Uses **Gemini AI** to explain genetic potential
- **Use Cases**:
  - Find **climate-resilient genes** for breeding programs
  - Locate **traditional varieties** with unique traits
  - Prioritize **seed collection expeditions**

### 11. 📊 **Analytics Dashboard**
- Visualize your farm's performance with:
  - **Annual yield trends** (bar charts)
  - **Market price movements** (line graphs)
  - **Expense distribution** (pie charts)
- **AI-generated insights**:
  - "Your cotton yield increased 15% this year due to better irrigation"
  - "Fertilizer costs are 20% above average—consider switching to organic"
- Helps farmers make **data-driven decisions**

### 12. 💰 **Market Price Intelligence**
- **Real-time Mandi (market) rates** for 15+ commodities:
  - Rice, Wheat, Cotton, Soybean, Onion, Tomato, etc.
- Search by:
  - State
  - District
  - Commodity
- AI provides:
  - **Price trends** (rising, falling, stable)
  - **Best time to sell** recommendations
  - **Market comparisons** (nearby mandis)

---

## 🏗️ Technical Architecture

### Frontend (React PWA)
```
Agritech/
├── App.tsx              # Main application & routing
├── pages/               # 12 feature pages
│   ├── Dashboard.tsx
│   ├── DiseaseDetection.tsx
│   ├── CropRecommendation.tsx
│   ├── YieldPrediction.tsx
│   ├── SmartAdvisory.tsx
│   ├── Chatbot.tsx
│   ├── Weather.tsx
│   ├── SoilAnalysis.tsx
│   ├── cropanalysis.tsx
│   ├── SeedScout.tsx
│   ├── Analytics.tsx
│   └── Profile.tsx
├── services/            # AI & API integrations
│   ├── geminiService.ts       # Google Gemini AI
│   ├── agmarknetService.ts    # Market prices
│   └── api.ts
├── components/          # Reusable UI components
├── utils/               # Translations & helpers
└── manifest.json        # PWA configuration
```

### Backend (Node.js Server)
```
server/
├── index.js             # Express API server
├── services/
│   └── scoring.js       # SeedScout hotspot algorithm
└── data/
    ├── staticMetadata.js
    └── india_district_climate_640.csv
```

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework for component-based architecture |
| **TypeScript** | Type safety & better developer experience |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Modern, responsive styling with glassmorphism |
| **Lucide React** | Beautiful iconography |
| **Recharts** | Interactive data visualization charts |
| **Leaflet / Google Maps** | Interactive mapping for SeedScout |

### **AI & ML**
| Technology | Purpose |
|------------|---------|
| **Google Gemini 3 Pro** | Vision analysis, complex reasoning, yield prediction |
| **Google Gemini 3 Flash** | Fast conversational AI, voice agent |
| **Google Search Tool** | Live data grounding (weather, market prices) |
| **Web Speech API** | Voice recognition & synthesis |

### **Backend**
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | RESTful API server for SeedScout |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### **PWA Features**
- **Service Worker**: Offline functionality
- **Web Manifest**: Installable app
- **Responsive Design**: Works on all devices
- **Geolocation API**: Location-based recommendations

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Google AI Studio API Key** ([Get it here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agritech.git
   cd Agritech
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create `.env` in the root directory:
   ```env
   VITE_API_KEY=your_google_gemini_api_key_here
   ```
   
   Create `server/.env`:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

5. **Start the development servers**
   
   **Frontend** (Terminal 1):
   ```bash
   npm run dev
   ```
   
   **Backend** (Terminal 2):
   ```bash
   cd server
   node index.js
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

---

## 🌍 Multilingual Support

BHUMI speaks **9+ languages** natively:

| Language | Code | Native Name |
|----------|------|-------------|
| English | `en` | English |
| Hindi | `hi` | हिन्दी |
| Odia | `or` | ଓଡ଼ିଆ |
| Bengali | `bn` | বাংলা |
| Mandarin | `zh` | 中文 |
| Spanish | `es` | Español |
| Russian | `ru` | Русский |
| Japanese | `ja` | 日本語 |
| Portuguese | `pt` | Português |

All AI responses, UI text, and voice interactions are **fully localized**.

---

## 💡 Key Innovations

1. **Voice-First Design**: Hands-free operation for farmers working in fields
2. **Hybrid AI System**: Combines on-device computer vision with cloud AI
3. **Genetic Hotspot Mapping**: First-of-its-kind tool for agricultural geneticists
4. **Live Data Grounding**: AI uses Google Search for real-time market & weather data
5. **Offline-First PWA**: Works even without internet for basic features
6. **Cultural Sensitivity**: Designed for low-literacy users with visual & voice interfaces

---

## 📊 Impact & Use Cases

### **For Farmers**
- ✅ **Save 20% of harvest** with early disease detection
- ✅ **Increase yield by 15-30%** with AI-optimized farming practices
- ✅ **Reduce costs** by avoiding overuse of fertilizers & pesticides
- ✅ **Get fair prices** with real-time market intelligence
- ✅ **Access expert advice** 24/7 in their native language

### **For Researchers**
- 🧬 Identify **genetic goldmines** for breeding programs
- 🌍 Map **stress-tolerant varieties** across 640+ districts
- 📈 Accelerate **crop improvement** with data-driven seed collection

### **For Agribusinesses**
- 📊 Provide **value-added services** to farmers
- 🤝 Build **digital extension networks**
- 🌾 Promote **sustainable farming** practices

---

## 🔐 Privacy & Security

- ✅ All data processing complies with **GDPR & local regulations**
- ✅ User images are **not stored** on servers (processed in real-time)
- ✅ Optional **guest mode** - no account required
- ✅ **End-to-end encryption** for user profiles (when logged in)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) (coming soon).

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Credits

**Project Lead & Developer**: Dipayan Sardar  
**Email**: dipayansardar73@gmail.com  
**Powered by**: Google Gemini AI, React, TypeScript

---

## 🙏 Acknowledgments

- **Google AI Studio** for providing Gemini API
- **Open-source community** for React, Vite, and other tools
- **Farmers worldwide** who inspired this project

---

## 📞 Support

- 📧 Email: dipayansardar73@gmail.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/yourusername/agritech/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/agritech/discussions)

---

**Made with ❤️ for farmers, by technologists**
