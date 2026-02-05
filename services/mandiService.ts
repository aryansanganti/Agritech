import { MandiPriceRecord } from '../types';

// Mock data for mandi prices
const MOCK_MANDI_DATA: MandiPriceRecord[] = [
    {
        state: 'Maharashtra',
        district: 'Nagpur',
        market: 'Nagpur Mandi',
        commodity: 'Soybean',
        variety: 'Yellow',
        minPrice: 4200,
        maxPrice: 4800,
        modalPrice: 4600,
        date: new Date().toISOString().split('T')[0],
        source: 'Agmarknet'
    },
    {
        state: 'Maharashtra',
        district: 'Nagpur',
        market: 'Nagpur Mandi',
        commodity: 'Soybean',
        variety: 'Yellow',
        minPrice: 4250,
        maxPrice: 4750,
        modalPrice: 4550,
        date: new Date().toISOString().split('T')[0],
        source: 'Data.gov.in'
    },
    {
        state: 'Rajasthan',
        district: 'Jodhpur',
        market: 'Jodhpur Mandi',
        commodity: 'Pearl Millet',
        variety: 'Hybrid',
        minPrice: 2100,
        maxPrice: 2400,
        modalPrice: 2250,
        date: new Date().toISOString().split('T')[0],
        source: 'Agmarknet'
    }
];

export const getMandiPrices = async (crop: string, district: string, state: string): Promise<MandiPriceRecord[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Filter mock data or fetch from real API if keys were configured
    // Since we don't have a real API key for Data.gov.in yet, we use a smart mock/search fallback

    const filtered = MOCK_MANDI_DATA.filter(record =>
        record.commodity.toLowerCase().includes(crop.toLowerCase()) &&
        record.district.toLowerCase().includes(district.toLowerCase()) &&
        record.state.toLowerCase().includes(state.toLowerCase())
    );

    if (filtered.length > 0) return filtered;

    // Generate smart fallback data if no specific match
    return [
        {
            state,
            district,
            market: `${district} Local Market`,
            commodity: crop,
            variety: 'Standard',
            minPrice: 2500,
            maxPrice: 3200,
            modalPrice: 2900,
            date: new Date().toISOString().split('T')[0],
            source: 'System Fallback'
        }
    ];
};
