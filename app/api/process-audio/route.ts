import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";

if (!API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const url = formData.get("url") as string;
        const metadataString = formData.get("metadata") as string;

        // Parse metadata if provided
        let metadata: Record<string, any> = {};
        if (metadataString) {
            try {
                metadata = JSON.parse(metadataString);
            } catch (e) {
                console.warn("Failed to parse metadata:", e);
            }
        }

        let buffer: Buffer;
        let mimeType: string;
        let fileName: string = "audio_file";

        if (url) {
            console.log(`Fetching audio from URL: ${url}`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch audio from URL: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = response.headers.get("content-type") || "audio/mp3";
            fileName = "url_audio";
        } else if (file) {
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = file.type || "audio/mp3";
            fileName = file.name;
        } else {
            return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
        }

        const base64Audio = buffer.toString("base64");
        console.log(`Processing ${fileName} (${mimeType}), size: ${buffer.length} bytes`);

        // Step 1: Get transcript first using Google Gemini API
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const transcriptPrompt = `Listen to this call recording and provide ONLY a verbatim transcript of the entire conversation.

Output ONLY valid JSON with this exact schema:
{
    "transcript": "Full verbatim transcript with speaker identification (Seller/Buyer)..."
}`;

        console.log("Step 1: Getting transcript...");
        const transcriptResult = await model.generateContent([
            transcriptPrompt,
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: mimeType
                }
            }
        ]);

        const transcriptResponse = await transcriptResult.response;
        const transcriptContent = transcriptResponse.text();
        const transcriptJsonString = transcriptContent.replace(/```json\s*/g, "").replace(/```/g, "").trim();
        const transcriptParsed = JSON.parse(transcriptJsonString);
        const transcript = transcriptParsed.transcript;

        console.log("Transcript obtained, now analyzing for insights...");

        // Step 2: Analyze transcript for comprehensive business insights
        const analysisPrompt = `Analyze this call recording AND the provided transcript to extract comprehensive business intelligence. 
You MUST listen to the audio to determine "seller_tone", "background_noise", and "engagement".
Use the transcript for extraction of specific facts, prices, and specs.

TRANSCRIPT:
${transcript}

Output ONLY valid JSON with this exact schema:
{
    "transcript": "${transcript.replace(/"/g, '\\"')}",
    "call_duration_seconds": 120,
    "analysis": {
        "category": "Product category (e.g., Electronics, Textiles, Machinery)",
        "deal_status": "Current status (Closed, Follow-up, Dropped, etc.)",
        "objection_type": "Main objection if any (Price, MOQ, Location, Specs, Trust, None)",
        "buyer_intent_score": 1-10,
        "missing_specs": ["List of specifications buyer asked for but seller couldn't provide"],
        "summary": "2-3 sentence summary of the negotiation",

        "seller_id": "Seller identifier or 'Unknown'",
        "buyer_id": "Buyer identifier or 'Unknown'",
        "product": "Main product discussed",
        "price_discussion": {"final_price": "Final agreed price or 'Not discussed'", "currency": "INR"},

        "language_analysis": {
            "primary_language": "Main language used (Hindi, English, Gujarati, etc.)",
            "language_barriers": "Any communication difficulties due to language",
            "translation_needed": "Did either party struggle with language?"
        },

        "responsiveness_analysis": {
            "background_noise_level": "none/low/medium/high (Listen to audio)",
            "call_quality_issues": ["List any quality issues: noise, interruptions, poor connection"],
            "seller_tone": "professional/casual/rude/sleepy/engaging (Listen to audio)",
            "response_delays": "any notable delays in responses",
            "call_engagement": "highly_engaged/moderately_engaged/low_engagement"
        },

        "demand_gap_analysis": {
            "unmet_requirements": ["Specific product features/variations buyer wanted but seller didn't offer"],
            "market_gaps_identified": ["Potential new product categories or specifications"],
            "buyer_suggestions": ["Any specific improvements buyer suggested"],
            "competitive_advantages_needed": ["What seller needs to offer to compete better"]
        },

        "negotiation_dynamics": {
            "negotiation_present": true/false,
            "negotiation_intensity": "high/medium/low/none",
            "buyer_behavior": "aggressive/passive/questioning/collaborative",
            "seller_flexibility": "high/medium/low/rigid",
            "discount_requested_percent": 0,
            "discount_offered_percent": 0,
            "negotiation_outcome": "successful/compromise/stalemate/failed"
        }
    }
}`;

        // Step 3: Call analysis API using Google Gemini
        console.log("Step 2: Analyzing transcript for business insights...");
        const analysisResult = await model.generateContent([
            analysisPrompt,
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: mimeType
                }
            }
        ]);

        const analysisResponse = await analysisResult.response;
        const analysisContent = analysisResponse.text();
        console.log("Analysis Response received");

        // Clean up JSON block
        const analysisJsonString = analysisContent.replace(/```json\s*/g, "").replace(/```/g, "").trim();

        const parsedData = JSON.parse(analysisJsonString);

        // Ensure we have the transcript in the final output
        if (!parsedData.transcript) {
            parsedData.transcript = transcript;
        }

        // Save to DB
        const newCall = {
            id: `call_${Date.now()}`,
            filename: fileName,
            timestamp: new Date().toISOString(),
            duration_seconds: parsedData.call_duration_seconds || Math.ceil(buffer.length * 8 / 128000), // Use LLM extracted duration or fallback
            transcript: parsedData.transcript,
            analysis: parsedData.analysis,
            // Add CSV metadata if available
            ...(Object.keys(metadata).length > 0 && { csv_metadata: metadata })
        };


        // Save to DB
        // Using relative import for safety
        const { saveCall } = await import('../../../src/lib/db');
        saveCall(newCall);

        return NextResponse.json(newCall);

    } catch (error: any) {
        console.error("Processing failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
