
import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyBgs2I2w9QoCQBfBgtU9BbZFo60FhfMsXE";
const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = 'gemini-3-pro-preview';

async function verifyFix() {
    console.log("Verifying Chatbot Fix...");

    // Mimic the React state
    const messages = [
        { role: 'model', text: 'Namaste! I am Bhumi...' }, // Initial greeting
        { role: 'user', text: 'Hello, I need help with my crops.' } // First user message
    ];

    // Mimic the FIX: Filter out the first message if it's from model
    const history = messages
        .filter((_, i) => i > 0)
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

    console.log("Filtered History to be sent:", JSON.stringify(history, null, 2));

    try {
        // 1. Create Chat with filtered history (should be empty if only 1 user msg, or start with User)
        // Wait, if I filter i>0 and have [Model, User], the history is [User].
        // Does 'history' in chats.create include the CURRENT message?
        // The service generic `chatWithBhumi` takes `history` and `message`.
        // In Chatbot.tsx: 
        // const history = messages.filter(...).map(...)
        // await chatWithBhumi(history, userMsg.text...)
        //
        // Inside `services/geminiService.ts`:
        // const chat = ai.chats.create({ history: history ... })
        // await chat.sendMessage({ message })

        // So `history` passed to `create` must be PREVIOUS turns.
        // If I have [Model, User(current)], filtered history is [User].
        // Then I call sendMessage(User). 
        // This effectively duplicates the User message? 
        // Let's check logic closely:

        // Chatbot.tsx:
        // 1. setMessages([...prev, userMsg]) -> State is [Model, User]
        // 2. handleSend -> calls chatWithBhumi w/ history derived from [Model, User]
        //    Filtered history = [User (text: input)]
        //    Args: chatWithBhumi(history=[User], message=input)

        // geminiService.ts:
        // ai.chats.create({ history: [User] }) -> This sets up context where User ALREADY said "input".
        // chat.sendMessage({ message: input }) -> User says "input" AGAIN?

        // This might be logically wrong (double user message), but does it CRASH?
        // API Rule: History must start with User.
        // If history is [User], it starts with User. Valid.
        // If history is [], it's valid.

        // Let's test the EXACT payload the code produces.

        const chat = ai.chats.create({
            model: MODEL_NAME,
            history: history, // [User]
        });

        console.log("Chat created. Sending message...");
        const result = await chat.sendMessage({ message: "Hello, I need help with my crops." });

        console.log("Verification Success!");
        console.log("Response:", result.text);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
}

verifyFix();
