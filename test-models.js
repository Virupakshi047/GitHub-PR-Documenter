const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

const logFile = 'debug_log.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

async function list() {
    fs.writeFileSync(logFile, '', 'utf8'); // Clear logs
    log("Listing available models...");

    if (!process.env.GEMINI_API_KEY) {
        log("ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }

    // Try to access the model list directly via REST if the SDK fails, but let's try SDK first
    // Note: The SDK doesn't have a direct 'listModels' on the main class in some versions, 
    // but usually we can try to guess or use a known one. 
    // Actually, looking at docs, typically there isn't a simple list function on the client instance in some versions?
    // Wait, typical usage: 
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 

    // There isn't a `genAI.listModels()` in the simplified package possibly.
    // Let's try to just test "gemini-pro" which is very standard.

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        log("Success with gemini-pro! Response: " + result.response.text());
    } catch (e) {
        log("Failed with gemini-pro: " + e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent("Hello");
        log("Success with gemini-1.0-pro! Response: " + result.response.text());
    } catch (e) {
        log("Failed with gemini-1.0-pro: " + e.message);
    }
}

list();