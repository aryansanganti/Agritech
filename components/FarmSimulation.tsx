import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Droplets, Sprout, Info, Wind } from 'lucide-react';

export const FarmSimulation: React.FC = () => {
    return (
        <div className="bg-white dark:bg-white/5 rounded-3xl p-1 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                {/* Simulated Desktop Screen Video */}
                <img
                    src="/simulation_preview.png"
                    alt="AgriSim Pro Desktop Interface - Real-time Analysis"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 animate-pulse">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
