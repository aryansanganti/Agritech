
export const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
];

export const getCommodities = () => {
    return [
        "Rice", "Wheat", "Maize", "Potato", "Onion", "Tomato", "Cotton", "Sugarcane",
        "Soybean", "Mustard", "Groundnut", "Chickpea", "Banana", "Mango", "Apple"
    ];
};

export interface MarketPrice {
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    modal_price: number;
    arrival_date: string;
}

// Mock Data Generator
export const getMarketPrice = async (state: string, district: string, commodity: string): Promise<MarketPrice> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate a realistic looking price based on commodity
    let basePrice = 2000;
    switch (commodity) {
        case 'Rice': basePrice = 2200; break;
        case 'Wheat': basePrice = 2125; break;
        case 'Onion': basePrice = 1500; break;
        case 'Tomato': basePrice = 1800; break;
        case 'Cotton': basePrice = 6000; break;
        case 'Soybean': basePrice = 4600; break;
        default: basePrice = 2500;
    }

    // Add some random variance
    const variance = Math.floor(Math.random() * 400) - 200;

    return {
        state,
        district,
        market: "Local Mandi",
        commodity,
        variety: "FAQ",
        modal_price: basePrice + variance,
        arrival_date: new Date().toLocaleDateString('en-IN')
    };
};
