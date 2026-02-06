import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
    BlockchainTransactionResult,
    getEtherscanTxUrl,
    SEPOLIA_CONFIG
} from '../services/ethereumService';
import { 
    QrCode, 
    Shield, 
    CreditCard, 
    Copy, 
    CheckCircle2, 
    ExternalLink,
    Package,
    Wallet,
    Sparkles,
    Lock,
    Eye,
    Link2
} from 'lucide-react';

interface EthereumBlockchainQRProps {
    transaction: BlockchainTransactionResult;
    farmerName?: string;
    quantityQuintals?: number;
}

// Generate UPI payment string
const generateUPIPaymentString = (
    upiId: string,
    payeeName: string,
    amount: number,
    transactionNote: string,
    transactionHash: string
): string => {
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        am: amount.toString(),
        cu: 'INR',
        tn: `BHUMI-${transactionNote}-${transactionHash.slice(0, 10)}`
    });
    return `upi://pay?${params.toString()}`;
};

export const EthereumBlockchainQR: React.FC<EthereumBlockchainQRProps> = ({ 
    transaction, 
    farmerName = 'Farmer',
    quantityQuintals = 1
}) => {
    const [activeTab, setActiveTab] = useState<'quality' | 'payment'>('quality');
    const [copied, setCopied] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [showUpiInput, setShowUpiInput] = useState(false);

    // Add null checks for transaction data
    if (!transaction || !transaction.data) {
        return (
            <div className="glass-panel rounded-3xl p-8 text-center">
                <p className="text-gray-500">Loading transaction data...</p>
            </div>
        );
    }

    const { data, transactionHash, blockNumber, etherscanUrl, timestamp, gasUsed } = transaction;
    
    // Safely access price data with fallbacks
    const minPrice = data.minPrice || 0;
    const maxPrice = data.maxPrice || 0;
    const guaranteedPrice = data.guaranteedPrice || 0;
    const qualityScore = data.qualityScore || 0;
    const crop = data.crop || 'Unknown';
    const location = data.location || 'Unknown';
    const quantity = data.quantity || quantityQuintals;
    
    // Calculate payment amount using mid-range price
    const midPrice = Math.round((minPrice + maxPrice) / 2);
    const totalAmount = quantityQuintals * midPrice;

    // Generate UPI QR string
    const upiQRString = upiId ? generateUPIPaymentString(
        upiId,
        farmerName,
        totalAmount,
        `${crop}-${quantityQuintals}Q`,
        transactionHash
    ) : '';

    // Quality grade helper
    const getQualityGrade = (score: number): string => {
        if (score >= 9) return 'Premium A+';
        if (score >= 8) return 'Premium A';
        if (score >= 7) return 'Good B+';
        if (score >= 6) return 'Good B';
        if (score >= 5) return 'Average C+';
        if (score >= 4) return 'Average C';
        return 'Below Average';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shortHash = `${transactionHash.slice(0, 10)}...${transactionHash.slice(-8)}`;

    return (
        <div className="glass-panel rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-3 rounded-xl border border-white/30">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Ethereum Blockchain Verified
                            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">
                                SEPOLIA
                            </span>
                        </h3>
                        <p className="text-white/80 text-sm">Immutable record on Ethereum Network</p>
                    </div>
                </div>
                
                {/* Transaction Hash */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Transaction Hash</p>
                            <p className="font-mono text-sm">{shortHash}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => copyToClipboard(transactionHash)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Copy full hash"
                            >
                                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            </button>
                            <a
                                href={etherscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="View on Etherscan"
                            >
                                <ExternalLink size={20} />
                            </a>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/20">
                        <div>
                            <p className="text-xs text-white/60">Block</p>
                            <p className="font-bold">#{blockNumber.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/60">Gas Used</p>
                            <p className="font-bold">{parseInt(gasUsed || '0').toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/60">Network</p>
                            <p className="font-bold">Sepolia</p>
                        </div>
                    </div>
                </div>

                {/* Etherscan Link Button */}
                <a
                    href={etherscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-white/20 hover:bg-white/30 border border-white/30 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                    <Link2 size={18} />
                    <span className="font-bold">View on Etherscan</span>
                    <ExternalLink size={14} />
                </a>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('quality')}
                    className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-bold transition-all ${
                        activeTab === 'quality' 
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Eye size={20} />
                    Check Quality
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-bold transition-all ${
                        activeTab === 'payment' 
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-500/10' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Wallet size={20} />
                    Pay via UPI
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'quality' ? (
                    <div className="space-y-6">
                        {/* Quality QR Code - Links to Etherscan */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-6 rounded-2xl shadow-xl mb-4 relative">
                                <QRCodeSVG 
                                    value={etherscanUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] px-2 py-1 rounded font-bold">
                                    ETHERSCAN
                                </div>
                            </div>
                            <p className="text-center text-gray-500 text-sm max-w-xs">
                                Scan to view crop quality & transaction details on <span className="font-bold text-indigo-600">Etherscan</span>
                            </p>
                        </div>

                        {/* Quality Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-indigo-500 mb-2">
                                    <Package size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Crop</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{crop}</p>
                                <p className="text-xs text-gray-500">{location}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-green-500 mb-2">
                                    <Sparkles size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Quality</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {qualityScore}/10
                                </p>
                                <p className="text-xs text-green-500 font-medium">
                                    {getQualityGrade(qualityScore)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-500 mb-2">
                                    <CreditCard size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Price Range</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">per quintal</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-red-500 mb-2">
                                    <Shield size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">MGP</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{guaranteedPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">minimum guaranteed</p>
                            </div>
                        </div>

                        {/* Blockchain Verification Badge */}
                        <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-500/10 text-green-600 py-3 px-4 rounded-xl border border-green-200 dark:border-green-500/20">
                            <CheckCircle2 size={20} />
                            <span className="font-bold">Verified on Ethereum Sepolia</span>
                        </div>

                        {/* Data Visibility Note */}
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                            <p className="text-blue-700 dark:text-blue-400 text-sm">
                                <span className="font-bold">📝 On-Chain Data:</span> All crop details including quality score ({qualityScore}/10), 
                                quantity ({quantity} quintals), and price range are permanently stored in the transaction's input data. 
                                View the full data by clicking "Input Data" → "Decode Input Data" on Etherscan.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {!showUpiInput ? (
                            <div className="text-center space-y-4">
                                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                                    <p className="text-amber-700 dark:text-amber-400 text-sm">
                                        <span className="font-bold">Note:</span> Enter farmer's UPI ID to generate payment QR code
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="Enter UPI ID (e.g., farmer@upi)"
                                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all outline-none text-center"
                                    />
                                    <button
                                        onClick={() => upiId && setShowUpiInput(true)}
                                        disabled={!upiId}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Generate Payment QR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Payment Summary */}
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-white/70">Quantity</p>
                                            <p className="font-bold">{quantityQuintals} Quintals</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/70">Price/Quintal</p>
                                            <p className="font-bold">₹{midPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-white/20">
                                            <p className="text-xs text-white/70">Total Amount</p>
                                            <p className="text-2xl font-black">₹{totalAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* UPI QR Code */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-white p-6 rounded-2xl shadow-xl mb-4">
                                        <QRCodeSVG 
                                            value={upiQRString}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="text-center text-gray-500 text-sm max-w-xs">
                                        Scan with any UPI app (GPay, PhonePe, Paytm) to pay ₹{totalAmount.toLocaleString()}
                                    </p>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Pay to</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{upiId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tx Ref</span>
                                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                            {transactionHash.slice(2, 12).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Blockchain</span>
                                        <a 
                                            href={etherscanUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            View on Etherscan
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowUpiInput(false);
                                        setUpiId('');
                                    }}
                                    className="w-full py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                                >
                                    Change UPI ID
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <QrCode size={14} />
                    <span>Powered by Ethereum • Sepolia Testnet • Immutable & Transparent</span>
                </div>
            </div>
        </div>
    );
};
