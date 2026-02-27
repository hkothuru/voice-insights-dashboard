import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY environment variable is not set");
    process.exit(1);
}

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // There isn't a direct listModels on GenericAI instance in some versions, 
    // but we can try to use the model and see or just guess. 
    // Actually the server SDK usually has a ModelManager.
    // Let's try the simple generation with a known model to see if ANYTHING works.

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello?");
        console.log("gemini-pro works:", result.response.text());
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        console.log("gemini-1.5-flash works:", result.response.text());
    } catch (e) {
        console.log("gemini-1.5-flash failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello?");
        console.log("gemini-1.5-flash-001 works:", result.response.text());
    } catch (e) {
        console.log("gemini-1.5-flash-001 failed:", e.message);
    }
}

listModels();
