import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const API_KEY = "sk-JzabVFUVGx_0Cs768A4PDQ";
const BASE_URL = "https://imllm.intermesh.net/v1/chat/completions";
const MODEL_NAME = "google/gemini-2.5-flash";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const url = formData.get("url") as string;

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

        // 2. Prepare OpenAI-compatible request body
        // Note: sending audio via 'image_url' or specific 'input_audio' depends on the gateway's implementation of multimodal.
        // For Gemini via standard proxies, often a data URI in 'image_url' (even for audio/video) or a custom format is used.
        // We will try the standard "image_url" pattern but with audio mime type, which some proxies map correctly.
        // If this fails, we might need a specific 'audio_url' property if the gateway supports it.

        // Step 1: Get transcript first
        const transcriptBody = {
            model: MODEL_NAME,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Listen to this call recording and provide ONLY a verbatim transcript of the entire conversation.

Output ONLY valid JSON with this exact schema:
{
    "transcript": "Full verbatim transcript with speaker identification (Seller/Buyer)..."
}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Audio}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.1
        };

        console.log("Step 1: Getting transcript...");
        const transcriptResponse = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(transcriptBody)
        });

        if (!transcriptResponse.ok) {
            const errText = await transcriptResponse.text();
            throw new Error(`Transcript API failed: ${transcriptResponse.status}: ${errText}`);
        }

        const transcriptData = await transcriptResponse.json();
        const transcriptContent = transcriptData.choices[0].message.content;
        const transcriptJsonString = transcriptContent.replace(/```json\s*/g, "").replace(/```/g, "").trim();
        const transcriptResult = JSON.parse(transcriptJsonString);
        const transcript = transcriptResult.transcript;

        console.log("Transcript obtained, now analyzing for insights...");

        // Step 2: Analyze transcript for comprehensive business insights
        const analysisBody = {
            model: MODEL_NAME,
            messages: [
                {
                    role: "user",
                    content: `Analyze this call transcript and extract comprehensive business intelligence. Focus on these 5 strategic insights:

TRANSCRIPT:
${transcript}

Output ONLY valid JSON with this exact schema:
{
    "transcript": "${transcript.replace(/"/g, '\\"')}",
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
            "background_noise_level": "none/low/medium/high",
            "call_quality_issues": ["List any quality issues: noise, interruptions, poor connection"],
            "seller_tone": "professional/casual/rude/sleepy/engaging",
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
}`
                }
            ],
            temperature: 0.2
        };

        // Step 3: Call analysis API
        console.log("Step 2: Analyzing transcript for business insights...");
        const analysisResponse = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(analysisBody)
        });

        if (!analysisResponse.ok) {
            const errText = await analysisResponse.text();
            console.error("Analysis API Error:", analysisResponse.status, errText);
            throw new Error(`Analysis API failed: ${analysisResponse.status}: ${errText}`);
        }

        const analysisData = await analysisResponse.json();
        console.log("Analysis Response received");

        if (!analysisData.choices || !analysisData.choices[0] || !analysisData.choices[0].message) {
            throw new Error("Invalid analysis response format from Gateway");
        }

        const analysisContent = analysisData.choices[0].message.content;

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
            timestamp: new Date().toISOString(),
            duration_seconds: 0, // We assume 0 or could estimate from file size
            transcript: parsedData.transcript,
            analysis: parsedData.analysis
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
