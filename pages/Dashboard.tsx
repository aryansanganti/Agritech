import React from 'react';
import { CloudRain, Wind, Droplets, ThermometerSun, AlertTriangle, TrendingUp, ScanLine, Sprout, BarChart3, CloudSun, Bug, FlaskConical, Mic, MapPin, ArrowRight, Compass } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageView, User, Language } from '../types';
import { translations } from '../utils/translations';
import { VoiceAgent } from '../components/VoiceAgent';

const mockData = [
    { name: 'Jan', yield: 40 },
    { name: 'Feb', yield: 30 },
    { name: 'Mar', yield: 20 },
    { name: 'Apr', yield: 27 },
    { name: 'May', yield: 18 },
    { name: 'Jun', yield: 23 },
    { name: 'Jul', yield: 34 },
];

interface DashboardProps {
    setView: (view: PageView) => void;
    user: User | null;
    lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView, user, lang }) => {
    const t = translations[lang];
    const firstName = user?.name ? user.name.split(' ')[0] : 'Farmer';
    const [showVoiceAgent, setShowVoiceAgent] = React.useState(false);

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-4xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-1">{t.greeting}, <span className="text-bhumi-primary dark:text-bhumi-darkPrimary">{firstName}</span></h1>
                    <p className="text-sm md:text-base text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">{t.farmConditions}</p>
                </div>
                <div className="hidden md:block bg-bhumi-accent dark:bg-bhumi-darkAccent px-5 py-2.5 border-2 border-bhumi-border dark:border-bhumi-darkBorder text-bhumi-primary dark:text-bhumi-darkPrimary font-medium shadow-sm">
                    {t.status}: <span className="font-bold">{t.optimal}</span>
                </div>
            </div>

            {/* Weather Strip */}
            <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0 snap-x">
                <div className="min-w-[150px] md:min-w-0 bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-5 flex flex-col justify-between h-32 relative overflow-hidden snap-start group hover:shadow-md transition-shadow">
                    <div className="absolute right-[-15px] top-[-15px] w-20 h-20 bg-orange-400/20 dark:bg-orange-500/20 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 w-fit text-orange-600 dark:text-orange-400 mb-2">
                        <ThermometerSun size={22} />
                    </div>
                    <div>
                        <span className="text-2xl font-heading font-bold block text-bhumi-fg dark:text-bhumi-darkFg">28°C</span>
                        <span className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">Sunny</span>
                    </div>
                </div>

                <div className="min-w-[150px] md:min-w-0 bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-5 flex flex-col justify-between h-32 relative overflow-hidden snap-start group hover:shadow-md transition-shadow">
                    <div className="absolute right-[-15px] top-[-15px] w-20 h-20 bg-blue-400/20 dark:bg-blue-500/20 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 w-fit text-blue-600 dark:text-blue-400 mb-2">
                        <Droplets size={22} />
                    </div>
                    <div>
                        <span className="text-2xl font-heading font-bold block text-bhumi-fg dark:text-bhumi-darkFg">65%</span>
                        <span className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">{t.humidity}</span>
                    </div>
                </div>

                <div className="min-w-[150px] md:min-w-0 bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-5 flex flex-col justify-between h-32 relative overflow-hidden snap-start group hover:shadow-md transition-shadow">
                    <div className="absolute right-[-15px] top-[-15px] w-20 h-20 bg-gray-400/20 dark:bg-gray-500/20 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <div className="p-2.5 bg-gray-100 dark:bg-gray-500/20 w-fit text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-2">
                        <Wind size={22} />
                    </div>
                    <div>
                        <span className="text-2xl font-heading font-bold block text-bhumi-fg dark:text-bhumi-darkFg">12 km/h</span>
                        <span className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">{t.wind}</span>
                    </div>
                </div>

                <div className="min-w-[150px] md:min-w-0 bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-5 flex flex-col justify-between h-32 relative overflow-hidden snap-start group hover:shadow-md transition-shadow">
                    <div className="absolute right-[-15px] top-[-15px] w-20 h-20 bg-indigo-400/20 dark:bg-indigo-500/20 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 w-fit text-indigo-600 dark:text-indigo-400 mb-2">
                        <CloudRain size={22} />
                    </div>
                    <div>
                        <span className="text-2xl font-heading font-bold block text-bhumi-fg dark:text-bhumi-darkFg">10%</span>
                        <span className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">{t.rain}</span>
                    </div>
                </div>
            </div>

            {/* Featured: Crop Replication Planner */}
            <div 
                onClick={() => setView('replication-planner')}
                className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-dashed border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium">🍓 Strawberry from Mahabaleshwar</span>
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-medium">🥭 Alphonso from Ratnagiri</span>
                                <span className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">🍎 Apple from Shimla</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                        <span>Try Now</span>
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>

            {/* Quick Actions - SeedScout & Marketplace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    onClick={() => setView('seedscout')}
                    className="glass-panel rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group border border-emerald-500/20 hover:border-emerald-500/50"
                >
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
                </div>
                
                <div 
                    onClick={() => setView('marketplace')}
                    className="glass-panel rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group border border-blue-500/20 hover:border-blue-500/50"
                >
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
                </div>
            </div>

            {/* Quick Actions Grid */}
            {/* <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.quickActions}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <button onClick={() => setView('disease-detection')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform z-10">
                            <ScanLine size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.disease}</span>
                    </button>

                    <button onClick={() => setView('yield-prediction')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-bhumi-gold/20 flex items-center justify-center text-yellow-600 dark:text-bhumi-gold group-hover:scale-110 transition-transform z-10">
                            <TrendingUp size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.yield}</span>
                    </button>

                    <button onClick={() => setView('crop-recommendation')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform z-10">
                            <Sprout size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.recommend}</span>
                    </button>

                    <button onClick={() => setView('weather')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-400/20 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform z-10">
                            <CloudSun size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.weather}</span>
                    </button>

                    <button onClick={() => setView('smart-advisory')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform z-10">
                            <Droplets size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.irrigation}</span>
                    </button>

                    <button onClick={() => setView('smart-advisory')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform z-10">
                            <FlaskConical size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.fertilizer}</span>
                    </button>

                    <button onClick={() => setView('smart-advisory')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform z-10">
                            <Bug size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.pesticides}</span>
                    </button>

                    <button onClick={() => setView('analytics')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform z-10">
                            <BarChart3 size={24} />
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">{t.analytics}</span>
                    </button>

                    <button onClick={() => setView('marketplace')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform z-10">
                            <span className="text-2xl">🛒</span>
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">Market</span>
                    </button>

                    <button onClick={() => setView('marketplace')} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 aspect-square md:aspect-auto md:h-32 group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform z-10">
                            <span className="text-2xl">🛒</span>
                        </div>
                        <span className="font-medium text-sm text-center z-10 text-gray-800 dark:text-white">Market</span>
                    </button>
                </div>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Yield Trends */}
                <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-5 md:p-6 col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-heading font-bold flex items-center gap-2 text-bhumi-fg dark:text-bhumi-darkFg">
                            <TrendingUp size={20} className="text-bhumi-secondary dark:text-bhumi-darkSecondary" />
                            {t.yield} Trends
                        </h3>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData}>
                                <defs>
                                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B89D6F" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#B89D6F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 217, 190, 0.3)" className="dark:stroke-bhumi-darkBorder" />
                                <XAxis dataKey="name" stroke="#6B8E5E" className="dark:stroke-bhumi-darkMutedFg" />
                                <YAxis stroke="#6B8E5E" className="dark:stroke-bhumi-darkMutedFg" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="yield" stroke="#B89D6F" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-5 md:p-6 col-span-1">
                    <h3 className="text-lg font-heading font-bold mb-5 flex items-center gap-2 text-bhumi-fg dark:text-bhumi-darkFg">
                        <AlertTriangle size={20} className="text-bhumi-destructive" />
                        {t.activeAlerts}
                    </h3>
                    <div className="space-y-3">
                        <div className="bg-bhumi-destructive/10 border-2 border-bhumi-destructive/30 p-4 flex gap-3 hover:bg-bhumi-destructive/15 transition-colors cursor-pointer group">
                            <AlertTriangle className="text-bhumi-destructive shrink-0 group-hover:scale-110 transition-transform" size={18} />
                            <div>
                                <div className="text-bhumi-destructive font-bold text-sm mb-1">High Humidity</div>
                                <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Risk of fungal disease in Rice.</p>
                            </div>
                        </div>
                        <div className="bg-bhumi-secondary/20 border-2 border-bhumi-secondary/40 p-4 flex gap-3 hover:bg-bhumi-secondary/30 transition-colors cursor-pointer group">
                            <AlertTriangle className="text-bhumi-secondaryFg dark:text-bhumi-darkSecondary shrink-0 group-hover:scale-110 transition-transform" size={18} />
                            <div>
                                <div className="text-bhumi-secondaryFg dark:text-bhumi-darkSecondary font-bold text-sm mb-1">Pest Alert</div>
                                <p className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Locusts reported 50km north.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voice Agent Trigger */}
            <div className="flex justify-center mt-10 pb-8">
                <button
                    onClick={() => setShowVoiceAgent(true)}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-bhumi-primary dark:bg-bhumi-darkPrimary text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border-2 border-bhumi-primary dark:border-bhumi-darkPrimary"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="w-3 h-3 bg-bhumi-destructive animate-pulse shadow-[0_0_10px_rgba(201,123,123,0.7)]"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        <Mic size={20} /> Ask Bhumi Live
                    </span>
                </button>
            </div>

            <VoiceAgent isOpen={showVoiceAgent} onClose={() => setShowVoiceAgent(false)} />
        </div>
    );
};