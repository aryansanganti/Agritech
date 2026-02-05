import React, { useState, useEffect } from 'react';
import { Layout, BhumiLogo } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { SoilAnalysis } from './pages/SoilAnalysis';
import { CropAnalysis } from './pages/cropanalysis';
import { Marketplace } from './pages/Marketplace';
import { SeedScout } from './pages/SeedScout';
import { PricingEngine } from './pages/PricingEngine';
import { ReplicationPlanner } from './pages/ReplicationPlanner';
import { Chatbot } from './pages/Chatbot';
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
            <div className="min-h-screen flex items-center justify-center bg-bhumi-bg dark:bg-bhumi-darkBg">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <BhumiLogo size={60} />
                    <div className="text-bhumi-primary dark:text-bhumi-darkPrimary font-heading font-bold">Loading Bhumi...</div>
                </div>
            </div>
        );
    }

    const ApiKeyBanner = () => (
        apiKeyMissing ? (
            <div className="bg-bhumi-destructive text-bhumi-destructiveFg text-xs md:text-sm font-bold text-center p-2.5 fixed top-0 w-full z-50 flex items-center justify-center gap-2 shadow-lg">
                <AlertTriangle size={16} />
                <span>Setup Required: Add <code className="bg-white/20 px-1.5 py-0.5 rounded">VITE_API_KEY</code> to your environment variables.</span>
            </div>
        ) : null
    );

    // Language Selection Screen
    if (view === 'language') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-bhumi-bg dark:bg-bhumi-darkBg transition-colors duration-500">
                <ApiKeyBanner />
                <div className="z-10 text-center space-y-10 animate-fade-in w-full max-w-4xl mt-6">
                    <div className="flex justify-center mb-8 animate-float">
                        <BhumiLogo size={100} />
                    </div>
                    <div>
                        <h1 className="text-5xl md:text-7xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg tracking-tight mb-3">BHUMI</h1>
                        <p className="text-bhumi-primary dark:text-bhumi-darkPrimary text-lg font-accent italic tracking-wide">Smart Farming Assistant</p>
                    </div>

                    <div className="decorative-line w-32 mx-auto my-8"></div>

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
                        ].map((l, index) => (
                            <button
                                key={l.code}
                                onClick={() => selectLanguage(l.code as Language)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                className="p-6 bg-bhumi-card dark:bg-bhumi-darkCard hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted transition-all border-2 border-bhumi-border dark:border-bhumi-darkBorder hover:border-bhumi-primary dark:hover:border-bhumi-darkPrimary group relative overflow-hidden animate-fade-in opacity-0"
                            >
                                <div className="absolute inset-0 bg-bhumi-primary/5 dark:bg-bhumi-darkPrimary/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                                <span className="relative text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg group-hover:text-bhumi-primary dark:group-hover:text-bhumi-darkPrimary transition-colors">
                                    {l.native}
                                </span>
                                <div className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-1 font-accent italic">{l.label}</div>
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
            case 'profile': return <Profile user={user} setUser={setUser} onBack={goBack} />;
            case 'chatbot': return <Chatbot lang={lang} />;
            case 'soil-analysis': return <SoilAnalysis lang={lang} onBack={goBack} />;
            case 'crop-analysis': return <CropAnalysis lang={lang} onBack={goBack} onNavigateToPricing={() => setView('pricing-engine')} />;
            case 'marketplace': return <Marketplace user={user} lang={lang} onBack={goBack} onNavigateToQualityGrading={() => setView('crop-analysis')} />;
            case 'seedscout': return <SeedScout lang={lang} onBack={goBack} onNavigateToReplication={(crop: string, source: string) => {
                // Store crop and source for replication planner
                localStorage.setItem('replication_crop', crop);
                localStorage.setItem('replication_source', source);
                setView('replication-planner');
            }} />;
            case 'pricing-engine': return <PricingEngine lang={lang} onBack={goBack} onNavigateToMarketplace={() => setView('marketplace')} onNavigateToQualityGrading={() => setView('crop-analysis')} />;
            case 'replication-planner': return <ReplicationPlanner 
                lang={lang} 
                onBack={goBack} 
                initialCrop={localStorage.getItem('replication_crop') || ''} 
                initialSource={localStorage.getItem('replication_source') || ''} 
            />;
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