// Ethereum Blockchain Service using ethers.js
// Connects to MetaMask and interacts with CropPricing smart contract on Sepolia

import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_CONFIG } from '../contracts/contractConfig';

// Re-export CHAIN_CONFIG as SEPOLIA_CONFIG for compatibility
export const SEPOLIA_CONFIG = {
    ...CHAIN_CONFIG,
    faucets: [
        'https://sepoliafaucet.com',
        'https://www.alchemy.com/faucets/ethereum-sepolia',
        'https://faucet.quicknode.com/ethereum/sepolia'
    ]
};

export interface EthereumTransaction {
    transactionHash: string;
    blockNumber: number;
    recordId: number;
    timestamp: string;
    etherscanUrl: string;
    data: {
        crop: string;
        location: string;
        qualityScore: number;
        quantityQuintals: number;
        pricePerQuintal: {
            min: number;
            max: number;
            guaranteed: number;
        };
        confidenceScore: number;
        farmerAddress: string;
    };
}

// Alias for backward compatibility
export interface BlockchainTransactionResult {
    success: boolean;
    transactionHash: string;
    blockNumber: number;
    etherscanUrl: string;
    timestamp: string;
    gasUsed?: string;
    error?: string;
    data: {
        crop: string;
        location: string;
        qualityScore: number;
        quantity: number;
        minPrice: number;
        maxPrice: number;
        guaranteedPrice: number;
    };
}

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    balance: string | null;
    chainId: string | null;
    isCorrectNetwork: boolean;
}

// Helper function to format address
export const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to format balance
export const formatBalance = (balance: string): string => {
    return parseFloat(balance).toFixed(4);
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Get provider
const getProvider = (): BrowserProvider | null => {
    if (!isMetaMaskInstalled()) return null;
    return new BrowserProvider(window.ethereum);
};

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<WalletState> => {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
        const provider = getProvider()!;
        const accounts = await provider.send('eth_requestAccounts', []);
        const address = accounts[0];
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        const isCorrectNetwork = network.chainId.toString() === '11155111'; // Sepolia

        return {
            isConnected: true,
            address,
            balance: formatUnits(balance, 18),
            chainId: network.chainId.toString(),
            isCorrectNetwork
        };
    } catch (error: any) {
        throw new Error(`Failed to connect wallet: ${error.message}`);
    }
};

// Switch to Sepolia network
export const switchToSepolia = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_CONFIG.chainId }]
        });
    } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: CHAIN_CONFIG.chainId,
                    chainName: CHAIN_CONFIG.chainName,
                    nativeCurrency: CHAIN_CONFIG.nativeCurrency,
                    rpcUrls: CHAIN_CONFIG.rpcUrls,
                    blockExplorerUrls: CHAIN_CONFIG.blockExplorerUrls
                }]
            });
        } else {
            throw switchError;
        }
    }
};

// Get contract instance
const getContract = async (withSigner: boolean = false): Promise<Contract> => {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');

    if ((CONTRACT_ADDRESS as string) === "PASTE_YOUR_CONTRACT_ADDRESS_HERE") {
        throw new Error('Contract address not configured. Please deploy the contract and update contractConfig.ts');
    }

    if (withSigner) {
        const signer = await provider.getSigner();
        return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Store price record on blockchain
export const storePriceOnChain = async (
    crop: string,
    location: string,
    qualityScore: number,
    quantityQuintals: number,
    minPrice: number,
    maxPrice: number,
    guaranteedPrice: number,
    confidenceScore: number
): Promise<EthereumTransaction> => {
    try {
        const contract = await getContract(true);
        const provider = getProvider()!;
        const signer = await provider.getSigner();
        const farmerAddress = await signer.getAddress();

        // Convert prices to paise (multiply by 100)
        const minPricePaise = BigInt(Math.round(minPrice * 100));
        const maxPricePaise = BigInt(Math.round(maxPrice * 100));
        const guaranteedPricePaise = BigInt(Math.round(guaranteedPrice * 100));

        console.log('Storing price record on blockchain...');
        console.log({ crop, location, qualityScore, quantityQuintals, minPricePaise, maxPricePaise, guaranteedPricePaise, confidenceScore });

        // Call the smart contract function
        const tx = await contract.storePriceRecord(
            crop,
            location,
            qualityScore,
            BigInt(quantityQuintals),
            minPricePaise,
            maxPricePaise,
            guaranteedPricePaise,
            BigInt(confidenceScore)
        );

        console.log('Transaction sent:', tx.hash);

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction mined:', receipt);

        // Get record ID from event logs
        let recordId = 0;
        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog({
                    topics: log.topics as string[],
                    data: log.data
                });
                if (parsed && parsed.name === 'PriceRecorded') {
                    recordId = Number(parsed.args[0]);
                    break;
                }
            } catch (e) {
                // Skip logs that can't be parsed
            }
        }

        const etherscanUrl = `https://sepolia.etherscan.io/tx/${receipt.hash}`;

        return {
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            recordId,
            timestamp: new Date().toISOString(),
            etherscanUrl,
            data: {
                crop,
                location,
                qualityScore,
                quantityQuintals,
                pricePerQuintal: {
                    min: minPrice,
                    max: maxPrice,
                    guaranteed: guaranteedPrice
                },
                confidenceScore,
                farmerAddress
            }
        };
    } catch (error: any) {
        console.error('Error storing price on chain:', error);
        throw new Error(`Failed to store on blockchain: ${error.message}`);
    }
};

