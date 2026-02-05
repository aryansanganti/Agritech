
import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyBgs2I2w9QoCQBfBgtU9BbZFo60FhfMsXE";
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-pro-preview';

async function test() {
    console.log(`Testing model: ${MODEL_NAME}`);
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                role: 'user',
                parts: [{ text: "Hello, are you working?" }]
            }
        });
        console.log("Success!");
        console.log(response.text);
    } catch (error) {
        console.error("Error occurred:");
        console.error(error);
    }
}

test();
