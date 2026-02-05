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
import { getQualityGrading, hasQualityGrading, clearQualityGrading } from '../services/qualityGradingService';
import { addMarketplaceListing, scoreToGrade } from '../services/marketplaceService';
import { 
    WalletState, 
    BlockchainTransactionResult,
    storeCropPriceOnChain,
    isMetaMaskInstalled
} from '../services/ethereumService';

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
        addMarketplaceListing({
            farmerName: walletState?.address ? `Farmer ${walletState.address.slice(0, 6)}...` : 'Anonymous Farmer',
            farmerAddress: walletState?.address || undefined,
            crop: ethTx.data.crop,
            grade: qualityGrading?.overallGrade || scoreToGrade(currentQuality),
            qualityScore: currentQuality,
            price: Math.round((ethTx.data.minPrice + ethTx.data.maxPrice) / 2),
            minPrice: ethTx.data.minPrice,
            maxPrice: ethTx.data.maxPrice,
            guaranteedPrice: ethTx.data.guaranteedPrice,
            marketPrice: Math.round((ethTx.data.minPrice + ethTx.data.maxPrice) / 2),
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
            image: qualityGrading?.image || getCropDefaultImage(ethTx.data.crop)
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
        <div className="min-h-screen bg-bhumi-bg dark:bg-bhumi-darkBg transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-bhumi-card dark:bg-bhumi-darkCard border-b-2 border-bhumi-border dark:border-bhumi-darkBorder backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted transition-colors"
                        >
                            <ArrowLeft size={24} className="text-bhumi-fg dark:text-bhumi-darkFg" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-heading font-black text-bhumi-fg dark:text-bhumi-darkFg tracking-tight flex items-center gap-2">
                                Standard Crop Pricing Engine
                                <span className="bg-bhumi-primary dark:bg-bhumi-darkPrimary text-[10px] text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg px-2 py-0.5 font-bold uppercase tracking-widest animate-pulse">
                                    AI Arbitrated
                                </span>
                            </h1>
                            <p className="text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-medium">Multi-source mandi aggregation & price arbitration</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Quality Grading Required Banner */}
                {!hasGrading && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30">
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
                                <button
                                    onClick={onNavigateToQualityGrading}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
                                >
                                    Go to Quality Grading
                                </button>
                            )}
                        </div>
                    </div>
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
                        <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-primary/10 dark:border-bhumi-darkPrimary/10 p-6">
                            <h3 className="text-sm font-heading font-bold text-bhumi-primary dark:text-bhumi-darkPrimary mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <ShieldCheck size={16} />
                                The BHUMI Standard
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">
                                    <div className="bg-bhumi-primary/20 dark:bg-bhumi-darkPrimary/20 p-1 h-fit mt-0.5">
                                        <Zap size={14} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                                    </div>
                                    <p><span className="font-bold text-bhumi-fg dark:text-bhumi-darkFg">Zero Exploitation:</span> AI-driven MGP ensures agents pay fair prices.</p>
                                </li>
                                <li className="flex gap-3 text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">
                                    <div className="bg-bhumi-primary/20 dark:bg-bhumi-darkPrimary/20 p-1 h-fit mt-0.5">
                                        <BarChart3 size={14} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                                    </div>
                                    <p><span className="font-bold text-bhumi-fg dark:text-bhumi-darkFg">Smart Aggregation:</span> We pull from 3+ official and private sources.</p>
                                </li>
                                <li className="flex gap-3 text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">
                                    <div className="bg-bhumi-primary/20 dark:bg-bhumi-darkPrimary/20 p-1 h-fit mt-0.5">
                                        <Sparkles size={14} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                                    </div>
                                    <p><span className="font-bold text-bhumi-fg dark:text-bhumi-darkFg">AI Arbitration:</span> Models weigh sources by reliability and historical accuracy.</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel: Results & Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {isLoading && (
                            <div className="h-[600px] flex flex-col items-center justify-center bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder animate-pulse">
                                <Loader2 size={48} className="text-bhumi-primary dark:text-bhumi-darkPrimary animate-spin mb-4" />
                                <p className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-2">{status}</p>
                                <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Evaluating multi-mandi datasets for parity...</p>
                            </div>
                        )}

                        {!isLoading && !prediction && !error && (
                            <div className="h-[600px] flex flex-col items-center justify-center bg-bhumi-card dark:bg-bhumi-darkCard border-dashed border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-6 mb-6">
                                    <BarChart3 size={48} className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg" />
                                </div>
                                <h2 className="text-2xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-2">Ready to Predict</h2>
                                <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg max-w-sm text-center">
                                    Select your crop and location to generate real-time AI-arbitrated price bands.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-8 bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-destructive/20 dark:border-bhumi-darkDestructive/20 flex flex-col items-center text-center">
                                <Info size={48} className="text-bhumi-destructive dark:text-bhumi-darkDestructive mb-4" />
                                <h2 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-2">Intelligence Interrupted</h2>
                                <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-6">{error}</p>
                                <button
                                    onClick={() => handleSearch('Soybean', 'Nagpur', 'Maharashtra', 8)}
                                    className="px-6 py-2 bg-bhumi-fg dark:bg-bhumi-darkFg text-bhumi-bg dark:text-bhumi-darkBg font-bold border-2 border-bhumi-fg dark:border-bhumi-darkFg"
                                >
                                    Retry Connection
                                </button>
                            </div>
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
