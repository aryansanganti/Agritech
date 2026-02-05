import React, { useState } from 'react';
import { User, Language, Listing } from '../types';
import { ArrowLeft, User as UserIcon, ShoppingBag, Plus, QrCode, ShieldCheck, TrendingUp, MapPin } from 'lucide-react';
import { MARKETPLACE_LISTINGS } from '../data/listings';
import { translations } from '../utils/translations';

interface Props {
    user: User | null;
    lang: Language;
    onBack: () => void;
}

export const Marketplace: React.FC<Props> = ({ user, lang, onBack }) => {
    // Role State: 'farmer' or 'vendor'
    const [role, setRole] = useState<'farmer' | 'vendor'>('vendor');
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [showQR, setShowQR] = useState(false);

    // Filter listings if needed
    const listings = MARKETPLACE_LISTINGS;

    const toggleRole = () => setRole(r => r === 'vendor' ? 'farmer' : 'vendor');

    // MOCK Blockchain Verification View
    const renderVerificationModal = () => {
        if (!selectedListing || !showQR) return null;

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
                <div className="bg-white dark:bg-[#1A202C] rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-bhumi-green/30" onClick={e => e.stopPropagation()}>
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blockchain Verified</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Digital Product Passport
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-left text-sm space-y-2 font-mono border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hash:</span>
                                <span className="text-bhumi-green truncate max-w-[150px]">{selectedListing.blockchainHash}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Origin:</span>
                                <span>{selectedListing.location.district}, {selectedListing.location.state}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Grade:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{selectedListing.grade} (AI Certified)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Harvest:</span>
                                <span>{selectedListing.harvestDate}</span>
                            </div>
                        </div>

                        <div className="py-4">
                            {/* Placeholder QR Code */}
                            <div className="w-48 h-48 bg-white p-2 mx-auto border-4 border-gray-900 rounded-lg">
                                {/* Simple CSS Pattern to fake a QR */}
                                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BhumiVerified')] bg-contain bg-no-repeat bg-center"></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Scan to view full history on ledger</p>
                        </div>

                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full py-3 bg-bhumi-green hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close Passport
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
            {renderVerificationModal()}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="text-bhumi-green" /> Crop Marketplace
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Direct Farm-to-Table Trading</p>
                    </div>
                </div>

                {/* Role Toggler */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start md:self-auto">
                    <button
                        onClick={() => setRole('farmer')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'farmer' ? 'bg-white dark:bg-gray-700 shadow text-bhumi-green' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        I am a Farmer
                    </button>
                    <button
                        onClick={() => setRole('vendor')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'vendor' ? 'bg-white dark:bg-gray-700 shadow text-bhumi-green' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        I am a Vendor
                    </button>
                </div>
            </header>

            {/* FARMER VIEW */}
            {role === 'farmer' && (
                <div className="animate-fade-in">
                    <div className="glass-panel p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-bhumi-green transition-colors cursor-pointer group mb-8">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-bhumi-green" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">List New Produce</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                            Upload photos, get AI grading, and generate a blockchain passport instantly.
                        </p>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Active Listings</h3>
                    {/* Reuse Listing Card for Farmer's own items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.slice(0, 1).map(item => (
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
                        <button className="flex items-center gap-2 text-sm text-bhumi-green font-medium hover:underline">
                            <TrendingUp size={16} /> Market Trends
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(item => (
                            <ListingCard
                                key={item.id}
                                item={item}
                                isOwner={false}
                                onViewQR={() => { setSelectedListing(item); setShowQR(true); }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-Component: Listing Card
const ListingCard: React.FC<{ item: Listing, isOwner: boolean, onViewQR: () => void }> = ({ item, isOwner, onViewQR }) => {
    // Calculate Price Difference
    const priceDiff = item.price - item.marketPrice;
    const isCheaper = priceDiff < 0;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-bhumi-green/30">
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.crop} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                            <MapPin size={12} /> {item.location.district}, {item.location.state}
                        </div>
                    </div>
                    {/* <div className="text-right">
                         <div className="text-xs text-gray-400">By</div>
                         <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.farmerName}</div>
                    </div> */}
                </div>

                <div className="my-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                        <div className="text-2xl font-bold text-bhumi-green">₹{item.price}<span className="text-sm font-normal text-gray-400">/q</span></div>
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
                    {!isOwner && (
                        <button className="flex-1 py-2.5 bg-bhumi-green hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20">
                            Buy Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
