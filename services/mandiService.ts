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

const AGMARKNET_RES_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const AGMARKNET_API_KEY = '579b464db66ec23bdd0000014e4eeffdb9a5409d7b3ab7e0688ff3ed';

const fetchFromAgmarknet = async (crop: string, district: string, state: string): Promise<MandiPriceRecord[]> => {
    try {
        // Build filters for the API
        const baseUrl = `https://api.data.gov.in/resource/${AGMARKNET_RES_ID}`;
        const params = new URLSearchParams({
            'api-key': AGMARKNET_API_KEY,
            'format': 'json',
            'limit': '10',
            'filters[state]': state,
            'filters[district]': district,
            'filters[commodity]': crop
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);
        if (!response.ok) throw new Error('Agmarknet API fetch failed');

        const data = await response.json();
        if (!data.records || data.records.length === 0) {
            console.warn('No records found for query, trying broader search');
            // Try broader search with just crop and state
            const broaderParams = new URLSearchParams({
                'api-key': AGMARKNET_API_KEY,
                'format': 'json',
                'limit': '10',
                'filters[state]': state,
                'filters[commodity]': crop
            });
            const broaderResponse = await fetch(`${baseUrl}?${broaderParams.toString()}`);
            const broaderData = await broaderResponse.json();
            if (!broaderData.records) return [];
            return normalizeAgmarknetRecords(broaderData.records);
        }

        return normalizeAgmarknetRecords(data.records);
    } catch (error) {
        console.error('Error fetching from Agmarknet:', error);
        return [];
    }
};

const normalizeAgmarknetRecords = (records: any[]): MandiPriceRecord[] => {
    return records.map(record => ({
        state: record.state,
        district: record.district,
        market: record.market,
        commodity: record.commodity,
        variety: record.variety,
        minPrice: parseFloat(record.min_price),
        maxPrice: parseFloat(record.max_price),
        modalPrice: parseFloat(record.modal_price),
        date: record.arrival_date,
        source: 'Agmarknet (Live)'
    }));
};

export const getMandiPrices = async (crop: string, district: string, state: string): Promise<MandiPriceRecord[]> => {
    console.log(`Fetching prices for ${crop} in ${district}, ${state}...`);

    // 1. Try Live API
    const liveRecords = await fetchFromAgmarknet(crop, district, state);
    if (liveRecords.length > 0) {
        return liveRecords;
    }

    // 2. Fallback to Mock Data if API returns nothing
    console.log('No live data found, falling back to cached/mock data');
    const filteredMock = MOCK_MANDI_DATA.filter(record =>
        record.commodity.toLowerCase().includes(crop.toLowerCase()) &&
        record.district.toLowerCase().includes(district.toLowerCase()) &&
        record.state.toLowerCase().includes(state.toLowerCase())
    );

    if (filteredMock.length > 0) return filteredMock;

    // 3. Last Resort Fallback
    return [
        {
            state,
            district,
            market: `${district} Local Market`,
            commodity: crop,
            variety: 'Standard',
            minPrice: 3800,
            maxPrice: 4500,
            modalPrice: 4150,
            date: new Date().toISOString().split('T')[0],
            source: 'Economic Estimation (Fallback)'
        }
    ];
};
