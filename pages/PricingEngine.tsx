import React, { useState, useEffect } from 'react';
import { Language, PricingPrediction } from '../types';
import { translations } from '../utils/translations';
import { ArrowLeft, BarChart3, ShieldCheck, Zap, Info, Loader2, Sparkles, Link2, AlertCircle } from 'lucide-react';
import { PricingForm } from '../components/PricingForm';
import { PricingResult } from '../components/PricingResult';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { WalletConnect } from '../components/WalletConnect';
import { getMandiPrices } from '../services/mandiService';
import { getPriceArbitration } from '../services/geminiService';
import { getQualityGrading, hasQualityGrading, clearQualityGrading, scoreToGrade as qualityScoreToGrade } from '../services/qualityGradingService';
import { addMarketplaceListing, scoreToGrade } from '../services/marketplaceService';
import { classifyHarvestIntoTiers, createSplitStreamListings, calculateUniversalPrice, mapGradeToTier } from '../services/tierRoutingService';
import { getCropConfig } from '../services/cropRoutingConfigService';
import {
    WalletState,
    BlockchainTransactionResult,
    storeCropPriceOnChain,
    isMetaMaskInstalled
} from '../services/ethereumService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, Alert, AlertDescription } from '../components/ui/Badge';
import { EmptyState, Spinner } from '../components/ui/Shared';

interface PricingEngineProps {
    lang: Language;
    onBack: () => void;
    onNavigateToMarketplace?: () => void;
    onNavigateToQualityGrading?: () => void;
}

