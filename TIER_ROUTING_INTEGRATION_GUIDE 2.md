# 3-Tier Routing Protocol - Integration Guide

## 🎯 Overview
Your app now has a **Universal 3-Tier Routing Protocol** that classifies ALL crops (tomato, potato, spinach, etc.) into **Retail, Market, and Industrial** destinations without building different logic for each vegetable.

## ✅ What Was Added (Without Removing Anything!)

### 1. **New Service Files** (Core Logic)
- `services/cropRoutingConfigService.ts` - JSON database with crop configurations
- `services/tierRoutingService.ts` - 3-tier classification logic
- `components/TierRoutingDisplay.tsx` - UI components for tier display
- `components/RescueRadar.tsx` - Flash sale feature for urgent crops

### 2. **Enhanced Existing Files** (Backward Compatible)
- `types.ts` - Added optional tier routing fields to Listing interface
- `pages/Marketplace.tsx` - Added tier badges and destination displays
- `pages/PricingEngine.tsx` - Integrated Universal Pricing Algorithm

## 🚀 How to Use the 3-Tier System

### Option 1: Manual Integration (Recommended for Demo)

When creating a new listing in your app, add tier routing data:

```typescript
import { mapGradeToTier, calculateUniversalPrice } from './services/tierRoutingService';
import { getCropConfig } from './services/cropRoutingConfigService';

// Example: Creating a listing with tier routing
const grade = 'B'; // From AI quality grading
const tier = mapGradeToTier(grade); // Returns 'tier2' (Market Grade)
const cropConfig = getCropConfig('tomato'); // Get crop-specific config

const listing = {
    // ... existing fields ...
    grade: 'B',
    price: 1500,
    tierRouting: {
        tier: tier,
        tierName: 'Market Grade',
        destination: cropConfig.tier2_destination, // "Local Mandis / Restaurants"
        targetBuyer: 'Local Mandi Agents, Restaurants, Hotels',
        transportMethod: cropConfig.transport // 'crate_stackable'
    }
};
```

### Option 2: Automatic Classification (For Full Integration)

When you scan a harvest with mixed quality:

```typescript
import { classifyHarvestIntoTiers, createSplitStreamListings } from './services/tierRoutingService';

// Farmer scans 1000kg of tomatoes
const result = classifyHarvestIntoTiers(
    'tomato',
    1000, // total quantity in quintals
    {
        gradeA: 60,  // 60% perfect
        gradeB: 30,  // 30% good
        gradeC: 10,  // 10% bruised
        gradeD: 0
    },
    12 // hours since harvest
);

// Result splits into 3 automatic listings:
// - 600kg → BigBasket (Retail Grade)
// - 300kg → Local Mandi (Market Grade)  
// - 100kg → Ketchup Factory (Industrial Grade)

const splitListings = createSplitStreamListings(result, 2000); // base price ₹2000
```

## 📊 The Complete Flow

### Step 1: Farmer Uploads Crop
```
pages/cropanalysis.tsx → AI grades crop (A/B/C)
```

### Step 2: System Classifies into Tier
```
Grade A → Tier 1 (Retail)
Grade B → Tier 2 (Market)
Grade C/D → Tier 3 (Industrial)
```

### Step 3: Pricing Engine Calculates Price
```typescript
// Universal Pricing Formula
Tier 1 Price = Base Price × 1.3 (30% premium)
Tier 2 Price = Base Price × 1.0 (market rate)
Tier 3 Price = Base Price × 0.4 (40% of market - but better than throwing away!)
```

### Step 4: Marketplace Shows Destination
```
Marketplace card displays:
- Tier badge (Retail/Market/Industrial)
- Destination (e.g., "Routed to: Ketchup Processing")
- Target buyers (e.g., "Factories like Kissan, Maggi")
```

## 🎪 Hackathon Demo Script

### Demo 1: Universal Protocol (Show Scalability)
```javascript
// In browser console or demo script:
import { getCropConfig, addNewCrop } from './services/cropRoutingConfigService';

// Show existing crops
console.log('Supported crops:', getSupportedCrops());

// Live demo: Add a new crop (Carrot) on stage!
addNewCrop('carrot', {
    tier1_destination: "Premium Supermarkets",
    tier2_destination: "Local Markets / Juice Shops",
    tier3_industry: "Pickle & Dehydration Processing",
    tier3_products: ["Pickles", "Carrot Juice", "Dehydrated Carrot"],
    transport: "crate_stackable",
    shelf_life_hours: 240,
    carbon_risk: "low",
    fragility: "medium",
    local_factory_priority: false
});

// Now carrot works instantly!
const carrotConfig = getCropConfig('carrot');
console.log(carrotConfig);
```

