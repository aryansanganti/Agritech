import { MarketplaceListing } from '../types';

// Marketplace Service
// Manages marketplace listings with blockchain verification

import { BlockchainTransactionResult } from './ethereumService';
import { QualityGradingData } from './qualityGradingService';

// Interface removed to use shared definition from types.ts


const STORAGE_KEY = 'bhumi_marketplace_listings';
const PENDING_LISTING_KEY = 'bhumi_pending_marketplace_listing';

// Generate unique ID
const generateId = (): string => {
    return `ML-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all marketplace listings
export const getMarketplaceListings = (): MarketplaceListing[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as MarketplaceListing[];
    } catch (error) {
        console.error('Failed to get marketplace listings:', error);
        return [];
    }
};

// Add new listing to marketplace
export const addMarketplaceListing = (listing: Omit<MarketplaceListing, 'id' | 'listedDate' | 'timestamp'>): MarketplaceListing => {
    try {
        const listings = getMarketplaceListings();
        const newListing: MarketplaceListing = {
            ...listing,
            id: generateId(),
            listedDate: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        listings.unshift(newListing); // Add to beginning
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));

        // Dispatch event for updates
        window.dispatchEvent(new CustomEvent('marketplaceListingAdded', { detail: newListing }));

        return newListing;
    } catch (error) {
        console.error('Failed to add marketplace listing:', error);
        throw error;
    }
};

// Remove listing from marketplace
export const removeMarketplaceListing = (id: string): boolean => {
    try {
        const listings = getMarketplaceListings();
        const filtered = listings.filter(l => l.id !== id);
        if (filtered.length === listings.length) return false;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('marketplaceListingRemoved', { detail: id }));
        return true;
    } catch (error) {
        console.error('Failed to remove marketplace listing:', error);
        return false;
    }
};

// Get listing by ID
export const getMarketplaceListingById = (id: string): MarketplaceListing | null => {
    const listings = getMarketplaceListings();
    return listings.find(l => l.id === id) || null;
};

// Get listings by farmer address
export const getListingsByFarmer = (address: string): MarketplaceListing[] => {
    const listings = getMarketplaceListings();
    return listings.filter(l => l.farmerAddress?.toLowerCase() === address.toLowerCase());
};

// Store pending listing data (before adding to marketplace)
export interface PendingMarketplaceData {
    crop: string;
    location: { district: string; state: string };
    quality: number;
    quantity: number;
    grade: 'A' | 'B' | 'C';
    minPrice: number;
    maxPrice: number;
    guaranteedPrice: number;
    gradingDetails?: {
        colorChecking: string;
        sizeCheck: string;
        textureCheck: string;
        shapeCheck: string;
    };
    blockchainTx?: BlockchainTransactionResult;
}

export const storePendingMarketplaceData = (data: PendingMarketplaceData): void => {
    try {
        localStorage.setItem(PENDING_LISTING_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('pendingMarketplaceUpdated', { detail: data }));
    } catch (error) {
        console.error('Failed to store pending marketplace data:', error);
    }
};

export const getPendingMarketplaceData = (): PendingMarketplaceData | null => {
    try {
        const stored = localStorage.getItem(PENDING_LISTING_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as PendingMarketplaceData;
    } catch (error) {
        console.error('Failed to get pending marketplace data:', error);
        return null;
    }
};

export const clearPendingMarketplaceData = (): void => {
    try {
        localStorage.removeItem(PENDING_LISTING_KEY);
        window.dispatchEvent(new CustomEvent('pendingMarketplaceCleared'));
    } catch (error) {
        console.error('Failed to clear pending marketplace data:', error);
    }
};

// Create listing from blockchain transaction and quality grading
export const createListingFromBlockchain = (
    tx: BlockchainTransactionResult,
    qualityData: QualityGradingData,
    quantity: number,
    farmerName: string = 'Anonymous Farmer',
    farmerAddress?: string
): MarketplaceListing => {
    const listing = addMarketplaceListing({
        farmerName,
        farmerAddress,
        crop: tx.data.crop || qualityData.crop,
        grade: qualityData.overallGrade,
        qualityScore: tx.data.qualityScore || qualityData.qualityScore,
        price: qualityData.estimatedPrice,
        minPrice: tx.data.minPrice || qualityData.estimatedPrice * 0.9,
        maxPrice: tx.data.maxPrice || qualityData.estimatedPrice * 1.1,
        guaranteedPrice: tx.data.guaranteedPrice || qualityData.estimatedPrice * 0.85,
        marketPrice: Math.round((tx.data.minPrice + tx.data.maxPrice) / 2) || qualityData.estimatedPrice,
        quantity: tx.data.quantity || quantity,
        location: {
            district: qualityData.district,
            state: qualityData.state
        },
        blockchainHash: tx.transactionHash,
        transactionHash: tx.transactionHash,
        etherscanUrl: tx.etherscanUrl,
        contractAddress: '0xA12AF30a5B555540e3D2013c7FB3eb793ff4b3B5', // Deployed contract
        recordId: tx.blockNumber,
        gradingDetails: qualityData.gradingDetails,
        harvestDate: new Date().toISOString().split('T')[0],

        // Default values for new required fields
        verificationStatus: 'verified',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000', // Placeholder
        variety: 'Standard'
    });

    return listing;
};

// Check if a crop has been blockchain verified (for marketplace eligibility)
export const isBlockchainVerified = (txHash: string): boolean => {
    return txHash && txHash.startsWith('0x') && txHash.length === 66;
};

// Convert quality score to grade
export const scoreToGrade = (score: number): 'A' | 'B' | 'C' => {
    if (score >= 8) return 'A';
    if (score >= 5) return 'B';
    return 'C';
};