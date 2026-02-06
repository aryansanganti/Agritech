/**
 * 3-Tier Routing Protocol — Full Page
 *
 * Sections:
 *   1. Crop Selector + Vision Scanner → Digital Assay
 *   2. Split-Stream Marketplace (auto-generated listings)
 *   3. Universal Pricing Dashboard
 *   4. Route-Matching Logistics (Milk-Run routes)
 *   5. Rescue Radar (flash-sale perishables)
 *   6. Carbon Footprint Summary
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, ScanLine, Layers, Truck, Leaf, AlertTriangle, Factory,
  ShoppingCart, MapPin, Clock, TrendingUp, Package, Zap, TreePine,
  CheckCircle2, ChevronRight, BarChart3, Flame, Recycle, Route,
  ArrowRight, Eye, Sparkles, Info, Timer, ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SelectNative, Label, Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/Shared';
import { cn } from '../lib/utils';
import { CROP_CONFIG, getCropKeys, getCropConfig, TRANSPORT_LABELS, CropConfig } from '../data/cropConfig';
import {
  runVisionScan,
  createSplitListings,
  calculateUniversalPrice,
  getMockRescueRadar,
  buildMilkRunRoutes,
  getCarbonSummary,
  DigitalAssay,
  SplitListing,
  UniversalPriceResult,
  RescueItem,
  MilkRunRoute,
} from '../services/routingProtocolService';

interface Props {
  lang: Language;
  onBack: () => void;
}

type Tab = 'scan' | 'listings' | 'pricing' | 'logistics' | 'rescue';

export const RoutingProtocol: React.FC<Props> = ({ lang, onBack }) => {
  // ─── State ──────────────────────────────────────────────────────
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [assay, setAssay] = useState<DigitalAssay | null>(null);
  const [listings, setListings] = useState<SplitListing[]>([]);
  const [pricing, setPricing] = useState<UniversalPriceResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const rescueItems = useMemo(() => getMockRescueRadar(), []);
  const milkRuns = useMemo(() => buildMilkRunRoutes(), []);
  const cropKeys = getCropKeys();

  // ─── Handlers ───────────────────────────────────────────────────
  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setAssay(null);
    setListings([]);
    setPricing(null);

    // Simulated progressive scan
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const result = runVisionScan(selectedCrop, quantityKg);
          if (result) {
            setAssay(result);
            setListings(createSplitListings(result));
            setPricing(calculateUniversalPrice(result));
          }
          setIsScanning(false);
          return 100;
        }
        return p + randomBetween(5, 15);
      });
    }, 200);
  };

  const currentConfig = getCropConfig(selectedCrop);

  // ─── Tabs ───────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'scan', label: 'Scan & Classify', icon: <ScanLine size={18} /> },
    { id: 'listings', label: 'Split Listings', icon: <Layers size={18} />, badge: listings.length > 0 ? `${listings.length}` : undefined },
    { id: 'pricing', label: 'Pricing', icon: <BarChart3 size={18} /> },
    { id: 'logistics', label: 'Milk-Run Routes', icon: <Truck size={18} />, badge: `${milkRuns.length}` },
    { id: 'rescue', label: 'Rescue Radar', icon: <AlertTriangle size={18} />, badge: `${rescueItems.filter(r => r.percentLifeUsed >= 80).length}` },
  ];

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen pb-28 md:pb-6">
      {/* Header */}
      <header className="mb-6">
        <PageHeader
          title="3-Tier Routing Protocol"
          onBack={onBack}
          icon={<Route size={24} className="text-white" />}
          subtitle="Analyze → Separate → Optimize → Rescue"
        />
      </header>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 shadow text-bhoomi-green font-bold'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="ml-1 bg-bhoomi-green/20 text-bhoomi-green text-xs px-1.5 py-0.5 rounded-full font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────── TAB: Scan */}
      {activeTab === 'scan' && (
        <div className="space-y-6 animate-fade-in">
          {/* Crop Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine size={20} className="text-bhoomi-green" />
                Multi-Crop Vision Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Crop Picker */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">Select Crop</Label>
                  <SelectNative value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                    {cropKeys.map((key) => (
                      <option key={key} value={key}>{CROP_CONFIG[key].name}</option>
                    ))}
                  </SelectNative>
                </div>
                {/* Quantity */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">Total Quantity (kg)</Label>
                  <Input
                    type="number"
                    min={10}
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Math.max(10, parseInt(e.target.value) || 10))}
                  />
                </div>
                {/* Scan Button */}
                <div className="flex items-end">
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={handleScan}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span> Scanning... {Math.min(scanProgress, 100)}%
                      </>
                    ) : (
                      <>
                        <ScanLine size={18} /> Scan Harvest
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(scanProgress, 100)}%` }}
                  />
                </div>
              )}

              {/* Crop Config Preview */}
              {currentConfig && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniStat icon={<Truck size={16} />} label="Transport" value={TRANSPORT_LABELS[currentConfig.transport] || currentConfig.transport} />
                  <MiniStat icon={<Clock size={16} />} label="Shelf Life" value={`${currentConfig.shelfLifeHours}h (${Math.round(currentConfig.shelfLifeHours / 24)}d)`} />
                  <MiniStat icon={<Flame size={16} />} label="Carbon Risk" value={currentConfig.carbonRisk} color={currentConfig.carbonRisk === 'Low' ? 'green' : currentConfig.carbonRisk === 'Medium' ? 'yellow' : 'red'} />
                  <MiniStat icon={<Factory size={16} />} label="Tier-3 Industry" value={currentConfig.tier3_industry} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Digital Assay Result */}
          {assay && (
            <Card className="border-2 border-bhoomi-green/30 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} className="text-bhoomi-green" />
                  Digital Assay — {assay.cropName}
                  <Badge variant="success" className="ml-auto">{assay.totalQuantityKg} kg scanned</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Tier Bars */}
                <div className="space-y-3">
                  {assay.tiers.map((tier) => (
                    <TierBar key={tier.tier} tier={tier} />
                  ))}
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <MiniStat icon={<TrendingUp size={16} />} label="Total Value" value={`₹${assay.totalValue.toLocaleString()}`} color="green" />
                  <MiniStat icon={<Package size={16} />} label="Transport" value={TRANSPORT_LABELS[assay.transportType] || assay.transportType} />
                  <MiniStat
                    icon={<AlertTriangle size={16} />}
                    label="Perishable?"
                    value={assay.isPerishable ? 'YES ⚡' : 'No'}
                    color={assay.isPerishable ? 'red' : 'green'}
                  />
                  <MiniStat
                    icon={<Recycle size={16} />}
                    label="Rescue Eligible"
                    value={assay.rescueEligible ? 'YES 🚨' : 'No'}
                    color={assay.rescueEligible ? 'yellow' : 'green'}
                  />
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="success" onClick={() => setActiveTab('listings')}>
                    <Layers size={16} /> View Split Listings
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('pricing')}>
                    <BarChart3 size={16} /> View Pricing
                  </Button>
                  {assay.rescueEligible && (
                    <Button variant="destructive" onClick={() => setActiveTab('rescue')}>
                      <AlertTriangle size={16} /> Rescue Radar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────── TAB: Split Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-fade-in">
          {listings.length === 0 ? (
            <Card className="p-12 text-center">
              <Layers size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No listings yet</p>
              <p className="text-gray-400 text-sm mt-1">Scan a harvest first to auto-generate split listings</p>
              <Button variant="success" className="mt-4" onClick={() => setActiveTab('scan')}>
                <ScanLine size={16} /> Go to Scanner
              </Button>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Auto-Generated Listings from Scan
                </h2>
                <Badge variant="info">{listings.length} listings created</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <SplitListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────── TAB: Pricing */}
      {activeTab === 'pricing' && (
        <div className="space-y-6 animate-fade-in">
          {!pricing ? (
            <Card className="p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No pricing data</p>
              <p className="text-gray-400 text-sm mt-1">Scan a harvest first to calculate pricing</p>
              <Button variant="success" className="mt-4" onClick={() => setActiveTab('scan')}>
                <ScanLine size={16} /> Go to Scanner
              </Button>
            </Card>
          ) : (
            <>
              {/* Formula Card */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-5">
                  <h3 className="font-bold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2">
                    <Sparkles size={18} /> Universal Pricing Formula
                  </h3>
                  <p className="text-indigo-700 dark:text-indigo-300 font-mono text-sm">
                    Total Value = (Q₁ × P<sub>Retail</sub>) + (Q₂ × P<sub>Mandi</sub>) + (Q₃ × P<sub>Factory</sub>)
                  </p>
                  <p className="text-xs text-indigo-500 mt-1">
                    P<sub>Mandi</sub> = 70% of Retail &nbsp;|&nbsp; P<sub>Factory</sub> = 30% of Retail
                  </p>
                </CardContent>
              </Card>

              {/* Price Tiers Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-bhoomi-green" />
                    Pricing Breakdown — {pricing.cropName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Tier</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Quantity (kg)</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Price (₹/qtl)</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Value (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.tiers.map((t) => (
                          <tr key={t.tier} className="border-b dark:border-gray-800">
                            <td className="py-3 px-2">
                              <Badge
                                variant={t.tier === 1 ? 'success' : t.tier === 2 ? 'warning' : 'destructive'}
                              >
                                Tier {t.tier} — {t.tier === 1 ? 'Retail' : t.tier === 2 ? 'Mandi' : 'Factory'}
                              </Badge>
                            </td>
                            <td className="text-right py-3 px-2 font-medium">{t.qtyKg.toLocaleString()}</td>
                            <td className="text-right py-3 px-2 font-medium">₹{t.pricePerQtl.toLocaleString()}</td>
                            <td className="text-right py-3 px-2 font-bold text-bhoomi-green">₹{t.value.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-green-50 dark:bg-green-900/20 font-bold">
                          <td className="py-3 px-2 text-green-800 dark:text-green-200">TOTAL</td>
                          <td className="text-right py-3 px-2">{assay?.totalQuantityKg.toLocaleString()}</td>
                          <td className="text-right py-3 px-2">—</td>
                          <td className="text-right py-3 px-2 text-green-700 dark:text-green-300 text-lg">₹{pricing.totalValue.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Insight Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <InsightCard
                      icon={<TrendingUp size={20} />}
                      label="vs All-Retail Price"
                      value={`${pricing.comparedToAllRetail}%`}
                      desc="of max possible value"
                      color="blue"
                    />
                    <InsightCard
                      icon={<Recycle size={20} />}
                      label="Value Rescued"
                      value={`₹${pricing.valueSaved.toLocaleString()}`}
                      desc="from Tier-3 that would be wasted"
                      color="green"
                    />
                    <InsightCard
                      icon={<Factory size={20} />}
                      label="Factory Price"
                      value={`₹${pricing.factoryPricePerQtl}/qtl`}
                      desc="30% of retail rate"
                      color="purple"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────── TAB: Milk-Run Routes */}
      {activeTab === 'logistics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Fill-Rate Banner */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <TreePine className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-200">🚛 Fill-Rate Optimization (Scope 3)</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Half-empty trucks emit the same CO₂ but carry half the food = <span className="font-bold">double carbon footprint per kg</span>.
                  Our Milk-Run algorithm aggregates Tier-3 produce from multiple farmers to ensure every truck is &gt;90% full.
                </p>
              </div>
            </div>
          </Card>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Milk-Run Routes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {milkRuns.map((route) => (
              <MilkRunCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────── TAB: Rescue Radar */}
      {activeTab === 'rescue' && (
        <div className="space-y-6 animate-fade-in">
          {/* Rescue Explainer */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-200">🚨 Rescue Radar — Save Food, Cut Methane</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  When <span className="font-bold">Time Since Harvest &gt; 80% of Shelf Life</span>, Tier-3 produce triggers a <span className="font-bold">Flash Sale at 70% off</span>.
                  Nearby NGOs, pig farms, and composting units are notified to claim it before it rots and releases methane.
                </p>
              </div>
            </div>
          </Card>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Nearby Perishable Alerts
            <Badge variant="destructive">{rescueItems.filter(r => r.percentLifeUsed >= 80).length} Flash Sales</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rescueItems.map((item) => (
              <RescueCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  Sub-Components
// ═══════════════════════════════════════════════════════════════════

/** Colored tier progress bar */
const TierBar: React.FC<{ tier: { tier: number; label: string; percentage: number; quantityKg: number; destination: string; pricePerQtl: number; totalValue: number } }> = ({ tier }) => {
  const colors: Record<number, string> = {
    1: 'from-green-400 to-emerald-500',
    2: 'from-yellow-400 to-amber-500',
    3: 'from-red-400 to-rose-500',
  };
  const bgColors: Record<number, string> = {
    1: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    2: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    3: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };
  const icons: Record<number, React.ReactNode> = {
    1: <ShoppingCart size={14} />,
    2: <MapPin size={14} />,
    3: <Factory size={14} />,
  };

  return (
    <div className={cn('p-4 rounded-xl', bgColors[tier.tier])}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          {icons[tier.tier]}
          Tier {tier.tier}: {tier.label}
        </div>
        <span className="text-xs font-medium">{tier.percentage}% • {tier.quantityKg}kg</span>
      </div>
      <div className="w-full bg-white/50 dark:bg-black/20 rounded-full h-3 overflow-hidden mb-2">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', colors[tier.tier])}
          style={{ width: `${tier.percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span>→ {tier.destination}</span>
        <span className="font-bold">₹{tier.pricePerQtl}/qtl → ₹{tier.totalValue.toLocaleString()}</span>
      </div>
    </div>
  );
};

