import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquareText, Minimize2, Mic, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { chatWithBhumi } from '../services/geminiService';
import { transcribeAudio, generateSpeech } from '../services/sarvamService';
import { ChatMessage, Language } from '../types';

interface Props {
    lang: Language;
}

export const ChatWidget: React.FC<Props> = ({ lang }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const greetings: Record<Language, string> = {
            en: "Namaste! I am Bhumi. How can I help you?",
            hi: "नमस्ते! मैं भूमि हूँ। मैं आपकी कैसे मदद कर सकती हूँ?",
            or: "ନମସ୍କାର! ମୁଁ ଭୂମି | ମୁଁ ତୁମକୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
            bn: "নমস্কার! আমি ভূমি। আপনাকে কীভাবে সাহায্য করতে পারি?",
            zh: "你好！我是Bhumi。我能为你做什么？",
            es: "¡Hola! Soy Bhumi. ¿Cómo puedo ayudarte?",
            ru: "Здравствуйте! Я Бхуми. Чем могу помочь?",
            ja: "こんにちは！ブミです。どのようなご用件でしょうか？",
            pt: "Olá! Sou Bhumi. Como posso ajudar?"
        };
        setMessages([{ id: '1', role: 'model', text: greetings[lang], timestamp: Date.now() }]);
    }, [lang]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        return () => {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
            }
        };
    }, []);

    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-[var(--primary)]">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const history = messages
                .filter((_, i) => i > 0)
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const responseText = await chatWithBhumi(history, userMsg.text, lang);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText || "I couldn't understand that.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setIsProcessingVoice(true);
                try {
                    const transcript = await transcribeAudio(audioBlob, lang);
                    if (transcript) {
                        setInput(transcript);
                    }
                } catch (error) {
                    console.error("Voice input failed", error);
                    alert("Could not process voice input. Please try again.");
                } finally {
                    setIsProcessingVoice(false);
                    // Stop all tracks
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const speakText = async (text: string) => {
        // Stop any current audio
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current = null;
            setIsSpeaking(false);
            return; // Toggle capability: if speaking, just stop.
        }

        setIsSpeaking(true);
        try {
            // Clean markdown for better speech approximation if needed, 
            // but Sarvam might handle clean text better.
            const cleanText = text.replace(/\*/g, '');
            const audioDataUrl = await generateSpeech(cleanText, lang);

            const audio = new Audio(audioDataUrl);
            audioPlayerRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                audioPlayerRef.current = null;
            };

            audio.onerror = () => {
                console.error("Audio playback error");
                setIsSpeaking(false);
                audioPlayerRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.error("TTS Error:", error);
            alert("Unable to play audio at this moment.");
            setIsSpeaking(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-40 flex flex-col items-end pointer-events-none w-full md:w-auto">
            <div className={`
                pointer-events-auto
                w-full md:w-[400px] 
                bg-bhumi-card dark:bg-bhumi-darkCard
                border-t md:border-2 border-bhumi-border dark:border-bhumi-darkBorder
                md:rounded-none shadow-2xl 
                flex flex-col 
                transition-all duration-300 origin-bottom-right
                overflow-hidden
                ${isOpen ? 'h-[80vh] md:h-[500px] opacity-100 scale-100' : 'h-0 opacity-0 scale-90'}
            `}>
                <div className="p-4 bg-bhumi-primary dark:bg-bhumi-darkPrimary flex justify-between items-center text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <span className="font-heading font-bold">Bhumi Assistant</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1">
                        <Minimize2 size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-bhumi-bg dark:bg-bhumi-darkBg">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-bhumi-primary dark:bg-bhumi-darkPrimary text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg'
                                    : 'bg-bhumi-muted dark:bg-bhumi-darkMuted text-bhumi-fg dark:text-bhumi-darkFg border-2 border-bhumi-border dark:border-bhumi-darkBorder'
                                }`}>
                                {formatText(msg.text)}
                            </div>
                            {msg.role === 'model' && (
                                <button
                                    onClick={() => speakText(msg.text)}
                                    className={`mt-1 transition-colors ${isSpeaking ? 'text-bhumi-primary dark:text-bhumi-darkPrimary' : 'text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-primary dark:hover:text-bhumi-darkPrimary'}`}
                                    title="Read aloud"
                                >
                                    {isSpeaking && audioPlayerRef.current ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                </button>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-bhumi-muted dark:bg-bhumi-darkMuted p-3 flex gap-1 items-center border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                <span className="w-1.5 h-1.5 bg-bhumi-mutedFg dark:bg-bhumi-darkMutedFg rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-bhumi-mutedFg dark:bg-bhumi-darkMutedFg rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-bhumi-mutedFg dark:bg-bhumi-darkMutedFg rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t-2 border-bhumi-border dark:border-bhumi-darkBorder bg-bhumi-card dark:bg-bhumi-darkCard">
                    <div className="relative flex items-center gap-2">
                        <button
                            onClick={toggleVoiceInput}
                            disabled={isProcessingVoice}
                            className={`p-3 transition-all ${isListening ? 'bg-bhumi-destructive dark:bg-bhumi-darkDestructive text-white animate-pulse' :
                                    isProcessingVoice ? 'bg-bhumi-muted dark:bg-bhumi-darkMuted animate-pulse' :
                                        'bg-bhumi-muted dark:bg-bhumi-darkMuted text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:bg-bhumi-border dark:hover:bg-bhumi-darkBorder'
                                }`}
                            title="Voice Input"
                        >
                            {isProcessingVoice ? <Loader2 size={20} className="animate-spin" /> :
                                isListening ? <StopCircle size={20} /> : <Mic size={20} />}
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? "Listening..." : "Ask Bhumi..."}
                                className="w-full bg-bhumi-input dark:bg-bhumi-darkInput border-2 border-bhumi-border dark:border-bhumi-darkBorder py-3 pl-4 pr-12 text-sm text-bhumi-fg dark:text-bhumi-darkFg focus:border-bhumi-primary dark:focus:border-bhumi-darkPrimary outline-none transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1 top-1 p-2 bg-bhumi-primary dark:bg-bhumi-darkPrimary text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    w-14 h-14 shadow-lg flex items-center justify-center transition-all duration-300
                    mb-4 mr-4 md:mb-0 md:mr-0
                    hover:scale-110 active:scale-95
                    ${isOpen ? 'bg-bhumi-destructive dark:bg-bhumi-darkDestructive rotate-90' : 'bg-bhumi-primary dark:bg-bhumi-darkPrimary animate-orb-glow'}
                `}
            >
                {isOpen ? <X size={24} className="text-white" /> : <MessageSquareText size={28} className="text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg" />}
            </button>
        </div>
    );
};