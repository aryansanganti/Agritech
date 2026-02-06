import React from 'react';

export const DNAScanner: React.FC = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/5 dark:bg-black/20 rounded-2xl relative">
            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 rounded-full border border-green-500/30 opacity-20 animate-[ping_3s_linear_infinite]"></div>
            <div className="absolute inset-0 rounded-full border border-green-500/20 opacity-40 animate-[ping_2s_linear_infinite_delay-1s]"></div>

            {/* SVG DNA Helix */}
            <svg width="100" height="200" viewBox="0 0 100 200" className="opacity-80">
                <defs>
                    <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                    </linearGradient>
                </defs>

                {/* Simulated Double Helix Nodes */}
                {[...Array(10)].map((_, i) => (
                    <g key={i} className="animate-dna-spin" style={{ animationDelay: `${i * -0.2}s` }}>
                        <circle cx="30" cy={20 + i * 20} r="4" fill="#10b981" />
                        <circle cx="70" cy={20 + i * 20} r="4" fill="#3b82f6" />
                        <line x1="30" y1={20 + i * 20} x2="70" y2={20 + i * 20} stroke="url(#dnaGrad)" strokeWidth="2" />
                    </g>
                ))}
            </svg>

            <style>{`
                @keyframes dna-spin {
                    0% { transform: translateX(0) scaleX(1); opacity: 1; }
                    50% { transform: translateX(0) scaleX(0.2); opacity: 0.5; }
                    100% { transform: translateX(0) scaleX(1); opacity: 1; }
                }
                .animate-dna-spin {
                    transform-origin: center;
                    animation: dna-spin 2s ease-in-out infinite;
                }
            `}</style>

            <div className="absolute bottom-4 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest animate-pulse">
                Scanning Genomes...
            </div>
        </div>
    );
};
