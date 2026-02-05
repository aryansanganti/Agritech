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
            <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-8 text-center">
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
        <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-bhumi-accent dark:bg-bhumi-darkAccent p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-3 border-2 border-white/30">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                            Ethereum Blockchain Verified
                            <span className="bg-white/20 text-[10px] px-2 py-0.5">
                                SEPOLIA
                            </span>
                        </h3>
                        <p className="text-white/80 text-sm">Immutable record on Ethereum Network</p>
                    </div>
                </div>
                
                {/* Transaction Hash */}
                <div className="bg-white/10 p-4 backdrop-blur-sm border-2 border-white/20">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Transaction Hash</p>
                            <p className="font-mono text-sm">{shortHash}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => copyToClipboard(transactionHash)}
                                className="p-2 hover:bg-white/20 transition-colors"
                                title="Copy full hash"
                            >
                                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            </button>
                            <a
                                href={etherscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/20 transition-colors"
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
                    className="mt-4 w-full bg-white/20 hover:bg-white/30 border-2 border-white/30 py-3 px-4 flex items-center justify-center gap-2 transition-colors"
                >
                    <Link2 size={18} />
                    <span className="font-bold">View on Etherscan</span>
                    <ExternalLink size={14} />
                </a>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b-2 border-bhumi-border dark:border-bhumi-darkBorder">
                <button
                    onClick={() => setActiveTab('quality')}
                    className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-bold transition-all ${
                        activeTab === 'quality' 
                            ? 'text-bhumi-accent dark:text-bhumi-darkAccent border-b-2 border-bhumi-accent dark:border-bhumi-darkAccent bg-bhumi-accent/10 dark:bg-bhumi-darkAccent/10' 
                            : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg'
                    }`}
                >
                    <Eye size={20} />
                    Check Quality
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-bold transition-all ${
                        activeTab === 'payment' 
                            ? 'text-bhumi-primary dark:text-bhumi-darkPrimary border-b-2 border-bhumi-primary dark:border-bhumi-darkPrimary bg-bhumi-primary/10 dark:bg-bhumi-darkPrimary/10' 
                            : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg'
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
                            <div className="bg-white p-6 shadow-xl mb-4 relative">
                                <QRCodeSVG 
                                    value={etherscanUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-bhumi-accent dark:bg-bhumi-darkAccent text-white text-[8px] px-2 py-1 font-bold">
                                    ETHERSCAN
                                </div>
                            </div>
                            <p className="text-center text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-sm max-w-xs">
                                Scan to view crop quality & transaction details on <span className="font-bold text-bhumi-accent dark:text-bhumi-darkAccent">Etherscan</span>
                            </p>
                        </div>

                        {/* Quality Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-4">
                                <div className="flex items-center gap-2 text-bhumi-accent dark:text-bhumi-darkAccent mb-2">
                                    <Package size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Crop</span>
                                </div>
                                <p className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">{crop}</p>
                                <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">{location}</p>
                            </div>
                            <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-4">
                                <div className="flex items-center gap-2 text-bhumi-primary dark:text-bhumi-darkPrimary mb-2">
                                    <Sparkles size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Quality</span>
                                </div>
                                <p className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">
                                    {qualityScore}/10
                                </p>
                                <p className="text-xs text-bhumi-primary dark:text-bhumi-darkPrimary font-medium">
                                    {getQualityGrade(qualityScore)}
                                </p>
                            </div>
                            <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-4">
                                <div className="flex items-center gap-2 text-bhumi-secondary dark:text-bhumi-darkSecondary mb-2">
                                    <CreditCard size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Price Range</span>
                                </div>
                                <p className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">
                                    ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">per quintal</p>
                            </div>
                            <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-4">
                                <div className="flex items-center gap-2 text-bhumi-destructive dark:text-bhumi-darkDestructive mb-2">
                                    <Shield size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">MGP</span>
                                </div>
                                <p className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">
                                    ₹{guaranteedPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">minimum guaranteed</p>
                            </div>
                        </div>

                        {/* Blockchain Verification Badge */}
                        <div className="flex items-center justify-center gap-2 bg-bhumi-primary/10 dark:bg-bhumi-darkPrimary/10 text-bhumi-primary dark:text-bhumi-darkPrimary py-3 px-4 border-2 border-bhumi-primary/20 dark:border-bhumi-darkPrimary/20">
                            <CheckCircle2 size={20} />
                            <span className="font-bold">Verified on Ethereum Sepolia</span>
                        </div>

                        {/* Data Visibility Note */}
                        <div className="bg-bhumi-accent/10 dark:bg-bhumi-darkAccent/10 border-2 border-bhumi-accent/20 dark:border-bhumi-darkAccent/20 p-4">
                            <p className="text-bhumi-fg dark:text-bhumi-darkFg text-sm">
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
                                <div className="bg-bhumi-secondary/30 dark:bg-bhumi-darkSecondary/30 border-2 border-bhumi-secondary dark:border-bhumi-darkSecondary p-4">
                                    <p className="text-bhumi-fg dark:text-bhumi-darkFg text-sm">
                                        <span className="font-bold">Note:</span> Enter farmer's UPI ID to generate payment QR code
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="Enter UPI ID (e.g., farmer@upi)"
                                        className="w-full bg-bhumi-input dark:bg-bhumi-darkInput border-2 border-bhumi-border dark:border-bhumi-darkBorder px-4 py-3 focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary transition-all outline-none text-center text-bhumi-fg dark:text-bhumi-darkFg"
                                    />
                                    <button
                                        onClick={() => upiId && setShowUpiInput(true)}
                                        disabled={!upiId}
                                        className="w-full bg-bhumi-primary dark:bg-bhumi-darkPrimary hover:opacity-90 text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-bhumi-primary dark:border-bhumi-darkPrimary"
                                    >
                                        Generate Payment QR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Payment Summary */}
                                <div className="bg-bhumi-primary dark:bg-bhumi-darkPrimary p-4 text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs opacity-70">Quantity</p>
                                            <p className="font-bold">{quantityQuintals} Quintals</p>
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-70">Price/Quintal</p>
                                            <p className="font-bold">₹{midPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-white/20">
                                            <p className="text-xs opacity-70">Total Amount</p>
                                            <p className="text-2xl font-heading font-bold">₹{totalAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* UPI QR Code */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-white p-6 shadow-xl mb-4">
                                        <QRCodeSVG 
                                            value={upiQRString}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="text-center text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-sm max-w-xs">
                                        Scan with any UPI app (GPay, PhonePe, Paytm) to pay ₹{totalAmount.toLocaleString()}
                                    </p>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Pay to</span>
                                        <span className="font-bold text-bhumi-fg dark:text-bhumi-darkFg">{upiId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Tx Ref</span>
                                        <span className="font-mono text-sm text-bhumi-fg dark:text-bhumi-darkFg">
                                            {transactionHash.slice(2, 12).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Blockchain</span>
                                        <a 
                                            href={etherscanUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-bhumi-accent dark:text-bhumi-darkAccent hover:underline flex items-center gap-1"
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
                                    className="w-full py-2 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg text-sm"
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
                <div className="flex items-center justify-center gap-2 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-xs">
                    <QrCode size={14} />
                    <span>Powered by Ethereum • Sepolia Testnet • Immutable & Transparent</span>
                </div>
            </div>
        </div>
    );
};
