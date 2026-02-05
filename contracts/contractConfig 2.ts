// Contract Configuration for BHUMI CropPricing
// After deploying the contract on Remix IDE, paste your contract address below

export const CONTRACT_ADDRESS = "0xA12AF30a5B555540e3D2013c7FB3eb793ff4b3B5"; // Deployed on Sepolia

// Sepolia Testnet Configuration
export const CHAIN_CONFIG = {
    chainId: "0xaa36a7", // 11155111 in hex
    chainName: "Sepolia Testnet",
    nativeCurrency: {
        name: "Sepolia ETH",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: ["https://sepolia.infura.io/v3/", "https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

// ABI for CropPricing contract - This is generated from your Solidity contract
export const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "recordId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "crop",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "qualityScore",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantityQuintals",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "minPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "maxPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "guaranteedPrice",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "farmer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "PriceRecorded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_farmer",
                "type": "address"
            }
        ],
        "name": "getFarmerRecords",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_recordId",
                "type": "uint256"
            }
        ],
        "name": "getPriceRecord",
        "outputs": [
            {
                "internalType": "string",
                "name": "crop",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "qualityScore",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "quantityQuintals",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "guaranteedPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "confidenceScore",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "farmer",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalRecords",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "priceRecords",
        "outputs": [
            {
                "internalType": "string",
                "name": "crop",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "qualityScore",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "quantityQuintals",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "guaranteedPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "confidenceScore",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "farmer",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "recordCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "recordIds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_crop",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_location",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "_qualityScore",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_quantityQuintals",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_minPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_guaranteedPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_confidenceScore",
                "type": "uint256"
            }
        ],
        "name": "storePriceRecord",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
