
require('dotenv').config();
const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    console.log("Using Key:", process.env.GROQ_API_KEY ? "Found key starting with " + process.env.GROQ_API_KEY.substring(0, 6) : "No key found");
    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: 'Say hello' }],
            model: 'llama-3.3-70b-versatile',
        });
        console.log("Success:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
