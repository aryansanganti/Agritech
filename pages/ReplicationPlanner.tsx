import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
    ArrowLeft, Sprout, MapPin, Thermometer, Droplets, Sun, Calendar,
    AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp,
    FlaskConical, CloudRain, Leaf, Target, TrendingUp, Download,
    Clock, DollarSign, Bug, Shield, Lightbulb, ArrowRight, RefreshCw,
    Globe, Layers, Zap, BookOpen, ExternalLink,
    Apple, Cherry, Citrus, Grape, Wheat, Flower2, Coffee, ClipboardList,
    Microscope
} from 'lucide-react';
import {
    ReplicationPlan,
    generateReplicationPlan,
    quickFeasibilityCheck,
    CropProfile,
    WeeklyActivity,
    FertilizerSchedule,
    PestDiseaseManagement
} from '../services/replicationPlannerService';
import { ClimateComparison, ClimateData } from '../services/climateDataService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, Alert, AlertDescription } from '../components/ui/Badge';
import { Input, Label } from '../components/ui/Input';
import { PageHeader, Progress, Spinner } from '../components/ui/Shared';
import { cn } from '../lib/utils';

interface ReplicationPlannerProps {
    lang: Language;
    onBack: () => void;
    initialCrop?: string;
    initialSource?: string;
}

