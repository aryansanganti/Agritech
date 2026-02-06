// Tier Routing Display Component
// Shows the 3-tier classification with destinations for marketplace listings

import React from 'react';
import { Factory, Store, ShoppingCart, Truck, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import type { TierLevel } from '../services/tierRoutingService';

interface TierRoutingDisplayProps {
    tier: TierLevel;
    tierName: string;
    destination: string;
    targetBuyer?: string;
    transportMethod?: string;
    rescueRadar?: boolean;
    className?: string;
}

export const TierRoutingDisplay: React.FC<TierRoutingDisplayProps> = ({
    tier,
    tierName,
    destination,
    targetBuyer,
    transportMethod,
    rescueRadar,
    className
}) => {
    const getTierIcon = () => {
        switch (tier) {
            case 'tier1':
                return <Store className="w-4 h-4" />;
            case 'tier2':
                return <ShoppingCart className="w-4 h-4" />;
            case 'tier3':
                return <Factory className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getTierColor = () => {
        switch (tier) {
            case 'tier1':
                return 'bg-emerald-500 text-white border-emerald-500';
            case 'tier2':
                return 'bg-blue-500 text-white border-blue-500';
            case 'tier3':
                return 'bg-orange-500 text-white border-orange-500';
            default:
                return 'bg-gray-500 text-white border-gray-500';
        }
    };

    const getTierBgColor = () => {
        switch (tier) {
            case 'tier1':
                return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
            case 'tier2':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'tier3':
                return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <div className={cn("relative", className)}>
            {rescueRadar && (
                <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-red-500 text-white border-red-500 animate-pulse flex items-center gap-1">
                        <Zap size={10} /> Flash Sale
                    </Badge>
                </div>
            )}
            <div className={cn("p-3 rounded-lg border-2", getTierBgColor())}>
                <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("flex items-center gap-1", getTierColor())}>
                        {getTierIcon()}
                        {tierName}
                    </Badge>
                    {transportMethod && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Truck size={12} />
                            {transportMethod === 'cold_chain' ? '❄️ Cold Chain' : '🚛 Standard'}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        📍 {destination}
                    </div>
                    {targetBuyer && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            🎯 {targetBuyer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Compact version for listing cards
export const TierRoutingBadge: React.FC<{ tier: TierLevel; tierName: string }> = ({ tier, tierName }) => {
    const getTierIcon = () => {
        switch (tier) {
            case 'tier1':
                return <Store className="w-3 h-3" />;
            case 'tier2':
                return <ShoppingCart className="w-3 h-3" />;
            case 'tier3':
                return <Factory className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getTierColor = () => {
        switch (tier) {
            case 'tier1':
                return 'bg-emerald-500 text-white border-emerald-500';
            case 'tier2':
                return 'bg-blue-500 text-white border-blue-500';
            case 'tier3':
                return 'bg-orange-500 text-white border-orange-500';
            default:
                return 'bg-gray-500 text-white border-gray-500';
        }
    };

    return (
        <Badge className={cn("flex items-center gap-1 text-xs", getTierColor())}>
            {getTierIcon()}
            {tierName}
        </Badge>
    );
};

// Full 3-tier breakdown modal/card
interface TierBreakdownProps {
    crop: string;
    tiers: Array<{
        tier: TierLevel;
        tierName: string;
        destination: string;
        percentage: number;
        quantity: number;
    }>;
    recommendations?: string[];
}

export const TierBreakdown: React.FC<TierBreakdownProps> = ({ crop, tiers, recommendations }) => {
    return (
        <Card className="border-2 border-green-500/30">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    🎯 3-Tier Routing Protocol for {crop}
                </h3>
                <div className="space-y-3 mb-4">
                    {tiers.map((tier, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "p-4 rounded-lg border-2",
                                tier.tier === 'tier1'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                    : tier.tier === 'tier2'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <TierRoutingBadge tier={tier.tier} tierName={tier.tierName} />
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {tier.quantity.toFixed(1)} Qtl
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {tier.percentage.toFixed(0)}% of total
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300">
                                📍 {tier.destination}
                            </div>
                        </div>
                    ))}
                </div>
                {recommendations && recommendations.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                            💡 Recommendations
                        </h4>
                        <ul className="space-y-1">
                            {recommendations.map((rec, idx) => (
                                <li key={idx} className="text-xs text-yellow-700 dark:text-yellow-300">
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