// Get price record from blockchain
export const getPriceRecord = async (recordId: number): Promise<EthereumTransaction['data'] & { timestamp: number }> => {
    try {
        const contract = await getContract(false);
        const record = await contract.getPriceRecord(recordId);

        return {
            crop: record.crop,
            location: record.location,
            qualityScore: Number(record.qualityScore),
            quantityQuintals: Number(record.quantityQuintals),
            pricePerQuintal: {
                min: Number(record.minPrice) / 100, // Convert from paise to rupees
                max: Number(record.maxPrice) / 100,
                guaranteed: Number(record.guaranteedPrice) / 100
            },
            confidenceScore: Number(record.confidenceScore),
            farmerAddress: record.farmer,
            timestamp: Number(record.timestamp)
        };
    } catch (error: any) {
        throw new Error(`Failed to get record: ${error.message}`);
    }
};

// Get all records for a farmer
export const getFarmerRecords = async (farmerAddress: string): Promise<number[]> => {
    try {
        const contract = await getContract(false);
        const recordIds = await contract.getFarmerRecords(farmerAddress);
        return recordIds.map((id: bigint) => Number(id));
    } catch (error: any) {
        throw new Error(`Failed to get farmer records: ${error.message}`);
    }
};

// Generate Etherscan URL for transaction
export const getEtherscanTxUrl = (txHash: string): string => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
};

// Generate Etherscan URL for contract read (to see the stored data)
export const getEtherscanContractReadUrl = (): string => {
    return `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#readContract`;
};

// Listen for account changes
export const onAccountChange = (callback: (accounts: string[]) => void): void => {
    if (isMetaMaskInstalled()) {
        window.ethereum.on('accountsChanged', callback);
    }
};

// Alias for compatibility
export const onAccountsChanged = onAccountChange;

// Listen for network changes
export const onNetworkChange = (callback: (chainId: string) => void): void => {
    if (isMetaMaskInstalled()) {
        window.ethereum.on('chainChanged', callback);
    }
};

// Alias for compatibility
export const onChainChanged = onNetworkChange;

// Disconnect listeners
export const removeListeners = (): void => {
    if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
    }
};

// Store crop price on chain - wrapper function for compatibility
export const storeCropPriceOnChain = async (data: {
    crop: string;
    location: string;
    qualityScore: number;
    quantity: number;
    minPrice: number;
    maxPrice: number;
    guaranteedPrice: number;
}): Promise<BlockchainTransactionResult> => {
    const result = await storePriceOnChain(
        data.crop,
        data.location,
        data.qualityScore,
        data.quantity,
        data.minPrice,
        data.maxPrice,
        data.guaranteedPrice,
        85 // Default confidence score
    );

    // Convert to BlockchainTransactionResult format
    return {
        success: true,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        etherscanUrl: result.etherscanUrl,
        timestamp: result.timestamp,
        data: {
            crop: result.data.crop,
            location: result.data.location,
            qualityScore: result.data.qualityScore,
            quantity: result.data.quantityQuintals,
            minPrice: result.data.pricePerQuintal.min,
            maxPrice: result.data.pricePerQuintal.max,
            guaranteedPrice: result.data.pricePerQuintal.guaranteed
        }
    };
};

// Declare ethereum on window
declare global {
    interface Window {
        ethereum: any;
    }
}