// Famous crop-region combinations with farmer-friendly descriptions
const FAMOUS_CROPS = [
    { crop: 'Strawberry', region: 'Mahabaleshwar', icon: <Cherry className="text-red-500" />, description: 'High-value hill variety • 6-8 months cycle' },
    { crop: 'Mango (Alphonso)', region: 'Ratnagiri', icon: <Citrus className="text-amber-500" />, description: 'Premium export quality • Best returns' },
    { crop: 'Apple', region: 'Shimla', icon: <Apple className="text-red-600" />, description: 'Cold climate specialty • High demand' },
    { crop: 'Coffee', region: 'Coorg', icon: <Coffee className="text-stone-600" />, description: 'Shade-grown arabica • Steady income' },
    { crop: 'Tea', region: 'Darjeeling', icon: <Leaf className="text-emerald-600" />, description: 'World-famous quality • Year-round harvest' },
    { crop: 'Grape', region: 'Nashik', icon: <Grape className="text-violet-600" />, description: 'Table & wine varieties • Export potential' },
    { crop: 'Saffron', region: 'Kashmir', icon: <Flower2 className="text-rose-500" />, description: 'Highest value per acre • Special care needed' },
    { crop: 'Cardamom', region: 'Idukki', icon: <Leaf className="text-green-600" />, description: 'Spice garden staple • Good shade tolerance' },
    { crop: 'Orange', region: 'Nagpur', icon: <Citrus className="text-orange-500" />, description: 'Reliable citrus crop • Wide market' },
    { crop: 'Rice (Basmati)', region: 'Dehradun', icon: <Wheat className="text-amber-600" />, description: 'Premium grain • High water requirement' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ReplicationPlanner: React.FC<ReplicationPlannerProps> = ({
    lang,
    onBack,
    initialCrop = '',
    initialSource = ''
}) => {
    const t = translations[lang];

    // Form state
    const [selectedCrop, setSelectedCrop] = useState(initialCrop);
    const [sourceLocation, setSourceLocation] = useState(initialSource);
    const [targetLocation, setTargetLocation] = useState('');
    const [customCrop, setCustomCrop] = useState('');
    const [customSource, setCustomSource] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ stage: '', percent: 0 });
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<ReplicationPlan | null>(null);

    // Expanded sections
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['climate', 'schedule']));
    const [selectedWeek, setSelectedWeek] = useState<number>(1);

    // Quick feasibility
    const [quickCheck, setQuickCheck] = useState<{ score: number; summary: string; canReplicate: boolean } | null>(null);
    const [checkingFeasibility, setCheckingFeasibility] = useState(false);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    const handleSelectPreset = (preset: typeof FAMOUS_CROPS[0]) => {
        setSelectedCrop(preset.crop);
        setSourceLocation(preset.region);
        setCustomCrop('');
        setCustomSource('');
        setQuickCheck(null);
    };

    const handleQuickCheck = async () => {
        const crop = customCrop || selectedCrop;
        const source = customSource || sourceLocation;

        if (!crop || !source || !targetLocation) {
            setError('Please fill all fields');
            return;
        }

        setCheckingFeasibility(true);
        setError(null);

        try {
            const result = await quickFeasibilityCheck(crop, source, targetLocation);
            setQuickCheck(result);
        } catch (e: any) {
            setError(e.message || 'Failed to check feasibility');
        } finally {
            setCheckingFeasibility(false);
        }
    };

    const handleGeneratePlan = async () => {
        const crop = customCrop || selectedCrop;
        const source = customSource || sourceLocation;

        if (!crop || !source || !targetLocation) {
            setError('Please fill all required fields');
            return;
        }

        setIsLoading(true);
        setError(null);
        setPlan(null);

        try {
            const result = await generateReplicationPlan(
                crop,
                source,
                targetLocation,
                lang,
                (stage, percent) => setProgress({ stage, percent })
            );
            setPlan(result);
            setExpandedSections(new Set(['climate', 'schedule', 'fertilizer']));
        } catch (e: any) {
            setError(e.message || 'Failed to generate plan');
        } finally {
            setIsLoading(false);
            setProgress({ stage: '', percent: 0 });
        }
    };

    const getFeasibilityColor = (score: number) => {
        if (score >= 70) return 'text-green-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getFeasibilityBg = (score: number) => {
        if (score >= 70) return 'bg-green-500/10 border-green-500/30';
        if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
        return 'bg-red-500/10 border-red-500/30';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/10';
            case 'high': return 'text-orange-500 bg-orange-500/10';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10';
            default: return 'text-green-500 bg-green-500/10';
        }
    };

    return (
        <div className="min-h-screen animate-fade-in pb-10">
            {/* Header */}
            <PageHeader
                title="Crop Success Planner"
                onBack={onBack}
                icon={<Sprout className="text-white" size={24} />}
                subtitle="Learn how to grow high-value crops in your region"
            />

            {/* Main Content */}
            {!plan ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Famous Crops Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target size={18} className="text-emerald-600" />
                                    Choose a Proven Crop
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">These crops have excellent track records in their native regions</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
                                    {FAMOUS_CROPS.map((item) => (
                                        <button
                                            key={item.crop}
                                            onClick={() => handleSelectPreset(item)}
                                            className={`p-3 rounded-lg text-left transition-all border-2 ${selectedCrop === item.crop
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-emerald-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.icon}
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.crop}</span>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">📍 {item.region}</div>
                                            <div className="text-xs text-gray-500">{item.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Leaf size={18} className="text-emerald-500" />
                                    Or Enter Your Own Crop
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="mb-1 block text-gray-700 dark:text-gray-300">Which crop do you want to grow?</Label>
                                        <Input
                                            type="text"
                                            value={customCrop}
                                            onChange={(e) => { setCustomCrop(e.target.value); setSelectedCrop(''); }}
                                            placeholder="e.g., Avocado, Blueberry, Dragon Fruit..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-1 block text-gray-700 dark:text-gray-300">Where is this crop grown successfully?</Label>
                                        <Input
                                            type="text"
                                            value={customSource}
                                            onChange={(e) => { setCustomSource(e.target.value); setSourceLocation(''); }}
                                            placeholder="e.g., California, Israel, Vietnam..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">We'll study the conditions there to help you replicate success</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Target Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin size={18} className="text-rose-500" />
                                    Your Farm Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Label className="mb-1 block text-gray-700 dark:text-gray-300">Where is your land located?</Label>
                                <Input
                                    type="text"
                                    value={targetLocation}
                                    onChange={(e) => setTargetLocation(e.target.value)}
                                    placeholder="Enter your district or village name..."
                                />
                                <p className="text-xs text-gray-500 mt-1">We'll analyze your local climate and soil conditions</p>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleQuickCheck}
                                disabled={checkingFeasibility || (!selectedCrop && !customCrop) || !targetLocation}
                                variant="outline"
                                className="w-full"
                            >
                                {checkingFeasibility ? (
                                    <><Loader2 size={18} className="animate-spin" /> Checking...</>
                                ) : (
                                    <><Zap size={18} /> Quick Check – Can I Grow This?</>
                                )}
                            </Button>

                            <Button
                                onClick={handleGeneratePlan}
                                disabled={isLoading || (!selectedCrop && !customCrop) || !targetLocation}
                                variant="premium"
                                size="lg"
                                className="w-full"
                            >
                                {isLoading ? (
                                    <><Loader2 size={20} className="animate-spin" /> {progress.stage}</>
                                ) : (
                                    <><Sprout size={20} /> Create My Growing Guide</>
                                )}
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        {isLoading && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>{progress.stage}</span>
                                        <span>{progress.percent}%</span>
                                    </div>
                                    <Progress value={progress.percent} variant="purple" />
                                </CardContent>
                            </Card>
                        )}

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Quick Check Results / Info Panel */}
                    <div className="lg:col-span-2">
                        {quickCheck ? (
                            <Card className={cn("border-2", getFeasibilityBg(quickCheck.score))}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Growing Potential</h2>
                                        <div className="text-center">
                                            <div className={`text-4xl font-bold ${getFeasibilityColor(quickCheck.score)}`}>
                                                {quickCheck.score}%
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">Success Score</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white dark:bg-slate-800">
                                        {quickCheck.canReplicate ? (
                                            <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
                                        ) : (
                                            <AlertTriangle size={24} className="text-amber-500 flex-shrink-0" />
                                        )}
                                        <span className="text-base text-gray-700 dark:text-gray-300">
                                            {quickCheck.canReplicate 
                                                ? 'Good news! This crop can grow well in your area.' 
                                                : 'This will need extra care, but it\'s possible with the right approach.'}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{quickCheck.summary}</p>

                                    <Button
                                        onClick={handleGeneratePlan}
                                        disabled={isLoading}
                                        variant="premium"
                                        size="lg"
                                        className="w-full"
                                    >
                                        <ArrowRight size={20} />
                                        Get Your Complete Growing Guide
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        How This Helps You
                                    </h2>
                                    <p className="text-gray-500 mb-6">Get a complete roadmap to grow high-value crops on your farm</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">1</div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Pick a Successful Crop</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-11">Select a crop that's thriving in another region</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">2</div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Add Your Location</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-11">Tell us where your farm is located</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">3</div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Comparison</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-11">We compare weather, soil & conditions between locations</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">4</div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Your Custom Plan</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-11">Get week-by-week guidance tailored to your farm</p>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <CheckCircle size={18} className="text-emerald-600" />
                                            Your Growing Guide Includes
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> Weather adjustments for your area</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> What to add to your soil</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> Week-by-week farming tasks</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> Fertilizer schedule with quantities</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> Watering plan for your climate</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> Pest & disease prevention</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> Expected costs & returns</div>
                                            <div className="flex items-center gap-2"><span className="text-emerald-500">•</span> When to plant & harvest</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                /* PLAN DISPLAY */
                <div className="space-y-6">
                    {/* Plan Header */}
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Your Growing Guide for</div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        {plan.crop.name}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <MapPin size={14} className="text-emerald-500" />
                                            Learning from: <strong className="text-gray-900 dark:text-white">{plan.sourceLocation}</strong>
                                        </span>
                                        <ArrowRight size={16} className="text-gray-400" />
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Target size={14} className="text-rose-500" />
                                            Growing in: <strong className="text-gray-900 dark:text-white">{plan.targetLocation}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`text-center p-4 rounded-lg ${getFeasibilityBg(plan.feasibilityScore)}`}>
                                        <div className={`text-3xl font-bold ${getFeasibilityColor(plan.feasibilityScore)}`}>
                                            {plan.feasibilityScore}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Success Chance</div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPlan(null)}
                                        title="Start over"
                                    >
                                        <RefreshCw size={20} />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {plan.feasibilityNotes}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Climate Comparison Section */}
                    <CollapsibleSection
                        title="Weather & Climate Comparison"
                        icon={<Thermometer className="text-orange-500" size={20} />}
                        isExpanded={expandedSections.has('climate')}
                        onToggle={() => toggleSection('climate')}
                    >
                        <ClimateComparisonPanel comparison={plan.climateComparison} />
                    </CollapsibleSection>

                    {/* Planting Window */}
                    <CollapsibleSection
                        title="Best Time to Plant"
                        icon={<Calendar className="text-green-500" size={20} />}
                        isExpanded={expandedSections.has('planting')}
                        onToggle={() => toggleSection('planting')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-emerald-600" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Window</span>
                                </div>
                                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                    {plan.plantingWindow.optimal.start} – {plan.plantingWindow.optimal.end}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Ideal conditions for this crop</div>
                            </div>
                            <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={16} className="text-amber-600" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Also Possible</span>
                                </div>
                                <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                                    {plan.plantingWindow.acceptable.start} – {plan.plantingWindow.acceptable.end}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Can work with extra care</div>
                            </div>
                            <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} className="text-rose-600" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avoid These Months</span>
                                </div>
                                <div className="text-sm text-rose-700 dark:text-rose-400">
                                    {plan.plantingWindow.avoid.join(', ')}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Not recommended for planting</div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Soil Preparation */}
                    <CollapsibleSection
                        title="Prepare Your Soil"
                        icon={<Layers className="text-amber-600" size={20} />}
                        isExpanded={expandedSections.has('soil')}
                        onToggle={() => toggleSection('soil')}
                    >
                        <SoilPreparationPanel soilPrep={plan.soilPreparation} />
                    </CollapsibleSection>

                    {/* Weekly Schedule */}
                    <CollapsibleSection
                        title="Week-by-Week Tasks"
                        icon={<Clock className="text-blue-500" size={20} />}
                        isExpanded={expandedSections.has('schedule')}
                        onToggle={() => toggleSection('schedule')}
                    >
                        <WeeklySchedulePanel
                            schedule={plan.weeklySchedule}
                            selectedWeek={selectedWeek}
                            onSelectWeek={setSelectedWeek}
                        />
                    </CollapsibleSection>

                    {/* Fertilizer Calendar */}
                    <CollapsibleSection
                        title="Fertilizer Schedule"
                        icon={<FlaskConical className="text-emerald-600" size={20} />}
                        isExpanded={expandedSections.has('fertilizer')}
                        onToggle={() => toggleSection('fertilizer')}
                    >
                        <FertilizerCalendarPanel fertilizers={plan.fertilizerCalendar} />
                    </CollapsibleSection>

                    {/* Pest & Disease Management */}
                    <CollapsibleSection
                        title="Protect Your Crop"
                        icon={<Shield className="text-rose-500" size={20} />}
                        isExpanded={expandedSections.has('pest')}
                        onToggle={() => toggleSection('pest')}
                    >
                        <PestManagementPanel pests={plan.pestDiseaseCalendar} />
                    </CollapsibleSection>

                    {/* Harvest & Yield */}
                    <CollapsibleSection
                        title="Harvest & Your Returns"
                        icon={<TrendingUp className="text-emerald-500" size={20} />}
                        isExpanded={expandedSections.has('harvest')}
                        onToggle={() => toggleSection('harvest')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">How to Know When It's Ready</h4>
                                <ul className="space-y-2">
                                    {plan.harvestGuidelines.indicators.map((indicator, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            {indicator}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Best Harvest Time</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{plan.harvestGuidelines.timing}</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What You Can Expect</h4>
                                <div className="space-y-3">
                                    <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                                        <div className="text-xs font-medium text-gray-500 mb-1">Expected Quantity</div>
                                        <div className="font-bold text-emerald-700 dark:text-emerald-400">{plan.expectedYield.quantity}</div>
                                    </div>
                                    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        <div className="text-xs font-medium text-gray-500 mb-1">Expected Quality</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{plan.expectedYield.quality}</div>
                                    </div>
                                    <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                        <div className="text-xs font-medium text-gray-500 mb-1">Time to First Harvest</div>
                                        <div className="font-bold text-blue-700 dark:text-blue-400">{plan.expectedYield.timeToFirstHarvest}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Cost Estimate */}
                    <CollapsibleSection
                        title="Investment & Costs"
                        icon={<DollarSign className="text-emerald-600" size={20} />}
                        isExpanded={expandedSections.has('cost')}
                        onToggle={() => toggleSection('cost')}
                    >
                        <CostEstimatePanel cost={plan.costEstimate} />
                    </CollapsibleSection>

                    {/* Risk Factors */}
                    <CollapsibleSection
                        title="Possible Challenges & Solutions"
                        icon={<AlertTriangle className="text-amber-500" size={20} />}
                        isExpanded={expandedSections.has('risk')}
                        onToggle={() => toggleSection('risk')}
                    >
                        <div className="space-y-3">
                            {plan.riskFactors.map((risk, i) => (
                                <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                    <div className="flex items-start gap-3">
                                        <div className={`px-2 py-1 rounded text-xs font-semibold ${risk.likelihood === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                risk.likelihood === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                            {risk.likelihood === 'high' ? 'Watch Out' : risk.likelihood === 'medium' ? 'Be Aware' : 'Low Risk'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white mb-1">{risk.risk}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="text-emerald-600 font-medium">What to do:</span> {risk.mitigation}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    {/* Success Tips */}
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="text-amber-500" size={20} />
                                Pro Tips for Success
                            </CardTitle>
                            <p className="text-sm text-gray-500">Expert advice to maximize your yield</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {plan.successTips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-sm font-semibold flex items-center justify-center">{i + 1}</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Local Resources */}
                    {plan.localResources.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="text-blue-500" size={20} />
                                    Helpful Resources Near You
                                </CardTitle>
                                <p className="text-sm text-gray-500">Local support and information sources</p>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {plan.localResources.map((resource, i) => (
                                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-600 dark:text-gray-400">
                                            <ExternalLink size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                            {resource}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, icon, isExpanded, onToggle, children }) => (
    <Card className="overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-slate-700"
            data-expanded={isExpanded}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{isExpanded ? 'Hide' : 'Show'}</span>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </div>
        </button>
        {isExpanded && <div className="px-5 pb-5 pt-4">{children}</div>}
    </Card>
);

const ClimateComparisonPanel: React.FC<{ comparison: ClimateComparison }> = ({ comparison }) => (
    <div className="space-y-6">
        {/* Overview Cards */}
        <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Key Climate Factors Compared</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ClimateCard
                    label="Temperature"
                    source={`${comparison.source.temperature.mean.toFixed(1)}°C`}
                    target={`${comparison.target.temperature.mean.toFixed(1)}°C`}
                    icon={<Thermometer size={16} className="text-orange-500" />}
                />
                <ClimateCard
                    label="Humidity"
                    source={`${comparison.source.humidity.avg.toFixed(0)}%`}
                    target={`${comparison.target.humidity.avg.toFixed(0)}%`}
                    icon={<Droplets size={16} className="text-blue-500" />}
                />
                <ClimateCard
                    label="Annual Rainfall"
                    source={`${comparison.source.rainfall.annual}mm`}
                    target={`${comparison.target.rainfall.annual}mm`}
                    icon={<CloudRain size={16} className="text-cyan-500" />}
                />
                <ClimateCard
                    label="Sunlight Hours"
                    source={`${comparison.source.sunlight.avgHours.toFixed(1)}h`}
                    target={`${comparison.target.sunlight.avgHours.toFixed(1)}h`}
                    icon={<Sun size={16} className="text-amber-500" />}
                />
            </div>
        </div>

        {/* Gaps */}
        {comparison.gaps.length > 0 && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Differences to Address</h4>
                <div className="space-y-2">
                    {comparison.gaps.map((gap, i) => (
                        <div key={i} className={`p-3 rounded-lg flex items-center justify-between border ${gap.severity === 'critical' ? 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20' :
                                gap.severity === 'high' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' :
                                    gap.severity === 'medium' ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                            }`}>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-white">{gap.parameter}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                    {gap.sourceValue.toFixed(1)} → {gap.targetValue.toFixed(1)} (difference: {gap.difference.toFixed(1)})
                                </span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${gap.severity === 'critical' ? 'bg-rose-500 text-white' :
                                    gap.severity === 'high' ? 'bg-orange-500 text-white' :
                                        gap.severity === 'medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                                }`}>
                                {gap.severity === 'critical' ? 'Major' : gap.severity === 'high' ? 'Significant' : gap.severity === 'medium' ? 'Moderate' : 'Minor'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Adjustments */}
        {comparison.adjustments.length > 0 && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What You Should Do</h4>
                <div className="space-y-2">
                    {comparison.adjustments.map((adj, i) => (
                        <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${adj.priority === 'essential' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                        adj.priority === 'recommended' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                    }`}>
                                    {adj.priority === 'essential' ? 'Must Do' : adj.priority === 'recommended' ? 'Suggested' : 'Optional'}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">{adj.parameter}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{adj.recommendation}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const ClimateCard: React.FC<{ label: string; source: string; target: string; icon: React.ReactNode }> = ({ label, source, target, icon }) => (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-3">
            {icon}
            <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-xs text-gray-400">There</div>
                <div className="font-bold text-gray-900 dark:text-white">{source}</div>
            </div>
            <ArrowRight size={14} className="text-gray-300" />
            <div>
                <div className="text-xs text-gray-400">Here</div>
                <div className="font-bold text-gray-900 dark:text-white">{target}</div>
            </div>
        </div>
    </div>
);

const SoilPreparationPanel: React.FC<{ soilPrep: any }> = ({ soilPrep }) => (
    <div className="space-y-5">
        {/* Amendments */}
        {soilPrep.amendments?.length > 0 && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What to Add to Your Soil</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Material</th>
                                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">How Much</th>
                                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Why</th>
                                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">When to Apply</th>
                            </tr>
                        </thead>
                        <tbody>
                            {soilPrep.amendments.map((a: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{a.material}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{a.quantity}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{a.purpose}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{a.applicationTiming}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Layers size={16} className="text-amber-600" />
                    Preparing the Beds
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{soilPrep.bedPreparation}</p>
            </div>
            <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Leaf size={16} className="text-emerald-600" />
                    Mulching Tips
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{soilPrep.mulching}</p>
            </div>
        </div>

        {soilPrep.prePlantingSteps?.length > 0 && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Steps Before Planting</h4>
                <ol className="space-y-2">
                    {soilPrep.prePlantingSteps.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                            {step}
                        </li>
                    ))}
                </ol>
            </div>
        )}
    </div>
);

const WeeklySchedulePanel: React.FC<{
    schedule: WeeklyActivity[];
    selectedWeek: number;
    onSelectWeek: (week: number) => void;
}> = ({ schedule, selectedWeek, onSelectWeek }) => {
    const current = schedule.find(w => w.week === selectedWeek) || schedule[0];

    return (
        <div className="space-y-4">
            {/* Week Selector */}
            <div>
                <div className="text-sm text-gray-500 mb-2">Select a week to see detailed tasks:</div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {schedule.map(w => (
                        <button
                            key={w.week}
                            onClick={() => onSelectWeek(w.week)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border-2 ${selectedWeek === w.week
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-emerald-400'
                                }`}
                        >
                            Week {w.week}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Week Details */}
            {current && (
                <div className="p-5 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">{current.week}</div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Week {current.week}</h4>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">{current.stage}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Activities */}
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" /> Your Tasks
                            </h5>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                {current.activities.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Irrigation */}
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Droplets size={16} className="text-blue-500" /> Watering Guide
                            </h5>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <div className="flex justify-between"><span className="text-gray-500">Amount:</span> <span className="font-medium text-gray-900 dark:text-white">{current.irrigation.waterRequirement}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">How often:</span> <span className="font-medium text-gray-900 dark:text-white">{current.irrigation.frequency}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Method:</span> <span className="font-medium text-gray-900 dark:text-white">{current.irrigation.method}</span></div>
                            </div>
                        </div>

                        {/* Pest Watch */}
                        {current.pestWatch?.length > 0 && (
                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Bug size={16} className="text-rose-500" /> Watch Out For
                                </h5>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    {current.pestWatch.map((p, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-rose-500 mt-0.5">•</span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tips */}
                        {current.tips?.length > 0 && (
                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Lightbulb size={16} className="text-amber-500" /> Helpful Tips
                                </h5>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    {current.tips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">•</span>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const FertilizerCalendarPanel: React.FC<{ fertilizers: FertilizerSchedule[] }> = ({ fertilizers }) => (
    <div className="overflow-x-auto">
        {fertilizers.length === 0 ? (
            <div className="text-center py-8">
                <FlaskConical size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Fertilizer schedule will be created based on your soil test results</p>
            </div>
        ) : (
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800">
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Week</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Growth Stage</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Fertilizer</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">NPK Ratio</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">How Much</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">How to Apply</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fertilizers.map((f, i) => (
                            <tr key={i} className="border-t border-gray-100 dark:border-slate-700">
                                <td className="py-3 px-4">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-semibold text-xs">{f.week}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{f.stage}</td>
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{f.fertilizer}</td>
                                <td className="py-3 px-4"><span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">{f.npkRatio}</span></td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{f.applicationRate}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{f.applicationMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const PestManagementPanel: React.FC<{ pests: PestDiseaseManagement[] }> = ({ pests }) => (
    <div className="space-y-4">
        {pests.map((pest, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${pest.type === 'pest' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                            pest.type === 'disease' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                        {pest.type === 'pest' ? 'Pest' : pest.type === 'disease' ? 'Disease' : 'Deficiency'}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{pest.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">Risk period: {pest.riskPeriod}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Signs to Look For</h6>
                        <ul className="text-gray-500 space-y-1">
                            {pest.symptoms.map((s, j) => <li key={j} className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">•</span> {s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">How to Prevent</h6>
                        <ul className="text-gray-500 space-y-1">
                            {pest.preventiveMeasures.map((p, j) => <li key={j} className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> {p}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <span className="text-gray-500 block mb-1">Chemical Treatment:</span>
                        <span className="text-gray-900 dark:text-white">{pest.treatment}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <span className="text-gray-500 block mb-1">Natural/Organic Option:</span>
                        <span className="text-emerald-700 dark:text-emerald-400">{pest.organicAlternative}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const CostEstimatePanel: React.FC<{ cost: any }> = ({ cost }) => (
    <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">₹{(cost.setup / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Initial Setup</div>
                <div className="text-xs text-gray-500">One-time investment</div>
            </div>
            <div className="p-5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{(cost.monthly / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly Cost</div>
                <div className="text-xs text-gray-500">Running expenses</div>
            </div>
            <div className="p-5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-center">
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">₹{(cost.perAcre / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Per Acre</div>
                <div className="text-xs text-gray-500">Total cultivation cost</div>
            </div>
        </div>

        {cost.breakdown?.length > 0 && (
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Where Your Money Goes</h4>
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {cost.breakdown.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-3 px-4 border-b border-gray-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800">
                            <span className="text-gray-600 dark:text-gray-400">{item.item}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{item.cost.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);
