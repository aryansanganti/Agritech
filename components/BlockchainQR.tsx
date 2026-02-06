import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { EthereumTransaction, getEtherscanTxUrl } from '../services/ethereumService';
import { 
    QrCode, 
    Shield, 
    Copy, 
    CheckCircle2, 
    ExternalLink,
    Package,
    Wallet,
    Sparkles,
    Lock,
    Eye
} from 'lucide-react';

interface BlockchainQRProps {
    transaction: EthereumTransaction;
    farmerName?: string;
    quantityQuintals?: number;
}

// Generate UPI payment string
const generateUPIPaymentString = (
    upiId: string,
    payeeName: string,
    amount: number,
    transactionNote: string
): string => {
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        am: amount.toString(),
        cu: 'INR',
        tn: transactionNote
    });
    return `upi://pay?${params.toString()}`;
};

export const BlockchainQR: React.FC<BlockchainQRProps> = ({ 
    transaction, 
    farmerName = 'Farmer',
    quantityQuintals = 1
}) => {
    const [activeTab, setActiveTab] = useState<'quality' | 'payment'>('quality');
    const [copied, setCopied] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [showUpiInput, setShowUpiInput] = useState(false);

    // Format transaction hash for display
    const shortHash = `${transaction.transactionHash.slice(0, 10)}...${transaction.transactionHash.slice(-8)}`;
    
    // Calculate payment amount using mid-range price
    const midPrice = Math.round(
        (transaction.data.pricePerQuintal.min + transaction.data.pricePerQuintal.max) / 2
    );
    const totalAmount = quantityQuintals * midPrice;

    // Generate UPI QR string
    const upiQRString = upiId ? generateUPIPaymentString(
        upiId,
        farmerName,
        totalAmount,
        `BHUMI-${transaction.data.crop}-${transaction.transactionHash.slice(2, 10)}`
    ) : '';

    // Etherscan URL for quality verification - this is what QR code will link to
    const etherscanUrl = transaction.etherscanUrl;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openEtherscan = () => {
        window.open(etherscanUrl, '_blank');
    };

    return (
        <div className="glass-panel rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-3 rounded-xl border border-white/30">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Ethereum Blockchain Record</h3>
                        <p className="text-white/80 text-sm">Stored on Sepolia Testnet • View on Etherscan</p>
                    </div>
                </div>
                
                {/* Transaction Hash */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Transaction Hash</p>
                            <p className="font-mono text-sm">{shortHash}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => copyToClipboard(transaction.transactionHash)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Copy hash"
                            >
                                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            </button>
                            <button 
                                onClick={openEtherscan}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="View on Etherscan"
                            >
                                <ExternalLink size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                        <div>
                            <p className="text-xs text-white/60">Block Number</p>
                            <p className="font-bold">#{transaction.blockNumber.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/60">Record ID</p>
                            <p className="font-bold">#{transaction.recordId}</p>
                        </div>
                    </div>
                </div>
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
                    Check Quality on Etherscan
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
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded font-bold">
                                    ETHERSCAN
                                </div>
                            </div>
                            <p className="text-center text-gray-500 text-sm max-w-xs mb-2">
                                Scan to view transaction on Etherscan with quality score & price data
                            </p>
                            <button
                                onClick={openEtherscan}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                            >
                                <ExternalLink size={16} />
                                Open Etherscan Directly
                            </button>
                        </div>

                        {/* Quality Details - Stored on Chain */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20">
                            <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                <Shield size={16} />
                                On-Chain Data (Viewable on Etherscan)
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Crop:</span>
                                    <span className="ml-2 font-bold text-gray-900 dark:text-white">{transaction.data.crop}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Location:</span>
                                    <span className="ml-2 font-bold text-gray-900 dark:text-white">{transaction.data.location}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Quality Score:</span>
                                    <span className="ml-2 font-bold text-green-600">{transaction.data.qualityScore}/10</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Quantity:</span>
                                    <span className="ml-2 font-bold text-gray-900 dark:text-white">{transaction.data.quantityQuintals} Q</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Min Price:</span>
                                    <span className="ml-2 font-bold text-gray-900 dark:text-white">₹{transaction.data.pricePerQuintal.min.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Max Price:</span>
                                    <span className="ml-2 font-bold text-gray-900 dark:text-white">₹{transaction.data.pricePerQuintal.max.toLocaleString()}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500">MGP (Guaranteed):</span>
                                    <span className="ml-2 font-bold text-red-600">₹{transaction.data.pricePerQuintal.guaranteed.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Verification Badge */}
                        <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-500/10 text-green-600 py-3 px-4 rounded-xl">
                            <CheckCircle2 size={20} />
                            <span className="font-bold">Verified on Ethereum Sepolia</span>
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
                                        <span className="text-gray-500">Blockchain Ref</span>
                                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                            {transaction.transactionHash.slice(2, 12).toUpperCase()}
                                        </span>
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
                    <span>Powered by Ethereum • Sepolia Testnet • Etherscan Verified</span>
                </div>
            </div>
        </div>
    );
};
