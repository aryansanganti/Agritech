import React, { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { SoilAnalysis } from './pages/SoilAnalysis';
import { CropAnalysis } from './pages/cropanalysis';
import { SeedScout } from './pages/SeedScout';
import { PricingEngine } from './pages/PricingEngine';
import { ReplicationPlanner } from './pages/ReplicationPlanner';
import { Chatbot } from './pages/Chatbot';
import { PageView, User, Language } from './types';
import { LandingPage } from './pages/LandingPage';
import { Profile } from './pages/Profile';
import { translations } from './utils/translations';
import { api } from './services/api';
import { isConfigured } from './services/geminiService';
import { Languages, Mail, Lock, User as UserIcon, MapPin, ArrowRight, Sprout, Droplets, Layers, AlertTriangle } from 'lucide-react';

const API_KEY = import.meta.env.VITE_API_KEY;

// Mock User for Instant Login
const MOCK_USER: User = {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    location: 'Madhya Pradesh, India',
    email: 'rajesh@agritech.com',
    language: 'en' // Default, will be updated by state
};

const App: React.FC = () => {
    const [view, setView] = useState<PageView>('landing');
    const [loading, setLoading] = useState(true);
    // Default Guest User
    const [user, setUser] = useState<User | null>(null);
    const [lang, setLang] = useState<Language>('en');
    const [isDark, setIsDark] = useState(false);

    // Initial Load Simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Theme Toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const goBack = () => setView('dashboard');

    // Instant Login Handler (Bypasses Auth Page)
    const handleInstantLogin = () => {
        const userWithLang = { ...MOCK_USER, language: lang };
        setUser(userWithLang);
        setView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setView('landing');
    };

    const apiKeyMissing = !API_KEY;

    const ApiKeyBanner = () => (
        apiKeyMissing ? (
            <div className="bg-red-500 text-white text-xs md:text-sm font-bold text-center p-2 fixed top-0 w-full z-50 flex items-center justify-center gap-2 shadow-lg">
                <AlertTriangle size={16} />
                <span>Setup Required: Add <code>VITE_API_KEY</code> to your environment variables.</span>
            </div>
        ) : null
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-bhoomi-dark flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    {/* Replaced bhoomiLogo with Image */}
                    <img src="/logo.png" alt="AgriTech Logo" className="h-28 w-auto mb-4 object-contain animate-bounce" />
                    <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-bhoomi-green animate-progress"></div>
                    </div>
                </div>
            </div>
        );
    }

    const renderPage = () => {
        switch (view) {
            case 'dashboard': return <Dashboard setView={setView} user={user} lang={lang} />;
            case 'profile': return <Profile user={user} setUser={setUser} onBack={goBack} />;
            case 'chatbot': return <Chatbot lang={lang} />;
            case 'soil-analysis': return <SoilAnalysis lang={lang} onBack={goBack} />;
            case 'crop-analysis': return <CropAnalysis lang={lang} onBack={goBack} />;
            case 'marketplace': return <Marketplace user={user} lang={lang} onBack={goBack} />;
            case 'seedscout': return <SeedScout lang={lang} onBack={goBack} />;
            case 'pricing-engine': return <PricingEngine lang={lang} onBack={goBack} />;
            case 'replication-planner': return <ReplicationPlanner lang={lang} onBack={goBack} />;
            default: return <Dashboard setView={setView} user={user} lang={lang} />;
        }
    };

    return (
        <>
            <ApiKeyBanner />

            {/* Landing Page (Public) */}
            {view === 'landing' && !user && (
                <LandingPage
                    onGetStarted={handleInstantLogin}
                />
            )}

            {/* Main App Layout (Protected) */}
            {user && (
                <Layout
                    currentView={view}
                    setView={setView}
                    user={user}
                    logout={handleLogout}
                    lang={lang}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                >
                    {renderPage()}
                </Layout>
            )}

            {/* Global Chat Widget (visible when logged in) */}
            {user && <div className="fixed bottom-6 right-6 z-50">
            </div>}
        </>
    );
}

export default App;