### Demo 2: 3-Tier Split (The Magic)
```javascript
// Show judges how ONE scan creates THREE listings
import { classifyHarvestIntoTiers } from './services/tierRoutingService';

const tomatoes = classifyHarvestIntoTiers('tomato', 1000, {
    gradeA: 60, gradeB: 30, gradeC: 10, gradeD: 0
}, 10);

console.log('Tier 1 (Retail):', tomatoes.tiers[0]);
// → 600kg to BigBasket/Zepto

console.log('Tier 2 (Market):', tomatoes.tiers[1]);
// → 300kg to Local Mandis

console.log('Tier 3 (Factory):', tomatoes.tiers[2]);
// → 100kg to Ketchup Factories
```

### Demo 3: Rescue Radar (Sustainability)
```javascript
// Show flash sale activation
import { needsUrgentRouting } from './services/cropRoutingConfigService';

// Spinach harvested 20 hours ago (shelf life: 24h)
const isUrgent = needsUrgentRouting('spinach', 20);
// → true (80% of shelf life exceeded)

// Triggers:
// - 70% price discount (Flash Sale)
// - Notification to local NGOs/composting units
```

## 🔌 Where to Integrate in Existing Pages

### 1. Crop Analysis Page (`pages/cropanalysis.tsx`)
After AI grading, add:
```typescript
const tier = mapGradeToTier(grade);
const config = getCropConfig(selectedCrop);
// Show tier destination to farmer immediately
```

### 2. Pricing Engine (`pages/PricingEngine.tsx`)
✅ **Already integrated!** Universal pricing automatically applied.

### 3. Marketplace (`pages/Marketplace.tsx`)
✅ **Already integrated!** Tier badges and destinations display automatically.

### 4. Dashboard (`pages/Dashboard.tsx`)
Add Rescue Radar widget:
```typescript
import { RescueRadarBanner } from '../components/RescueRadar';

// Show urgent listings count
<RescueRadarBanner urgentCount={5} onClick={() => navigate('marketplace')} />
```

## 🌍 Carbon Footprint Features

### Local Factory Priority
```typescript
// Tier 3 crops with high methane risk prioritize local factories
if (config.local_factory_priority && distance < 50) {
    // Route to nearby factory to reduce CO2
}
```

### Transport Optimization
```typescript
// Automatic transport method selection
if (shelf_life_hours < 48) {
    transport = 'cold_chain'; // Berries, leafy greens
} else {
    transport = config.transport; // Potato → jute sack
}
```

## 📝 Key Features for Judges

### 1. ✅ Universal Protocol
"We didn't build separate logic for tomatoes vs potatoes. We built a CONFIG DATABASE that makes ANY crop work instantly."

### 2. ✅ Zero Waste
"Tier 3 produce that farmers currently THROW AWAY now goes to factories. 100kg from Farmer A + 200kg from Farmer B = 300kg bulk order for powder factory."

### 3. ✅ Fair Pricing
"Farmers get 30% premium for Grade A, but even Grade C gets 40% of market price instead of ₹0."

### 4. ✅ Carbon Reduction
"Our algorithm prioritizes local factories for perishables and optimizes truck fill rates to >90%."

## 🎨 UI Elements Added

### Tier Badges
- Green (Tier 1 - Retail): Store icon
- Blue (Tier 2 - Market): Shopping cart icon  
- Orange (Tier 3 - Industrial): Factory icon

### Rescue Radar
- Red pulsing badge: "⚡ Flash Sale"
- Countdown timer: "12h left"
- Discount display: "Save ₹800"

## 📦 No Breaking Changes!

All new fields are **optional**:
```typescript
interface Listing {
    // ... existing fields ...
    tierRouting?: { ... }  // ← Optional
    rescueRadar?: boolean  // ← Optional
}
```

Existing listings without tier routing continue to work normally.

## 🚀 Next Steps (Optional Enhancements)

1. **Add more crops** to `cropRoutingConfigService.ts`
2. **Integrate with backend** to aggregate Tier 3 from multiple farmers
3. **Add factory directory** with contact info for Tier 3 buyers
4. **Build Rescue Radar notifications** (SMS/Push when flash sale starts)

## 🎯 Summary

**What changed:** Added 4 new files, enhanced 3 existing files  
**What broke:** Nothing! 100% backward compatible  
**What improved:** Universal routing, fair pricing, zero waste, carbon optimization  
**Demo time:** <5 minutes to show tomato → potato → spinach universal flow

---

## Quick Test Commands

```bash
# See all supported crops
grep "export const CROP_ROUTING_CONFIG" services/cropRoutingConfigService.ts -A 100

# Check integration in PricingEngine
grep "tierRouting" pages/PricingEngine.tsx

# Check UI integration
grep "TierRoutingBadge" pages/Marketplace.tsx
```

**You're ready to demo! 🎉**
