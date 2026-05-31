const path = require("path");
require("dotenv").config();

const { interpretWithGemini } = require("./services/geminiService");

async function runTest(query) {
    console.log("----------------------------------------");
    console.log("raw query:", query);
    try {
        const result = await interpretWithGemini(query);
        console.log("Gemini parsed output:", JSON.stringify(result.preferences, null, 2));
        console.log("whether fallback parser triggered:", result.fallbackActivated);
        console.log("final interpreted preferences:", JSON.stringify(result.preferences, null, 2));
    } catch (error) {
        console.error("Test execution failed:", error.message);
    }
}

async function main() {
    console.log("=== GEMINI NEW KEY SMOKE TEST ===");
    console.log("Gemini API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    
    const queries = [
        "sci-fi videos",
        "funny hindi standup",
        "I had a breakup suggest relatable music",
        "I had a breakup suggest music to get over it",
        "I'm chilling at home eating food, suggest something to watch",
        "gym music",
        "with family suggest funny videos"
    ];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < queries.length; i++) {
        if (i > 0) {
            console.log("Sleeping 13 seconds to prevent rate limiting...");
            await sleep(13000);
        }
        await runTest(queries[i]);
    }
    console.log("----------------------------------------");
    console.log("=== TEST END ===");
}

main().catch(console.error);
