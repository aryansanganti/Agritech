import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
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
// Updated Logo to Image

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, logout, lang, isDark, toggleTheme }) => {
    const [showQrModal, setShowQrModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const t = translations[lang];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(APP_SHARE_URL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bhoomi-dark transition-colors duration-300 font-sans">
            <Navbar
                user={user}
                currentView={currentView}
                setView={setView}
                lang={lang}
                isDark={isDark}
                toggleTheme={toggleTheme}
                logout={logout}
            />

            <main className="pt-20 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
                {children}
            </main>

            {/* Floating Chat Widget */}
            <ChatWidget lang={lang} />

            {/* QR Code Modal for Sharing */}
            {showQrModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setShowQrModal(false)}
                >
                    <div
                        className="bg-white dark:bg-bhoomi-dark p-8 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-white/10 animate-scale-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share bhoomi App</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Scan the code below or copy the link to share bhoomi with other farmers.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-bhoomi-green/20">
                            {/* Improved QR code display for better scanner detection */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APP_SHARE_URL)}&bgcolor=ffffff&color=2D5016`}
                                alt="App QR Code"
                                className="w-48 h-48 md:w-64 md:h-64 object-contain"
                            />
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleCopyLink}
                                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all border shadow-sm ${copied
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="flex-1 bg-bhoomi-green text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
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
