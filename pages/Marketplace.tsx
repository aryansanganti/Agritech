import React, { useState, useEffect } from 'react';
import { User, Language, Listing, MarketplaceListing } from '../types';
import { ArrowLeft, ShoppingBag, Plus, QrCode, ShieldCheck, TrendingUp, MapPin, ExternalLink, Trash2, Leaf, Truck, Route } from 'lucide-react';
import { MARKETPLACE_LISTINGS } from '../data/listings';
import { getMarketplaceListings, removeMarketplaceListing } from '../services/marketplaceService';
import { CarbonLogistics } from '../components/CarbonLogistics';
import { DISTRICT_COORDINATES } from '../services/carbonLogisticsService';
import { MarketTicker } from '../components/MarketTicker';

interface Props {
    user: User | null;
    lang: Language;
    onBack: () => void;
    onNavigateToQualityGrading?: () => void;
}

export const Marketplace: React.FC<Props> = ({ user, lang, onBack, onNavigateToQualityGrading }) => {
    // Role State: 'farmer' or 'vendor'
    const [role, setRole] = useState<'farmer' | 'vendor'>('vendor');
    const [selectedListing, setSelectedListing] = useState<Listing | MarketplaceListing | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [blockchainListings, setBlockchainListings] = useState<MarketplaceListing[]>([]);

    // Carbon Logistics State
    const [showCarbonLogistics, setShowCarbonLogistics] = useState(false);
    const [selectedForLogistics, setSelectedForLogistics] = useState<MarketplaceListing | null>(null);
    const [vendorDistrict, setVendorDistrict] = useState('Mumbai');
    const [vendorState, setVendorState] = useState('Maharashtra');
    const [showVendorLocationModal, setShowVendorLocationModal] = useState(false);

    // Available districts for vendor location selection
    const availableDistricts = Object.keys(DISTRICT_COORDINATES).map(d =>
        d.charAt(0).toUpperCase() + d.slice(1)
    );

    useEffect(() => {
        const loadListings = () => {
            const listings = getMarketplaceListings();
            setBlockchainListings(listings);
        };
        loadListings();
        const handleNewListing = () => loadListings();
        window.addEventListener('marketplaceListingAdded', handleNewListing);
        window.addEventListener('marketplaceListingRemoved', handleNewListing);
        return () => {
            window.removeEventListener('marketplaceListingAdded', handleNewListing);
            window.removeEventListener('marketplaceListingRemoved', handleNewListing);
        };
    }, []);

    const isBlockchainListing = (item: Listing | MarketplaceListing): item is MarketplaceListing => {
        return 'etherscanUrl' in item;
    };

    const handleListNewProduce = () => {
        if (onNavigateToQualityGrading) {
            onNavigateToQualityGrading();
        }
    };

    const handleRemoveListing = (id: string) => {
        removeMarketplaceListing(id);
    };

    const handleOpenCarbonLogistics = (item: MarketplaceListing) => {
        setSelectedForLogistics(item);
        setShowVendorLocationModal(true);
    };

    // MOCK Blockchain Verification View (UI from user snippet with added logic)
    const renderVerificationModal = () => {
        if (!selectedListing || !showQR) return null;
        const isBlockchain = isBlockchainListing(selectedListing);

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
                <div className="bg-white dark:bg-[#1A202C] rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-bhoomi-green/30" onClick={e => e.stopPropagation()}>
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isBlockchain ? 'Ethereum Verified' : 'Blockchain Verified'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Digital Product Passport
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-left text-sm space-y-2 font-mono border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hash:</span>
                                <span className="text-bhoomi-green truncate max-w-[150px]">
                                    {isBlockchain ? selectedListing.transactionHash : selectedListing.blockchainHash}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Origin:</span>
                                <span>{typeof selectedListing.location === 'string' ? selectedListing.location : `${selectedListing.location.district}, ${selectedListing.location.state}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Grade:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {selectedListing.grade} {isBlockchain ? '(AI Certified)' : ''}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Harvest:</span>
                                <span>{selectedListing.harvestDate}</span>
                            </div>
                        </div>

                        {isBlockchain && selectedListing.etherscanUrl && (
                            <a href={selectedListing.etherscanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                                <ExternalLink size={16} />
                                View on Etherscan
                            </a>
                        )}

                        <div className="py-4">
                            <div className="w-48 h-48 bg-white p-2 mx-auto border-4 border-gray-900 rounded-lg">
                                <div
                                    className="w-full h-full bg-contain bg-no-repeat bg-center"
                                    style={{
                                        backgroundImage: `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                            isBlockchain && selectedListing.etherscanUrl
                                                ? selectedListing.etherscanUrl
                                                : `https://bhumi.app/verify/${selectedListing.blockchainHash || 'unknown'}`
                                        )}')`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Scan to view full history on ledger</p>
                        </div>

                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full py-3 bg-bhoomi-green hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close Passport
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Vendor Location Modal for Carbon Footprint calculation
    const renderVendorLocationModal = () => {
        if (!showVendorLocationModal || !selectedForLogistics) return null;

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowVendorLocationModal(false)}>
                <div className="bg-white dark:bg-[#1A202C] rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-green-500/30" onClick={e => e.stopPropagation()}>
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <MapPin className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Set Your Location</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your warehouse/delivery location to calculate optimal route</p>
                        </div>

                        <div className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District</label>
                                <select
                                    value={vendorDistrict}
                                    onChange={(e) => setVendorDistrict(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {availableDistricts.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                                <input
                                    type="text"
                                    value={vendorState}
                                    onChange={(e) => setVendorState(e.target.value)}
                                    placeholder="Enter state"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowVendorLocationModal(false)}
                                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowVendorLocationModal(false);
                                    setShowCarbonLogistics(true);
                                }}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Route size={18} />
                                Calculate Route
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            {renderVerificationModal()}
            {renderVendorLocationModal()}
            {showCarbonLogistics && selectedForLogistics && (
                <CarbonLogistics
                    listing={selectedForLogistics}
                    vendorLocation={{ district: vendorDistrict, state: vendorState }}
                    onClose={() => {
                        setShowCarbonLogistics(false);
                        setSelectedForLogistics(null);
                    }}
                />
            )}
            <MarketTicker />

            <div className="p-4 md:p-6 max-w-7xl mx-auto">

                {/* Header (UI from user snippet) */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingBag className="text-bhoomi-green" /> Crop Marketplace
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Direct Farm-to-Table Trading</p>
                        </div>
                    </div>

                    {/* Role Toggler (UI from user snippet) */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start md:self-auto">
                        <button
                            onClick={() => setRole('farmer')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'farmer' ? 'bg-white dark:bg-gray-700 shadow text-bhoomi-green' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            I am a Farmer
                        </button>
                        <button
                            onClick={() => setRole('vendor')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'vendor' ? 'bg-white dark:bg-gray-700 shadow text-bhoomi-green' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            I am a Vendor
                        </button>
                    </div>
                </header>

                {/* FARMER VIEW */}
                {role === 'farmer' && (
                    <div className="animate-fade-in">
                        <div onClick={handleListNewProduce} className="glass-panel p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-bhoomi-green transition-colors cursor-pointer group mb-8">
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-bhoomi-green" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">List New Produce</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                                Upload photos, get AI grading, and generate a blockchain passport instantly.
                            </p>
                        </div>

                        {blockchainListings.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Blockchain Verified Listings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blockchainListings.map(item => (
                                        <ListingCard
                                            key={item.id}
                                            item={item}
                                            isOwner={true}
                                            onViewQR={() => { setSelectedListing(item); setShowQR(true); }}
                                            onRemove={() => handleRemoveListing(item.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Active Listings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MARKETPLACE_LISTINGS.slice(0, 1).map(item => (
                                <ListingCard
                                    key={item.id}
                                    item={item}
                                    isOwner={true}
                                    onViewQR={() => { setSelectedListing(item); setShowQR(true); }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* VENDOR VIEW */}
                {role === 'vendor' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Premium Certified Crops</h2>
                            <button className="flex items-center gap-2 text-sm text-bhoomi-green font-medium hover:underline">
                                <TrendingUp size={16} /> Market Trends
                            </button>
                        </div>

                        {/* Mixed Listings Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Priority show blockchain listings */}
                            {blockchainListings.map(item => (
                                <ListingCard
                                    key={item.id}
                                    item={item}
                                    isOwner={false}
                                    onViewQR={() => { setSelectedListing(item); setShowQR(true); }}
                                    onCarbonClick={() => handleOpenCarbonLogistics(item)}
                                    isBlockchain={true}
                                />
                            ))}
                            {/* Then standard listings */}
                            {MARKETPLACE_LISTINGS.map(item => (
                                <ListingCard
                                    key={item.id}
                                    item={item}
                                    isOwner={false}
                                    onViewQR={() => { setSelectedListing(item); setShowQR(true); }}
                                    onCarbonClick={() => {
                                        // Wrapper for standard listing to support carbon logic
                                        const ml: MarketplaceListing = {
                                            ...item,
                                            verificationStatus: 'verified',
                                            qualityScore: item.grade === 'A' ? 9 : 7,
                                            minPrice: item.price * 0.9,
                                            maxPrice: item.price * 1.1,
                                            guaranteedPrice: item.price * 0.85,
                                            transactionHash: '0x...',
                                            etherscanUrl: '',
                                            contractAddress: '',
                                            recordId: 0,
                                            listedDate: new Date().toISOString(),
                                            timestamp: Date.now()
                                        } as MarketplaceListing;
                                        handleOpenCarbonLogistics(ml);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-Component: Listing Card (UI from user snippet with added features)
const ListingCard: React.FC<{
    item: Listing | MarketplaceListing,
    isOwner: boolean,
    onViewQR: () => void,
    onRemove?: () => void,
    onCarbonClick?: () => void,
    isBlockchain?: boolean
}> = ({ item, isOwner, onViewQR, onRemove, onCarbonClick, isBlockchain }) => {
    // Calculate Price Difference
    const priceDiff = item.price - item.marketPrice;
    const isCheaper = priceDiff < 0;
    const defaultImage = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop';

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border relative ${isBlockchain ? 'border-purple-500/30 hover:border-purple-500/60' : 'border-transparent hover:border-bhoomi-green/30'}`}>
            {isBlockchain && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] py-0.5 px-3 flex items-center justify-center gap-1 z-10 font-bold uppercase tracking-wider">
                    Ethereum Verified
                </div>
            )}

            {/* Image Header */}
            <div className={`relative h-48 overflow-hidden ${isBlockchain ? 'mt-4' : ''}`}>
                <img src={item.image || defaultImage} alt={item.crop} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {item.quantity} Qtl
                </div>
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 ${item.grade === 'A' ? 'bg-green-500 text-white' :
                    item.grade === 'B' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    <ShieldCheck size={12} /> Grade {item.grade}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.crop} <span className="text-sm font-normal text-gray-500">({item.variety})</span></h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin size={12} /> {typeof item.location === 'string' ? item.location : `${item.location.district}, ${item.location.state}`}
                        </div>
                    </div>
                </div>

                <div className="my-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                        <div className="text-2xl font-bold text-bhoomi-green">₹{item.price}<span className="text-sm font-normal text-gray-400">/q</span></div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Mandi Avg</p>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">₹{item.marketPrice}</div>
                        <div className={`text-[10px] font-bold ${isCheaper ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(priceDiff)} {isCheaper ? 'below' : 'above'} avg
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onViewQR}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <QrCode size={16} /> {isOwner ? 'View Passport' : 'Verify'}
                    </button>

                    {isOwner && onRemove && (
                        <button onClick={onRemove} className="py-2.5 px-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center">
                            <Trash2 size={16} />
                        </button>
                    )}

                    {!isOwner && (
                        <>
                            {onCarbonClick && (
                                <button
                                    onClick={onCarbonClick}
                                    className="py-2.5 px-3 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                                    title="Calculate Carbon Footprint"
                                >
                                    <Leaf size={16} />
                                    <Truck size={14} />
                                </button>
                            )}
                            <button className="flex-1 py-2.5 bg-bhoomi-green hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20">
                                Buy Now
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
