import React, { useEffect, useRef } from 'react';

interface Props {
    soc: number;      // 0-100 Organic Carbon
    moisture: number; // 0-100 Moisture
    salinity: number; // 0-100 Salinity (bad)
    texture: number;  // 0-100 (0=Fine, 100=Rocky)
}

export const DigitalMicroscope: React.FC<Props> = ({ soc, moisture, salinity, texture }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        // Particle System
        const particles: any[] = [];
        const microbeCount = Math.floor(soc / 5) + 5; // More SOC = More Microbes
        const waterCount = Math.floor(moisture / 4); // More Moisture = More Water Particles
        const crystalCount = Math.floor(salinity / 3); // Salinity = Crystals

        const createParticle = (type: 'microbe' | 'water' | 'crystal' | 'soil') => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * (type === 'microbe' ? 1 : 0.2),
            vy: (Math.random() - 0.5) * (type === 'microbe' ? 1 : 0.2),
            size: type === 'soil' ? Math.random() * (texture / 5 + 2) : Math.random() * 3 + 2,
            type
        });

        // Initialize
        for (let i = 0; i < microbeCount; i++) particles.push(createParticle('microbe'));
        for (let i = 0; i < waterCount; i++) particles.push(createParticle('water'));
        for (let i = 0; i < crystalCount; i++) particles.push(createParticle('crystal'));

        // Static Soil Background Particles
        const soilTexturePoints: any[] = [];
        for (let i = 0; i < 300; i++) {
            soilTexturePoints.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 4 + 1,
                alpha: Math.random() * 0.5
            });
        }

        let animationId: number;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Dynamic Background based on SOC/Moisture
            // High SOC = Darker Brown, High Moisture = Darker
            const r = 100 - (soc * 0.4);
            const g = 80 - (soc * 0.3);
            const b = 50 - (soc * 0.2);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, width, height);

            // Draw Soil Texture (Static)
            ctx.fillStyle = '#3e2723';
            soilTexturePoints.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Animate Particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                if (p.type === 'microbe') {
                    // Green wiggling microbes
                    ctx.fillStyle = '#4ade80'; // Green
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = '#4ade80';
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else if (p.type === 'water') {
                    // Blue slow droplets
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
                    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'crystal') {
                    // White sharp crystals (Salinity)
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.rect(p.x, p.y, p.size, p.size); // Square crystals
                    ctx.fill();
                }
            });

            // Microscope Overlay Effect (Vignette)
            const gradient = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width / 1.5);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Crosshair
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
            ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Ruler markings
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px monospace';
            ctx.fillText('10µm', width / 2 + 5, height / 2 - 5);

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationId);
    }, [soc, moisture, salinity, texture]);

    return (
        <div className="relative w-full h-[300px] rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl bg-black">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-green-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur-md border border-green-500/30">
                    Live Microbe Activity
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur-md border border-blue-500/30">
                    H2O Saturation: {moisture}%
                </span>
            </div>
        </div>
    );
};
