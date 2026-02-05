const { getDistrictData, getHotspotData } = require('./dataLoader');
const { CROP_TRAIT_COMPATIBILITY, STRESS_TRAIT_WEIGHTS } = require('../data/staticMetadata');

// Formula: Score = (Trait Match * 0.4) + (Environmental Stress * 0.4) + (Tribal % * 0.2)
const calculateHotspotScore = (crop, desiredTraits) => {
    const districts = getDistrictData();
    const topologyHotspots = getHotspotData(); // Pre-computed scores (Dataset 5)

    // Normalize frontend IDs to Data Keys
    const cropMap = {
        'rice': 'Rice',
        'pearl-millet': 'Pearl Millet',
        'sorghum': 'Sorghum',
        'finger-millet': 'Finger Millet',
        'wheat': 'Wheat',
        'chickpea': 'Chickpea',
        'groundnut': 'Groundnut',
        'sesame': 'Sesame',
        'cotton': 'Cotton',
        'maize': 'Maize'
    };
    const cropName = cropMap[crop.toLowerCase()] || crop;

    // DYNAMIC RANGE CALCULATION - Use actual min/max from dataset for better distribution
    const salinityValues = districts.map(d => d.soil_ec_ds_m);
    const tempValues = districts.map(d => d.max_temp_c);
    const rainfallValues = districts.map(d => d.annual_rainfall_mm);
    const tribalValues = districts.map(d => d.tribal_percent);

    const salinityRange = { min: Math.min(...salinityValues), max: Math.max(...salinityValues) };
    const tempRange = { min: Math.min(...tempValues), max: Math.max(...tempValues) };
    const rainfallRange = { min: Math.min(...rainfallValues), max: Math.max(...rainfallValues) };
    const tribalRange = { min: Math.min(...tribalValues), max: Math.max(...tribalValues) };

    return districts.map(district => {
        // 1. Trait Match Score (from Dataset 4 - Compatibility)
        let traitMatchTotal = 0;
        let traitCount = 0;

        if (desiredTraits.salinityTolerance) {
            const match = CROP_TRAIT_COMPATIBILITY.find(c => c.crop === cropName && c.trait === 'SalinityTolerance');
            if (match) traitMatchTotal += match.score;
            traitCount++;
        }
        if (desiredTraits.heatTolerance) {
            const match = CROP_TRAIT_COMPATIBILITY.find(c => c.crop === cropName && c.trait === 'HeatResistance');
            if (match) traitMatchTotal += match.score;
            traitCount++;
        }
        if (desiredTraits.droughtTolerance) {
            const match = CROP_TRAIT_COMPATIBILITY.find(c => c.crop === cropName && c.trait === 'DroughtHardiness');
            if (match) traitMatchTotal += match.score;
            traitCount++;
        }

        const traitMatchScore = traitCount > 0 ? traitMatchTotal / traitCount : 0.5;

        // 2. Environmental Stress Score (IMPROVED: Use dynamic ranges from actual data)
        // This ensures full 0-1 distribution for better heatmap contrast
        const salinityScore = salinityRange.max > salinityRange.min
            ? (district.soil_ec_ds_m - salinityRange.min) / (salinityRange.max - salinityRange.min)
            : 0.5;

        const heatScore = tempRange.max > tempRange.min
            ? (district.max_temp_c - tempRange.min) / (tempRange.max - tempRange.min)
            : 0.5;

        // For drought: LOWER rainfall = HIGHER drought stress
        const droughtScore = rainfallRange.max > rainfallRange.min
            ? 1 - ((district.annual_rainfall_mm - rainfallRange.min) / (rainfallRange.max - rainfallRange.min))
            : 0.5;

        let envStressScore = 0;
        if (desiredTraits.salinityTolerance) envStressScore += salinityScore * 0.6; // Weighted heavily for salinity if requested
        else envStressScore += salinityScore * 0.1;

        if (desiredTraits.heatTolerance) envStressScore += heatScore * 0.6;
        else envStressScore += heatScore * 0.1;

        if (desiredTraits.droughtTolerance) envStressScore += droughtScore * 0.6;
        else envStressScore += droughtScore * 0.1;

        // Normalize envStressScore (max possible is 1.8 if all traits selected, so divide by 1.8)
        const maxPossible = (desiredTraits.salinityTolerance ? 0.6 : 0.1) +
            (desiredTraits.heatTolerance ? 0.6 : 0.1) +
            (desiredTraits.droughtTolerance ? 0.6 : 0.1);
        envStressScore = maxPossible > 0 ? envStressScore / maxPossible : 0;

        // 3. Tribal % Score (use dynamic range too)
        const tribalScore = tribalRange.max > tribalRange.min
            ? (district.tribal_percent - tribalRange.min) / (tribalRange.max - tribalRange.min)
            : 0.5;

        // Final Weighted Score
        const finalScore = (traitMatchScore * 0.4) + (envStressScore * 0.4) + (tribalScore * 0.2);

        // Check if pre-computed hotspot exists (Dataset 5 Override/Boost)
        const knownHotspot = topologyHotspots.find(h =>
            h.crop === cropName &&
            // Simple match logic (in real app, map state/district precisely)
            // Here we assume dataset 5 rows represent "archetypes" per zone.
            // For now, let's just use the calculated score but attach "Reasons" from topology if close match.
            // Note: The prompt implies Dataset 5 has "Pre-computed scores". 
            // If the user wants EXACT Dataset 5 scores for specific districts, we should lookup by name.
            // But Dataset 5 uses "Topology Zones" (Coastal, Deccan) not District names directly in the CSV snippet provided.
            // WAIT - Reviewing Dataset 5 CSV snippet:
            // "Rice,Coastal Plains,..."
            // It maps CROP + ZONE -> Score.
            // We need to map District -> Zone.
            district.climate_zone.includes(h.topology_zone.split(' ')[0]) // fuzzy match zone
        );

        return {
            district: {
                id: district.district, // Use name as ID for now
                name: district.district,
                state: district.state,
                lat: district.lat,
                lng: district.lng,
                salinity: district.soil_ec_ds_m,
                maxTemp: district.max_temp_c,
                rainfall: district.annual_rainfall_mm,
                tribalPercent: district.tribal_percent,
                cluster: 0 // Placeholder
            },
            traitScore: finalScore,
            salinityScore,
            heatScore,
            tribalScore,
            // If we found a topology match, use its reason, else generic
            reason: knownHotspot ? knownHotspot.reason : `High adaptation potential due to ${envStressScore > 0.6 ? 'severe environmental stress' : 'tribal conservation'}.`
        };
    }).sort((a, b) => b.traitScore - a.traitScore);
};

module.exports = { calculateHotspotScore };
