import React, { useState, useEffect } from 'react';
import {
    isMetaMaskInstalled,
    connectWallet,
    switchToSepolia,
    onAccountsChanged,
    onChainChanged,
    removeListeners,
    formatAddress,
    formatBalance,
    WalletState,
    SEPOLIA_CONFIG
} from '../services/ethereumService';
import {
    Wallet,
    Link2,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    Copy,
    Loader2,
    Droplets
} from 'lucide-react';

interface WalletConnectProps {
    onWalletConnected?: (state: WalletState) => void;
    onWalletDisconnected?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
    onWalletConnected,
    onWalletDisconnected
}) => {
    const [walletState, setWalletState] = useState<WalletState>({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isCorrectNetwork: false
    });
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Check if already connected on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
                try {
                    const state = await connectWallet();
                    setWalletState(state);
                    onWalletConnected?.(state);
                } catch (e) {
                    // Not connected, that's fine
                }
            }
        };
        checkConnection();

        // Set up event listeners
        onAccountsChanged(async (accounts) => {
            if (accounts.length === 0) {
                setWalletState({
                    isConnected: false,
                    address: null,
                    balance: null,
                    chainId: null,
                    isCorrectNetwork: false
                });
                onWalletDisconnected?.();
            } else {
                const state = await connectWallet();
                setWalletState(state);
                onWalletConnected?.(state);
            }
        });

        onChainChanged(async () => {
            // Refresh wallet state when chain changes
            if (walletState.isConnected) {
                const state = await connectWallet();
                setWalletState(state);
                onWalletConnected?.(state);
            }
        });

        return () => {
            removeListeners();
        };
    }, []);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!isMetaMaskInstalled()) {
                window.open('https://metamask.io/download/', '_blank');
                throw new Error('Please install MetaMask first');
            }

            const state = await connectWallet();
            setWalletState(state);
            onWalletConnected?.(state);

            if (!state.isCorrectNetwork) {
                setError('Please switch to Sepolia network');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSwitchNetwork = async () => {
        setIsSwitching(true);
        setError(null);

        try {
            await switchToSepolia();
            const state = await connectWallet();
            setWalletState(state);
            onWalletConnected?.(state);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSwitching(false);
        }
    };

    const copyAddress = () => {
        if (walletState.address) {
            navigator.clipboard.writeText(walletState.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const openFaucet = () => {
        window.open(SEPOLIA_CONFIG.faucets[0], '_blank');
    };

    // Not connected state
    if (!walletState.isConnected) {
        return (
            <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-accent/20 dark:border-bhumi-darkAccent/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-bhumi-accent/20 dark:bg-bhumi-darkAccent/20 p-2">
                        <Wallet size={20} className="text-bhumi-accent dark:text-bhumi-darkAccent" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">Connect Wallet</h3>
                        <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Store prices on Ethereum blockchain</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-bhumi-destructive/10 dark:bg-bhumi-darkDestructive/10 text-bhumi-destructive dark:text-bhumi-darkDestructive text-sm flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full bg-bhumi-accent dark:bg-bhumi-darkAccent hover:opacity-90 text-white font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-all border-2 border-bhumi-accent dark:border-bhumi-darkAccent"
                >
                    {isConnecting ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Link2 size={20} />
                    )}
                    {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </button>

                {!isMetaMaskInstalled() && (
                    <p className="text-xs text-center text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-3">
                        MetaMask not detected. Click to install.
                    </p>
                )}
            </div>
        );
    }

    // Connected but wrong network
    if (!walletState.isCorrectNetwork) {
        return (
            <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-secondary/30 dark:border-bhumi-darkSecondary/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-bhumi-secondary/30 dark:bg-bhumi-darkSecondary/30 p-2">
                        <AlertTriangle size={20} className="text-bhumi-fg dark:text-bhumi-darkFg" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">Wrong Network</h3>
                        <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Please switch to Sepolia testnet</p>
                    </div>
                </div>

                <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Connected</span>
                        <span className="font-mono font-bold text-bhumi-fg dark:text-bhumi-darkFg">
                            {walletState.address && formatAddress(walletState.address)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitching}
                    className="w-full bg-bhumi-secondary dark:bg-bhumi-darkSecondary hover:opacity-90 text-bhumi-fg dark:text-bhumi-darkFg font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-all border-2 border-bhumi-secondary dark:border-bhumi-darkSecondary"
                >
                    {isSwitching ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <RefreshCw size={20} />
                    )}
                    {isSwitching ? 'Switching...' : 'Switch to Sepolia'}
                </button>
            </div>
        );
    }

    // Connected and correct network
    return (
        <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-primary/20 dark:border-bhumi-darkPrimary/20 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-bhumi-primary/20 dark:bg-bhumi-darkPrimary/20 p-2">
                    <CheckCircle2 size={20} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">Wallet Connected</h3>
                    <p className="text-xs text-bhumi-primary dark:text-bhumi-darkPrimary">Sepolia Testnet</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Address */}
                <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg uppercase tracking-widest">Address</span>
                        <button
                            onClick={copyAddress}
                            className="text-bhumi-accent dark:text-bhumi-darkAccent hover:opacity-80 transition-colors"
                        >
                            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <p className="font-mono text-sm font-bold text-bhumi-fg dark:text-bhumi-darkFg mt-1">
                        {walletState.address && formatAddress(walletState.address)}
                    </p>
                </div>

                {/* Balance */}
                <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg uppercase tracking-widest">Balance</span>
                        <button
                            onClick={openFaucet}
                            className="text-xs text-bhumi-accent dark:text-bhumi-darkAccent hover:opacity-80 flex items-center gap-1"
                        >
                            <Droplets size={12} />
                            Get Test ETH
                        </button>
                    </div>
                    <p className="font-bold text-bhumi-fg dark:text-bhumi-darkFg mt-1">
                        {walletState.balance && formatBalance(walletState.balance)} ETH
                    </p>
                </div>
            </div>

            <a
                href={`https://sepolia.etherscan.io/address/${walletState.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full text-center text-xs text-bhumi-accent dark:text-bhumi-darkAccent hover:opacity-80 flex items-center justify-center gap-1"
            >
                <ExternalLink size={12} />
                View on Etherscan
            </a>
        </div>
    );
};
