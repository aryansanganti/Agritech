import React, { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { SoilAnalysis } from './pages/SoilAnalysis';
import { CropAnalysis } from './pages/cropanalysis';
import { SeedScout } from './pages/SeedScout';
import { PricingEngine } from './pages/PricingEngine';
import { Chatbot } from './pages/Chatbot';
import { Profile } from './pages/Profile';
import { LandingPage } from './pages/LandingPage';
import { Language, PageView, User } from './types';
import { AlertTriangle } from 'lucide-react';

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

function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<PageView>('landing'); // Default to landing
    const [language, setLanguage] = useState<Language>('en');
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

    // Instant Login Handler (Bypasses Auth Page)
    const handleInstantLogin = () => {
        const userWithLang = { ...MOCK_USER, language: language };
        setUser(userWithLang);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView('landing');
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
        switch (currentView) {
            case 'dashboard':
                return <Dashboard user={user} lang={language} setView={setCurrentView} />;
            case 'marketplace':
                return <Marketplace lang={language} onBack={() => setCurrentView('dashboard')} user={user} />;
            case 'soil-analysis':
                return <SoilAnalysis lang={language} onBack={() => setCurrentView('dashboard')} />;
            case 'crop-analysis':
                return <CropAnalysis lang={language} onBack={() => setCurrentView('dashboard')} />;
            case 'seedscout':
                return <SeedScout lang={language} onBack={() => setCurrentView('dashboard')} />;
            case 'pricing-engine':
                return <PricingEngine lang={language} onBack={() => setCurrentView('dashboard')} />;
            case 'chatbot':
                return <Chatbot lang={language} />;
            case 'profile':
                return <Profile user={user} setUser={setUser} onBack={() => setCurrentView('dashboard')} />;
            default:
                return <Dashboard user={user} lang={language} setView={setCurrentView} />;
        }
    };

    return (
        <>
            <ApiKeyBanner />

            {/* Landing Page (Public) */}
            {currentView === 'landing' && !user && (
                <LandingPage
                    onGetStarted={handleInstantLogin}
                />
            )}

            {/* Main App Layout (Protected) */}
            {user && (
                <Layout
                    currentView={currentView}
                    setView={setCurrentView}
                    user={user}
                    logout={handleLogout}
                    lang={language}
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