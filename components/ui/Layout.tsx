
import React, { useState, useEffect } from 'react';
import { PageView, User, Language } from '../../types';
import { translations } from '../../utils/translations';
import {
    LayoutDashboard,
    ScanLine,
    Sprout,
    CloudSun,
    BarChart3,
    User as UserIcon,
    Menu,
    X,
    LogOut,
    TrendingUp,
    Droplets,
    Moon,
    Sun,
    FlaskConical,
    Bug,
    Download,
    QrCode,
    Copy,
    Check,
    Compass,
    ShoppingBag
} from 'lucide-react';
import { ChatWidget } from '../ChatWidget';

const APP_SHARE_URL = "https://ai.studio/apps/drive/1vb5mhOsrY1MB02qq9fb5fE2W2nawBCQv?fullscreenApplet=true";

interface LayoutProps {
    children: React.ReactNode;
    currentView: PageView;
    setView: (view: PageView) => void;
    user: User | null;
    logout: () => void;
    lang: Language;
    isDark: boolean;
    toggleTheme: () => void;
}

// Updated Logo: Modern Leaf Design
export const BhumiLogo = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="leafGrad" x1="10" y1="90" x2="90" y2="10">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Main Leaf Body */}
        <path
            d="M50 95 C 50 95, 10 70, 10 40 C 10 15, 30 5, 50 5 C 70 5, 90 15, 90 40 C 90 70, 50 95, 50 95 Z"
            fill="url(#leafGrad)"
            className="drop-shadow-md"
        />

        {/* Central Vein */}
        <path
            d="M50 95 Q 50 50 50 15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
        />

        {/* Side Veins */}
        <path d="M50 70 Q 70 60 80 50" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M50 70 Q 30 60 20 50" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M50 50 Q 70 40 75 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M50 50 Q 30 40 25 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

        {/* Water Droplet Accent */}
        <circle cx="65" cy="35" r="5" fill="#bae6fd" filter="url(#glow)" />
    </svg>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, logout, lang, isDark, toggleTheme }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(APP_SHARE_URL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const navItems = [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'soil-analysis', label: t.soilAnalysis, icon: FlaskConical },
        { id: 'crop-analysis', label: t.cropAnalysis, icon: ScanLine },

        { id: 'seedscout', label: 'SeedScout', icon: Compass },
        { id: 'replication-planner', label: 'Replication Planner', icon: Sprout },
        { id: 'pricing-engine', label: 'Pricing Engine', icon: TrendingUp },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
        { id: 'profile', label: t.profile, icon: UserIcon },
    ];

    return (
        <div className="min-h-screen flex relative overflow-hidden transition-colors duration-200 bg-bhumi-bg dark:bg-bhumi-darkBg text-bhumi-fg dark:text-bhumi-darkFg">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-bhumi-card dark:bg-bhumi-darkCard border-r-2 border-bhumi-border dark:border-bhumi-darkBorder z-20 h-screen sticky top-0">
                <div className="p-5 flex items-center gap-3 border-b-2 border-bhumi-border dark:border-bhumi-darkBorder">
                    <div className="animate-float">
                        <BhumiLogo size={42} />
                    </div>
                    <span className="text-2xl font-heading font-bold tracking-wide text-bhumi-fg dark:text-bhumi-darkFg">BHUMI</span>
                </div>
                <nav className="flex-1 px-3 space-y-1 mt-3 custom-scrollbar overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as PageView)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 border-2 ${currentView === item.id
                                ? 'bg-bhumi-primary dark:bg-bhumi-darkPrimary text-white border-bhumi-primary dark:border-bhumi-darkPrimary'
                                : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg border-transparent hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted hover:text-bhumi-fg dark:hover:text-bhumi-darkFg hover:border-bhumi-border dark:hover:border-bhumi-darkBorder'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={2} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t-2 border-bhumi-border dark:border-bhumi-darkBorder space-y-1">
                    {deferredPrompt && (
                        <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-3 bg-bhumi-primary dark:bg-bhumi-darkPrimary text-white border-2 border-bhumi-primary dark:border-bhumi-darkPrimary transition-colors hover:bg-bhumi-primaryHover">
                            <Download size={18} />
                            <span className="font-medium text-sm">Install App</span>
                        </button>
                    )}
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted border-2 border-transparent hover:border-bhumi-border dark:hover:border-bhumi-darkBorder transition-colors">
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="font-medium text-sm">{isDark ? t.lightMode : t.darkMode}</span>
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-bhumi-destructive hover:bg-bhumi-destructive/10 border-2 border-transparent hover:border-bhumi-destructive/30 transition-colors">
                        <LogOut size={18} />
                        <span className="font-medium text-sm">{t.logout}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 w-full z-30 bg-bhumi-card dark:bg-bhumi-darkCard border-b-2 border-bhumi-border dark:border-bhumi-darkBorder px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BhumiLogo size={32} />
                    <span className="font-heading font-bold text-lg text-bhumi-fg dark:text-bhumi-darkFg">BHUMI</span>
                </div>
                <div className="flex items-center gap-1">
                    {deferredPrompt && (
                        <button onClick={handleInstallClick} className="p-2 text-bhumi-primary dark:text-bhumi-darkPrimary hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted">
                            <Download size={20} />
                        </button>
                    )}
                    <button onClick={() => setShowQrModal(true)} className="p-2 text-bhumi-primary dark:text-bhumi-darkPrimary hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted">
                        <QrCode size={20} />
                    </button>
                    <button onClick={toggleTheme} className="p-2 text-bhumi-fg dark:text-bhumi-darkFg hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-bhumi-fg dark:text-bhumi-darkFg">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-20 bg-bhumi-bg dark:bg-bhumi-darkBg pt-16 px-4 pb-6 overflow-y-auto md:hidden animate-fade-in">
                    <nav className="space-y-2 mt-4">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setView(item.id as PageView);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-4 border-2 transition-colors ${currentView === item.id
                                    ? 'bg-bhumi-primary dark:bg-bhumi-darkPrimary text-white border-bhumi-primary dark:border-bhumi-darkPrimary'
                                    : 'bg-bhumi-card dark:bg-bhumi-darkCard text-bhumi-mutedFg dark:text-bhumi-darkMutedFg border-bhumi-border dark:border-bhumi-darkBorder'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                        {deferredPrompt && (
                            <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-4 mt-6 bg-bhumi-primary dark:bg-bhumi-darkPrimary text-white border-2 border-bhumi-primary dark:border-bhumi-darkPrimary font-medium">
                                <Download size={20} />
                                <span>Install Bhumi App</span>
                            </button>
                        )}
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-4 mt-2 text-bhumi-destructive bg-bhumi-destructive/10 border-2 border-bhumi-destructive/30">
                            <LogOut size={20} />
                            <span className="font-medium">{t.logout}</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto z-10 custom-scrollbar pt-16 md:pt-0 p-4 md:p-6 lg:p-8">
                {children}
            </main>

            {/* Floating Chat Widget */}
            <ChatWidget lang={lang} />

            {/* QR Code Modal for Sharing */}
            {showQrModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in"
                    onClick={() => setShowQrModal(false)}
                >
                    <div
                        className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 flex flex-col items-center gap-5 max-w-sm w-full border-2 border-bhumi-border dark:border-bhumi-darkBorder shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-1">Share Bhumi App</h3>
                            <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-sm">
                                Scan the code or copy the link to share.
                            </p>
                        </div>

                        <div className="bg-white p-4 border-4 border-bhumi-primary/30">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APP_SHARE_URL)}&bgcolor=ffffff&color=5D8F4A`}
                                alt="App QR Code"
                                className="w-48 h-48 md:w-56 md:h-56 object-contain"
                            />
                        </div>

                        <div className="flex gap-2 w-full">
                            <button
                                onClick={handleCopyLink}
                                className={`flex-1 flex items-center justify-center gap-2 font-medium py-3 border-2 transition-colors ${copied
                                    ? 'bg-bhumi-primary/10 border-bhumi-primary text-bhumi-primary'
                                    : 'bg-bhumi-muted dark:bg-bhumi-darkMuted border-bhumi-border dark:border-bhumi-darkBorder text-bhumi-fg dark:text-bhumi-darkFg hover:bg-bhumi-accent dark:hover:bg-bhumi-darkAccent'
                                    }`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="flex-1 bg-bhumi-primary dark:bg-bhumi-darkPrimary text-white font-medium py-3 border-2 border-bhumi-primary dark:border-bhumi-darkPrimary hover:bg-bhumi-primaryHover transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
