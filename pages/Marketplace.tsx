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
                <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-primary/30 dark:border-bhumi-darkPrimary/30 p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-bhumi-primary/10 dark:bg-bhumi-darkPrimary/10 flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-bhumi-primary dark:text-bhumi-darkPrimary" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">Blockchain Verified</h3>
                        <p className="text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">
                            Digital Product Passport
                        </p>

                        <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-4 text-left text-sm space-y-2 font-mono border-2 border-dashed border-bhumi-border dark:border-bhumi-darkBorder">
                            <div className="flex justify-between">
                                <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Hash:</span>
                                <span className="text-bhumi-primary dark:text-bhumi-darkPrimary truncate max-w-[150px]">{selectedListing.blockchainHash}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Origin:</span>
                                <span className="text-bhumi-fg dark:text-bhumi-darkFg">{selectedListing.location.district}, {selectedListing.location.state}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Grade:</span>
                                <span className="font-bold text-bhumi-fg dark:text-bhumi-darkFg">{selectedListing.grade} (AI Certified)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Harvest:</span>
                                <span className="text-bhumi-fg dark:text-bhumi-darkFg">{selectedListing.harvestDate}</span>
                            </div>
                        </div>

                        <div className="py-4">
                            {/* Placeholder QR Code */}
                            <div className="w-48 h-48 bg-white p-2 mx-auto border-4 border-bhumi-fg dark:border-bhumi-darkFg">
                                {/* Simple CSS Pattern to fake a QR */}
                                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BhumiVerified')] bg-contain bg-no-repeat bg-center"></div>
                            </div>
                            <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-2">Scan to view full history on ledger</p>
                        </div>

                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full py-3 bg-bhumi-primary dark:bg-bhumi-darkPrimary hover:opacity-90 text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg font-bold transition-colors border-2 border-bhumi-primary dark:border-bhumi-darkPrimary"
                        >
                            Close Passport
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-bhumi-bg dark:bg-bhumi-darkBg">
            {renderVerificationModal()}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted transition-colors">
                        <ArrowLeft size={24} className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg flex items-center gap-2">
                            <ShoppingBag className="text-bhumi-primary dark:text-bhumi-darkPrimary" /> Crop Marketplace
                        </h1>
                        <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-sm">Direct Farm-to-Table Trading</p>
                    </div>
                </div>

                {/* Role Toggler */}
                <div className="flex bg-bhumi-muted dark:bg-bhumi-darkMuted p-1 self-start md:self-auto">
                    <button
                        onClick={() => setRole('farmer')}
                        className={`px-4 py-2 text-sm font-medium transition-all ${role === 'farmer' ? 'bg-bhumi-card dark:bg-bhumi-darkCard shadow text-bhumi-primary dark:text-bhumi-darkPrimary' : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg'}`}
                    >
                        I am a Farmer
                    </button>
                    <button
                        onClick={() => setRole('vendor')}
                        className={`px-4 py-2 text-sm font-medium transition-all ${role === 'vendor' ? 'bg-bhumi-card dark:bg-bhumi-darkCard shadow text-bhumi-primary dark:text-bhumi-darkPrimary' : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg'}`}
                    >
                        I am a Vendor
                    </button>
                </div>
            </header>

            {/* FARMER VIEW */}
            {role === 'farmer' && (
                <div className="animate-fade-in">
                    <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-dashed border-bhumi-border dark:border-bhumi-darkBorder p-8 text-center hover:border-bhumi-primary dark:hover:border-bhumi-darkPrimary transition-colors cursor-pointer group mb-8">
                        <div className="w-16 h-16 bg-bhumi-primary/10 dark:bg-bhumi-darkPrimary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-bhumi-primary dark:text-bhumi-darkPrimary" />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">List New Produce</h2>
                        <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-2 max-w-sm mx-auto">
                            Upload photos, get AI grading, and generate a blockchain passport instantly.
                        </p>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-4">Your Active Listings</h3>
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
                        <h2 className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">Premium Certified Crops</h2>
                        <button className="flex items-center gap-2 text-sm text-bhumi-primary dark:text-bhumi-darkPrimary font-medium hover:underline">
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
        <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-bhumi-primary/30 dark:hover:border-bhumi-darkPrimary/30">
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.crop} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-bhumi-card/90 dark:bg-bhumi-darkCard/90 backdrop-blur px-2 py-1 text-xs font-bold shadow-sm text-bhumi-fg dark:text-bhumi-darkFg">
                    {item.quantity} Qtl
                </div>
                <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold shadow-sm flex items-center gap-1 ${item.grade === 'A' ? 'bg-bhumi-primary dark:bg-bhumi-darkPrimary text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg' :
                        item.grade === 'B' ? 'bg-bhumi-secondary dark:bg-bhumi-darkSecondary text-bhumi-fg dark:text-bhumi-darkFg' : 'bg-bhumi-destructive dark:bg-bhumi-darkDestructive text-white'
                    }`}>
                    <ShieldCheck size={12} /> Grade {item.grade}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">{item.crop} <span className="text-sm font-normal text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">({item.variety})</span></h3>
                        <div className="flex items-center gap-1 text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-1">
                            <MapPin size={12} /> {item.location.district}, {item.location.state}
                        </div>
                    </div>
                    {/* <div className="text-right">
                         <div className="text-xs text-[var(--muted-foreground)]">By</div>
                         <div className="text-sm font-medium text-[var(--foreground)]">{item.farmerName}</div>
                    </div> */}
                </div>

                <div className="my-4 pt-4 border-t border-bhumi-border dark:border-bhumi-darkBorder flex justify-between items-end">
                    <div>
                        <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1">Asking Price</p>
                        <div className="text-2xl font-heading font-bold text-bhumi-primary dark:text-bhumi-darkPrimary">₹{item.price}<span className="text-sm font-normal text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">/q</span></div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1">Mandi Avg</p>
                        <div className="text-sm font-medium text-bhumi-fg dark:text-bhumi-darkFg">₹{item.marketPrice}</div>
                        <div className={`text-[10px] font-bold ${isCheaper ? 'text-bhumi-primary dark:text-bhumi-darkPrimary' : 'text-bhumi-destructive dark:text-bhumi-darkDestructive'}`}>
                            {Math.abs(priceDiff)} {isCheaper ? 'below' : 'above'} avg
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onViewQR}
                        className="flex-1 py-2.5 bg-bhumi-muted dark:bg-bhumi-darkMuted hover:bg-bhumi-border dark:hover:bg-bhumi-darkBorder text-bhumi-fg dark:text-bhumi-darkFg text-sm font-bold transition-colors flex items-center justify-center gap-2 border-2 border-bhumi-border dark:border-bhumi-darkBorder"
                    >
                        <QrCode size={16} /> {isOwner ? 'View Passport' : 'Verify'}
                    </button>
                    {!isOwner && (
                        <button className="flex-1 py-2.5 bg-bhumi-primary dark:bg-bhumi-darkPrimary hover:opacity-90 text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg text-sm font-bold transition-colors shadow-lg shadow-bhumi-primary/20 dark:shadow-bhumi-darkPrimary/20 border-2 border-bhumi-primary dark:border-bhumi-darkPrimary">
                            Buy Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
