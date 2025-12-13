'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Play, Pause, Download, User, Archive, MapPin, Calendar,
    CheckCircle2, TrendingUp, AlertTriangle, Package, DollarSign, ShieldCheck,
    Mic, Activity, Volume2, Zap
} from "lucide-react";
import { useState } from "react";

interface CallDetailProps {
    call: any;
    onDelete?: (id: string) => void;
}

export function CallDetail({ call, onDelete }: CallDetailProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const safeRender = (value: any) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this call data?')) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/calls?id=${call.id}`, { method: 'DELETE' });
            if (res.ok) {
                if (onDelete) onDelete(call.id);
            }
        } catch (error) {
            console.error("Failed to delete call", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!call) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="text-center">
                    <p>Select a call to view details</p>
                </div>
            </div>
        );
    }

    // Gentle fallback for new data fields
    const analysis = call.analysis || {};
    const productDetails = analysis.product_details || {};
    const negotiation = analysis.negotiation_details || {};
    const pricePoints = analysis.price_points || {};
    const sellerPerf = analysis.seller_performance || {};

    return (
        <div className="space-y-6 h-full overflow-y-auto pr-2">
            {/* Header & Audio Player */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {safeRender(productDetails.product_name || analysis.product || 'Unknown Product')}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Archive className="h-4 w-4" />
                                {safeRender(analysis.category)}
                                <span>•</span>
                                <Calendar className="h-4 w-4" />
                                {new Date(call.timestamp).toLocaleDateString()}
                                {productDetails.delivery_location && (
                                    <>
                                        <span>•</span>
                                        <MapPin className="h-4 w-4" />
                                        {safeRender(productDetails.delivery_location)}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={analysis.buyer_intent_score >= 8 ? 'success' : 'default'}>
                                Intent Score: {analysis.buyer_intent_score}/10
                            </Badge>
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                    title="Delete Call Analysis"
                                >
                                    {isDeleting ? <span className="text-xs">...</span> : <Package className="h-4 w-4 rotate-45" style={{ display: 'none' }} /> /* Hidden icon hack or just use a real trash icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
                        <button
                            className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-1" />}
                        </button>
                        <div className="flex-1">
                            <div className="h-1 bg-slate-300 rounded-full w-full">
                                <div className="h-1 bg-blue-500 rounded-full w-1/3"></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>00:45</span>
                                <span>{Math.floor((call.duration_seconds || 0) / 60)}:{(call.duration_seconds || 0) % 60}</span>
                            </div>
                        </div>
                        <button className="text-slate-500 hover:text-slate-700">
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Insights Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Information & Participants */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Call Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Participants Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Buyer</p>
                                    <p className="text-sm text-slate-600">{safeRender(analysis.buyer_id || 'Unknown')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Seller</p>
                                    <p className="text-sm text-slate-600">{safeRender(analysis.seller_id || 'Unknown')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Specs Section (Compact) */}
                        {productDetails.specifications && Object.keys(productDetails.specifications).length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Package className="h-3 w-3" /> Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {Object.entries(productDetails.specifications).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase">{key}</p>
                                            <p className="text-xs font-medium text-slate-700 truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Voice & Interaction Signals (NEW) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Voice & Interaction Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Tone & Engagement */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 flex items-center gap-1"><Mic className="h-3 w-3" /> Seller Tone</p>
                                <Badge variant={
                                    (analysis.responsiveness_analysis?.seller_tone?.toLowerCase().includes('rude') || analysis.responsiveness_analysis?.seller_tone?.toLowerCase().includes('sleepy')) ? 'destructive' :
                                        analysis.responsiveness_analysis?.seller_tone?.toLowerCase().includes('engaging') ? 'success' : 'outline'
                                }>
                                    {safeRender(analysis.responsiveness_analysis?.seller_tone || 'Professional')}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 flex items-center gap-1"><Zap className="h-3 w-3" /> Engagement</p>
                                <Badge variant={analysis.responsiveness_analysis?.call_engagement === 'highly_engaged' ? 'success' : 'secondary'}>
                                    {safeRender(analysis.responsiveness_analysis?.call_engagement?.replace('_', ' ') || 'Moderate')}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-3">
                            {/* Noise Level */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500 flex items-center gap-1"><Volume2 className="h-3 w-3" /> Background Noise</span>
                                    <span className="font-medium text-slate-700 capitalize">{safeRender(analysis.responsiveness_analysis?.background_noise_level || 'Low')}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${analysis.responsiveness_analysis?.background_noise_level === 'high' ? 'bg-red-500' :
                                            analysis.responsiveness_analysis?.background_noise_level === 'medium' ? 'bg-amber-400' : 'bg-green-500'
                                            }`}
                                        style={{ width: analysis.responsiveness_analysis?.background_noise_level === 'high' ? '90%' : analysis.responsiveness_analysis?.background_noise_level === 'medium' ? '50%' : '15%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Language */}
                        {analysis.language_analysis && (
                            <div className="pt-3 border-t border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-slate-500">Language</p>
                                        <p className="text-sm font-medium">{safeRender(analysis.language_analysis.primary_language)}</p>
                                    </div>
                                    {analysis.language_analysis.translation_needed && (
                                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">Translation Used</Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Deal Intelligence */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Deal Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Column 1: Status & Objection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm text-slate-500">Deal Status</span>
                                    <Badge variant="outline">{safeRender(analysis.deal_status)}</Badge>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm text-slate-500">Objection</span>
                                    <div className="flex items-center text-red-600 gap-1 text-sm font-medium">
                                        {safeRender(analysis.objection_type) !== 'None' && <AlertTriangle className="h-3 w-3" />}
                                        {safeRender(analysis.objection_type || 'None')}
                                    </div>
                                </div>
                                {analysis.demand_gap_analysis?.unmet_requirements?.length > 0 && (
                                    <div className="bg-red-50 text-red-800 text-xs p-2 rounded border border-red-100">
                                        <strong>Gap:</strong> {safeRender(analysis.demand_gap_analysis.unmet_requirements[0])}
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Pricing */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm text-slate-500">Final Price</span>
                                    <span className="font-bold text-green-700">
                                        {pricePoints.final_settled_price
                                            ? `₹${safeRender(pricePoints.final_settled_price)}`
                                            : safeRender(analysis.price_discussion?.final_price || 'N/A')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-2">
                                    <span>Quote: ₹{safeRender(pricePoints.seller_initial_quote || 'N/A')}</span>
                                    <span>Offer: ₹{safeRender(pricePoints.buyer_counter_offer || 'N/A')}</span>
                                </div>
                            </div>

                            {/* Column 3: Negotiation Dynamics */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Dynamics</span>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {analysis.negotiation_dynamics?.negotiation_intensity || negotiation.negotiation_intensity || 'Low'} Intensity
                                    </Badge>
                                </div>

                                {/* Seller Flexibility */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Seller Flexibility</span>
                                        <span>{analysis.negotiation_dynamics?.seller_flexibility || 'Normal'}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${analysis.negotiation_dynamics?.seller_flexibility === 'rigid' ? 'bg-slate-400' : 'bg-blue-500'
                                            }`} style={{ width: analysis.negotiation_dynamics?.seller_flexibility === 'high' ? '80%' : analysis.negotiation_dynamics?.seller_flexibility === 'rigid' ? '20%' : '50%' }}></div>
                                    </div>
                                </div>

                                {/* Buyer Behavior */}
                                <div className="pt-2">
                                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                        Buyer: {safeRender(analysis.negotiation_dynamics?.buyer_behavior || 'Standard')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transcript */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Transcript & Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {analysis.summary && (
                        <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-900 border border-amber-100">
                            <strong>Summary: </strong> {analysis.summary}
                        </div>
                    )}
                    <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {call.transcript}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
