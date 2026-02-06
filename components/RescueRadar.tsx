// Rescue Radar - Flash Sale Feature for Highly Perishable Crops
// Marketplace filter and notification system for crops approaching shelf life

import React, { useMemo } from 'react';
import { Listing, MarketplaceListing } from '../types';
import { Zap, Clock, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { getCropConfig, needsUrgentRouting } from '../services/cropRoutingConfigService';

interface RescueRadarProps {
    listings: (Listing | MarketplaceListing)[];
    onSelectListing?: (listing: Listing | MarketplaceListing) => void;
}

export const RescueRadar: React.FC<RescueRadarProps> = ({ listings, onSelectListing }) => {
    // Filter listings that need urgent routing
    const urgentListings = useMemo(() => {
        return listings.filter(listing => {
            const harvestDate = new Date(listing.harvestDate);
            const now = new Date();
            const hoursSinceHarvest = (now.getTime() - harvestDate.getTime()) / (1000 * 60 * 60);
            
            // Check if crop is approaching shelf life (> 80%)
            return needsUrgentRouting(listing.crop, hoursSinceHarvest) || listing.rescueRadar;
        });
    }, [listings]);

    // Calculate flash sale price (70% off)
    const getFlashSalePrice = (originalPrice: number): number => {
        return Math.round(originalPrice * 0.3);
    };

    // Calculate hours remaining
    const getHoursRemaining = (listing: Listing | MarketplaceListing): number => {
        const config = getCropConfig(listing.crop);
        if (!config) return 0;

        const harvestDate = new Date(listing.harvestDate);
        const now = new Date();
        const hoursSinceHarvest = (now.getTime() - harvestDate.getTime()) / (1000 * 60 * 60);
        
        return Math.max(0, config.shelf_life_hours - hoursSinceHarvest);
    };

    if (urgentListings.length === 0) {
        return (
            <Card className="border-2 border-green-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <Zap className="animate-pulse" />
                        Rescue Radar - Flash Sales
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No urgent listings at this time.</p>
                        <p className="text-sm mt-1">All produce is within safe shelf life.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-red-500/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Zap className="animate-pulse" />
                    Rescue Radar - {urgentListings.length} Flash Sale{urgentListings.length > 1 ? 's' : ''}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ⚡ Highly perishable crops at 70% discount - Buy now to prevent food waste!
                </p>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {urgentListings.map(listing => {
                        const hoursRemaining = getHoursRemaining(listing);
                        const flashPrice = getFlashSalePrice(listing.price);
                        const savings = listing.price - flashPrice;
                        const urgencyLevel = hoursRemaining < 24 ? 'critical' : hoursRemaining < 48 ? 'high' : 'medium';

                        return (
                            <Card 
                                key={listing.id}
                                className={cn(
                                    "border-2 hover:shadow-xl transition-all cursor-pointer",
                                    urgencyLevel === 'critical' 
                                        ? "border-red-500 animate-pulse" 
                                        : urgencyLevel === 'high'
                                        ? "border-orange-500"
                                        : "border-yellow-500"
                                )}
                                onClick={() => onSelectListing?.(listing)}
                            >
                                <div className="relative">
                                    <img 
                                        src={listing.image} 
                                        alt={listing.crop}
                                        className="w-full h-32 object-cover rounded-t-lg"
                                    />
                                    <Badge className="absolute top-2 right-2 bg-red-500 text-white border-red-500 animate-pulse">
                                        <Zap size={10} /> URGENT
                                    </Badge>
                                    <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                                        <Clock size={10} /> {Math.floor(hoursRemaining)}h left
                                    </Badge>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{listing.crop}</h3>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {typeof listing.location === 'string' 
                                            ? listing.location 
                                            : `${listing.location.district}, ${listing.location.state}`}
                                    </div>
                                    
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-bold text-red-600">₹{flashPrice}</span>
                                        <span className="text-sm text-gray-400 line-through">₹{listing.price}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs mb-3">
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            <TrendingDown size={10} /> Save ₹{savings}
                                        </Badge>
                                        <span className="text-gray-500">{listing.quantity} Qtl</span>
                                    </div>

                                    <div className={cn(
                                        "text-xs font-semibold p-2 rounded text-center",
                                        urgencyLevel === 'critical'
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            : urgencyLevel === 'high'
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    )}>
                                        {urgencyLevel === 'critical' && '🚨 Critical - Buy Now!'}
                                        {urgencyLevel === 'high' && '⚠️ High Priority'}
                                        {urgencyLevel === 'medium' && '⏰ Limited Time'}
                                    </div>

                                    {onSelectListing && (
                                        <Button 
                                            className="w-full mt-2"
                                            variant="destructive"
                                            size="sm"
                                        >
                                            <Zap size={14} /> Rescue Buy
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        Why Rescue Radar?
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>🌱 Prevent food waste and reduce methane emissions</li>
                        <li>💰 Get premium produce at 70% discount</li>
                        <li>🤝 Support farmers by buying what would otherwise rot</li>
                        <li>🏭 Unsold items redirected to composting or animal feed</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

// Notification Banner for Rescue Radar (to show in marketplace)
export const RescueRadarBanner: React.FC<{ urgentCount: number; onClick?: () => void }> = ({ urgentCount, onClick }) => {
    if (urgentCount === 0) return null;

    return (
        <div 
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all"
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Rescue Radar Active!</h3>
                        <p className="text-sm opacity-90">
                            {urgentCount} crop{urgentCount > 1 ? 's' : ''} at 70% flash sale - Prevent food waste!
                        </p>
                    </div>
                </div>
                <Button variant="secondary" size="sm">
                    View Flash Sales →
                </Button>
            </div>
        </div>
    );
};
