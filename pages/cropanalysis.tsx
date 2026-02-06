import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, ArrowLeft, CheckCircle, AlertTriangle, Scale, DollarSign, Activity, ArrowRight, XCircle, TrendingUp, ShieldCheck, ScanLine } from 'lucide-react';
import { analyzeCropQuality, getPriceArbitration } from '../services/geminiService';
import { getMarketPrice, STATES, getCommodities } from '../services/agmarknetService';
import { getMandiPrices } from '../services/mandiService';
import { storeQualityGrading, gradeToScore, getQualityGrading, clearQualityGrading } from '../services/qualityGradingService';
import { Language, CropAnalysisResult, PricingPrediction } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, Alert, AlertTitle, AlertDescription } from '../components/ui/Badge';
import { SelectNative, Label, Input } from '../components/ui/Input';
import { PageHeader, EmptyState, Spinner, StatCard } from '../components/ui/Shared';
import { cn } from '../lib/utils';
import { PricingResult } from '../components/PricingResult';
import { WalletConnect } from '../components/WalletConnect';
import {
    WalletState,
    BlockchainTransactionResult,
    storeCropPriceOnChain
} from '../services/ethereumService';
import { addMarketplaceListing, scoreToGrade } from '../services/marketplaceService';

interface Props {
    lang: Language;
    onBack: () => void;
    onNavigateToPricing?: () => void;
    onNavigateToMarketplace?: () => void;
}

