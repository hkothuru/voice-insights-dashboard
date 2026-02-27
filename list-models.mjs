import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCigD3BEpmTbvrUBeAs0sdFfhd6XJB-uj0";

async function listAvailableModels() {
    try {
        // Try to fetch available models via REST API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        
        if (!response.ok) {
            console.error("Failed to fetch models:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }
        
        const data = await response.json();
        console.log("Available models:");
        console.log(JSON.stringify(data, null, 2));
        
        // Filter for models that support generateContent
        if (data.models) {
            console.log("\n\nModels supporting generateContent:");
            const contentModels = data.models.filter(m => 
                m.supportedGenerationMethods?.includes("generateContent")
            );
            contentModels.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')}`);
            });
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listAvailableModels();
