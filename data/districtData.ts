// Indian Districts with Environmental Data for SeedScout
// Data sources: Soil Health Card, IMD, Census 2011 (mock data based on real patterns)

import { DistrictData } from '../types';

export const indianDistricts: DistrictData[] = [
    // Maharashtra - Known for drought-prone regions
    { id: 'mh-nan', name: 'Nandurbar', state: 'Maharashtra', lat: 21.37, lng: 74.24, salinity: 5.2, maxTemp: 44, rainfall: 680, tribalPercent: 69.3, cluster: 0 },
    { id: 'mh-dhu', name: 'Dhule', state: 'Maharashtra', lat: 20.90, lng: 74.78, salinity: 4.8, maxTemp: 43, rainfall: 590, tribalPercent: 35.2, cluster: 0 },
    { id: 'mh-ahm', name: 'Ahmednagar', state: 'Maharashtra', lat: 19.08, lng: 74.73, salinity: 6.1, maxTemp: 42, rainfall: 520, tribalPercent: 12.4, cluster: 0 },
    { id: 'mh-sol', name: 'Solapur', state: 'Maharashtra', lat: 17.66, lng: 75.91, salinity: 7.2, maxTemp: 43, rainfall: 450, tribalPercent: 5.8, cluster: 1 },
    { id: 'mh-gad', name: 'Gadchiroli', state: 'Maharashtra', lat: 20.10, lng: 80.00, salinity: 2.1, maxTemp: 41, rainfall: 1450, tribalPercent: 38.7, cluster: 2 },

    // Rajasthan - Extreme heat and salinity
    { id: 'rj-jai', name: 'Jaisalmer', state: 'Rajasthan', lat: 26.92, lng: 70.90, salinity: 8.5, maxTemp: 48, rainfall: 180, tribalPercent: 12.1, cluster: 1 },
    { id: 'rj-bar', name: 'Barmer', state: 'Rajasthan', lat: 25.75, lng: 71.42, salinity: 7.8, maxTemp: 47, rainfall: 220, tribalPercent: 9.8, cluster: 1 },
    { id: 'rj-bik', name: 'Bikaner', state: 'Rajasthan', lat: 28.02, lng: 73.31, salinity: 6.9, maxTemp: 46, rainfall: 260, tribalPercent: 8.5, cluster: 1 },
    { id: 'rj-jod', name: 'Jodhpur', state: 'Rajasthan', lat: 26.29, lng: 73.02, salinity: 5.8, maxTemp: 45, rainfall: 320, tribalPercent: 14.2, cluster: 0 },
    { id: 'rj-ban', name: 'Banswara', state: 'Rajasthan', lat: 23.55, lng: 74.44, salinity: 3.2, maxTemp: 41, rainfall: 920, tribalPercent: 76.4, cluster: 2 },
    { id: 'rj-dun', name: 'Dungarpur', state: 'Rajasthan', lat: 23.84, lng: 73.71, salinity: 3.5, maxTemp: 42, rainfall: 850, tribalPercent: 70.8, cluster: 2 },

    // Gujarat - Saline coastal regions
    { id: 'gj-kut', name: 'Kutch', state: 'Gujarat', lat: 23.73, lng: 69.86, salinity: 9.2, maxTemp: 45, rainfall: 340, tribalPercent: 8.2, cluster: 1 },
    { id: 'gj-pnm', name: 'Patan', state: 'Gujarat', lat: 23.85, lng: 72.13, salinity: 7.5, maxTemp: 44, rainfall: 520, tribalPercent: 4.1, cluster: 1 },
    { id: 'gj-dan', name: 'Dang', state: 'Gujarat', lat: 20.75, lng: 73.68, salinity: 1.8, maxTemp: 38, rainfall: 2100, tribalPercent: 94.0, cluster: 3 },
    { id: 'gj-sab', name: 'Sabarkantha', state: 'Gujarat', lat: 23.63, lng: 73.00, salinity: 3.8, maxTemp: 42, rainfall: 780, tribalPercent: 21.4, cluster: 2 },

    // Madhya Pradesh - Central India tribal belt
    { id: 'mp-jha', name: 'Jhabua', state: 'Madhya Pradesh', lat: 22.77, lng: 74.59, salinity: 4.2, maxTemp: 43, rainfall: 820, tribalPercent: 86.8, cluster: 2 },
    { id: 'mp-ali', name: 'Alirajpur', state: 'Madhya Pradesh', lat: 22.30, lng: 74.35, salinity: 4.5, maxTemp: 44, rainfall: 750, tribalPercent: 89.0, cluster: 0 },
    { id: 'mp-bar', name: 'Barwani', state: 'Madhya Pradesh', lat: 22.04, lng: 74.90, salinity: 5.1, maxTemp: 44, rainfall: 680, tribalPercent: 72.3, cluster: 0 },
    { id: 'mp-din', name: 'Dindori', state: 'Madhya Pradesh', lat: 22.95, lng: 81.08, salinity: 2.8, maxTemp: 40, rainfall: 1320, tribalPercent: 64.2, cluster: 2 },
    { id: 'mp-man', name: 'Mandla', state: 'Madhya Pradesh', lat: 22.60, lng: 80.38, salinity: 2.5, maxTemp: 41, rainfall: 1280, tribalPercent: 58.9, cluster: 2 },

    // Odisha - Coastal saline + tribal regions
    { id: 'od-may', name: 'Mayurbhanj', state: 'Odisha', lat: 21.93, lng: 86.73, salinity: 2.2, maxTemp: 39, rainfall: 1520, tribalPercent: 58.7, cluster: 3 },
    { id: 'od-ken', name: 'Kendujhar', state: 'Odisha', lat: 21.63, lng: 85.58, salinity: 2.8, maxTemp: 40, rainfall: 1450, tribalPercent: 45.4, cluster: 2 },
    { id: 'od-sun', name: 'Sundargarh', state: 'Odisha', lat: 22.12, lng: 84.03, salinity: 3.1, maxTemp: 41, rainfall: 1380, tribalPercent: 50.7, cluster: 2 },
    { id: 'od-gan', name: 'Ganjam', state: 'Odisha', lat: 19.38, lng: 84.68, salinity: 5.8, maxTemp: 38, rainfall: 1180, tribalPercent: 3.8, cluster: 0 },
    { id: 'od-bal', name: 'Balasore', state: 'Odisha', lat: 21.49, lng: 86.93, salinity: 6.2, maxTemp: 37, rainfall: 1580, tribalPercent: 11.2, cluster: 3 },

    // Jharkhand - Tribal heartland
    { id: 'jh-gum', name: 'Gumla', state: 'Jharkhand', lat: 23.04, lng: 84.54, salinity: 2.4, maxTemp: 39, rainfall: 1340, tribalPercent: 68.4, cluster: 2 },
    { id: 'jh-sim', name: 'Simdega', state: 'Jharkhand', lat: 22.62, lng: 84.50, salinity: 2.6, maxTemp: 39, rainfall: 1290, tribalPercent: 71.3, cluster: 2 },
    { id: 'jh-lok', name: 'Lohardaga', state: 'Jharkhand', lat: 23.44, lng: 84.69, salinity: 2.3, maxTemp: 40, rainfall: 1260, tribalPercent: 56.2, cluster: 2 },
    { id: 'jh-pkr', name: 'Pakur', state: 'Jharkhand', lat: 24.64, lng: 87.84, salinity: 3.8, maxTemp: 41, rainfall: 1150, tribalPercent: 45.8, cluster: 2 },

    // Chhattisgarh - Rice belt with tribal population
    { id: 'cg-bas', name: 'Bastar', state: 'Chhattisgarh', lat: 19.10, lng: 82.04, salinity: 1.9, maxTemp: 40, rainfall: 1380, tribalPercent: 66.2, cluster: 3 },
    { id: 'cg-dan', name: 'Dantewada', state: 'Chhattisgarh', lat: 18.90, lng: 81.35, salinity: 2.1, maxTemp: 40, rainfall: 1420, tribalPercent: 78.5, cluster: 3 },
    { id: 'cg-nar', name: 'Narayanpur', state: 'Chhattisgarh', lat: 19.72, lng: 81.25, salinity: 1.8, maxTemp: 39, rainfall: 1480, tribalPercent: 77.4, cluster: 3 },
    { id: 'cg-big', name: 'Bijapur', state: 'Chhattisgarh', lat: 18.84, lng: 80.78, salinity: 2.0, maxTemp: 40, rainfall: 1350, tribalPercent: 79.8, cluster: 3 },

    // Telangana/Andhra - Semi-arid
    { id: 'tg-mah', name: 'Mahbubnagar', state: 'Telangana', lat: 16.74, lng: 77.99, salinity: 4.8, maxTemp: 43, rainfall: 580, tribalPercent: 8.2, cluster: 0 },
    { id: 'tg-adi', name: 'Adilabad', state: 'Telangana', lat: 19.67, lng: 78.53, salinity: 3.5, maxTemp: 42, rainfall: 1050, tribalPercent: 18.4, cluster: 0 },
    { id: 'tg-kha', name: 'Khammam', state: 'Telangana', lat: 17.25, lng: 80.15, salinity: 3.2, maxTemp: 41, rainfall: 1120, tribalPercent: 27.3, cluster: 2 },
    { id: 'ap-ann', name: 'Anantapur', state: 'Andhra Pradesh', lat: 14.68, lng: 77.60, salinity: 5.5, maxTemp: 42, rainfall: 520, tribalPercent: 5.1, cluster: 0 },
    { id: 'ap-kur', name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.83, lng: 78.04, salinity: 5.2, maxTemp: 43, rainfall: 580, tribalPercent: 6.8, cluster: 0 },

    // Karnataka - Diverse agro-climatic
    { id: 'ka-bel', name: 'Bellary', state: 'Karnataka', lat: 15.15, lng: 76.93, salinity: 5.8, maxTemp: 42, rainfall: 480, tribalPercent: 8.5, cluster: 0 },
    { id: 'ka-big', name: 'Bidar', state: 'Karnataka', lat: 17.91, lng: 77.52, salinity: 4.5, maxTemp: 41, rainfall: 820, tribalPercent: 5.2, cluster: 0 },
    { id: 'ka-kod', name: 'Kodagu', state: 'Karnataka', lat: 12.42, lng: 75.74, salinity: 1.2, maxTemp: 32, rainfall: 3250, tribalPercent: 6.8, cluster: 3 },

    // Tamil Nadu - Coastal and interior
    { id: 'tn-ram', name: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.37, lng: 78.83, salinity: 7.8, maxTemp: 38, rainfall: 820, tribalPercent: 1.2, cluster: 1 },
    { id: 'tn-tut', name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.76, lng: 78.13, salinity: 7.2, maxTemp: 37, rainfall: 680, tribalPercent: 0.8, cluster: 1 },
    { id: 'tn-nil', name: 'Nilgiris', state: 'Tamil Nadu', lat: 11.41, lng: 76.69, salinity: 1.5, maxTemp: 25, rainfall: 1850, tribalPercent: 4.5, cluster: 3 },
];

