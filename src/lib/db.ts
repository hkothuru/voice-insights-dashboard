import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

export interface Call {
    id: string;
    timestamp: string;
    duration_seconds: number;
    transcript: string;
    analysis: Analysis;
    metadata?: any;
}

export interface Analysis {
    category: string;
    deal_status: string;
    objection_type: string;
    buyer_intent_score: number;
    missing_specs: string[];
    summary: string;
    seller_id: string;
    buyer_id: string;
    product: string;
    price_discussion: {
        final_price: string;
        currency: string;
    };
    // New Deep Analysis Fields
    product_details?: {
        product_name: string;
        specifications: Record<string, string>;
        quantity: string;
        delivery_location: string;
        delivery_time_mentioned: string;
        payment_terms: string;
    };
    price_points?: {
        seller_initial_quote: number | null;
        buyer_counter_offer: number | null;
        final_settled_price: number | null;
    };
    negotiation_details?: {
        negotiation_present: boolean;
        negotiation_intensity: 'high' | 'medium' | 'low';
        buyer_behaviour: string;
        seller_flexibility: string;
        discount_requested_percent: number | null;
        discount_offered_percent: number | null;
        negotiation_summary: string;
    };
    requirements_match?: {
        requirements_clearly_stated: boolean;
        spec_mismatch_detected: boolean;
        mismatched_specs: Array<{ spec: string; buyer_wants: string; seller_offered: string }>;
        custom_requirements: string[];
        alignment_score: number;
    };
    intent_analysis?: {
        intent_signals_detected: string[];
        intent_level: 'high' | 'medium' | 'low';
        intent_score: number;
        intent_rationale: string;
    };
    seller_performance?: {
        seller_clarity: 'good' | 'average' | 'poor';
        professional_greeting: boolean;
        response_time_delay_seconds: number | null; // Estimated from transcript if possible, or null
        interruption_frequency: 'low' | 'medium' | 'high';
        conversation_coherence: 'high' | 'medium' | 'low';
    };
    // Enhanced Strategic Insights Fields
    language_analysis?: {
        primary_language: string;
        language_barriers: string;
        translation_needed: boolean;
    };
    responsiveness_analysis?: {
        background_noise_level: 'none' | 'low' | 'medium' | 'high';
        call_quality_issues: string[];
        seller_tone: 'professional' | 'casual' | 'rude' | 'sleepy' | 'engaging';
        response_delays: string;
        call_engagement: 'highly_engaged' | 'moderately_engaged' | 'low_engagement';
    };
    demand_gap_analysis?: {
        unmet_requirements: string[];
        market_gaps_identified: string[];
        buyer_suggestions: string[];
        competitive_advantages_needed: string[];
    };
    negotiation_dynamics?: {
        negotiation_present: boolean;
        negotiation_intensity: 'high' | 'medium' | 'low' | 'none';
        buyer_behavior: 'aggressive' | 'passive' | 'questioning' | 'collaborative';
        seller_flexibility: 'high' | 'medium' | 'low' | 'rigid';
        discount_requested_percent: number | null;
        discount_offered_percent: number | null;
        negotiation_outcome: 'successful' | 'compromise' | 'stalemate' | 'failed';
    };
}

export function getCalls() {
    if (!fs.existsSync(DB_PATH)) {
        return [];
    }
    const fileData = fs.readFileSync(DB_PATH, 'utf-8');
    try {
        return JSON.parse(fileData);
    } catch (error) {
        return [];
    }
}

export function saveCall(callData: any) {
    const calls = getCalls();
    calls.unshift(callData); // Add new call to the beginning
    fs.writeFileSync(DB_PATH, JSON.stringify(calls, null, 2));
    return callData;
}

export function deleteCall(id: string) {
    const calls = getCalls();
    const updatedCalls = calls.filter((call: any) => call.id !== id);
    fs.writeFileSync(DB_PATH, JSON.stringify(updatedCalls, null, 2));
    return updatedCalls;
}

export function clearCalls() {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    return [];
}
