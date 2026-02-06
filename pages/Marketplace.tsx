import React, { useState, useEffect } from 'react';
import { User, Language, Listing, MarketplaceListing } from '../types';
import { ArrowLeft, ShoppingBag, Plus, QrCode, ShieldCheck, TrendingUp, MapPin, ExternalLink, Trash2, Leaf, Truck, Route, CreditCard, IndianRupee, CheckCircle2, X } from 'lucide-react';
import { MARKETPLACE_LISTINGS } from '../data/listings';
import { getMarketplaceListings, removeMarketplaceListing } from '../services/marketplaceService';
import { CarbonLogistics } from '../components/CarbonLogistics';
import { DISTRICT_COORDINATES } from '../services/carbonLogisticsService';
import { MarketTicker } from '../components/MarketTicker';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { cn } from '../lib/utils';

// UPI Payment Configuration
const UPI_CONFIG = {
    payeeVPA: 'mohak3345-1@okaxis',
    payeeName: 'Bhumi Agritech',
    transactionNote: 'Bhumi Marketplace Purchase'
};

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

    // UPI Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedForPayment, setSelectedForPayment] = useState<Listing | MarketplaceListing | null>(null);
    const [paymentQuantity, setPaymentQuantity] = useState(1);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');

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



    // Handle Buy Now - Opens UPI Payment Modal
    const handleBuyNow = (item: Listing | MarketplaceListing) => {
        setSelectedForPayment(item);
        setPaymentQuantity(1);
        setPaymentStatus('pending');
        setShowPaymentModal(true);
    };

    // Generate UPI Payment URL
    const generateUPIUrl = (amount: number) => {
        const transactionRef = `BHUMI${Date.now()}`;
        return `upi://pay?pa=${UPI_CONFIG.payeeVPA}&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(UPI_CONFIG.transactionNote)}&tr=${transactionRef}`;
    };

    // Render UPI Payment Modal
    const renderPaymentModal = () => {
        if (!showPaymentModal || !selectedForPayment) return null;

        const pricePerQuintal = selectedForPayment.price;
        const maxQuantity = selectedForPayment.quantity;
        const totalAmount = pricePerQuintal * paymentQuantity;
        const upiUrl = generateUPIUrl(totalAmount);

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
                <Card className="max-w-md w-full shadow-2xl border-green-500/30" onClick={e => e.stopPropagation()}>
                    <CardContent className="p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <IndianRupee className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment</h3>
                                    <p className="text-xs text-gray-500">Scan QR to pay via UPI</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center gap-4">
                            <img
                                src={selectedForPayment.image || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=100&h=100&fit=crop'}
                                alt={selectedForPayment.crop}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">{selectedForPayment.crop}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin size={10} />
                                    {typeof selectedForPayment.location === 'string'
                                        ? selectedForPayment.location
                                        : `${selectedForPayment.location.district}, ${selectedForPayment.location.state}`}
                                </div>
                                <div className="text-sm text-bhumi-green font-semibold mt-1">₹{pricePerQuintal}/quintal</div>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600 dark:text-gray-300">Select Quantity (Quintals)</Label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPaymentQuantity(Math.max(1, paymentQuantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    disabled={paymentQuantity <= 1}
                                >
                                    −
                                </button>
                                <div className="flex-1 text-center">
                                    <Input
                                        type="number"
                                        value={paymentQuantity}
                                        onChange={(e) => setPaymentQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                                        className="text-center text-lg font-bold"
                                        min={1}
                                        max={maxQuantity}
                                    />
                                </div>
                                <button
                                    onClick={() => setPaymentQuantity(Math.min(maxQuantity, paymentQuantity + 1))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    disabled={paymentQuantity >= maxQuantity}
                                >
                                    +
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Available: {maxQuantity} quintals</p>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Price per quintal</span>
                                <span className="text-gray-900 dark:text-white">₹{pricePerQuintal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                                <span className="text-gray-900 dark:text-white">{paymentQuantity} quintals</span>
                            </div>
                            <div className="border-t border-green-200 dark:border-green-800 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">Total Amount</span>
                                    <span className="text-2xl font-bold text-bhumi-green">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        {paymentStatus === 'pending' && (
                            <div className="text-center space-y-3">
                                <div className="bg-white p-3 rounded-xl inline-block border-2 border-gray-200 shadow-lg">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`}
                                        alt="UPI Payment QR"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Scan with any UPI app to pay
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">GPay</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">PhonePe</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Paytm</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">BHIM</span>
                                </div>
                            </div>
                        )}

                        {/* UPI ID Display */}
                        <div className="text-center space-y-2">
                            <p className="text-xs text-gray-500">UPI ID</p>
                            <div className="flex items-center justify-center gap-2">
                                <code className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200">
                                    {UPI_CONFIG.payeeVPA}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(UPI_CONFIG.payeeVPA)}
                                    className="p-2 text-gray-500 hover:text-bhumi-green transition-colors"
                                    title="Copy UPI ID"
                                >
                                    <CreditCard size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Payment Confirmation Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success"
                                className="flex-1"
                                onClick={() => {
                                    setPaymentStatus('processing');
                                    // Simulate payment verification
                                    setTimeout(() => {
                                        setPaymentStatus('success');
                                    }, 2000);
                                }}
                            >
                                <CheckCircle2 size={16} />
                                I've Paid
                            </Button>
                        </div>

                        {/* Processing/Success States */}
                        {paymentStatus === 'processing' && (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 border-4 border-bhumi-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Verifying payment...</p>
                            </div>
                        )}

                        {paymentStatus === 'success' && (
                            <div className="text-center py-4 space-y-3">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-green-600">Payment Successful!</h4>
                                    <p className="text-sm text-gray-500">Your order has been placed</p>
                                </div>
                                <Button
                                    variant="success"
                                    className="w-full"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentStatus('pending');
                                    }}
                                >
                                    Done
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };



    const MarketplaceListingCard: React.FC<{ item: Listing; isOwner: boolean; onViewQR: () => void }> = ({ item, isOwner, onViewQR }) => {
        const priceDiff = item.price - item.marketPrice;
        const isCheaper = priceDiff < 0;

        // Convert Listing to MarketplaceListing format for carbon logistics
        const handleCarbonClick = () => {
            const marketplaceListing: MarketplaceListing = {
                id: item.id,
                farmerName: 'Local Farmer',
                crop: item.crop,
                variety: item.variety,
                quantity: item.quantity,
                grade: item.grade as 'A' | 'B' | 'C',
                qualityScore: item.grade === 'A' ? 9 : item.grade === 'B' ? 7 : 5,
                price: item.price,
                minPrice: item.price * 0.9,
                maxPrice: item.price * 1.1,
                guaranteedPrice: item.price * 0.85,
                marketPrice: item.marketPrice,
                location: item.location,
                image: item.image,
                blockchainHash: item.blockchainHash || '0x...',
                transactionHash: item.blockchainHash || '0x...',
                etherscanUrl: '',
                contractAddress: '',
                recordId: 0,
                harvestDate: new Date().toISOString(),
                listedDate: new Date().toISOString(),
                timestamp: Date.now(),
                verificationStatus: 'pending',
            };
            setSelectedForLogistics(marketplaceListing);
            setShowVendorLocationModal(true);
        };

        return (
            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-bhoomi-green/30">
                <div className="relative h-48 overflow-hidden">
                    <img src={item.image} alt={item.crop} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge className="absolute top-3 right-3" variant="outline">{item.quantity} Qtl</Badge>
                    <Badge className={cn("absolute top-3 left-3 flex items-center gap-1", item.grade === 'A' ? 'bg-green-500 text-white border-green-500' : item.grade === 'B' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-red-500 text-white border-red-500')}>
                        <ShieldCheck size={12} /> Grade {item.grade}
                    </Badge>
                </div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.crop} <span className="text-sm font-normal text-gray-500">({item.variety})</span></h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><MapPin size={12} /> {typeof item.location === 'string' ? item.location : `${item.location.district}, ${item.location.state}`}</div>
                        </div>
                    </div>
                    <div className="my-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                            <div className="text-2xl font-bold text-bhumi-green">₹{item.price}<span className="text-sm font-normal text-gray-400">/q</span></div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Mandi Avg</p>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">₹{item.marketPrice}</div>
                            <div className={`text-[10px] font-bold ${isCheaper ? 'text-green-500' : 'text-red-500'}`}>{Math.abs(priceDiff)} {isCheaper ? 'below' : 'above'} avg</div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="secondary" size="sm" className="flex-1" onClick={onViewQR}>
                            <QrCode size={16} /> {isOwner ? 'View Passport' : 'Verify'}
                        </Button>
                        {!isOwner && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                                    onClick={handleCarbonClick}
                                    title="Calculate Carbon Footprint & Route"
                                >
                                    <Leaf size={16} />
                                    <Truck size={14} />
                                </Button>
                                <Button variant="success" size="sm" className="flex-1" onClick={() => handleBuyNow(item)}>
                                    <IndianRupee size={14} />
                                    Buy Now
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen">
            {renderVerificationModal()}
            {renderVendorLocationModal()}
            {renderPaymentModal()}
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