// Crop types that can be searched
export const cropTypes = [
    { id: 'pearl-millet', name: 'Pearl Millet (Bajra)' },
    { id: 'sorghum', name: 'Sorghum (Jowar)' },
    { id: 'finger-millet', name: 'Finger Millet (Ragi)' },
    { id: 'rice', name: 'Rice (Traditional)' },
    { id: 'wheat', name: 'Wheat (Desi)' },
    { id: 'chickpea', name: 'Chickpea (Chana)' },
    { id: 'groundnut', name: 'Groundnut' },
    { id: 'sesame', name: 'Sesame (Til)' },
    { id: 'cotton', name: 'Cotton (Desi)' },
    { id: 'maize', name: 'Maize (Indigenous)' },
];

// K-Means Cluster Labels
export const clusterLabels: Record<number, { name: string; description: string; color: string }> = {
    0: { name: 'Arid Stress Zone', description: 'High heat, moderate salinity, low rainfall', color: '#ef4444' },
    1: { name: 'Hyper-Saline Belt', description: 'Extreme salinity and heat stress', color: '#f97316' },
    2: { name: 'Tribal Highland', description: 'Moderate climate with high tribal presence', color: '#8b5cf6' },
    3: { name: 'Humid Resilience Zone', description: 'High rainfall with traditional farming', color: '#22c55e' },
};
