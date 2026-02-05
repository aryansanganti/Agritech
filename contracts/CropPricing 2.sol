// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CropPricing
 * @dev Stores crop pricing data on blockchain for BHUMI Agritech
 * Deploy this contract on Sepolia testnet using Remix IDE
 * Get Sepolia ETH from: https://sepoliafaucet.com/ or https://www.alchemy.com/faucets/ethereum-sepolia
 */
contract CropPricing {
    
    struct PriceRecord {
        string crop;
        string location;
        uint8 qualityScore;      // 1-10
        uint256 quantityQuintals;
        uint256 minPrice;        // in paise (1 INR = 100 paise)
        uint256 maxPrice;        // in paise
        uint256 guaranteedPrice; // MGP in paise
        uint256 confidenceScore; // 0-100
        address farmer;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from record ID to PriceRecord
    mapping(uint256 => PriceRecord) public priceRecords;
    
    // Array to store all record IDs
    uint256[] public recordIds;
    
    // Counter for generating unique IDs
    uint256 public recordCount;
    
    // Events
    event PriceRecorded(
        uint256 indexed recordId,
        string crop,
        string location,
        uint8 qualityScore,
        uint256 quantityQuintals,
        uint256 minPrice,
        uint256 maxPrice,
        uint256 guaranteedPrice,
        address indexed farmer,
        uint256 timestamp
    );
    
    /**
     * @dev Store a new crop price record
     * @param _crop Name of the crop
     * @param _location District, State
     * @param _qualityScore Quality score from 1-10
     * @param _quantityQuintals Quantity in quintals
     * @param _minPrice Minimum price in paise
     * @param _maxPrice Maximum price in paise
     * @param _guaranteedPrice Minimum Guaranteed Price in paise
     * @param _confidenceScore AI confidence score 0-100
     */
    function storePriceRecord(
        string memory _crop,
        string memory _location,
        uint8 _qualityScore,
        uint256 _quantityQuintals,
        uint256 _minPrice,
        uint256 _maxPrice,
        uint256 _guaranteedPrice,
        uint256 _confidenceScore
    ) external returns (uint256) {
        require(_qualityScore >= 1 && _qualityScore <= 10, "Quality score must be 1-10");
        require(_quantityQuintals > 0, "Quantity must be greater than 0");
        require(_maxPrice >= _minPrice, "Max price must be >= min price");
        
        recordCount++;
        uint256 recordId = recordCount;
        
        priceRecords[recordId] = PriceRecord({
            crop: _crop,
            location: _location,
            qualityScore: _qualityScore,
            quantityQuintals: _quantityQuintals,
            minPrice: _minPrice,
            maxPrice: _maxPrice,
            guaranteedPrice: _guaranteedPrice,
            confidenceScore: _confidenceScore,
            farmer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        recordIds.push(recordId);
        
        emit PriceRecorded(
            recordId,
            _crop,
            _location,
            _qualityScore,
            _quantityQuintals,
            _minPrice,
            _maxPrice,
            _guaranteedPrice,
            msg.sender,
            block.timestamp
        );
        
        return recordId;
    }
    
    /**
     * @dev Get a price record by ID
     */
    function getPriceRecord(uint256 _recordId) external view returns (
        string memory crop,
        string memory location,
        uint8 qualityScore,
        uint256 quantityQuintals,
        uint256 minPrice,
        uint256 maxPrice,
        uint256 guaranteedPrice,
        uint256 confidenceScore,
        address farmer,
        uint256 timestamp
    ) {
        require(priceRecords[_recordId].exists, "Record does not exist");
        PriceRecord memory record = priceRecords[_recordId];
        return (
            record.crop,
            record.location,
            record.qualityScore,
            record.quantityQuintals,
            record.minPrice,
            record.maxPrice,
            record.guaranteedPrice,
            record.confidenceScore,
            record.farmer,
            record.timestamp
        );
    }
    
    /**
     * @dev Get total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return recordCount;
    }
    
    /**
     * @dev Get all record IDs for a specific farmer
     */
    function getFarmerRecords(address _farmer) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First, count how many records belong to this farmer
        for (uint256 i = 0; i < recordIds.length; i++) {
            if (priceRecords[recordIds[i]].farmer == _farmer) {
                count++;
            }
        }
        
        // Create array and populate
        uint256[] memory farmerRecordIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < recordIds.length; i++) {
            if (priceRecords[recordIds[i]].farmer == _farmer) {
                farmerRecordIds[index] = recordIds[i];
                index++;
            }
        }
        
        return farmerRecordIds;
    }
}
