// Crop Routing Configuration Engine
// This JSON database tells the AI and Logistics engine how to handle each crop universally

export interface CropConfig {
    tier1_destination: string;       // Retail Grade destination
    tier2_destination: string;       // Market Grade destination
    tier3_industry: string;          // Industrial Grade destination
    tier3_products: string[];        // What products this becomes
    transport: 'cold_chain' | 'crate_stackable' | 'jute_sack' | 'hay_lined_box' | 'standard_truck';
    shelf_life_hours: number;        // Hours before spoilage
    carbon_risk: 'high_methane' | 'medium' | 'low';
    fragility: 'high' | 'medium' | 'low';
    local_factory_priority: boolean;  // Should prioritize <50km factories
}

export const CROP_ROUTING_CONFIG: Record<string, CropConfig> = {
    tomato: {
        tier1_destination: "Supermarkets / Export / Quick Commerce (Zepto/Blinkit)",
        tier2_destination: "Local Mandis / Restaurants / Canteens",
        tier3_industry: "Ketchup & Puree Processing",
        tier3_products: ["Ketchup", "Tomato Puree", "Tomato Paste", "Pizza Sauce"],
        transport: "crate_stackable",
        shelf_life_hours: 72,
        carbon_risk: "high_methane",
        fragility: "high",
        local_factory_priority: true
    },
    potato: {
        tier1_destination: "Supermarkets / Export",
        tier2_destination: "Local Mandis / Bulk Restaurants",
        tier3_industry: "Chips & Starch Processing",
        tier3_products: ["Potato Chips", "French Fries", "Starch", "Flour"],
        transport: "jute_sack",
        shelf_life_hours: 720, // 30 days
        carbon_risk: "low",
        fragility: "low",
        local_factory_priority: false
    },
    onion: {
        tier1_destination: "Premium Retail / Export",
        tier2_destination: "Local Mandis / Wholesale",
        tier3_industry: "Dehydration & Powder Processing",
        tier3_products: ["Onion Powder", "Dehydrated Onions", "Onion Paste"],
        transport: "jute_sack",
        shelf_life_hours: 1440, // 60 days
        carbon_risk: "low",
        fragility: "low",
        local_factory_priority: false
    },
    mango: {
        tier1_destination: "Premium Supermarkets / Export (Alphonso Grade)",
        tier2_destination: "Local Fruit Markets",
        tier3_industry: "Juice & Pulp Processing",
        tier3_products: ["Mango Pulp", "Mango Juice", "Aam Panna", "Pickles"],
        transport: "hay_lined_box",
        shelf_life_hours: 120,
        carbon_risk: "medium",
        fragility: "high",
        local_factory_priority: true
    },
    spinach: {
        tier1_destination: "Premium Organic Stores / Quick Commerce",
        tier2_destination: "Local Vegetable Markets / Canteens",
        tier3_industry: "Puree & Frozen Processing",
        tier3_products: ["Spinach Puree", "Frozen Spinach", "Dehydrated Spinach"],
        transport: "cold_chain",
        shelf_life_hours: 24,
        carbon_risk: "high_methane",
        fragility: "high",
        local_factory_priority: true
    },
    wheat: {
        tier1_destination: "Organic Retail / Premium Brands",
        tier2_destination: "Local Grain Markets / Millers",
        tier3_industry: "Flour & Feed Processing",
        tier3_products: ["Industrial Flour", "Animal Feed", "Starch"],
        transport: "jute_sack",
        shelf_life_hours: 4320, // 6 months
        carbon_risk: "low",
        fragility: "low",
        local_factory_priority: false
    },
    rice: {
        tier1_destination: "Premium Basmati / Export",
        tier2_destination: "Local Mandis / Wholesalers",
        tier3_industry: "Rice Bran Oil & Broken Rice Processing",
        tier3_products: ["Rice Bran Oil", "Rice Flour", "Poha", "Animal Feed"],
        transport: "jute_sack",
        shelf_life_hours: 8640, // 1 year
        carbon_risk: "low",
        fragility: "low",
        local_factory_priority: false
    },
    strawberry: {
        tier1_destination: "Premium Stores / Hotels / Export",
        tier2_destination: "Local Fruit Markets",
        tier3_industry: "Jam & Frozen Processing",
        tier3_products: ["Strawberry Jam", "Frozen Berries", "Puree"],
        transport: "cold_chain",
        shelf_life_hours: 48,
        carbon_risk: "high_methane",
        fragility: "high",
        local_factory_priority: true
    },
    carrot: {
        tier1_destination: "Supermarkets / Organic Stores",
        tier2_destination: "Local Markets / Juice Shops",
        tier3_industry: "Juice & Pickle Processing",
        tier3_products: ["Carrot Juice", "Pickles", "Dehydrated Carrot"],
        transport: "crate_stackable",
        shelf_life_hours: 240,
        carbon_risk: "low",
        fragility: "medium",
        local_factory_priority: false
    },
    cauliflower: {
        tier1_destination: "Premium Retail",
        tier2_destination: "Local Vegetable Markets",
        tier3_industry: "Frozen & Pickle Processing",
        tier3_products: ["Frozen Cauliflower", "Pickles", "Mixed Vegetables"],
        transport: "crate_stackable",
        shelf_life_hours: 120,
        carbon_risk: "medium",
        fragility: "medium",
        local_factory_priority: true
    }
};

// Get configuration for a crop (case-insensitive)
export const getCropConfig = (cropName: string): CropConfig | null => {
    const normalizedCrop = cropName.toLowerCase().trim();
    return CROP_ROUTING_CONFIG[normalizedCrop] || null;
};

// Get all supported crops
export const getSupportedCrops = (): string[] => {
    return Object.keys(CROP_ROUTING_CONFIG);
};

// Check if crop is supported
export const isCropSupported = (cropName: string): boolean => {
    return getCropConfig(cropName) !== null;
};

// Get transport method for a crop
export const getTransportMethod = (cropName: string): string => {
    const config = getCropConfig(cropName);
    if (!config) return "standard_truck";
    
    if (config.shelf_life_hours < 48) {
        return "cold_chain";
    }
    return config.transport;
};

// Check if crop needs urgent routing (flash sale eligible)
export const needsUrgentRouting = (cropName: string, hoursSinceHarvest: number): boolean => {
    const config = getCropConfig(cropName);
    if (!config) return false;
    
    // If time since harvest is > 80% of shelf life
    return hoursSinceHarvest > (config.shelf_life_hours * 0.8);
};

// Get carbon emission category
export const getCarbonRiskCategory = (cropName: string): string => {
    const config = getCropConfig(cropName);
    return config?.carbon_risk || 'medium';
};

// Demo function: Add new crop dynamically (for hackathon demo)
export const addNewCrop = (cropName: string, config: CropConfig): void => {
    CROP_ROUTING_CONFIG[cropName.toLowerCase()] = config;
    console.log(`✅ New crop "${cropName}" added to routing config!`);
};