/** Mini stat pill */
const MiniStat: React.FC<{ icon: React.ReactNode; label: string; value: string; color?: string }> = ({ icon, label, value, color }) => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  };
  return (
    <div className={cn('p-3 rounded-xl text-center', colorMap[color || 'blue'] || colorMap.blue)}>
      <div className="flex items-center justify-center gap-1 mb-1 opacity-70">{icon}<span className="text-[10px] font-medium">{label}</span></div>
      <div className="text-xs font-bold leading-tight">{value}</div>
    </div>
  );
};

/** Insight metric card */
const InsightCard: React.FC<{ icon: React.ReactNode; label: string; value: string; desc: string; color: string }> = ({ icon, label, value, desc, color }) => {
  const cls: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  return (
    <div className={cn('p-4 rounded-xl border', cls[color] || cls.blue)}>
      <div className="flex items-center gap-2 mb-2 text-gray-500">{icon}<span className="text-xs font-medium">{label}</span></div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{desc}</div>
    </div>
  );
};

/** Split Listing Card */
const SplitListingCard: React.FC<{ listing: SplitListing }> = ({ listing }) => {
  const tierColors: Record<number, string> = {
    1: 'border-green-500/40 hover:border-green-500',
    2: 'border-yellow-500/40 hover:border-yellow-500',
    3: 'border-red-500/40 hover:border-red-500',
  };
  const tierBg: Record<number, string> = {
    1: 'from-green-600 to-emerald-600',
    2: 'from-yellow-500 to-amber-600',
    3: 'from-red-500 to-rose-600',
  };

  return (
    <Card className={cn('overflow-hidden transition-all duration-300 hover:shadow-xl border-2', tierColors[listing.tier])}>
      <div className={cn('text-white text-xs font-bold py-1.5 px-3 text-center bg-gradient-to-r', tierBg[listing.tier])}>
        {listing.tier === 1 && '🛒 '}{listing.tier === 2 && '🏪 '}{listing.tier === 3 && '🏭 '}
        Tier {listing.tier}: {listing.tierLabel}
      </div>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{listing.cropName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{listing.quantityKg} kg</p>
          </div>
          {listing.urgency === 'flash-sale' && (
            <Badge variant="destructive" className="animate-pulse">⚡ Flash Sale</Badge>
          )}
          {listing.urgency === 'high' && (
            <Badge variant="warning">⏰ High Priority</Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">{listing.destination}</span>
          </div>
          <div className="flex items-start gap-2">
            <ShoppingCart size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">{listing.buyerLabel}</span>
          </div>
          <div className="flex items-start gap-2">
            <Truck size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">{TRANSPORT_LABELS[listing.transport] || listing.transport}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-xl font-bold text-bhoomi-green">₹{listing.pricePerQtl}<span className="text-sm font-normal text-gray-400">/qtl</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="font-bold text-gray-900 dark:text-white">₹{listing.totalValue.toLocaleString()}</p>
          </div>
        </div>

        <Button variant="success" size="sm" className="w-full mt-2">
          <ShieldCheck size={16} /> Push to Buyer Portal
        </Button>
      </CardContent>
    </Card>
  );
};

/** Milk-Run Route Card */
const MilkRunCard: React.FC<{ route: MilkRunRoute }> = ({ route }) => {
  const fillColor = route.truckFillPercent >= 90 ? 'text-green-600' : route.truckFillPercent >= 70 ? 'text-yellow-600' : 'text-red-600';
  return (
    <Card className="hover:shadow-lg transition-all border-green-200/50 dark:border-green-800/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{route.factoryName}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} />{route.factoryLocation}</p>
          </div>
          <Badge variant={route.truckFillPercent >= 90 ? 'success' : 'warning'}>
            {route.truckFillPercent >= 90 ? '🟢' : '🟡'} {route.truckFillPercent}% Full
          </Badge>
        </div>

        {/* Stops */}
        <div className="space-y-2">
          {route.stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-bhoomi-green/20 text-bhoomi-green flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <div className="flex-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{stop.farmerName}</span>
                <span className="text-gray-400 text-xs ml-2">({stop.location})</span>
              </div>
              <span className="text-xs font-bold text-gray-500">{stop.quantityKg}kg {stop.cropName}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-xs">🏭</div>
            <span className="font-bold text-purple-600">{route.factoryName.split('—')[0].trim()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{route.totalQuantityKg}kg</div>
            <div className="text-[10px] text-gray-500">Total Load</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{route.estimatedDistanceKm}km</div>
            <div className="text-[10px] text-gray-500">Distance</div>
          </div>
          <div className="text-center">
            <div className={cn('text-lg font-bold', fillColor)}>{route.truckFillPercent}%</div>
            <div className="text-[10px] text-gray-500">Fill Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{route.carbonSavedKg}kg</div>
            <div className="text-[10px] text-gray-500">CO₂ Saved</div>
          </div>
        </div>

        {route.truckFillPercent >= 90 && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-green-700 dark:text-green-300 text-xs font-medium">
            <CheckCircle2 size={16} />
            Green Fleet Certified — Buyers earn Carbon Credits for this route!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/** Rescue Radar Card */
const RescueCard: React.FC<{ item: RescueItem }> = ({ item }) => {
  const isFlash = item.percentLifeUsed >= 80;
  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-lg border-2',
      isFlash ? 'border-red-500/50' : 'border-orange-300/50'
    )}>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{item.cropName}</h3>
            <p className="text-xs text-gray-500">{item.quantityKg} kg • Tier 3</p>
          </div>
          {isFlash ? (
            <Badge variant="destructive" className="animate-pulse">🔥 FLASH SALE</Badge>
          ) : (
            <Badge variant="warning">⏰ Expiring Soon</Badge>
          )}
        </div>

        {/* Life gauge */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Shelf Life Used</span>
            <span>{item.percentLifeUsed}% ({item.hoursSinceHarvest}h / {item.shelfLifeHours}h)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                item.percentLifeUsed >= 80 ? 'bg-red-500' : item.percentLifeUsed >= 50 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${Math.min(item.percentLifeUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Price comparison */}
        <div className="flex justify-between items-end pt-2">
          <div>
            <p className="text-xs text-gray-500">Original Price</p>
            <p className={cn('font-medium', isFlash && 'line-through text-gray-400')}>₹{item.originalPricePerQtl}/qtl</p>
          </div>
          {isFlash && (
            <div className="text-right">
              <p className="text-xs text-red-500 font-bold">Flash Price (−70%)</p>
              <p className="text-xl font-bold text-red-600">₹{item.flashPricePerQtl}/qtl</p>
            </div>
          )}
        </div>

        {/* Rescue Channels */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Rescue Channels:</p>
          <div className="flex flex-wrap gap-1.5">
            {item.rescueChannels.map((ch, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {ch === 'NGO Kitchen' && '🍽️ '}
                {ch === 'Pig Farms' && '🐷 '}
                {ch === 'Composting Unit' && '♻️ '}
                {ch === 'Cattle Feed' && '🐄 '}
                {ch}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          variant={isFlash ? 'destructive' : 'outline'}
          size="sm"
          className="w-full mt-2"
        >
          {isFlash ? '⚡ Claim Flash Sale' : '🔔 Notify Buyers'}
        </Button>
      </CardContent>
    </Card>
  );
};

// ─── Utility ──────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default RoutingProtocol;
