import React, { useState } from 'react';
import { CloudRain, Wind, Droplets, ThermometerSun, AlertTriangle, TrendingUp, ScanLine, Sprout, BarChart3, CloudSun, Bug, FlaskConical, Mic, ArrowRight, Compass, ShoppingBag, Route } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageView, User, Language } from '../types';
import { translations } from '../utils/translations';
import { VoiceAgent } from '../components/VoiceAgent';
import { FarmSimulation } from '../components/FarmSimulation';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Separator } from '../components/ui/Shared';
import { cn } from '../lib/utils';

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
        <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-bhoomi-green/30 relative overflow-hidden" onClick={onClick}>
            <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity", colorClass)}>
                <Icon size={64} />
            </div>
            <CardContent className="p-6">
                <div className={cn("w-12 h-12 rounded-xl mb-4 flex items-center justify-center", colorClass, "bg-opacity-10 dark:bg-opacity-20 text-opacity-100")}>
                    <Icon size={24} className="text-current" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-bhoomi-green group-hover:translate-x-1 transition-transform">
                    Open <ArrowRight size={16} />
                </div>
            </CardContent>
        </Card>
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

                {/* Weather Widget */}
                <Card className="flex-shrink-0 shadow-sm">
                    <CardContent className="p-3 px-5 flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-500/10 rounded-xl text-orange-500">
                                <ThermometerSun size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white">28°C</span>
                                <span className="text-xs text-gray-500">Sunny</span>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-500">
                                <Droplets size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white">65%</span>
                                <span className="text-xs text-gray-500">Humid</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Featured: Crop Replication Planner */}
            <Card
                className="cursor-pointer group border-2 border-dashed border-bhoomi-primary/30 hover:border-bhoomi-primary bg-gradient-to-r from-bhoomi-primary/5 to-transparent transition-all"
                onClick={() => setView('replication-planner')}
            >
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-bhoomi-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Sprout className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    🌱 Crop Replication Planner
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-lg">
                                    Replicate any famous crop anywhere! Get complete cultivation plans with climate adjustments,
                                    week-by-week schedules, fertilizer calendars & pest management.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant="success">🍓 Strawberry from Mahabaleshwar</Badge>
                                    <Badge variant="warning">🥭 Alphonso from Ratnagiri</Badge>
                                    <Badge variant="info">🍎 Apple from Shimla</Badge>
                                </div>
                            </div>
                        </div>

                        <Button variant="success" size="lg" className="group-hover:scale-105 transition-all shadow-lg">
                            <span>Try Now</span>
                            <ArrowRight size={18} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions - SeedScout & Marketplace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                    className="cursor-pointer group border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-lg transition-all"
                    onClick={() => setView('seedscout')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Compass className="text-emerald-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">SeedScout</h3>
                                <p className="text-sm text-gray-500">Find genetic hotspots for stress-tolerant seeds</p>
                            </div>
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer group border-blue-500/20 hover:border-blue-500/50 hover:shadow-lg transition-all"
                    onClick={() => setView('marketplace')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🛒</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">Marketplace</h3>
                                <p className="text-sm text-gray-500">Buy & sell blockchain-verified produce</p>
                            </div>
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access: 3-Tier Routing Protocol */}
            <Card
                className="cursor-pointer group border-2 border-dashed border-orange-400/30 hover:border-orange-500 bg-gradient-to-r from-orange-500/5 to-red-500/5 transition-all"
                onClick={() => setView('routing-protocol')}
            >
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Route className="text-orange-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">3-Tier Routing Protocol</h3>
                            <p className="text-sm text-gray-500">Scan → Classify → Route to Retail, Mandi, or Factory</p>
                        </div>
                        <ArrowRight size={20} className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main: Farm Simulation (Interactive) */}
                <div className="lg:col-span-2 space-y-6">
                    <FarmSimulation />

                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-bhoomi-green border-bhoomi-green text-white cursor-pointer hover:shadow-xl transition-all group overflow-hidden" onClick={() => setShowVoiceAgent(true)}>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Mic size={24} />
                                    </div>
                                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">AI Assistant</Badge>
                                </div>
                                <h3 className="text-xl font-bold mb-1">Ask bhoomi Live</h3>
                                <p className="text-emerald-50 text-sm opacity-90">Voice-enabled farm advisory</p>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-all group" onClick={() => setView('crop-analysis')}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                                        <ScanLine size={24} />
                                    </div>
                                    <Badge variant="info">New</Badge>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Crop Doctor</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Diagnose diseases instantly</p>
                            </CardContent>
                        </Card>
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
                            colorClass="text-sky-700 bg-sky-100 dark:text-sky-400 dark:bg-sky-500/10"
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