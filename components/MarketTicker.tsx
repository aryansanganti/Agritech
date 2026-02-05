import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MARKET_DATA = [
    { crop: 'Wheat', price: 2150, change: +2.5 },
    { crop: 'Rice (Basmati)', price: 4200, change: -1.2 },
    { crop: 'Cotton', price: 6300, change: +0.8 },
    { crop: 'Soybean', price: 3800, change: +5.1 },
    { crop: 'Chilli', price: 12500, change: -3.4 },
    { crop: 'Maize', price: 1950, change: +0.5 },
    { crop: 'Turmeric', price: 7800, change: +1.2 },
    { crop: 'Potato', price: 850, change: -4.5 },
    { crop: 'Onion', price: 1200, change: +12.0 }, // High volatility!
    { crop: 'Tomato', price: 2400, change: -8.2 },
];

export const MarketTicker: React.FC = () => {
    return (
        <div className="w-full bg-gray-900 border-b border-gray-800 text-white overflow-hidden py-2 relative z-40">
            <div className="flex animate-marquee whitespace-nowrap gap-8 items-center">
                {/* Duplicate the list for seamless loop */}
                {[...MARKET_DATA, ...MARKET_DATA, ...MARKET_DATA].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-mono">
                        <span className="font-bold text-gray-400 uppercase">{item.crop}</span>
                        <span className="font-medium">₹{item.price}</span>
                        <span className={`flex items-center text-xs ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.change > 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                            {Math.abs(item.change)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Inline Styles for marquee animation manually if tailwind plugin missing */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};
