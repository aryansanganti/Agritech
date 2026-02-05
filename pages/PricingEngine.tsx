import React, { useState, useEffect } from 'react';
import { Language, PricingPrediction } from '../types';
import { translations } from '../utils/translations';
import { ArrowLeft, BarChart3, ShieldCheck, Zap, Info, Loader2, Sparkles, Link2 } from 'lucide-react';
import { PricingForm } from '../components/PricingForm';
import { PricingResult } from '../components/PricingResult';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { WalletConnect } from '../components/WalletConnect';
import { getMandiPrices } from '../services/mandiService';
import { getPriceArbitration } from '../services/geminiService';
import { 
    WalletState, 
    BlockchainTransactionResult,
    storeCropPriceOnChain,
    isMetaMaskInstalled
} from '../services/ethereumService';

interface PricingEngineProps {
    lang: Language;
    onBack: () => void;
}

export const PricingEngine: React.FC<PricingEngineProps> = ({ lang, onBack }) => {
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
    const [pendingPriceData, setPendingPriceData] = useState<{
        crop: string;
        location: string;
        quality: number;
        quantity: number;
        prediction: PricingPrediction;
    } | null>(null);

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
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                Standard Crop Pricing Engine
                                <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
                                    AI Arbitrated
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Multi-source mandi aggregation & price arbitration</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
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
                        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                            <h3 className="text-sm font-bold text-emerald-600 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <ShieldCheck size={16} />
                                The BHUMI Standard
                            </h3>
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
                        </div>
                    </div>

                    {/* Right Panel: Results & Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {isLoading && (
                            <div className="h-[600px] flex flex-col items-center justify-center glass-panel rounded-3xl animate-pulse">
                                <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{status}</p>
                                <p className="text-gray-500">Evaluating multi-mandi datasets for parity...</p>
                            </div>
                        )}

                        {!isLoading && !prediction && !error && (
                            <div className="h-[600px] flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-gray-200 dark:border-white/5">
                                <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-full mb-6">
                                    <BarChart3 size={48} className="text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to Predict</h2>
                                <p className="text-gray-500 max-w-sm text-center">
                                    Select your crop and location to generate real-time AI-arbitrated price bands.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-8 glass-panel rounded-3xl border-red-500/20 flex flex-col items-center text-center">
                                <Info size={48} className="text-red-500 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Intelligence Interrupted</h2>
                                <p className="text-gray-500 mb-6">{error}</p>
                                <button
                                    onClick={() => handleSearch('Soybean', 'Nagpur', 'Maharashtra', 8)}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-gray-100 dark:text-gray-900 rounded-xl font-bold"
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
