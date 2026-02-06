import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
    ArrowLeft, Sprout, MapPin, Thermometer, Droplets, Sun, Calendar,
    AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp,
    FlaskConical, CloudRain, Leaf, Target, TrendingUp, Download,
    Clock, DollarSign, Bug, Shield, Lightbulb, ArrowRight, RefreshCw,
    Globe, Layers, Zap, BookOpen, ExternalLink
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

// Famous crop-region combinations
const FAMOUS_CROPS = [
    { crop: 'Strawberry', region: 'Mahabaleshwar', icon: '🍓', description: 'Sweet hill strawberries' },
    { crop: 'Mango (Alphonso)', region: 'Ratnagiri', icon: '🥭', description: 'King of mangoes' },
    { crop: 'Apple', region: 'Shimla', icon: '🍎', description: 'Crisp mountain apples' },
    { crop: 'Coffee', region: 'Coorg', icon: '☕', description: 'Aromatic arabica' },
    { crop: 'Tea', region: 'Darjeeling', icon: '🍵', description: 'Champagne of teas' },
    { crop: 'Grape', region: 'Nashik', icon: '🍇', description: 'Premium wine grapes' },
    { crop: 'Saffron', region: 'Kashmir', icon: '🌸', description: 'Red gold spice' },
    { crop: 'Cardamom', region: 'Idukki', icon: '🌿', description: 'Queen of spices' },
    { crop: 'Orange', region: 'Nagpur', icon: '🍊', description: 'Sweet citrus' },
    { crop: 'Rice (Basmati)', region: 'Dehradun', icon: '🌾', description: 'Aromatic long grain' },
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
        if (score >= 70) return 'text-emerald-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getFeasibilityBg = (score: number) => {
        if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/30';
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
                title="Replication Planner"
                onBack={onBack}
                icon={<Sprout className="text-white" size={24} />}
                subtitle="Replicate Any Crop Anywhere"
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
                                    <Target size={18} className="text-purple-500" />
                                    Select Famous Crop
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                                {FAMOUS_CROPS.map((item) => (
                                    <button
                                        key={item.crop}
                                        onClick={() => handleSelectPreset(item)}
                                        className={`p-3 rounded-xl text-left transition-all border ${
                                            selectedCrop === item.crop 
                                                ? 'bg-purple-500/20 border-purple-500/50' 
                                                : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-purple-500/30'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{item.icon}</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.crop}</div>
                                        <div className="text-xs text-gray-500">{item.region}</div>
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
                                    Or Enter Custom
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <Label className="mb-1 block">Crop Name</Label>
                                    <Input
                                        type="text"
                                        value={customCrop}
                                        onChange={(e) => { setCustomCrop(e.target.value); setSelectedCrop(''); }}
                                        placeholder="e.g., Avocado, Blueberry..."
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1 block">Source Region (Famous For)</Label>
                                    <Input
                                        type="text"
                                        value={customSource}
                                        onChange={(e) => { setCustomSource(e.target.value); setSourceLocation(''); }}
                                        placeholder="e.g., California, New Zealand..."
                                    />
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        {/* Target Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin size={18} className="text-red-500" />
                                    Your Target Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <Input
                                type="text"
                                value={targetLocation}
                                onChange={(e) => setTargetLocation(e.target.value)}
                                placeholder="Where do you want to grow? e.g., Pune, Delhi..."
                            />
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
                                    <><Zap size={18} /> Quick Feasibility Check</>
                                )}
                            </Button>
                            
                            <Button
                                onClick={handleGeneratePlan}
                                disabled={isLoading || (!selectedCrop && !customCrop) || !targetLocation}
                                variant="premium"
                                size="lg"
                                className="w-full shadow-lg shadow-purple-500/30"
                            >
                                {isLoading ? (
                                    <><Loader2 size={20} className="animate-spin" /> {progress.stage}</>
                                ) : (
                                    <><Sprout size={20} /> Generate Complete Plan</>
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
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Feasibility Check</h2>
                                    <div className={`text-4xl font-bold ${getFeasibilityColor(quickCheck.score)}`}>
                                        {quickCheck.score}%
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-4">
                                    {quickCheck.canReplicate ? (
                                        <CheckCircle size={24} className="text-emerald-500" />
                                    ) : (
                                        <AlertTriangle size={24} className="text-red-500" />
                                    )}
                                    <span className="text-lg text-gray-700 dark:text-gray-300">
                                        {quickCheck.canReplicate ? 'Replication is feasible!' : 'Challenging - see details'}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 mb-6">{quickCheck.summary}</p>
                                
                                <Button
                                    onClick={handleGeneratePlan}
                                    disabled={isLoading}
                                    variant="premium"
                                    size="lg"
                                    className="w-full"
                                >
                                    <ArrowRight size={20} />
                                    Generate Detailed Cultivation Plan
                                </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <BookOpen size={20} className="text-purple-500" />
                                    How It Works
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-purple-500/10">
                                        <div className="text-2xl mb-2">🌍</div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">1. Select Source</h3>
                                        <p className="text-sm text-gray-500">Choose a famous crop from its renowned region</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-indigo-500/10">
                                        <div className="text-2xl mb-2">📍</div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">2. Enter Target</h3>
                                        <p className="text-sm text-gray-500">Where you want to replicate this crop</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/10">
                                        <div className="text-2xl mb-2">🔬</div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">3. AI Analysis</h3>
                                        <p className="text-sm text-gray-500">We analyze climate, soil, and growing conditions</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-500/10">
                                        <div className="text-2xl mb-2">📋</div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">4. Get Your Plan</h3>
                                        <p className="text-sm text-gray-500">Complete week-by-week cultivation guide</p>
                                    </div>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Lightbulb size={16} className="text-yellow-500" />
                                        What You'll Get
                                    </h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>✓ Climate comparison & adjustments needed</li>
                                        <li>✓ Soil preparation with exact amendments</li>
                                        <li>✓ Week-by-week activity schedule</li>
                                        <li>✓ Fertilizer calendar with NPK ratios</li>
                                        <li>✓ Irrigation plan adjusted for your climate</li>
                                        <li>✓ Pest & disease management calendar</li>
                                        <li>✓ Cost estimates and expected yield</li>
                                    </ul>
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
                    <Card className="bg-emerald-50 dark:bg-emerald-500/5 border-emerald-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.crop.name} Replication Plan
                                </h2>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <Badge variant="purple">{plan.sourceLocation}</Badge>
                                    <ArrowRight size={16} />
                                    <Badge variant="info">{plan.targetLocation}</Badge>
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`text-center p-4 rounded-xl ${getFeasibilityBg(plan.feasibilityScore)}`}>
                                    <div className={`text-3xl font-bold ${getFeasibilityColor(plan.feasibilityScore)}`}>
                                        {plan.feasibilityScore}%
                                    </div>
                                    <div className="text-xs text-gray-500">Feasibility</div>
                                </div>
                                
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPlan(null)}
                                >
                                    <RefreshCw size={20} />
                                </Button>
                            </div>
                        </div>
                        
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                            {plan.feasibilityNotes}
                        </p>
                    </Card>

                    {/* Climate Comparison Section */}
                    <CollapsibleSection
                        title="Climate Comparison"
                        icon={<Thermometer className="text-orange-500" size={20} />}
                        isExpanded={expandedSections.has('climate')}
                        onToggle={() => toggleSection('climate')}
                    >
                        <ClimateComparisonPanel comparison={plan.climateComparison} />
                    </CollapsibleSection>

                    {/* Planting Window */}
                    <CollapsibleSection
                        title="Planting Window"
                        icon={<Calendar className="text-green-500" size={20} />}
                        isExpanded={expandedSections.has('planting')}
                        onToggle={() => toggleSection('planting')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <div className="text-sm text-gray-500 mb-1">Optimal Window</div>
                                <div className="text-lg font-bold text-emerald-600">
                                    {plan.plantingWindow.optimal.start} - {plan.plantingWindow.optimal.end}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                                <div className="text-sm text-gray-500 mb-1">Acceptable Window</div>
                                <div className="text-lg font-bold text-yellow-600">
                                    {plan.plantingWindow.acceptable.start} - {plan.plantingWindow.acceptable.end}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                <div className="text-sm text-gray-500 mb-1">Avoid Planting</div>
                                <div className="text-sm text-red-600">
                                    {plan.plantingWindow.avoid.join(', ')}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Soil Preparation */}
                    <CollapsibleSection
                        title="Soil Preparation"
                        icon={<Layers className="text-amber-600" size={20} />}
                        isExpanded={expandedSections.has('soil')}
                        onToggle={() => toggleSection('soil')}
                    >
                        <SoilPreparationPanel soilPrep={plan.soilPreparation} />
                    </CollapsibleSection>

                    {/* Weekly Schedule */}
                    <CollapsibleSection
                        title="Weekly Cultivation Schedule"
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
                        title="Fertilizer Calendar"
                        icon={<FlaskConical className="text-purple-500" size={20} />}
                        isExpanded={expandedSections.has('fertilizer')}
                        onToggle={() => toggleSection('fertilizer')}
                    >
                        <FertilizerCalendarPanel fertilizers={plan.fertilizerCalendar} />
                    </CollapsibleSection>

                    {/* Pest & Disease Management */}
                    <CollapsibleSection
                        title="Pest & Disease Management"
                        icon={<Bug className="text-red-500" size={20} />}
                        isExpanded={expandedSections.has('pest')}
                        onToggle={() => toggleSection('pest')}
                    >
                        <PestManagementPanel pests={plan.pestDiseaseCalendar} />
                    </CollapsibleSection>

                    {/* Harvest & Yield */}
                    <CollapsibleSection
                        title="Harvest Guidelines & Expected Yield"
                        icon={<TrendingUp className="text-emerald-500" size={20} />}
                        isExpanded={expandedSections.has('harvest')}
                        onToggle={() => toggleSection('harvest')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Harvest Indicators</h4>
                                <ul className="space-y-2">
                                    {plan.harvestGuidelines.indicators.map((indicator, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                            {indicator}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <div className="text-xs text-gray-500">Best Harvest Time</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{plan.harvestGuidelines.timing}</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Expected Yield</h4>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-emerald-500/10">
                                        <div className="text-xs text-gray-500">Quantity</div>
                                        <div className="font-bold text-emerald-600">{plan.expectedYield.quantity}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-500/10">
                                        <div className="text-xs text-gray-500">Quality</div>
                                        <div className="font-bold text-purple-600">{plan.expectedYield.quality}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <div className="text-xs text-gray-500">Time to First Harvest</div>
                                        <div className="font-bold text-blue-600">{plan.expectedYield.timeToFirstHarvest}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Cost Estimate */}
                    <CollapsibleSection
                        title="Cost Estimate"
                        icon={<DollarSign className="text-green-600" size={20} />}
                        isExpanded={expandedSections.has('cost')}
                        onToggle={() => toggleSection('cost')}
                    >
                        <CostEstimatePanel cost={plan.costEstimate} />
                    </CollapsibleSection>

                    {/* Risk Factors */}
                    <CollapsibleSection
                        title="Risk Factors & Mitigation"
                        icon={<Shield className="text-orange-500" size={20} />}
                        isExpanded={expandedSections.has('risk')}
                        onToggle={() => toggleSection('risk')}
                    >
                        <div className="space-y-3">
                            {plan.riskFactors.map((risk, i) => (
                                <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-start gap-4">
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        risk.likelihood === 'high' ? 'bg-red-500/20 text-red-600' :
                                        risk.likelihood === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                                        'bg-green-500/20 text-green-600'
                                    }`}>
                                        {risk.likelihood}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{risk.risk}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <span className="text-emerald-600 font-medium">Mitigation:</span> {risk.mitigation}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    {/* Success Tips */}
                    <Card className="bg-emerald-50 dark:bg-emerald-500/5 border-emerald-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="text-yellow-500" size={20} />
                                Success Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {plan.successTips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/50 dark:bg-black/20">
                                    <span className="text-emerald-500 font-bold">{i + 1}.</span>
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
                                    Local Resources & Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <ul className="space-y-2">
                                {plan.localResources.map((resource, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <ExternalLink size={14} className="text-blue-500 flex-shrink-0 mt-1" />
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
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-bold text-gray-900 dark:text-white">{title}</span>
            </div>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isExpanded && <div className="px-5 pb-5">{children}</div>}
    </Card>
);

const ClimateComparisonPanel: React.FC<{ comparison: ClimateComparison }> = ({ comparison }) => (
    <div className="space-y-6">
        {/* Overview Cards */}
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
                label="Rainfall" 
                source={`${comparison.source.rainfall.annual}mm`}
                target={`${comparison.target.rainfall.annual}mm`}
                icon={<CloudRain size={16} className="text-cyan-500" />}
            />
            <ClimateCard 
                label="Sunlight" 
                source={`${comparison.source.sunlight.avgHours.toFixed(1)}h`}
                target={`${comparison.target.sunlight.avgHours.toFixed(1)}h`}
                icon={<Sun size={16} className="text-yellow-500" />}
            />
        </div>

        {/* Gaps */}
        {comparison.gaps.length > 0 && (
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Climate Gaps to Address</h4>
                <div className="space-y-2">
                    {comparison.gaps.map((gap, i) => (
                        <div key={i} className={`p-3 rounded-xl flex items-center justify-between ${
                            gap.severity === 'critical' ? 'bg-red-500/10' :
                            gap.severity === 'high' ? 'bg-orange-500/10' :
                            gap.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                        }`}>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-white">{gap.parameter}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                    {gap.sourceValue.toFixed(1)} → {gap.targetValue.toFixed(1)} (Δ{gap.difference.toFixed(1)})
                                </span>
                            </div>
                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                gap.severity === 'critical' ? 'bg-red-500 text-white' :
                                gap.severity === 'high' ? 'bg-orange-500 text-white' :
                                gap.severity === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                                {gap.severity}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Adjustments */}
        {comparison.adjustments.length > 0 && (
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Recommended Adjustments</h4>
                <div className="space-y-2">
                    {comparison.adjustments.map((adj, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                    adj.priority === 'essential' ? 'bg-red-500/20 text-red-600' :
                                    adj.priority === 'recommended' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-gray-500/20 text-gray-600'
                                }`}>
                                    {adj.priority}
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
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-xs text-gray-500">{label}</span>
        </div>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-xs text-purple-500">Source</div>
                <div className="font-bold text-gray-900 dark:text-white">{source}</div>
            </div>
            <ArrowRight size={14} className="text-gray-400" />
            <div>
                <div className="text-xs text-indigo-500">Target</div>
                <div className="font-bold text-gray-900 dark:text-white">{target}</div>
            </div>
        </div>
    </div>
);

const SoilPreparationPanel: React.FC<{ soilPrep: any }> = ({ soilPrep }) => (
    <div className="space-y-4">
        {/* Amendments */}
        {soilPrep.amendments?.length > 0 && (
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Soil Amendments Required</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-left py-2 px-3 text-gray-500">Material</th>
                                <th className="text-left py-2 px-3 text-gray-500">Quantity</th>
                                <th className="text-left py-2 px-3 text-gray-500">Purpose</th>
                                <th className="text-left py-2 px-3 text-gray-500">When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {soilPrep.amendments.map((a: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-white/5">
                                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{a.material}</td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{a.quantity}</td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{a.purpose}</td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{a.applicationTiming}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-500/10">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Bed Preparation</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{soilPrep.bedPreparation}</p>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Mulching</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{soilPrep.mulching}</p>
            </div>
        </div>
        
        {soilPrep.prePlantingSteps?.length > 0 && (
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Pre-Planting Steps</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {soilPrep.prePlantingSteps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
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
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {schedule.map(w => (
                    <button
                        key={w.week}
                        onClick={() => onSelectWeek(w.week)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                            selectedWeek === w.week
                                ? 'bg-bhoomi-primary text-white'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                        Week {w.week}
                    </button>
                ))}
            </div>
            
            {/* Selected Week Details */}
            {current && (
                <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Week {current.week}: {current.stage}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Activities */}
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" /> Activities
                            </h5>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {current.activities.map((a, i) => (
                                    <li key={i}>• {a}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Irrigation */}
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Droplets size={16} className="text-blue-500" /> Irrigation
                            </h5>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div><strong>Water:</strong> {current.irrigation.waterRequirement}</div>
                                <div><strong>Frequency:</strong> {current.irrigation.frequency}</div>
                                <div><strong>Method:</strong> {current.irrigation.method}</div>
                            </div>
                        </div>
                        
                        {/* Pest Watch */}
                        {current.pestWatch?.length > 0 && (
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Bug size={16} className="text-red-500" /> Pest Watch
                                </h5>
                                <ul className="text-sm text-gray-600 dark:text-gray-400">
                                    {current.pestWatch.map((p, i) => (
                                        <li key={i}>• {p}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Tips */}
                        {current.tips?.length > 0 && (
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Lightbulb size={16} className="text-yellow-500" /> Tips
                                </h5>
                                <ul className="text-sm text-gray-600 dark:text-gray-400">
                                    {current.tips.map((t, i) => (
                                        <li key={i}>• {t}</li>
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
            <p className="text-gray-500 text-center py-8">Fertilizer schedule will be generated based on soil test results</p>
        ) : (
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                        <th className="text-left py-2 px-3 text-gray-500">Week</th>
                        <th className="text-left py-2 px-3 text-gray-500">Stage</th>
                        <th className="text-left py-2 px-3 text-gray-500">Fertilizer</th>
                        <th className="text-left py-2 px-3 text-gray-500">NPK Ratio</th>
                        <th className="text-left py-2 px-3 text-gray-500">Rate</th>
                        <th className="text-left py-2 px-3 text-gray-500">Method</th>
                    </tr>
                </thead>
                <tbody>
                    {fertilizers.map((f, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-white/5">
                            <td className="py-2 px-3 font-medium text-purple-600">{f.week}</td>
                            <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{f.stage}</td>
                            <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{f.fertilizer}</td>
                            <td className="py-2 px-3 text-emerald-600 font-mono">{f.npkRatio}</td>
                            <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{f.applicationRate}</td>
                            <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{f.applicationMethod}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

const PestManagementPanel: React.FC<{ pests: PestDiseaseManagement[] }> = ({ pests }) => (
    <div className="space-y-4">
        {pests.map((pest, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        pest.type === 'pest' ? 'bg-red-500/20 text-red-600' :
                        pest.type === 'disease' ? 'bg-orange-500/20 text-orange-600' :
                        'bg-yellow-500/20 text-yellow-600'
                    }`}>
                        {pest.type}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{pest.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">Risk: {pest.riskPeriod}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms</h6>
                        <ul className="text-gray-500 space-y-0.5">
                            {pest.symptoms.map((s, j) => <li key={j}>• {s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Prevention</h6>
                        <ul className="text-gray-500 space-y-0.5">
                            {pest.preventiveMeasures.map((p, j) => <li key={j}>• {p}</li>)}
                        </ul>
                    </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Treatment:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{pest.treatment}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Organic:</span>
                        <span className="ml-2 text-emerald-600">{pest.organicAlternative}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const CostEstimatePanel: React.FC<{ cost: any }> = ({ cost }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-center">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">₹{(cost.setup / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">Setup Cost</div>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-center">
                <div className="text-2xl font-bold text-sky-700 dark:text-sky-500">₹{(cost.monthly / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">Monthly</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-center">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">₹{(cost.perAcre / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">Per Acre</div>
            </div>
        </div>
        
        {cost.breakdown?.length > 0 && (
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                    {cost.breakdown.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-600 dark:text-gray-400">{item.item}</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{item.cost.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);
