
import { Language } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

const getSarvamLang = (lang: Language): string => {
    const supported = ['hi', 'bn', 'or', 'en'];
    if (supported.includes(lang)) {
        return `${lang}-IN`;
    }
    return 'en-IN';
};

export const transcribeAudio = async (audioBlob: Blob, language: Language): Promise<string> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    // Backend handles model selection

    try {
        const response = await fetch(`${API_BASE_URL}/speech-to-text`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Backend STT failed: ${err}`);
        }

        const data = await response.json();
        return data.transcript || data.text || "No transcript";
    } catch (error) {
        console.error("STT Error:", error);
        throw error;
    }
};

export const generateSpeech = async (text: string, language: Language): Promise<string> => {
    const targetLang = getSarvamLang(language);

    // Truncate if needed (safe to truncate)
    const truncatedText = text.length > 500 ? text.substring(0, 497) + '...' : text;

    try {
        const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: truncatedText,
                target_language_code: targetLang,
                speaker: 'anushka',
                model: 'bulbul:v2'
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Backend TTS failed: ${err}`);
        }

        const data = await response.json();

        // Handle various potential response formats from SDK
        if (data.audios && data.audios[0]) {
            return `data:audio/wav;base64,${data.audios[0]}`;
        }
        if (typeof data === 'string' && data.startsWith('data:audio')) {
            return data;
        }

        throw new Error("No audio data received from backend");
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const chatWithSarvam = async (
    history: ChatMessage[],
    userMessage: string,
    language: Language
): Promise<string> => {

    const messages: ChatMessage[] = [
        ...history,
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                language
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Backend Chat failed: ${err}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }

        throw new Error("No response content from backend");
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
};
