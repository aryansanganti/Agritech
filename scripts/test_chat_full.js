
import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyBgs2I2w9QoCQBfBgtU9BbZFo60FhfMsXE"; // Hardcoded from .env
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-pro-preview';

async function testChat() {
    console.log(`Testing Chat with model: ${MODEL_NAME}`);

    const history = [
        {
            role: 'model',
            parts: [{ text: 'Namaste! I am Bhumi, your farming assistant. How can I help you today?' }]
        }
    ];

    try {
        const chat = ai.chats.create({
            model: MODEL_NAME,
            history: history,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are Bhumi, a wise and friendly agricultural expert friend."
            }
        });

        console.log("Chat session created. Sending message...");

        // Mimic the service call: await chat.sendMessage({ message });
        // IMPORTANT: Verify if this signature is correct for @google/genai
        const result = await chat.sendMessage({ message: "What crops are good for red soil?" });

        console.log("Success!");
        console.log(result.text);
    } catch (error) {
        console.error("Chat Error occurred:");
        console.error(error);
    }
}

testChat();
