import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, ScanLine, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);       // Grass
    const leavesCanvasRef = useRef<HTMLCanvasElement>(null); // Vegetables
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        mouseRef.current = mousePos;
    }, [mousePos]);

    // --- EFFECT 1: REALISTIC GRASS (Calmer Wind) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // High DPI Scaling
        const dpr = window.devicePixelRatio || 1;

        const initCanvas = () => {
            const width = window.innerWidth;
            const height = window.innerHeight * 0.45;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
            return { width, height };
        };

        let { width, height } = initCanvas();
        let time = 0;

        class Stalk {
            x: number;
            y: number;
            height: number;
            angle: number;
            targetAngle: number;
            stiffness: number;
            width: number;
            color: string;

            constructor(x: number) {
                this.x = x + (Math.random() - 0.5) * 5;
                this.y = height;
                this.height = Math.random() * 60 + 50;
                this.angle = 0;
                this.targetAngle = 0;
                this.stiffness = 0.05 + Math.random() * 0.05;
                this.width = Math.random() * 2 + 1.5;
                const greens = ['#15803d', '#166534', '#14532d', '#22c55e', '#16a34a'];
                this.color = greens[Math.floor(Math.random() * greens.length)];
            }

            update(mouseX: number, t: number) {
                // REDUCED WIND: Multipliers reduced by ~50%
                const wind = Math.sin(t * 0.002 + this.x * 0.005) * 0.1 +
                    Math.sin(t * 0.006 + this.x * 0.02) * 0.05;

                const dx = this.x - mouseX;
                const dist = Math.abs(dx);
                const maxDist = 200;
                let mouseForce = 0;

                if (dist < maxDist) {
                    const power = (1 - dist / maxDist);
                    mouseForce = (dx > 0 ? 0.8 : -0.8) * power;
                }

                this.targetAngle = wind + mouseForce;
                this.angle += (this.targetAngle - this.angle) * this.stiffness;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);

                // Calculate tip position based on angle and height
                const tipX = Math.sin(this.angle) * this.height;
                const tipY = -Math.cos(this.angle) * this.height;

                // Control points for the curve (midway)
                // We shift them slightly to create a nice curve
                const cp1x = Math.sin(this.angle * 0.5) * (this.height * 0.5);
                const cp1y = -Math.cos(this.angle * 0.5) * (this.height * 0.5);

                // Blade Gradient (Texture)
                // Create a gradient relative to the blade's height
                const gradient = ctx.createLinearGradient(0, 0, tipX, tipY);
                gradient.addColorStop(0, '#022c22'); // Darker base (shadow)
                gradient.addColorStop(0.4, this.color); // Main color
                gradient.addColorStop(1, '#86efac'); // Lighter tip (sunlight)

                ctx.fillStyle = gradient;

                // Draw Tapered Blade
                ctx.beginPath();
                // Start wide at the base (left side)
                ctx.moveTo(-this.width, 0);

                // Curve to the tip (left edge)
                ctx.quadraticCurveTo(cp1x - this.width * 0.5, cp1y, tipX, tipY);

                // Curve back to the base (right edge)
                ctx.quadraticCurveTo(cp1x + this.width * 0.5, cp1y, this.width, 0);

                // Close shape at base
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        }

        let stalks: Stalk[] = [];
        const initGrass = () => {
            const dims = initCanvas();
            width = dims.width;
            height = dims.height;
            stalks = [];
            for (let x = 0; x < width; x += 3) stalks.push(new Stalk(x));
        };
        initGrass();

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            time += 16;

            const gradient = ctx.createLinearGradient(0, height, 0, height - 20);
            gradient.addColorStop(0, '#14532d');
            gradient.addColorStop(1, 'rgba(20, 83, 45, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, height - 20, width, 20);

            const mx = mouseRef.current.x;
            stalks.forEach(stalk => {
                stalk.update(mx, time);
                stalk.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        const handleResize = () => {
            initGrass();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // --- EFFECT 2: FALLING VEGETABLES (Harvest Theme - Slower & Smoother) ---
    useEffect(() => {
        const canvas = leavesCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        const dpr = window.devicePixelRatio || 1;

        const initCanvas = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);
            return { w, h };
        };

        let { w: width, h: height } = initCanvas();

        type VegType = 'tomato' | 'apple' | 'onion' | 'carrot' | 'garlic';

        class Veggie {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            angle: number;
            spin: number;
            type: VegType;
            color: string;
            stemColor: string;

            constructor(resetY = false) {
                // Side Bias (Relaxed)
                const onLeft = Math.random() > 0.5;
                const sideWidth = width * 0.35;
                this.x = onLeft ? Math.random() * sideWidth : width - Math.random() * sideWidth;

                this.y = resetY ? -40 : Math.random() * height;

                // --- SMOOTHER & SLOWER ---
                // Reduced speed significantly for a "floating" feel
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = Math.random() * 1.0 + 0.5;   // Slow fall (0.5 to 1.5)

                this.size = Math.random() * 12 + 12;
                this.angle = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - 0.5) * 0.02; // Slower spin

                const r = Math.random();
                if (r < 0.25) {
                    this.type = 'tomato';
                    this.color = '#ef4444';
                    this.stemColor = '#16a34a';
                } else if (r < 0.5) {
                    this.type = 'apple';
                    this.color = Math.random() > 0.5 ? '#f87171' : '#bef264';
                    this.stemColor = '#78350f';
                } else if (r < 0.7) {
                    this.type = 'onion';
                    this.color = '#c084fc';
                    this.stemColor = '#a855f7';
                } else if (r < 0.85) {
                    this.type = 'garlic';
                    this.color = '#f3f4f6';
                    this.stemColor = '#d1d5db';
                } else {
                    this.type = 'carrot';
                    this.color = '#f97316';
                    this.stemColor = '#22c55e';
                }
            }

            update(mx: number, my: number) {
                this.y += this.vy;
                this.x += this.vx;
                this.angle += this.spin;

                const dx = this.x - mx;
                const dy = this.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    const ang = Math.atan2(dy, dx);
                    const repulse = force * 3.0; // Gentler push
                    this.vx += Math.cos(ang) * repulse;
                    this.vy += Math.sin(ang) * repulse;
                }

                this.vx *= 0.98;
                this.vy = Math.max(0.5, Math.min(this.vy, 3)); // Clamp low speed

                if (this.y > height + 40) {
                    const newVeg = new Veggie(true);
                    Object.assign(this, newVeg);
                }

                if (this.x > width + 40) this.x = -40;
                if (this.x < -40) this.x = width + 40;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                const s = this.size;
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 2;

                if (this.type === 'tomato') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, s, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = this.stemColor;
                    ctx.beginPath();
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.3, -s * 0.3);
                    ctx.lineTo(s, -s * 0.2);
                    ctx.lineTo(s * 0.4, 0);
                    ctx.lineTo(0.5 * s, s * 0.5);
                    ctx.lineTo(0, 0);
                    ctx.fill();
                } else if (this.type === 'apple') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -s * 0.5);
                    ctx.bezierCurveTo(-s, -s, -s, s, 0, s);
                    ctx.bezierCurveTo(s, s, s, -s, 0, -s * 0.5);
                    ctx.fill();
                    ctx.shadowColor = 'transparent';
                    ctx.strokeStyle = this.stemColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, -s * 0.5);
                    ctx.quadraticCurveTo(0, -s, s * 0.2, -s);
                    ctx.stroke();
                } else if (this.type === 'onion') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.ellipse(0, s * 0.2, s, s * 0.9, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(-s * 0.3, -s * 0.5);
                    ctx.quadraticCurveTo(0, -s * 1.2, s * 0.3, -s * 0.5);
                    ctx.fill();
                    ctx.shadowColor = 'transparent';
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, s * 1.1);
                    ctx.lineTo(0, s * 1.3);
                    ctx.moveTo(-s * 0.3, s * 1.0);
                    ctx.lineTo(-s * 0.4, s * 1.3);
                    ctx.moveTo(s * 0.3, s * 1.0);
                    ctx.lineTo(s * 0.4, s * 1.3);
                    ctx.stroke();
                } else if (this.type === 'garlic') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.ellipse(0, s * 0.2, s, s * 0.8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(-s * 0.4, -s * 0.4);
                    ctx.lineTo(0, -s * 1.2);
                    ctx.lineTo(s * 0.4, -s * 0.4);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.shadowColor = 'transparent';
                    ctx.strokeStyle = this.stemColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, -s * 1.2);
                    ctx.lineTo(0, -s * 1.6);
                    ctx.stroke();
                } else if (this.type === 'carrot') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(s * 0.4, -s);
                    ctx.lineTo(0, s * 2);
                    ctx.lineTo(-s * 0.4, -s);
                    ctx.fill();
                    ctx.shadowColor = 'transparent';
                    ctx.strokeStyle = this.stemColor;
                    ctx.beginPath();
                    ctx.moveTo(0, -s);
                    ctx.lineTo(0, -s * 1.5);
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        let veggies: Veggie[] = [];
        const count = 12; // REDUCED COUNT (was 18)
        const initVeggies = () => {
            const dims = initCanvas();
            width = dims.w;
            height = dims.h;
            veggies = [];
            for (let i = 0; i < count; i++) {
                veggies.push(new Veggie());
            }
        };
        initVeggies();

        const renderVeggies = () => {
            ctx.clearRect(0, 0, width, height);
            const { x, y } = mouseRef.current;

            veggies.forEach(v => {
                v.update(x, y);
                v.draw(ctx);
            });
            frameId = requestAnimationFrame(renderVeggies);
        };
        renderVeggies();

        const handleResize = () => {
            initVeggies();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
        }
    }, []);


    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div
            className="min-h-screen bg-white dark:bg-bhoomi-dark flex flex-col font-sans transition-colors duration-300 overflow-x-hidden relative"
            onMouseMove={handleMouseMove}
        >
            {/* Center Radial Gradient */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
                <div className="w-[800px] h-[800px] bg-green-100/40 rounded-full blur-[120px] dark:hidden translate-y-[-10%]"></div>
                <div className="hidden dark:block w-[900px] h-[900px] bg-green-900/20 rounded-full blur-[150px] translate-y-[-10%]"></div>
            </div>

            {/* FALLING VEGGIES CANVAS (Top Z-Index but pointer-none) */}
            <canvas ref={leavesCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full z-30 relative">
                <div className="flex items-center gap-2">
                    {/* LOGO IMAGE REPLACEMENT */}
                    <img src="/logo.png" alt="bhoomi Logo" className="h-20 w-auto object-contain" />
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={onGetStarted}>
                        Login
                    </Button>
                    <Button onClick={onGetStarted} className="rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        Get Started
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 relative flex flex-col items-center justify-center text-center px-4 pt-10 pb-40 z-30 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    The Future of Indian Agriculture
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 animate-slide-up opacity-0 relative" style={{ animationDelay: '0.2s' }}>
                    Farming Intelligence, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-bhoomi-green to-green-500">Reimagined.</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 animate-slide-up opacity-0 leading-relaxed" style={{ animationDelay: '0.3s' }}>
                    Empowering farmers with AI-driven crop analysis, real-time market insights, and precision advisory tools.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
                    <Button onClick={onGetStarted} size="xl" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl hover:shadow-2xl hover:scale-105">
                        Start Farming Smarter <ArrowRight size={20} />
                    </Button>
                    <Button variant="outline" size="xl" onClick={onGetStarted}>
                        View Demo
                    </Button>
                </div>

                {/* Feature Pills */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
                    {[
                        { icon: ScanLine, label: "AI Crop Doctor" },
                        { icon: TrendingUp, label: "Price Engine" },
                        { icon: ShieldCheck, label: "Soil Health" },
                        { icon: ShoppingBag, label: "Marketplace" }
                    ].map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white/80 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
                            <f.icon className="text-bhoomi-green" size={20} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{f.label}</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* GRASS CANVAS (Bottom Layer) */}
            <div className="absolute bottom-0 left-0 w-full h-[45vh] z-10 pointer-events-none">
                <canvas ref={canvasRef} className="w-full h-full" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-bhoomi-dark to-transparent"></div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-4 w-full text-center text-gray-400 dark:text-gray-600 text-center text-sm z-30">
                &copy; 2024 bhoomi Agritech. Made for India 🇮🇳
            </footer>

        </div>
    );
};
