import React, { useState, useEffect } from 'react';
import { Layout, BhumiLogo } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { Chatbot } from './pages/Chatbot';
import { CropRecommendation } from './pages/CropRecommendation';
import { YieldPrediction } from './pages/YieldPrediction';
import { SmartAdvisory } from './pages/SmartAdvisory';
import { Weather } from './pages/Weather';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { SeedScout } from './pages/SeedScout';
import { PageView, User, Language } from './types';
import { translations } from './utils/translations';
import { api } from './services/api';
import { isConfigured } from './services/geminiService';
import { Languages, Mail, Lock, User as UserIcon, MapPin, ArrowRight, Sprout, Droplets, Layers, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
    const [view, setView] = useState<PageView>('language');
    // Default Guest User
    const [user, setUser] = useState<User | null>({
        name: 'Guest Farmer',
        email: 'guest@bhumi.ag',
        location: 'India',
        farmSize: '5',
        soilType: 'Loamy',
        mainCrop: 'Rice',
        irrigationSource: 'Rainfed'
    });
    const [lang, setLang] = useState<Language>('en');
    const [isDark, setIsDark] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);


    // Initial Load
    useEffect(() => {
        const initApp = async () => {
            try {
                // Check if API key is present
                if (!isConfigured()) {
                    setApiKeyMissing(true);
                }

                const storedLang = localStorage.getItem('bhumi_lang') as Language;
                if (storedLang) setLang(storedLang);

                const storedTheme = localStorage.getItem('bhumi_theme');
                if (storedTheme === 'dark') {
                    setIsDark(true);
                    document.documentElement.classList.add('dark');
                } else {
                    setIsDark(false);
                    document.documentElement.classList.remove('dark');
                }

                // Ensure we are ready
                setInitialCheckDone(true);
            } catch (error) {
                console.error("Initialization error:", error);
                setInitialCheckDone(true);
            }
        };
        initApp();
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('bhumi_theme', newTheme ? 'dark' : 'light');
        if (newTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = async () => {
        // await api.auth.logout(); // Optional: Call API logout if backend session exists
        // setUser(null); // Keep guest user or reset to default guest
        setView('language');
    };

    const selectLanguage = (l: Language) => {
        setLang(l);
        localStorage.setItem('bhumi_lang', l);
        setView('dashboard');
    };

    const goBack = () => setView('dashboard');
    const t = translations[lang];

    // Show loading spinner while checking auth status
    if (!initialCheckDone) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F1419]">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <BhumiLogo size={60} />
                    <div className="text-bhumi-green font-bold">Loading Bhumi...</div>
                </div>
            </div>
        );
    }

    const ApiKeyBanner = () => (
        apiKeyMissing ? (
            <div className="bg-red-500 text-white text-xs md:text-sm font-bold text-center p-2 fixed top-0 w-full z-50 flex items-center justify-center gap-2 shadow-lg">
                <AlertTriangle size={16} />
                <span>Setup Required: Add <code>VITE_API_KEY</code> to your environment variables.</span>
            </div>
        ) : null
    );

    // Language Selection Screen
    if (view === 'language') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-white dark:bg-[#0F1419] transition-colors duration-500">
                <ApiKeyBanner />
                <div className="z-10 text-center space-y-8 animate-fade-in w-full max-w-4xl mt-6">
                    <div className="flex justify-center mb-6 animate-float">
                        <BhumiLogo size={120} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">BHUMI</h1>
                        <p className="text-bhumi-green dark:text-bhumi-gold text-xl font-light tracking-widest uppercase">Smart Farming Assistant</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                        {[
                            { code: 'en', label: 'English', native: 'English' },
                            { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
                            { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
                            { code: 'bn', label: 'Bengali', native: 'বাংলা' },
                            { code: 'zh', label: 'Mandarin', native: '中文' },
                            { code: 'es', label: 'Spanish', native: 'Español' },
                            { code: 'ru', label: 'Russian', native: 'Русский' },
                            { code: 'ja', label: 'Japanese', native: '日本語' },
                            { code: 'pt', label: 'Portuguese', native: 'Português' },
                        ].map((l) => (
                            <button
                                key={l.code}
                                onClick={() => selectLanguage(l.code as Language)}
                                className="glass-panel p-6 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 hover:border-bhumi-green dark:hover:border-bhumi-gold group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-bhumi-green/5 dark:bg-bhumi-gold/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <span className="relative text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-bhumi-green dark:group-hover:text-bhumi-gold transition-colors">
                                    {l.native}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">{l.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }


    const renderPage = () => {
        switch (view) {
            case 'dashboard': return <Dashboard setView={setView} user={user} lang={lang} />;
            case 'profile': return <Profile user={user} setUser={setUser} onBack={goBack} />; case 'disease-detection': return <DiseaseDetection lang={lang} onBack={goBack} />;
            case 'yield-prediction': return <YieldPrediction lang={lang} onBack={goBack} />;
            case 'smart-advisory': return <SmartAdvisory lang={lang} onBack={goBack} />;
            case 'chatbot': return <Chatbot lang={lang} />;
            case 'crop-recommendation': return <CropRecommendation lang={lang} onBack={goBack} />;
            case 'weather': return <Weather lang={lang} onBack={goBack} />;
            case 'analytics': return <Analytics lang={lang} onBack={goBack} />;
            case 'profile': return <Profile user={user} setUser={setUser} onBack={goBack} />;
            case 'seedscout': return <SeedScout lang={lang} onBack={goBack} />;
            default: return <Dashboard setView={setView} user={user} lang={lang} />;
        }
    };

    return (
        <Layout
            currentView={view}
            setView={setView}
            user={user}
            logout={handleLogout}
            lang={lang}
            isDark={isDark}
            toggleTheme={toggleTheme}
        >
            <ApiKeyBanner />
            {renderPage()}
        </Layout>
    );
};

export default App;