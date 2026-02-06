// 3-Tier Routing Protocol - Live Demo Examples
// Run these examples in your browser console or create a demo button

import { 
    classifyHarvestIntoTiers, 
    createSplitStreamListings,
    calculateUniversalPrice,
    mapGradeToTier 
} from '../services/tierRoutingService';
import { 
    getCropConfig, 
    addNewCrop, 
    getSupportedCrops,
    needsUrgentRouting 
} from '../services/cropRoutingConfigService';

// ==========================================
// DEMO 1: Universal Protocol (Scalability)
// ==========================================

export const demoUniversalProtocol = () => {
    console.log('🎯 DEMO 1: Universal 3-Tier Protocol\n');
    
    // Show all supported crops
    console.log('✅ Supported crops:', getSupportedCrops());
    
    // Demo: Add a NEW crop live on stage!
    console.log('\n🔴 LIVE DEMO: Adding "Carrot" to the system...');
    addNewCrop('carrot', {
        tier1_destination: "Premium Supermarkets / Organic Stores",
        tier2_destination: "Local Markets / Juice Shops",
        tier3_industry: "Juice & Pickle Processing",
        tier3_products: ["Carrot Juice", "Pickles", "Dehydrated Carrot"],
        transport: "crate_stackable",
        shelf_life_hours: 240,
        carbon_risk: "low",
        fragility: "medium",
        local_factory_priority: false
    });
    
    console.log('✅ Carrot added! Now querying configuration...');
    const carrotConfig = getCropConfig('carrot');
    console.log('Carrot Config:', carrotConfig);
    
    console.log('\n💡 Key Point: No code changes needed! Just JSON configuration.\n');
};

// ==========================================
// DEMO 2: The Magic - 3-Tier Split
// ==========================================

export const demoThreeTierSplit = () => {
    console.log('🎯 DEMO 2: The "Split-Stream" Magic\n');
    
    console.log('📦 Farmer scans 1000 quintals of TOMATOES');
    console.log('AI Analysis: 60% Grade A, 30% Grade B, 10% Grade C\n');
    
    const result = classifyHarvestIntoTiers(
        'tomato',
        1000, // quintals
        {
            gradeA: 60,  // 60% perfect
            gradeB: 30,  // 30% good  
            gradeC: 10,  // 10% bruised
            gradeD: 0
        },
        12 // hours since harvest
    );
    
    console.log('✨ System automatically creates 3 SEPARATE listings:\n');
    
    result.tiers.forEach((tier, index) => {
        console.log(`${index + 1}. ${tier.tierName.toUpperCase()}`);
        console.log(`   Quantity: ${tier.quantity} quintals (${tier.percentage}%)`);
        console.log(`   Destination: ${tier.destination}`);
        console.log(`   Grade: ${tier.grade}`);
        console.log('');
    });
    
    console.log('📊 Recommendations:');
    result.recommendations.forEach(rec => console.log(`   ${rec}`));
    
    console.log('\n💡 Key Point: ONE scan → THREE markets automatically!\n');
    
    return result;
};

// ==========================================
// DEMO 3: Universal Pricing Algorithm
// ==========================================

export const demoUniversalPricing = () => {
    console.log('🎯 DEMO 3: Universal Pricing Algorithm\n');
    
    const basePrice = 2000; // ₹2000/quintal mandi price
    
    console.log(`Base Mandi Price: ₹${basePrice}/quintal\n`);
    
    const tier1Price = calculateUniversalPrice(basePrice, 'tier1', false);
    const tier2Price = calculateUniversalPrice(basePrice, 'tier2', false);
    const tier3Price = calculateUniversalPrice(basePrice, 'tier3', false);
    const tier3FlashPrice = calculateUniversalPrice(basePrice, 'tier3', true);
    
    console.log('💰 Calculated Prices:');
    console.log(`   Tier 1 (Retail): ₹${tier1Price} (${((tier1Price/basePrice - 1) * 100).toFixed(0)}% premium)`);
    console.log(`   Tier 2 (Market): ₹${tier2Price} (market rate)`);
    console.log(`   Tier 3 (Factory): ₹${tier3Price} (${(tier3Price/basePrice * 100).toFixed(0)}% of market)`);
    console.log(`   Tier 3 (Flash Sale): ₹${tier3FlashPrice} (70% off - Rescue Radar)\n`);
    
    // Calculate total value
    const quantities = { tier1: 600, tier2: 300, tier3: 100 }; // from 1000 total
    const totalValue = 
        quantities.tier1 * tier1Price +
        quantities.tier2 * tier2Price +
        quantities.tier3 * tier3Price;
    
    const oldValue = 1000 * basePrice; // if farmer sold all at average price
    
    console.log('📈 Total Revenue Comparison:');
    console.log(`   Old way (sell all at avg): ₹${oldValue.toLocaleString()}`);
    console.log(`   3-Tier way: ₹${totalValue.toLocaleString()}`);
    console.log(`   Increase: ₹${(totalValue - oldValue).toLocaleString()} (${((totalValue/oldValue - 1) * 100).toFixed(1)}%)\n`);
    
    console.log('💡 Key Point: Farmers earn MORE by separating tiers!\n');
};

// ==========================================
// DEMO 4: Rescue Radar (Sustainability)
// ==========================================

