require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        // This fetches the actual list of models tied to your API Key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        console.log("--- Available Models ---");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`Model Name: ${m.name} (Supports: ${m.supportedGenerationMethods})`);
            });
        } else {
            console.log("No models found. Error details:", data);
        }
    } catch (e) {
        console.error("Connection Error:", e);
    }
}

run();