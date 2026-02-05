// Blockchain Service for Crop Pricing Storage
// Simulates blockchain storage with local storage persistence and generates unique transaction hashes

export interface BlockchainTransaction {
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    data: {
        crop: string;
        location: string;
        qualityScore: number;
        amount: number;
        pricePerQuintal: {
            min: number;
            max: number;
            guaranteed: number;
        };
        farmerUpiId?: string;
        confidenceScore: number;
    };
    verified: boolean;
}

export interface QRCodeData {
    type: 'quality' | 'payment';
    transactionHash: string;
    data: {
        crop?: string;
        qualityScore?: number;
        amount?: number;
        verificationUrl?: string;
        upiId?: string;
        payeeName?: string;
        transactionNote?: string;
    };
}

// Generate a realistic-looking blockchain transaction hash
const generateTransactionHash = (): string => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
};

// Generate a block number
const generateBlockNumber = (): number => {
    const baseBlock = 18500000; // Simulated starting block
    const storedTransactions = getStoredTransactions();
    return baseBlock + storedTransactions.length + 1;
};

// Get stored transactions from localStorage
export const getStoredTransactions = (): BlockchainTransaction[] => {
    try {
        const stored = localStorage.getItem('bhumi_blockchain_transactions');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Store transaction to localStorage
const storeTransaction = (transaction: BlockchainTransaction): void => {
    const transactions = getStoredTransactions();
    transactions.push(transaction);
    localStorage.setItem('bhumi_blockchain_transactions', JSON.stringify(transactions));
};

// Get transaction by hash
export const getTransactionByHash = (hash: string): BlockchainTransaction | null => {
    const transactions = getStoredTransactions();
    return transactions.find(t => t.transactionHash === hash) || null;
};

// Store pricing data on "blockchain"
export const storePriceOnBlockchain = async (
    crop: string,
    location: string,
    qualityScore: number,
    amount: number,
    pricePerQuintal: { min: number; max: number; guaranteed: number },
    confidenceScore: number,
    farmerUpiId?: string
): Promise<BlockchainTransaction> => {
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const transaction: BlockchainTransaction = {
        transactionHash: generateTransactionHash(),
        blockNumber: generateBlockNumber(),
        timestamp: new Date().toISOString(),
        data: {
            crop,
            location,
            qualityScore,
            amount,
            pricePerQuintal,
            farmerUpiId,
            confidenceScore
        },
        verified: true
    };

    storeTransaction(transaction);
    return transaction;
};

// Verify a transaction on the blockchain
export const verifyTransaction = async (hash: string): Promise<{
    verified: boolean;
    transaction: BlockchainTransaction | null;
}> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const transaction = getTransactionByHash(hash);
    return {
        verified: transaction?.verified || false,
        transaction
    };
};

// Generate QR code data for quality verification
export const generateQualityQRData = (transaction: BlockchainTransaction): string => {
    const qrData: QRCodeData = {
        type: 'quality',
        transactionHash: transaction.transactionHash,
        data: {
            crop: transaction.data.crop,
            qualityScore: transaction.data.qualityScore,
            amount: transaction.data.amount,
            verificationUrl: `https://bhumi.agri/verify/${transaction.transactionHash}`
        }
    };
    return JSON.stringify(qrData);
};

// Generate UPI payment QR code string (standard UPI deep link format)
export const generateUPIPaymentString = (
    upiId: string,
    payeeName: string,
    amount: number,
    transactionNote: string,
    transactionHash: string
): string => {
    // UPI deep link format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=NOTE
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        am: amount.toString(),
        cu: 'INR',
        tn: `BHUMI-${transactionNote}-${transactionHash.slice(0, 10)}`
    });
    return `upi://pay?${params.toString()}`;
};

// Calculate total amount based on quantity and price
export const calculateTotalAmount = (
    quantityInQuintals: number,
    pricePerQuintal: number
): number => {
    return quantityInQuintals * pricePerQuintal;
};

// Generate verification URL for QR code
export const generateVerificationUrl = (transactionHash: string): string => {
    // In production, this would be a real URL
    return `https://bhumi.agri/verify/${transactionHash}`;
};

// Format transaction for display
export const formatTransactionForDisplay = (transaction: BlockchainTransaction) => {
    return {
        hash: transaction.transactionHash,
        shortHash: `${transaction.transactionHash.slice(0, 10)}...${transaction.transactionHash.slice(-8)}`,
        block: transaction.blockNumber.toLocaleString(),
        time: new Date(transaction.timestamp).toLocaleString(),
        crop: transaction.data.crop,
        quality: `${transaction.data.qualityScore}/10`,
        amount: transaction.data.amount,
        priceRange: `₹${transaction.data.pricePerQuintal.min.toLocaleString()} - ₹${transaction.data.pricePerQuintal.max.toLocaleString()}`,
        mgp: `₹${transaction.data.pricePerQuintal.guaranteed.toLocaleString()}`,
        verified: transaction.verified
    };
};
