import React, { useState } from 'react';
import {
    ThermometerSun, Droplets, Wind,
    ScanLine, ShoppingBag, Sprout, ArrowRight,
    TrendingUp, ArrowUpRight, ChevronRight, Play,
    BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageView, User, Language } from '../types';
import { translations } from '../utils/translations';
import { VoiceAgent } from '../components/VoiceAgent';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

// Mock Data for Market Price Chart
const MARKET_DATA = [
    { name: 'Wheat', price: 2350, color: '#16a34a' },
    { name: 'Rice', price: 2800, color: '#15803d' },
    { name: 'Cotton', price: 6200, color: '#ca8a04' },
    { name: 'Onion', price: 1800, color: '#dc2626' },
    { name: 'Soy', price: 4100, color: '#0284c7' },
];
import { getCurrentWeather, WeatherData } from '../services/weatherService';

interface DashboardProps {
    setView: (view: PageView) => void;
    user: User | null;
    lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView, user, lang }) => {
    const t = translations[lang];
    const firstName = user?.name ? user.name.split(' ')[0] : 'Rajesh';
    const [showVoiceAgent, setShowVoiceAgent] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Fetch Weather on Mount
    React.useEffect(() => {
        const fetchWeather = async (lat: number, lng: number) => {
            const data = await getCurrentWeather(lat, lng);
            setWeather(data);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Geolocation denied, using default location (Central India)");
                    fetchWeather(22.9734, 78.6569);
                }
            );
        } else {
            fetchWeather(22.9734, 78.6569);
        }
    }, []);

    // Helper to determine condition string
    const getWeatherCondition = (w: WeatherData) => {
        if (w.precipitation > 0) return 'Rainy';
        if (w.cloudCover > 50) return 'Cloudy';
        if (w.windSpeed > 20) return 'Windy';
        return 'Sunny';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 font-sans">

            {/* 1. Header: Rounded Box, Stretched, Accent Color */}
            <div className=" px-4 md:px-8 pt-6">
                <div className="w-full bg-bhoomi-green text-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
                {/* Weather Widget */}
                <Card className="flex-shrink-0 shadow-sm min-w-[200px]">
                    <CardContent className="p-3 px-5 flex items-center gap-6">
                        {weather ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-500/10 rounded-xl text-orange-500">
                                        {weather.precipitation > 0 ? <CloudRain size={20} /> : <ThermometerSun size={20} />}
                                    </div>
                                    <div>
                                        <span className="block font-bold text-gray-900 dark:text-white">{Math.round(weather.temp)}°C</span>
                                        <span className="text-xs text-gray-500">{getWeatherCondition(weather)}</span>
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-500">
                                        <Droplets size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-gray-900 dark:text-white">{weather.humidity}%</span>
                                        <span className="text-xs text-gray-500">Humid</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                                <CloudSun size={20} /> Loading weather...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="text-4xl md:text-5xl mb-2 tracking-tight">
                            <span className="font-light opacity-90">Hello</span>, <span className="font-bold">{firstName}</span>
                        </div>
                        <p className="text-green-100 text-lg font-light">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-center">
                            <ThermometerSun className="mx-auto mb-1 text-yellow-300" size={24} />
                            <span className="font-bold text-lg">28°C</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center">
                            <Droplets className="mx-auto mb-1 text-blue-300" size={24} />
                            <span className="font-bold text-lg">65%</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center">
                            <Wind className="mx-auto mb-1 text-gray-300" size={24} />
                            <span className="font-bold text-lg">12km</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-8 mt-8">

                {/* Left: Video Player */}
                <div className="w-full aspect-video bg-black rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative group">
                    <video
                        src="/bhoomi-vmake.mp4"
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                </div>

                {/* Right: Market Chart */}
                <div className="w-full aspect-video bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <BarChart3 className="text-bhoomi-green" /> Market Trends
                        </h3>
                        <Badge variant="outline" className="text-xs">Live Mandi Prices</Badge>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MARKET_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="₹"
                                />
                                <Tooltip
                                    cursor={{ fill: '#f0fdf4' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`₹${value}`, 'Price']}
                                />
                                <Bar dataKey="price" radius={[6, 6, 0, 0]} barSize={48}>
                                    {MARKET_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Quick Actions Grid */}
            <div className="px-4 md:px-8 mt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <button onClick={() => setView('crop-analysis')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ScanLine size={24} />
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Crop Analysis</div>
                        <p className="text-sm text-gray-500 mt-1">Check Quality & Disease</p>
                    </button>

                    <button onClick={() => setView('marketplace')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Marketplace</div>
                        <p className="text-sm text-gray-500 mt-1">Sell Produce Online</p>
                    </button>

                    <button onClick={() => setView('soil-analysis')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sprout size={24} />
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Soil Health</div>
                        <p className="text-sm text-gray-500 mt-1">Nutrients & Moisture</p>
                    </button>

                    <button onClick={() => setView('seedscout')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">SeedScout</div>
                        <p className="text-sm text-gray-500 mt-1">Find Best Seeds</p>
                    </button>
                </div>
            </div>

            <VoiceAgent isOpen={showVoiceAgent} onClose={() => setShowVoiceAgent(false)} />
        </div>
    );
};