export const CropAnalysis: React.FC<Props> = ({ lang, onBack, onNavigateToPricing, onNavigateToMarketplace }) => {
    // Form State
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [market, setMarket] = useState('');
    const [commodity, setCommodity] = useState('');
    const [quantityQuintals, setQuantityQuintals] = useState<number>(1);

    // Image State
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<CropAnalysisResult | null>(null);
    const [marketPrice, setMarketPrice] = useState<number | null>(null);

    // Pricing & Blockchain State
    const [pricingResult, setPricingResult] = useState<PricingPrediction | null>(null);
    const [walletState, setWalletState] = useState<WalletState | null>(null);
    const [ethTx, setEthTx] = useState<BlockchainTransactionResult | null>(null);
    const [isStoringOnChain, setIsStoringOnChain] = useState(false);
    const [pendingPriceData, setPendingPriceData] = useState<{
        prediction: PricingPrediction;
        quality: number;
    } | null>(null);

    // Client-Side Validation State
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch Market Price when details change
    useEffect(() => {
        if (state && district && commodity) {
            const fetchPrice = async () => {
                const data = await getMarketPrice(state, district, commodity);
                setMarketPrice(data.modal_price);
            };
            fetchPrice();
        }
    }, [state, district, commodity]);

    // Blockchain Handlers
    const handleWalletConnected = (state: WalletState) => {
        setWalletState(state);
    };

    const handleWalletDisconnected = () => {
        setWalletState(null);
    };

    const storeOnEthereum = async () => {
        if (!pendingPriceData || !walletState?.isConnected || !walletState?.isCorrectNetwork) {
            return;
        }

        setIsStoringOnChain(true);

        try {
            const tx = await storeCropPriceOnChain({
                crop: pendingPriceData.prediction.crop,
                location: pendingPriceData.prediction.location,
                qualityScore: pendingPriceData.quality,
                quantity: quantityQuintals,
                minPrice: pendingPriceData.prediction.expectedPriceBand.low,
                maxPrice: pendingPriceData.prediction.expectedPriceBand.high,
                guaranteedPrice: pendingPriceData.prediction.minGuaranteedPrice
            });

            setEthTx(tx);
            setPendingPriceData(null);
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Failed to store on blockchain');
        } finally {
            setIsStoringOnChain(false);
        }
    };

    const handleAddToMarketplace = () => {
        if (!ethTx || !result) return;

        // Default crop image based on crop type
        const getCropDefaultImage = (crop: string): string => {
            const cropImages: Record<string, string> = {
                'Rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
                'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
                'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
                'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
                'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82ber608?w=400&h=300&fit=crop',
                'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
                'Soybean': 'https://images.unsplash.com/photo-1599150468774-a57fd6d2ae06?w=400&h=300&fit=crop',
                'Cotton': 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop',
                'Sugarcane': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
            };
            return cropImages[crop] || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop';
        };

        addMarketplaceListing({
            farmerName: walletState?.address ? `Farmer ${walletState.address.slice(0, 6)}...` : 'Anonymous Farmer',
            farmerAddress: walletState?.address || undefined,
            crop: ethTx.data.crop,
            grade: result.grading.overallGrade,
            qualityScore: gradeToScore(result.grading.overallGrade),
            price: Math.round((ethTx.data.minPrice + ethTx.data.maxPrice) / 2),
            minPrice: ethTx.data.minPrice,
            maxPrice: ethTx.data.maxPrice,
            guaranteedPrice: ethTx.data.guaranteedPrice,
            marketPrice: Math.round((ethTx.data.minPrice + ethTx.data.maxPrice) / 2),
            quantity: ethTx.data.quantity,
            location: {
                district: district || ethTx.data.location.split(',')[0]?.trim() || 'Unknown',
                state: state || ethTx.data.location.split(',')[1]?.trim() || 'Unknown'
            },
            blockchainHash: ethTx.transactionHash,
            transactionHash: ethTx.transactionHash,
            etherscanUrl: ethTx.etherscanUrl,
            contractAddress: '0xA12AF30a5B555540e3D2013c7FB3eb793ff4b3B5',
            recordId: ethTx.blockNumber,
            gradingDetails: {
                colorChecking: result.grading.colorChecking,
                sizeCheck: result.grading.sizeCheck,
                textureCheck: result.grading.textureCheck,
                shapeCheck: result.grading.shapeCheck,
            },
            harvestDate: new Date().toISOString().split('T')[0],
            image: image || getCropDefaultImage(ethTx.data.crop),
            variety: 'Standard',
            verificationStatus: 'verified'
        });

        clearQualityGrading();

        if (onNavigateToMarketplace) {
            onNavigateToMarketplace();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                setPricingResult(null);
                setEthTx(null);
                setPendingPriceData(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    // New Validation Logic
    const validateImage = (img: HTMLImageElement): boolean => {
        if (!canvasRef.current) return true;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return true;

        const width = 200;
        const height = (img.height / img.width) * width;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const pixelCount = data.length / 4;

        let skinTonePixels = 0;
        let skyBluePixels = 0;
        let flatWhitePixels = 0;
        let totalTexture = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;

            if (r > 95 && g > 40 && b > 20 && d > 15 && r > g && r > b && max > 20 && max < 230) {
                skinTonePixels++;
            }

            if (b > r + 30 && b > g + 30 && b > 100) {
                skyBluePixels++;
            }

            if (r > 200 && g > 200 && b > 200 && d < 15) {
                flatWhitePixels++;
            }

            totalTexture += d;
        }

        const textureAvg = totalTexture / pixelCount;

        if (skyBluePixels / pixelCount > 0.4) {
            setError("This image appears to be mostly sky. Please focus on the crop produce.");
            return false;
        }

        if (flatWhitePixels / pixelCount > 0.6 && textureAvg < 10) {
            setError("This looks like a document or screenshot. Please upload a real photo of the crop.");
            return false;
        }

        return true;
    };

    const handleAnalyze = async () => {
        if (!image || !commodity) {
            alert("Please select a commodity and upload an image.");
            return;
        }

        setAnalyzing(true);
        setError(null);
        setPricingResult(null);
        setEthTx(null);

        try {
            // Validation
            const img = new Image();
            img.src = image;
            await new Promise((resolve) => { img.onload = resolve; });

            const isValid = validateImage(img);
            if (!isValid) {
                setAnalyzing(false);
                return;
            }

            const base64Data = image.split(',')[1];
            const context = {
                state, district, market, commodity, price: marketPrice || 0
            };

            const data = await analyzeCropQuality(base64Data, context, lang);

            // Mismatch Check
            const userSelection = commodity.toLowerCase().trim();
            const aiDetection = data.detectedCrop.toLowerCase().trim();
            const isMatch = data.isMatch || aiDetection.includes(userSelection) || userSelection.includes(aiDetection);

            if (!isMatch) {
                setError(
                    `Commodity Mismatch! You selected "${commodity}", but the AI detected "${data.detectedCrop}" in the image.`
                );
                setAnalyzing(false);
                return;
            }

            setResult(data);

            // Pricing Engine Logic
            const mandiData = await getMandiPrices(data.detectedCrop, district, state);
            const pricing = await getPriceArbitration(data.detectedCrop, `${district}, ${state}`, mandiData, lang);

            // Adjust based on quality
            const qualityScore = gradeToScore(data.grading.overallGrade);
            if (qualityScore > 7) {
                pricing.expectedPriceBand.high += 200;
                pricing.expectedPriceBand.low += 100;
            } else if (qualityScore < 4) {
                pricing.expectedPriceBand.low -= 200;
                pricing.expectedPriceBand.high -= 100;
            }

            setPricingResult(pricing);
            setPendingPriceData({
                prediction: pricing,
                quality: qualityScore
            });

            // Store Grading
            storeQualityGrading({
                crop: data.detectedCrop,
                state: state,
                district: district,
                qualityScore: qualityScore,
                overallGrade: data.grading.overallGrade,
                estimatedPrice: data.market.estimatedPrice,
                timestamp: new Date().toISOString(),
                image: image,
                gradingDetails: {
                    colorChecking: data.grading.colorChecking,
                    sizeCheck: data.grading.sizeCheck,
                    textureCheck: data.grading.textureCheck,
                    shapeCheck: data.grading.shapeCheck,
                },
                healthStatus: {
                    lesions: data.health.lesions,
                    chlorosis: data.health.chlorosis,
                    pestDamage: data.health.pestDamage,
                    mechanicalDamage: data.health.mechanicalDamage,
                    diseaseName: data.health.diseaseName,
                },
            });

        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getBBoxStyle = (bbox: number[]) => {
        let [ymin, xmin, ymax, xmax] = bbox;
        if (ymin > 1 || xmin > 1 || ymax > 1 || xmax > 1) {
            ymin /= 1000; xmin /= 1000; ymax /= 1000; xmax /= 1000;
        }
        return {
            top: `${ymin * 100}%`,
            left: `${xmin * 100}%`,
            width: `${(xmax - xmin) * 100}%`,
            height: `${(ymax - ymin) * 100}%`,
        };
    };

    return (
        <div className="max-w-full px-6 mx-auto space-y-8 animate-fade-in pb-20">
            <PageHeader
                title="Crop Analysis & Pricing"
                onBack={onBack}
                icon={<Scale size={24} className="text-white" />}
                subtitle="Integrated Quality Analysis & Minimum Guaranteed Pricing"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Controls & Inputs */}
                <div className="lg:col-span-4 space-y-4">
                    <WalletConnect
                        onWalletConnected={handleWalletConnected}
                        onWalletDisconnected={handleWalletDisconnected}
                    />

                    <Card>
                        <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5">
                            <CardTitle className="text-sm font-bold uppercase tracking-wide text-gray-500">1. Market Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <div>
                                <Label className="mb-1 text-xs uppercase text-gray-400 font-bold">State</Label>
                                <SelectNative value={state} onChange={(e) => setState(e.target.value)} className="py-1.5 text-sm">
                                    <option value="">Select State</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </SelectNative>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="mb-1 text-xs uppercase text-gray-400 font-bold">District</Label>
                                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Khordha" className="py-1.5 text-sm" />
                                </div>
                                <div>
                                    <Label className="mb-1 text-xs uppercase text-gray-400 font-bold">Market</Label>
                                    <SelectNative value={market} onChange={(e) => setMarket(e.target.value)} className="py-1.5 text-sm">
                                        <option value="Local">Local Mandi</option>
                                        <option value="Export">Export Hub</option>
                                    </SelectNative>
                                </div>
                            </div>
                            <div>
                                <Label className="mb-1 text-xs uppercase text-gray-400 font-bold">Commodity</Label>
                                <SelectNative value={commodity} onChange={(e) => setCommodity(e.target.value)} className="py-1.5 text-sm">
                                    <option value="">Select Crop</option>
                                    {getCommodities().map(c => <option key={c} value={c}>{c}</option>)}
                                </SelectNative>
                            </div>
                            <div>
                                <Label className="mb-1 text-xs uppercase text-gray-400 font-bold">Quantity (Quintals)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantityQuintals}
                                    onChange={(e) => setQuantityQuintals(parseInt(e.target.value) || 1)}
                                    className="py-1.5 text-sm"
                                />
                            </div>
                            {marketPrice && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex justify-between items-center border border-blue-100 dark:border-blue-900/30">
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-300">Avg. Mandi Price</span>
                                    <span className="font-bold text-sm text-blue-700 dark:text-blue-200">₹{marketPrice}/q</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Upload */}
                <div className="lg:col-span-8">
                    <Card className="h-full border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-bhoomi-green transition-colors bg-gray-50/50 dark:bg-black/20">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>2. Visual Analysis</span>
                                {image && <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Image Loaded</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-80px)] flex flex-col justify-center">
                            <div className="relative w-full h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group">
                                {image ? (
                                    <div className="relative w-full h-full">
                                        <img src={image} alt="Crop" className="w-full h-full object-contain" />

                                        {/* Overlay Controls */}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => { fileInputRef.current?.click(); }} className="backdrop-blur-md bg-white/50 hover:bg-white/80">
                                                <RefreshCw size={14} className="mr-1" /> Retake
                                            </Button>
                                        </div>

                                        {error && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center z-20 backdrop-blur-sm">
                                                <div className="max-w-md">
                                                    <XCircle className="text-red-500 mx-auto mb-4" size={48} />
                                                    <h3 className="text-white text-lg font-bold mb-2">Analysis Error</h3>
                                                    <p className="text-gray-300 text-sm mb-4">{error}</p>
                                                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black" onClick={() => { fileInputRef.current?.click(); setError(null); }}>Try Another Photo</Button>
                                                </div>
                                            </div>
                                        )}

                                        {result?.detections && result.detections.length > 0 ? (
                                            result.detections.map((det, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute border-2 border-red-500 hover:z-10 transition-all duration-300"
                                                    style={getBBoxStyle(det.bbox)}
                                                >
                                                    <div className="absolute -top-7 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                                                        <ScanLine size={10} /> {det.label} {det.confidence}%
                                                    </div>
                                                </div>
                                            ))
                                        ) : result?.bbox ? (
                                            <div
                                                className="absolute border-4 border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                                                style={getBBoxStyle(result.bbox)}
                                            >
                                                <div className="absolute -top-7 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">Target Crop</div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="text-center p-12 cursor-pointer w-full h-full flex flex-col items-center justify-center pointer-events-none">
                                        <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/10 flex items-center justify-center mb-6 pointer-events-auto transition-transform hover:scale-110" onClick={() => fileInputRef.current?.click()}>
                                            <Camera size={48} className="text-bhoomi-green" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Drag & Drop or Click to Scan</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                            Upload a clear photo of your crop produce (e.g. pile of onions, rice grains) for AI quality grading.
                                        </p>
                                        <Button onClick={() => fileInputRef.current?.click()} className="pointer-events-auto">
                                            <Upload size={18} className="mr-2" /> Select Photo
                                        </Button>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <canvas ref={canvasRef} className="hidden" />

                            {error && !image && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {image && !analyzing && !result && (
                                <div className="mt-6 flex justify-end">
                                    <Button size="lg" onClick={handleAnalyze} className="w-full md:w-auto px-8 shadow-lg shadow-green-200 dark:shadow-none animate-pulse-subtle">
                                        <Scale size={20} className="mr-2" /> Run AI Analysis & Price Check
                                    </Button>
                                </div>
                            )}

                            {analyzing && (
                                <div className="mt-6">
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-bhoomi-green animate-progress-indeterminate"></div>
                                    </div>
                                    <p className="text-center text-xs text-gray-400 mt-2">Analyzing texture, size, and market rates...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section: Results */}
                <div className="col-span-1 lg:col-span-12">
                    {result && (
                        <div className="space-y-6 animate-slide-up bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="text-bhoomi-green" />
                                <h3 className="text-xl font-bold">Analysis Report</h3>
                            </div>

                            {/* Quality Grade Card */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <Card className={cn(
                                        "h-full flex flex-col justify-center border-l-[8px]",
                                        result.grading.overallGrade === 'A' ? 'border-l-green-500 bg-green-50/30' :
                                            result.grading.overallGrade === 'B' ? 'border-l-yellow-500 bg-yellow-50/30' :
                                                'border-l-red-500 bg-red-50/30'
                                    )}>
                                        <CardContent className="p-8 text-center">
                                            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Overall Grade</div>
                                            <div className="text-6xl font-black text-gray-900 dark:text-white mb-2">
                                                {result.grading.overallGrade}
                                            </div>
                                            <Badge variant="secondary" className="px-3 py-1 text-sm">
                                                Quality Score: {gradeToScore(result.grading.overallGrade)}/10
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="py-3"><CardTitle className="text-sm">Visual Grading</CardTitle></CardHeader>
                                        <CardContent className="space-y-3 py-2">
                                            {[
                                                { label: 'Color', val: result.grading.colorChecking },
                                                { label: 'Size', val: result.grading.sizeCheck },
                                                { label: 'Texture', val: result.grading.textureCheck },
                                                { label: 'Shape', val: result.grading.shapeCheck }
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-500">{item.label}</span>
                                                    <span className="font-medium">{item.val}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="py-3"><CardTitle className="text-sm">Defects & Health</CardTitle></CardHeader>
                                        <CardContent className="space-y-3 py-2">
                                            {[
                                                { label: 'Lesions', val: result.health.lesions, good: result.health.lesions.includes('None') },
                                                { label: 'Pests', val: result.health.pestDamage, good: result.health.pestDamage.includes('None') }
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-500">{item.label}</span>
                                                    <span className={item.good ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{item.val}</span>
                                                </div>
                                            ))}
                                            {result.health.diseaseName && (
                                                <div className="mt-2 pt-2 border-t border-dashed">
                                                    <span className="block text-xs text-red-500 font-bold">Detected: {result.health.diseaseName}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Navigate to Pricing Engine Button */}
                            {onNavigateToPricing && (
                                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-500/30">
                                    <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                                    Quality Score: {gradeToScore(result.grading.overallGrade)}/10
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Your crop grading is saved. Get fair market price with blockchain verification.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={onNavigateToPricing}
                                                variant="success"
                                                size="lg"
                                                className="shadow-lg shadow-emerald-500/30 animate-pulse hover:animate-none whitespace-nowrap"
                                            >
                                                Check Real Price <ArrowRight size={20} className="ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
