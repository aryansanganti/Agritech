/**
 * Crop Configuration Engine
 * The universal "Config Database" that maps every crop to its specific
 * industrial use, transport needs, shelf life, and carbon risk.
 *
 * ✅ To add a new crop during a demo, just add a new entry here.
 */

export interface CropConfig {
  name: string;
  tier1_destination: string;   // Retail / Export / Quick Commerce
  tier2_destination: string;   // Local Mandis / Restaurants
  tier3_industry: string;      // Processing Factories (FMCG)
  transport: 'Cold_Chain' | 'Crate_Stackable' | 'Jute_Sack' | 'Hay_Lined_Box' | 'Plastic_Crate' | 'Ventilated_Van';
  shelfLifeHours: number;      // Hours after harvest
  carbonRisk: 'Low' | 'Medium' | 'High_Methane';
  image: string;
  retailPricePerQtl: number;   // Base Grade-A retail price ₹/quintal
  factoryBuyerLabel: string;   // e.g. "Hindustan Unilever" or "ITC Foods"
  rescueChannels: string[];    // NGO / Pig Farms / Composting etc.
}

export const CROP_CONFIG: Record<string, CropConfig> = {
  tomato: {
    name: 'Tomato',
    tier1_destination: 'Supermarkets / BigBasket / Zepto',
    tier2_destination: 'Local Mandis / Restaurants',
    tier3_industry: 'Ketchup & Puree',
    transport: 'Crate_Stackable',
    shelfLifeHours: 120,        // ~5 days
    carbonRisk: 'High_Methane',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
    retailPricePerQtl: 2500,
    factoryBuyerLabel: 'Hindustan Unilever (Kissan)',
    rescueChannels: ['NGO Kitchen', 'Pig Farms', 'Composting Unit'],
  },
  potato: {
    name: 'Potato',
    tier1_destination: 'Supermarkets / Export / Quick Commerce',
    tier2_destination: 'Local Mandis / Canteens',
    tier3_industry: 'Chips & Starch',
    transport: 'Jute_Sack',
    shelfLifeHours: 720,        // ~30 days
    carbonRisk: 'Low',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
    retailPricePerQtl: 1800,
    factoryBuyerLabel: 'PepsiCo (Lays)',
    rescueChannels: ['Cattle Feed', 'Starch Factory', 'Composting Unit'],
  },
  onion: {
    name: 'Onion',
    tier1_destination: 'Supermarkets / Export',
    tier2_destination: 'Local Mandis / Restaurants',
    tier3_industry: 'Dehydrated Powder',
    transport: 'Jute_Sack',
    shelfLifeHours: 480,        // ~20 days
    carbonRisk: 'Medium',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
    retailPricePerQtl: 2000,
    factoryBuyerLabel: 'Jain Irrigation (Dehydration)',
    rescueChannels: ['Cattle Feed', 'Composting Unit'],
  },
  mango: {
    name: 'Mango',
    tier1_destination: 'Export / Supermarkets / Blinkit',
    tier2_destination: 'Local Mandis / Juice Shops',
    tier3_industry: 'Juice & Pulp',
    transport: 'Hay_Lined_Box',
    shelfLifeHours: 168,        // ~7 days
    carbonRisk: 'Medium',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
    retailPricePerQtl: 5000,
    factoryBuyerLabel: 'Dabur (Real Juice)',
    rescueChannels: ['NGO Kitchen', 'Jam Factory', 'Composting Unit'],
  },
  spinach: {
    name: 'Spinach',
    tier1_destination: 'Supermarkets / Quick Commerce',
    tier2_destination: 'Local Mandis / Restaurants / Canteens',
    tier3_industry: 'Puree & Frozen',
    transport: 'Cold_Chain',
    shelfLifeHours: 36,         // ~1.5 days ⚡ very perishable
    carbonRisk: 'High_Methane',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
    retailPricePerQtl: 1500,
    factoryBuyerLabel: 'McCain (Frozen Veg)',
    rescueChannels: ['NGO Kitchen', 'Pig Farms', 'Composting Unit'],
  },
  rice: {
    name: 'Rice',
    tier1_destination: 'Export / Supermarkets',
    tier2_destination: 'Local Mandis / Wholesale',
    tier3_industry: 'Rice Flour & Starch',
    transport: 'Jute_Sack',
    shelfLifeHours: 8760,       // ~1 year
    carbonRisk: 'Low',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    retailPricePerQtl: 4500,
    factoryBuyerLabel: 'ITC (Aashirvaad)',
    rescueChannels: ['FCI Warehouse', 'NGO Distribution'],
  },
  wheat: {
    name: 'Wheat',
    tier1_destination: 'Export / Supermarkets',
    tier2_destination: 'Local Mandis / Wholesale',
    tier3_industry: 'Flour & Animal Feed',
    transport: 'Jute_Sack',
    shelfLifeHours: 8760,       // ~1 year
    carbonRisk: 'Low',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
    retailPricePerQtl: 2600,
    factoryBuyerLabel: 'ITC (Aashirvaad Atta)',
    rescueChannels: ['FCI Warehouse', 'Cattle Feed'],
  },
  banana: {
    name: 'Banana',
    tier1_destination: 'Supermarkets / Quick Commerce',
    tier2_destination: 'Local Mandis / Juice Shops',
    tier3_industry: 'Chips & Banana Powder',
    transport: 'Ventilated_Van',
    shelfLifeHours: 96,         // ~4 days
    carbonRisk: 'High_Methane',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    retailPricePerQtl: 1600,
    factoryBuyerLabel: 'Balaji Wafers',
    rescueChannels: ['NGO Kitchen', 'Pig Farms', 'Composting Unit'],
  },
  carrot: {
    name: 'Carrot',
    tier1_destination: 'Supermarkets / Export',
    tier2_destination: 'Local Mandis / Restaurants',
    tier3_industry: 'Juice & Halwa Mix',
    transport: 'Plastic_Crate',
    shelfLifeHours: 240,        // ~10 days
    carbonRisk: 'Medium',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
    retailPricePerQtl: 2000,
    factoryBuyerLabel: 'Haldiram\'s',
    rescueChannels: ['NGO Kitchen', 'Cattle Feed', 'Composting Unit'],
  },
  strawberry: {
    name: 'Strawberry',
    tier1_destination: 'Supermarkets / Export / Blinkit',
    tier2_destination: 'Local Bakeries / Restaurants',
    tier3_industry: 'Jam & Frozen Berries',
    transport: 'Cold_Chain',
    shelfLifeHours: 48,         // ~2 days ⚡ very perishable
    carbonRisk: 'High_Methane',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop',
    retailPricePerQtl: 12000,
    factoryBuyerLabel: 'Kissan (Jam)',
    rescueChannels: ['NGO Kitchen', 'Composting Unit'],
  },
  cotton: {
    name: 'Cotton',
    tier1_destination: 'Export / Textile Mills',
    tier2_destination: 'Local Ginning Mills',
    tier3_industry: 'Cottonseed Oil & Animal Feed',
    transport: 'Jute_Sack',
    shelfLifeHours: 8760,
    carbonRisk: 'Low',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&h=300&fit=crop',
    retailPricePerQtl: 6500,
    factoryBuyerLabel: 'Arvind Mills',
    rescueChannels: ['Cottonseed Crushers'],
  },
  sugarcane: {
    name: 'Sugarcane',
    tier1_destination: 'Sugar Mills / Jaggery Units',
    tier2_destination: 'Juice Shops / Local Mills',
    tier3_industry: 'Ethanol & Bagasse',
    transport: 'Ventilated_Van',
    shelfLifeHours: 72,
    carbonRisk: 'High_Methane',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&h=300&fit=crop',
    retailPricePerQtl: 350,
    factoryBuyerLabel: 'Bajaj Hindusthan Sugar',
    rescueChannels: ['Ethanol Plant', 'Composting Unit'],
  },
};

/** Helper — get all crop keys */
export const getCropKeys = (): string[] => Object.keys(CROP_CONFIG);

/** Helper — get config or fallback */
export const getCropConfig = (cropKey: string): CropConfig | undefined =>
  CROP_CONFIG[cropKey.toLowerCase()];

/** Transport label mapping */
export const TRANSPORT_LABELS: Record<string, string> = {
  Cold_Chain: '❄️ Cold Chain Refrigerated',
  Crate_Stackable: '📦 Stackable Crates',
  Jute_Sack: '🧺 Jute Sack (Standard Truck)',
  Hay_Lined_Box: '🌾 Hay-Lined Box',
  Plastic_Crate: '🗃️ Plastic Crate',
  Ventilated_Van: '🚐 Ventilated Van',
};
