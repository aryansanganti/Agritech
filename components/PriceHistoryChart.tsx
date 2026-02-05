import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface PriceHistoryChartProps {
    crop: string;
}

const generateMockHistory = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let basePrice = 2500;
    return months.map(m => {
        basePrice += (Math.random() - 0.5) * 200;
        return {
            month: m,
            price: Math.round(basePrice),
            benchmark: Math.round(basePrice * 0.9)
        };
    });
};

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ crop }) => {
    const data = generateMockHistory();

    return (
        <div className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-6 h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg flex items-center gap-2">
                    <span className="w-2 h-2 bg-bhumi-accent dark:bg-bhumi-darkAccent"></span>
                    Price Trend for {crop} (2025)
                </h3>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1 text-bhumi-accent dark:text-bhumi-darkAccent">
                        <span className="w-3 h-0.5 bg-bhumi-accent dark:bg-bhumi-darkAccent"></span> Market
                    </div>
                    <div className="flex items-center gap-1 text-bhumi-primary dark:text-bhumi-darkPrimary">
                        <span className="w-3 h-0.5 bg-bhumi-primary dark:bg-bhumi-darkPrimary"></span> Benchmark
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5D7A4A" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#5D7A4A" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(250,248,243,0.95)',
                            borderRadius: '0',
                            border: '2px solid #C8D9BE',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#5D7A4A"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        dot={{ fill: '#5D7A4A', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#7FAE6B"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
