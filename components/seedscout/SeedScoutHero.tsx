import React from 'react';
import { Compass, Loader2, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface SeedScoutHeroProps {
    onLocate: () => void;
    isLocating: boolean;
}

export const SeedScoutHero: React.FC<SeedScoutHeroProps> = ({ onLocate, isLocating }) => {
    return (
        <div className="relative w-full rounded-3xl overflow-hidden mb-6 group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 opacity-90 transition-all duration-1000 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-bf4a51e5e03b?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-2">
                        <Compass size={12} className="animate-spin-slow" />
                        Next-Gen Agriculture
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Seed<span className="text-emerald-400">Scout</span> Protocol
                    </h1>
                    <p className="text-emerald-100/80 text-lg md:text-xl font-medium">
                        Discover genetic hotspots and ecological twins using advanced geolocation topology.
                    </p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button
                        onClick={onLocate}
                        disabled={isLocating}
                        className={`
                            relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl
                            ${isLocating ? 'bg-emerald-800/50 cursor-not-allowed' : 'bg-white text-emerald-900 hover:bg-emerald-50'}
                             border-0 rounded-2xl py-6 px-8 text-lg font-bold group/btn
                        `}
                    >
                        {isLocating ? (
                            <div className="flex items-center gap-3">
                                <Loader2 size={24} className="animate-spin text-emerald-500" />
                                <span className="text-emerald-500/80">Scanning...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <MapPin size={24} className="text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                                <span>Eco-Locate</span>
                            </div>
                        )}

                        {/* Pulse Effect */}
                        {!isLocating && (
                            <span className="absolute right-0 top-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-emerald-400/20 blur-xl animate-pulse-glow"></span>
                        )}
                    </Button>
                    <p className="text-center text-xs text-emerald-200/60 font-medium">
                        Analyze local topology & weather
                    </p>
                </div>
            </div>
        </div>
    );
};