export const demoRescueRadar = () => {
    console.log('🎯 DEMO 4: Rescue Radar - Zero Waste Feature\n');
    
    const crops = [
        { name: 'Spinach', hours: 20, shelfLife: 24 },
        { name: 'Strawberry', hours: 40, shelfLife: 48 },
        { name: 'Tomato', hours: 60, shelfLife: 72 },
        { name: 'Potato', hours: 600, shelfLife: 720 }
    ];
    
    console.log('⏰ Checking shelf life status:\n');
    
    crops.forEach(crop => {
        const isUrgent = needsUrgentRouting(crop.name, crop.hours);
        const percentUsed = (crop.hours / crop.shelfLife * 100).toFixed(0);
        
        console.log(`${crop.name}:`);
        console.log(`   Harvested ${crop.hours}h ago (${percentUsed}% of shelf life)`);
        console.log(`   Status: ${isUrgent ? '🚨 URGENT - Flash Sale Activated!' : '✅ Normal'}`);
        
        if (isUrgent) {
            console.log(`   Action: 70% discount, notify NGOs/composting units`);
        }
        console.log('');
    });
    
    console.log('💡 Key Point: Instead of rotting → becomes animal feed/compost\n');
    console.log('🌱 Carbon Impact: Prevents methane emissions from food waste!\n');
};

// ==========================================
// DEMO 5: Complete End-to-End Flow
// ==========================================

export const demoCompleteFlow = () => {
    console.log('🎯 DEMO 5: Complete E2E Flow - Tomato Example\n');
    console.log('═'.repeat(60));
    
    // Step 1: Scan
    console.log('\n📸 STEP 1: Farmer scans tomato heap');
    console.log('   AI Vision detects: Size, Defects, Rot, Color');
    
    // Step 2: Classify
    console.log('\n🎯 STEP 2: 3-Tier Classification');
    const result = classifyHarvestIntoTiers('tomato', 1000, {
        gradeA: 60, gradeB: 30, gradeC: 10, gradeD: 0
    }, 12);
    
    console.log(`   ✅ ${result.tiers[0].quantity}kg → ${result.tiers[0].destination}`);
    console.log(`   ✅ ${result.tiers[1].quantity}kg → ${result.tiers[1].destination}`);
    console.log(`   ✅ ${result.tiers[2].quantity}kg → ${result.tiers[2].destination}`);
    
    // Step 3: Price
    console.log('\n💰 STEP 3: Universal Pricing');
    const listings = createSplitStreamListings(result, 2000);
    
    listings.forEach((listing, i) => {
        console.log(`   Listing ${i + 1}: ${listing.quantity}kg @ ₹${listing.suggestedPrice}/q → ${listing.targetBuyer}`);
    });
    
    // Step 4: Route
    console.log('\n🚛 STEP 4: Logistics Routing');
    const config = getCropConfig('tomato');
    console.log(`   Transport: ${config?.transport}`);
    console.log(`   Shelf Life: ${config?.shelf_life_hours}h`);
    console.log(`   Carbon Risk: ${config?.carbon_risk}`);
    
    if (config?.local_factory_priority) {
        console.log('   ✅ Tier 3 prioritizes local factories (<50km) to reduce CO₂');
    }
    
    // Step 5: Impact
    console.log('\n📊 STEP 5: Impact Summary');
    console.log('   ✅ Zero waste - even Grade C has a buyer');
    console.log('   ✅ Fair pricing - premium for quality, base for processing');
    console.log('   ✅ Carbon optimized - local routing + full trucks');
    console.log('   ✅ Scalable - works for ANY crop with JSON config\n');
    
    console.log('═'.repeat(60));
};

// ==========================================
// DEMO 6: Compare 3 Different Crops
// ==========================================

export const demoMultipleCrops = () => {
    console.log('🎯 DEMO 6: Universal Protocol Across Crops\n');
    
    const crops = ['tomato', 'potato', 'spinach'];
    const basePrice = 2000;
    
    console.log('Showing how the SAME logic works for different crops:\n');
    
    crops.forEach(cropName => {
        const config = getCropConfig(cropName);
        const tier3Price = calculateUniversalPrice(basePrice, 'tier3', false);
        
        console.log(`${cropName.toUpperCase()}:`);
        console.log(`   Tier 1 → ${config?.tier1_destination}`);
        console.log(`   Tier 2 → ${config?.tier2_destination}`);
        console.log(`   Tier 3 → ${config?.tier3_industry}`);
        console.log(`   Products: ${config?.tier3_products.join(', ')}`);
        console.log(`   Transport: ${config?.transport}`);
        console.log('');
    });
    
    console.log('💡 Key Point: Same protocol, different destinations!\n');
};

// ==========================================
// Master Demo Runner
// ==========================================

export const runAllDemos = () => {
    console.clear();
    console.log('🎪 3-TIER ROUTING PROTOCOL - LIVE DEMO\n');
    console.log('═'.repeat(60));
    
    demoUniversalProtocol();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    demoThreeTierSplit();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    demoUniversalPricing();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    demoRescueRadar();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    demoMultipleCrops();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    demoCompleteFlow();
    
    console.log('\n🎉 All demos complete! Ready for judges.\n');
};

// Export for use in browser console or demo page
if (typeof window !== 'undefined') {
    (window as any).TierRoutingDemos = {
        runAll: runAllDemos,
        demo1: demoUniversalProtocol,
        demo2: demoThreeTierSplit,
        demo3: demoUniversalPricing,
        demo4: demoRescueRadar,
        demo5: demoCompleteFlow,
        demo6: demoMultipleCrops
    };
    
    console.log('💡 Run in console: TierRoutingDemos.runAll()');
}
