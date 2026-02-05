import React, { useState } from 'react';
import { CloudRain, Wind, Droplets, ThermometerSun, ScanLine, Sprout, ShoppingBag, FlaskConical, Mic, ArrowRight } from 'lucide-react';
import { PageView, User, Language } from '../types';
import { translations } from '../utils/translations';
import { VoiceAgent } from '../components/VoiceAgent';
import { FarmSimulation } from '../components/FarmSimulation';

interface DashboardProps {
    setView: (view: PageView) => void;
    user: User | null;
    lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView, user, lang }) => {
    const t = translations[lang];
    const firstName = user?.name ? user.name.split(' ')[0] : 'Farmer';
    const [showVoiceAgent, setShowVoiceAgent] = useState(false);

    const QuickActionCard = ({ icon: Icon, title, description, onClick, colorClass }: any) => (
        <button
            onClick={onClick}
            className="group relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-bhoomi-green/30"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                <Icon size={64} />
            </div>
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-opacity-100`}>
                <Icon size={24} className="text-current" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-bhoomi-green group-hover:translate-x-1 transition-transform">
                Open <ArrowRight size={16} />
            </div>
        </button>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        {t.greeting}, {firstName}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {t.farmConditions}
                    </p>
                </div>

                {/* Simplified Weather Widget */}
                <div className="flex items-center gap-6 bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-500/10 rounded-lg text-orange-500">
                            <ThermometerSun size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-gray-900 dark:text-white">28°C</span>
                            <span className="text-xs text-gray-500">Sunny</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-gray-200 dark:bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-500">
                            <Droplets size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-gray-900 dark:text-white">65%</span>
                            <span className="text-xs text-gray-500">Humid</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main: Farm Simulation (Interactive) */}
                <div className="lg:col-span-2 space-y-6">
                    <FarmSimulation />

                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-bhoomi-green to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setShowVoiceAgent(true)}>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Mic size={24} />
                                    </div>
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">AI Assistant</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1">Ask bhoomi Live</h3>
                                <p className="text-green-100 text-sm">Voice-enabled farm advisory</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        </div>

                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group cursor-pointer" onClick={() => setView('crop-analysis')}>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                                        <ScanLine size={24} />
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">New</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Crop Doctor</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Diagnose diseases instantly</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Quick Actions List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Quick Access
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <QuickActionCard
                            title="Marketplace"
                            description="Sell crops & buy seeds"
                            icon={ShoppingBag}
                            onClick={() => setView('marketplace')}
                            colorClass="text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/10"
                        />
                        <QuickActionCard
                            title="Soil Health"
                            description="Analyze nutrients"
                            icon={FlaskConical}
                            onClick={() => setView('soil-analysis')}
                            colorClass="text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10"
                        />
                        <QuickActionCard
                            title="SeedScout"
                            description="Find optimal seeds"
                            icon={Sprout}
                            onClick={() => setView('seedscout')}
                            colorClass="text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-500/10"
                        />
                    </div>
                </div>
            </div>

            <VoiceAgent isOpen={showVoiceAgent} onClose={() => setShowVoiceAgent(false)} />
        </div>
    );
};