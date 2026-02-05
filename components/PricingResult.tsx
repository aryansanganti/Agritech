import React from 'react';
import { PricingPrediction } from '../types';
import { BlockchainTransactionResult } from '../services/ethereumService';
import { AlertCircle, CheckCircle2, TrendingUp, Info, ShieldAlert, Loader2, Link2 } from 'lucide-react';
import { EthereumBlockchainQR } from './EthereumBlockchainQR';

interface PricingResultProps {
    prediction: PricingPrediction;
    ethTx?: BlockchainTransactionResult | null;
    qualityScore?: number;
    quantityQuintals?: number;
    walletConnected?: boolean;
    onStoreOnChain?: () => void;
    isStoringOnChain?: boolean;
    pendingStore?: boolean;
}

export const PricingResult: React.FC<PricingResultProps> = ({ 
    prediction, 
    ethTx,
    qualityScore = 8,
    quantityQuintals = 1,
    walletConnected = false,
    onStoreOnChain,
    isStoringOnChain = false,
    pendingStore = false
}) => {
    const {
        minGuaranteedPrice,
        expectedPriceBand,
        confidenceScore,
        arbitrationReasoning,
        sourceAnalysis
    } = prediction;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Price Card */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2 font-medium">
                        <CheckCircle2 size={18} />
                        <span>AI-Arbitrated Price Band</span>
                    </div>

                    <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                        ₹{expectedPriceBand.low.toLocaleString()} - ₹{expectedPriceBand.high.toLocaleString()}
                        <span className="text-lg font-normal text-gray-500 ml-2">/ quintal</span>
                    </h2>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Confidence: {confidenceScore}%
                        </div>
                        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold border border-amber-500/20">
                            <ShieldAlert size={16} />
                            MGP Error Protection Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Minimum Guaranteed Price Banner */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 rounded-2xl text-white shadow-xl shadow-red-500/20">
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl border border-white/30">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1 italic uppercase tracking-wider">Minimum Guaranteed Price (MGP)</h3>
                        <p className="text-3xl font-black mb-2">₹{minGuaranteedPrice.toLocaleString()}</p>
                        <p className="text-white/80 text-sm max-w-xl">
                            <span className="font-bold underline">LEGAL PROTECTION:</span> No registered agent is permitted to purchase below this price. If an agent offers less, report immediately via the Transparency Dashboard.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reasoning Card */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 text-blue-500 mb-4 font-bold uppercase text-xs tracking-widest">
                        <Info size={16} />
                        AI Arbitration Logic
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                        "{arbitrationReasoning}"
                    </p>
                </div>

                {/* Sources Card */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-4 font-bold uppercase text-xs tracking-widest text-emerald-500">
                        <ShieldAlert size={16} />
                        Source Reliability Index
                    </div>
                    <div className="space-y-4">
                        {sourceAnalysis.map((source, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{source.name}</span>
                                    <span className="text-emerald-500 font-bold">{source.reliability}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${source.reliability}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-gray-400 italic mt-1">{source.contribution}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Blockchain QR Code Section */}
            {ethTx ? (
                <EthereumBlockchainQR 
                    transaction={ethTx}
                    farmerName="Farmer"
                    quantityQuintals={quantityQuintals}
                />
            ) : pendingStore && (
                <div className="glass-panel rounded-3xl p-8 text-center">
                    {walletConnected ? (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl inline-block mb-4">
                                <Link2 size={32} className="text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Store on Ethereum Blockchain
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Your price data is ready. Click below to permanently store the quality score, 
                                price, and quantity on Ethereum Sepolia for verification.
                            </p>
                            <button
                                onClick={onStoreOnChain}
                                disabled={isStoringOnChain}
                                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                            >
                                {isStoringOnChain ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Confirming Transaction...
                                    </>
                                ) : (
                                    <>
                                        <Link2 size={20} />
                                        Store on Ethereum & Generate QR
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-400 mt-2">
                                This will create a transaction on Sepolia testnet (requires small gas fee)
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl inline-block mb-4">
                                <AlertCircle size={32} className="text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Connect Wallet to Store on Blockchain
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Connect your MetaMask wallet and switch to Sepolia testnet to store 
                                this price data on the Ethereum blockchain.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
