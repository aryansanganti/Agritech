// Dataset 2: crop_traits
const CROP_TRAITS = [
    { crop: 'Rice', local_name: 'Traditional', heat_tolerance: 'Medium', drought_tolerance: 'Low', salinity_tolerance: 'Low', water_requirement_mm: 1200, growth_duration_days: 120 },
    { crop: 'Pearl Millet', local_name: 'Bajra', heat_tolerance: 'High', drought_tolerance: 'High', salinity_tolerance: 'Medium', water_requirement_mm: 350, growth_duration_days: 90 },
    { crop: 'Sorghum', local_name: 'Jowar', heat_tolerance: 'High', drought_tolerance: 'High', salinity_tolerance: 'Medium', water_requirement_mm: 450, growth_duration_days: 105 },
    { crop: 'Finger Millet', local_name: 'Ragi', heat_tolerance: 'Medium', drought_tolerance: 'High', salinity_tolerance: 'Low', water_requirement_mm: 500, growth_duration_days: 110 },
    { crop: 'Wheat', local_name: 'Desi', heat_tolerance: 'Low', drought_tolerance: 'Low', salinity_tolerance: 'Low', water_requirement_mm: 450, growth_duration_days: 130 },
    { crop: 'Chickpea', local_name: 'Chana', heat_tolerance: 'Medium', drought_tolerance: 'High', salinity_tolerance: 'Low', water_requirement_mm: 300, growth_duration_days: 100 },
    { crop: 'Groundnut', local_name: 'Groundnut', heat_tolerance: 'Medium', drought_tolerance: 'Medium', salinity_tolerance: 'Low', water_requirement_mm: 500, growth_duration_days: 110 },
    { crop: 'Sesame', local_name: 'Til', heat_tolerance: 'High', drought_tolerance: 'High', salinity_tolerance: 'Medium', water_requirement_mm: 300, growth_duration_days: 90 },
    { crop: 'Cotton', local_name: 'Desi', heat_tolerance: 'High', drought_tolerance: 'Medium', salinity_tolerance: 'Medium', water_requirement_mm: 700, growth_duration_days: 160 },
    { crop: 'Maize', local_name: 'Indigenous', heat_tolerance: 'Medium', drought_tolerance: 'Medium', salinity_tolerance: 'Low', water_requirement_mm: 600, growth_duration_days: 110 }
];

// Dataset 3: stress_trait_weights
const STRESS_TRAIT_WEIGHTS = {
    SalinityTolerance: { ec_weight: 0.6, temp_weight: 0.2, rainfall_weight: 0.2 },
    HeatResistance: { ec_weight: 0.1, temp_weight: 0.7, rainfall_weight: 0.2 },
    DroughtHardiness: { ec_weight: 0.2, temp_weight: 0.2, rainfall_weight: 0.6 }
};

// Dataset 4: crop_trait_compatibility
const CROP_TRAIT_COMPATIBILITY = [
    { crop: 'Rice', trait: 'SalinityTolerance', score: 0.2 },
    { crop: 'Rice', trait: 'HeatResistance', score: 0.3 },
    { crop: 'Rice', trait: 'DroughtHardiness', score: 0.2 },
    { crop: 'Pearl Millet', trait: 'SalinityTolerance', score: 0.6 },
    { crop: 'Pearl Millet', trait: 'HeatResistance', score: 0.9 },
    { crop: 'Pearl Millet', trait: 'DroughtHardiness', score: 0.95 },
    { crop: 'Sorghum', trait: 'SalinityTolerance', score: 0.5 },
    { crop: 'Sorghum', trait: 'HeatResistance', score: 0.85 },
    { crop: 'Sorghum', trait: 'DroughtHardiness', score: 0.8 },
    { crop: 'Finger Millet', trait: 'SalinityTolerance', score: 0.3 },
    { crop: 'Finger Millet', trait: 'HeatResistance', score: 0.6 },
    { crop: 'Finger Millet', trait: 'DroughtHardiness', score: 0.85 },
    { crop: 'Cotton', trait: 'SalinityTolerance', score: 0.6 },
    { crop: 'Cotton', trait: 'HeatResistance', score: 0.8 },
    { crop: 'Cotton', trait: 'DroughtHardiness', score: 0.6 }
];

module.exports = {
    CROP_TRAITS,
    STRESS_TRAIT_WEIGHTS,
    CROP_TRAIT_COMPATIBILITY
};
