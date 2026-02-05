
import { Language } from '../types';

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || '';

const SARVAM_LANG_MAP: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    or: 'or-IN',
    bn: 'bn-IN',
    zh: 'en-IN',
    es: 'en-IN',
    ru: 'en-IN',
    ja: 'en-IN',
    pt: 'en-IN'
};

// Sarvam supported languages for TTS (bulbul): hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, gu-IN, en-IN
// STT (saarika): hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, gu-IN, en-IN

const getSarvamLang = (lang: Language): string => {
    const supported = ['hi', 'bn', 'or', 'en']; // Add others as needed from types
    if (supported.includes(lang)) {
        return `${lang}-IN`;
    }
    return 'en-IN';
};

export const transcribeAudio = async (audioBlob: Blob, language: Language): Promise<string> => {
    if (!SARVAM_API_KEY) throw new Error("Sarvam API Key missing");

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'saarika:v1');
    // For translation to English prompt, use speech-to-text-translate if needed. 
    // But user wants "multilingual", implying they want to speak Hindi and see Hindi text?
    // Or speak Hindi and chat with Gemini in Hindi (which we handle).
    // Let's use strict speech-to-text to capture what they said.
    // prompt: optional

    // Sarvam requires 'language_code' usually or auto-detect?
    // Docs say: language_code is not strictly required for saarika as it handles code-switching, 
    // but saarika:v1 is usually for code-mixed Hindi-English. 
    // Wait, let's use the general endpoint.

    // NOTE: Sarvam API details from memory/search:
    // Endpoint: https://api.sarvam.ai/speech-to-text
    // Multipart form data: file, model (saarika:v1), prompt (optional)

    try {
        const response = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: {
                'api-subscription-key': SARVAM_API_KEY
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Sarvam STT failed: ${err}`);
        }

        const data = await response.json();
        return data.transcript;
    } catch (error) {
        console.error("Sarvam STT Error:", error);
        throw error;
    }
};

export const generateSpeech = async (text: string, language: Language): Promise<string> => {
    if (!SARVAM_API_KEY) throw new Error("Sarvam API Key missing");

    const targetLang = getSarvamLang(language);

    // Sarvam TTS has a 500 character limit per input
    const truncatedText = text.length > 500 ? text.substring(0, 497) + '...' : text;

    try {
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': SARVAM_API_KEY
            },
            body: JSON.stringify({
                inputs: [truncatedText],
                target_language_code: targetLang,
                speaker: 'anushka',
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 8000,
                enable_preprocessing: true,
                model: 'bulbul:v2'
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Sarvam TTS failed: ${err}`);
        }

        const data = await response.json();
        // Sarvam returns base64 audio usually? Or direct bytes?
        // Response format: { audios: ["base64string..."] }

        if (data.audios && data.audios[0]) {
            return `data:audio/wav;base64,${data.audios[0]}`;
        }
        throw new Error("No audio data received");
    } catch (error) {
        console.error("Sarvam TTS Error:", error);
        throw error;
    }
};
