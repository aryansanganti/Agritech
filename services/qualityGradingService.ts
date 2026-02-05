// Quality Grading Service
// Stores quality grading results from Crop Analysis to be used in Pricing Engine

export interface QualityGradingData {
    crop: string;
    state: string;
    district: string;
    qualityScore: number;        // 1-10 score
    overallGrade: 'A' | 'B' | 'C';
    estimatedPrice: number;
    timestamp: string;
    image?: string;              // Base64 or URL of the crop image
    gradingDetails: {
        colorChecking: string;
        sizeCheck: string;
        textureCheck: string;
        shapeCheck: string;
    };
    healthStatus: {
        lesions: string;
        chlorosis: string;
        pestDamage: string;
        mechanicalDamage: string;
        diseaseName?: string;
    };
}

const STORAGE_KEY = 'bhumi_quality_grading';

// Convert letter grade to numeric score (1-10)
export const gradeToScore = (grade: 'A' | 'B' | 'C'): number => {
    switch (grade) {
        case 'A': return 9;  // Premium quality
        case 'B': return 6;  // Good quality
        case 'C': return 3;  // Below average
        default: return 5;
    }
};

// Convert numeric score to letter grade
export const scoreToGrade = (score: number): 'A' | 'B' | 'C' => {
    if (score >= 8) return 'A';
    if (score >= 5) return 'B';
    return 'C';
};

// Store quality grading result
export const storeQualityGrading = (data: QualityGradingData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('qualityGradingUpdated', { detail: data }));
    } catch (error) {
        console.error('Failed to store quality grading:', error);
    }
};

// Retrieve quality grading result
export const getQualityGrading = (): QualityGradingData | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        
        const data = JSON.parse(stored) as QualityGradingData;
        
        // Check if data is not too old (within 24 hours)
        const timestamp = new Date(data.timestamp).getTime();
        const now = Date.now();
        const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            clearQualityGrading();
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Failed to retrieve quality grading:', error);
        return null;
    }
};

// Clear quality grading result
export const clearQualityGrading = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('qualityGradingCleared'));
    } catch (error) {
        console.error('Failed to clear quality grading:', error);
    }
};

// Check if quality grading exists
export const hasQualityGrading = (): boolean => {
    return getQualityGrading() !== null;
};

// Get quality score from stored grading (or default)
export const getStoredQualityScore = (): number => {
    const grading = getQualityGrading();
    return grading?.qualityScore ?? 8; // Default to 8 if no grading
};

// Get crop from stored grading
export const getStoredCrop = (): string | null => {
    const grading = getQualityGrading();
    return grading?.crop ?? null;
};

// Get location from stored grading
export const getStoredLocation = (): { state: string; district: string } | null => {
    const grading = getQualityGrading();
    if (!grading) return null;
    return { state: grading.state, district: grading.district };
};
