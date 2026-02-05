const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const loadCSV = (filename) => {
    const filePath = path.join(__dirname, '../data', filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true // Auto-convert numbers
    });
};

const getDistrictData = () => loadCSV('india_district_climate_640.csv');
const getHotspotData = () => loadCSV('crop_topology_genetic_hotspots.csv');

module.exports = {
    getDistrictData,
    getHotspotData
};