export const PricingEngine: React.FC<PricingEngineProps> = ({ lang, onBack, onNavigateToMarketplace, onNavigateToQualityGrading }) => {
    const t = translations[lang];
    const [prediction, setPrediction] = useState<PricingPrediction | null>(null);
    const [ethTx, setEthTx] = useState<BlockchainTransactionResult | null>(null);
    const [walletState, setWalletState] = useState<WalletState | null>(null);
    const [currentQuality, setCurrentQuality] = useState<number>(8);
    const [quantityQuintals, setQuantityQuintals] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isStoringOnChain, setIsStoringOnChain] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [hasGrading, setHasGrading] = useState(false);
    const [pendingPriceData, setPendingPriceData] = useState<{
        crop: string;
        location: string;
        quality: number;
        quantity: number;
        prediction: PricingPrediction;
    } | null>(null);

    // Check for quality grading on mount
    useEffect(() => {
        setHasGrading(hasQualityGrading());
    }, []);

    const handleWalletConnected = (state: WalletState) => {
        setWalletState(state);
    };

    const handleWalletDisconnected = () => {
        setWalletState(null);
    };

    // Store on Ethereum when wallet is connected and we have pending data
    const storeOnEthereum = async () => {
        if (!pendingPriceData || !walletState?.isConnected || !walletState?.isCorrectNetwork) {
            return;
        }

        setIsStoringOnChain(true);
        setStatus('Storing on Ethereum Sepolia...');

        try {
            const tx = await storeCropPriceOnChain({
                crop: pendingPriceData.crop,
                location: pendingPriceData.location,
                qualityScore: pendingPriceData.quality,
                quantity: pendingPriceData.quantity,
                minPrice: pendingPriceData.prediction.expectedPriceBand.low,
                maxPrice: pendingPriceData.prediction.expectedPriceBand.high,
                guaranteedPrice: pendingPriceData.prediction.minGuaranteedPrice
            });

            setEthTx(tx);
            setPendingPriceData(null);
        } catch (e: any) {
            setError(e.message || 'Failed to store on blockchain');
        } finally {
            setIsStoringOnChain(false);
            setStatus('');
        }
    };

    // Handler for adding to marketplace
    const handleAddToMarketplace = () => {
        if (!ethTx || (!pendingPriceData && !prediction)) return;

        const qualityGrading = getQualityGrading();

        // Default crop image based on crop type
        const getCropDefaultImage = (crop: string): string => {
            const cropImages: Record<string, string> = {
                'Rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
                'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
                'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
                'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
                'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82ber608?w=400&h=300&fit=crop',
                'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
                'Soybean': 'https://images.unsplash.com/photo-1599150468774-a57fd6d2ae06?w=400&h=300&fit=crop',
                'Cotton': 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop',
                'Sugarcane': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
            };
            return cropImages[crop] || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop';
        };

        // Add listing to marketplace
        const grade = qualityGrading?.overallGrade || scoreToGrade(currentQuality);
        const tier = mapGradeToTier(grade);
        const cropConfig = getCropConfig(ethTx.data.crop);
        
        // Calculate tier-based price using Universal Pricing Algorithm
        const basePrice = Math.round((ethTx.data.minPrice + ethTx.data.maxPrice) / 2);
        const tierPrice = cropConfig 
            ? calculateUniversalPrice(basePrice, tier, false)
            : basePrice;

        addMarketplaceListing({
            farmerName: walletState?.address ? `Farmer ${walletState.address.slice(0, 6)}...` : 'Anonymous Farmer',
            farmerAddress: walletState?.address || undefined,
            crop: ethTx.data.crop,
            grade: grade,
            qualityScore: currentQuality,
            price: tierPrice,
            minPrice: ethTx.data.minPrice,
            maxPrice: ethTx.data.maxPrice,
            guaranteedPrice: ethTx.data.guaranteedPrice,
            marketPrice: basePrice,
            quantity: ethTx.data.quantity,
            location: {
                district: qualityGrading?.district || ethTx.data.location.split(',')[0]?.trim() || 'Unknown',
                state: qualityGrading?.state || ethTx.data.location.split(',')[1]?.trim() || 'Unknown'
            },
            blockchainHash: ethTx.transactionHash,
            transactionHash: ethTx.transactionHash,
            etherscanUrl: ethTx.etherscanUrl,
            contractAddress: '0xA12AF30a5B555540e3D2013c7FB3eb793ff4b3B5',
            recordId: ethTx.blockNumber,
            gradingDetails: qualityGrading?.gradingDetails,
            harvestDate: new Date().toISOString().split('T')[0],
            image: qualityGrading?.image || getCropDefaultImage(ethTx.data.crop),
            variety: 'Standard',
            verificationStatus: 'verified',
            // 3-Tier Routing Data
            tierRouting: cropConfig ? {
                tier: tier,
                tierName: tier === 'tier1' ? 'Retail Grade' : tier === 'tier2' ? 'Market Grade' : 'Industrial Grade',
                destination: tier === 'tier1' ? cropConfig.tier1_destination : 
                             tier === 'tier2' ? cropConfig.tier2_destination : 
                             cropConfig.tier3_industry,
                targetBuyer: tier === 'tier1' ? 'BigBasket, Zepto, Blinkit, Export Agents' :
                             tier === 'tier2' ? 'Local Mandi Agents, Restaurants, Hotels' :
                             'Processing Factories (FMCG Companies)',
                transportMethod: cropConfig.transport
            } : undefined
        });

        // Clear quality grading data after adding to marketplace
        clearQualityGrading();

        // Navigate to marketplace
        if (onNavigateToMarketplace) {
            onNavigateToMarketplace();
        }
    };

    const handleSearch = async (crop: string, district: string, state: string, quality: number, quantity: number = 1) => {
        setIsLoading(true);
        setError(null);
        setPrediction(null);
        setEthTx(null);
        setPendingPriceData(null);
        setCurrentQuality(quality);
        setQuantityQuintals(quantity);

        try {
            setStatus('Connecting to Mandi Data Sources...');
            const mandiData = await getMandiPrices(crop, district, state);

            setStatus('Gemini AI Arbitrating Price Sources...');
            const result = await getPriceArbitration(crop, `${district}, ${state}`, mandiData, lang);

            // Adjust based on quality score
            if (quality > 7) {
                result.expectedPriceBand.high += 200;
                result.expectedPriceBand.low += 100;
            } else if (quality < 4) {
                result.expectedPriceBand.low -= 200;
                result.expectedPriceBand.high -= 100;
            }

            setPrediction(result);

            // Store pending data for blockchain storage
            setPendingPriceData({
                crop,
                location: `${district}, ${state}`,
                quality,
                quantity,
                prediction: result
            });

        } catch (e) {
            console.error(e);
            setError('Failed to fetch pricing intelligence. Please try again.');
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-header border-b border-gray-200/50 dark:border-white/5 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                        >
                            <ArrowLeft size={24} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                Standard Crop Pricing Engine
                                <Badge variant="pulse" className="bg-emerald-500 text-white text-[10px] uppercase tracking-widest">
                                    AI Arbitrated
                                </Badge>
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Multi-source mandi aggregation & price arbitration</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Quality Grading Required Banner */}
                {!hasGrading && (
                    <Alert variant="warning" className="mb-6" icon={false}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={24} className="text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-700 dark:text-amber-400">
                                        Quality Grading Required for Marketplace
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        To add crops to the marketplace, first complete AI quality grading in Crop Analysis
                                    </p>
                                </div>
                            </div>
                            {onNavigateToQualityGrading && (
                                <Button
                                    onClick={onNavigateToQualityGrading}
                                    className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
                                >
                                    Go to Quality Grading
                                </Button>
                            )}
                        </div>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Input Form and Value Prop */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Wallet Connect */}
                        <WalletConnect
                            onWalletConnected={handleWalletConnected}
                            onWalletDisconnected={handleWalletDisconnected}
                        />

                        <PricingForm onSearch={handleSearch} isLoading={isLoading} />

                        {/* Value Props */}
                        <Card className="bg-emerald-50 dark:bg-emerald-500/5 border-emerald-500/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
                                    <ShieldCheck size={16} />
                                    The AgriTech Standard
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="bg-emerald-500/20 p-1 rounded-md h-fit mt-0.5">
                                        <Zap size={14} className="text-emerald-600" />
                                    </div>
                                    <p><span className="font-bold text-gray-900 dark:text-white">Zero Exploitation:</span> AI-driven MGP ensures agents pay fair prices.</p>
                                </li>
                                <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="bg-emerald-500/20 p-1 rounded-md h-fit mt-0.5">
                                        <BarChart3 size={14} className="text-emerald-600" />
                                    </div>
                                    <p><span className="font-bold text-gray-900 dark:text-white">Smart Aggregation:</span> We pull from 3+ official and private sources.</p>
                                </li>
                                <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="bg-emerald-500/20 p-1 rounded-md h-fit mt-0.5">
                                        <Sparkles size={14} className="text-emerald-600" />
                                    </div>
                                    <p><span className="font-bold text-gray-900 dark:text-white">AI Arbitration:</span> Models weigh sources by reliability and historical accuracy.</p>
                                </li>
                            </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Results & Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {isLoading && (
                            <Card className="h-[600px] flex flex-col items-center justify-center animate-pulse">
                                <Spinner size={48} className="text-emerald-500 mb-4" />
                                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{status}</p>
                                <p className="text-gray-500">Evaluating multi-mandi datasets for parity...</p>
                            </Card>
                        )}

                        {!isLoading && !prediction && !error && (
                            <EmptyState
                                icon={<BarChart3 size={48} />}
                                title="Ready to Predict"
                                description="Select your crop and location to generate real-time AI-arbitrated price bands."
                                className="h-[600px]"
                            />
                        )}

                        {error && (
                            <Card className="p-8 border-red-500/20 flex flex-col items-center text-center">
                                <Info size={48} className="text-red-500 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Intelligence Interrupted</h2>
                                <p className="text-gray-500 mb-6">{error}</p>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleSearch('Soybean', 'Nagpur', 'Maharashtra', 8)}
                                >
                                    Retry Connection
                                </Button>
                            </Card>
                        )}

                        {prediction && (
                            <>
                                <PricingResult
                                    prediction={prediction}
                                    ethTx={ethTx}
                                    qualityScore={currentQuality}
                                    quantityQuintals={quantityQuintals}
                                    walletConnected={walletState?.isConnected && walletState?.isCorrectNetwork}
                                    onStoreOnChain={storeOnEthereum}
                                    isStoringOnChain={isStoringOnChain}
                                    pendingStore={!!pendingPriceData}
                                    onAddToMarketplace={ethTx ? handleAddToMarketplace : undefined}
                                />
                                <PriceHistoryChart crop={prediction.crop} />
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
